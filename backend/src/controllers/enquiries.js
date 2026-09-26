import crypto from 'node:crypto';
import { Enquiry } from '../models/Enquiry.js';
import { enquirySchema, statusSchema } from '../validators/schemas.js';
import { ok, fail } from '../utils/api.js';
import { notifyNewEnquiry } from '../services/notificationService.js';
import { audit } from '../services/auditService.js';

function makeReferenceId() {
  return `ENQ-${new Date().getUTCFullYear()}-${crypto.randomBytes(4).toString('hex').toUpperCase()}`;
}

async function updateNotificationState(id, result, requestId) {
  const error = result.errors?.length ? result.errors.join('; ').slice(0, 500) : undefined;
  await Enquiry.findByIdAndUpdate(id, { $set: { customerEmailStatus: result.customerEmailStatus, adminEmailStatus: result.adminEmailStatus, notificationError: error, lastNotificationAt: new Date() }, $inc: { notificationAttempts: 1 } });
  if (error) console.error(JSON.stringify({ level: 'warn', event: 'enquiry_notification_failed', requestId, enquiryId: id, message: error }));
}

export async function create(req, res) {
  const d = enquirySchema.parse(req.body);
  const e = await Enquiry.create({ ...d, referenceId: makeReferenceId(), customer: req.user?._id, product: d.productId || undefined, idempotencyKey: req.get('Idempotency-Key') || undefined });
  await audit({ action: 'ENQUIRY_CREATED', resource: 'Enquiry', resourceId: e.id, requestId: req.id, metadata: { referenceId: e.referenceId, requirementType: e.requirementType } });
  // Notification delivery deliberately happens after the response path is committed.
  notifyNewEnquiry(e.toObject(), req.id).then(result => updateNotificationState(e._id, result, req.id)).catch(error => updateNotificationState(e._id, { customerEmailStatus: 'failed', adminEmailStatus: 'failed', errors: [error.message] }, req.id));
  return ok(res, { enquiryId: e.id, referenceId: e.referenceId, status: e.status, requirementType: e.requirementType, receivedAt: e.createdAt }, 201);
}

export async function list(req, res) {
  const filter = req.user.role === 'admin' ? {} : { customer: req.user._id };
  if (req.query.status) filter.status = req.query.status;
  if (req.query.requirementType) filter.requirementType = req.query.requirementType;
  if (req.query.q) { const q = String(req.query.q).slice(0, 80).replace(/[.*+?^${}()|[\]\\]/g, '\\$&'); filter.$or = [{ firstName: new RegExp(q, 'i') }, { lastName: new RegExp(q, 'i') }, { email: new RegExp(q, 'i') }, { company: new RegExp(q, 'i') }, { productName: new RegExp(q, 'i') }, { referenceId: new RegExp(q, 'i') }]; }
  const page = Math.max(Number(req.query.page) || 1, 1), limit = Math.min(Number(req.query.limit) || 20, 50);
  const [items, total] = await Promise.all([Enquiry.find(filter).select(req.user.role === 'admin' ? '+internalNotes' : '-internalNotes').populate('product', 'name').sort({ createdAt: -1 }).skip((page - 1) * limit).limit(limit).lean(), Enquiry.countDocuments(filter)]);
  return ok(res, { items, total, page, pages: Math.max(1, Math.ceil(total / limit)) });
}

export async function get(req, res) {
  const e = await Enquiry.findById(req.params.id).select(req.user.role === 'admin' ? '+internalNotes' : '-internalNotes').populate('product', 'name').lean();
  if (!e) return fail(res, 'Enquiry not found', 404, 'ENQUIRY_NOT_FOUND');
  if (req.user.role !== 'admin' && String(e.customer) !== String(req.user._id)) return fail(res, 'Forbidden', 403);
  if (req.user.role === 'admin') await audit({ actor: req.user._id, action: 'ENQUIRY_VIEWED', resource: 'Enquiry', resourceId: e._id, requestId: req.id });
  return ok(res, e);
}

export async function update(req, res) {
  if (req.user.role !== 'admin') return fail(res, 'Forbidden', 403);
  const d = statusSchema.parse(req.body);
  const e = await Enquiry.findByIdAndUpdate(req.params.id, { status: d.status }, { new: true, runValidators: true }).lean();
  if (!e) return fail(res, 'Enquiry not found', 404, 'ENQUIRY_NOT_FOUND');
  await audit({ actor: req.user._id, action: 'ENQUIRY_STATUS_CHANGED', resource: 'Enquiry', resourceId: e._id, metadata: { status: d.status, referenceId: e.referenceId }, requestId: req.id });
  return ok(res, e);
}

export async function retryNotifications(req, res) {
  if (req.user.role !== 'admin') return fail(res, 'Forbidden', 403);
  const e = await Enquiry.findById(req.params.id).lean();
  if (!e) return fail(res, 'Enquiry not found', 404, 'ENQUIRY_NOT_FOUND');
  const result = await notifyNewEnquiry(e, req.id);
  await updateNotificationState(e._id, result, req.id);
  await audit({ actor: req.user._id, action: 'ENQUIRY_NOTIFICATIONS_RETRIED', resource: 'Enquiry', resourceId: e._id, requestId: req.id });
  return ok(res, result);
}
