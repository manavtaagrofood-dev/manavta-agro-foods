import crypto from 'node:crypto';
import { env } from '../config/env.js';

const BUSINESS = {
  name: 'Manavta Agro Foods',
  address: 'Tajoke Road, Rureke Kalan, District Barnala, Punjab, India',
  email: 'manavtaagrofood@gmail.com',
};

const escapeHtml = (value = '') => String(value).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
const text = value => String(value || '—');
const fullName = e => [e.firstName, e.lastName].filter(Boolean).join(' ') || 'Customer';
const label = (name, value) => `<div class="detail"><span>${escapeHtml(name)}</span><strong>${escapeHtml(text(value))}</strong></div>`;

function layout(title, intro, content, reference) {
  return `<!doctype html><html><body style="margin:0;background:#f7f1e5;color:#173b27;font-family:Arial,sans-serif"><div style="max-width:640px;margin:0 auto;padding:24px"><div style="background:#0b4d2b;color:#fff;padding:24px 28px;border-radius:14px 14px 0 0"><div style="font-size:12px;letter-spacing:2px;color:#e2bd67">MANAVTA AGRO FOODS</div><h1 style="margin:10px 0 0;font-size:26px">${escapeHtml(title)}</h1></div><div style="background:#fff;padding:28px;border:1px solid #e9dfcf;border-top:0"><p style="font-size:16px;line-height:1.6">${intro}</p>${content}<div style="margin:24px 0;padding:16px;background:#f7f1e5;border-left:4px solid #c59a3b"><div style="font-size:12px;letter-spacing:1px;color:#6f715f">REFERENCE ID</div><div style="font-size:20px;font-weight:700;color:#0b4d2b">${escapeHtml(reference)}</div></div><p style="font-size:14px;line-height:1.6;color:#536054">${BUSINESS.name}<br>${BUSINESS.address}<br><a href="mailto:${BUSINESS.email}" style="color:#0b4d2b">${BUSINESS.email}</a></p></div><div style="padding:16px;text-align:center;font-size:12px;color:#6f715f">Transactional enquiry confirmation — no marketing content</div></div><style>.detail{display:flex;justify-content:space-between;gap:16px;padding:9px 0;border-bottom:1px solid #eee}.detail span{color:#6f715f}.detail strong{text-align:right}</style></body></html>`;
}

function details(e, includePrivate = false) {
  const rows = [label('Customer', fullName(e)), label('Company', e.company), label('Email', e.email), label('Phone', e.phone), label('Product', e.productName), label('Requirement', e.requirementType === 'SAMPLE' ? 'Request a Sample' : 'Request a Quote'), label('Quantity', e.quantity), label('Packaging', e.packaging), label('Destination', e.destination), label('Status', e.status), label('Submitted', new Date(e.createdAt || Date.now()).toISOString())];
  if (includePrivate) rows.push(label('Source', e.sourcePage), `<div style="padding:12px 0"><strong>Message</strong><div style="white-space:pre-wrap;margin-top:6px">${escapeHtml(text(e.message))}</div></div>`);
  return `<div style="margin:20px 0;padding:18px;border:1px solid #e9dfcf;border-radius:10px">${rows.filter(Boolean).join('')}</div>`;
}

export function customerEmail(enquiry) {
  const kind = enquiry.requirementType === 'SAMPLE' ? 'sample request' : 'enquiry';
  const html = layout('We received your request', `Thank you for contacting Manavta Agro Foods. We have received your ${kind} and our commercial team will review the details. We will contact you during our published working hours to discuss availability, specifications, quantity and packaging requirements.`, details(enquiry), enquiry.referenceId);
  return { to: enquiry.email, subject: 'Manavta Agro Foods — We Received Your Enquiry', html, text: `Thank you for contacting Manavta Agro Foods. Reference: ${enquiry.referenceId}. We will review your requirements during published working hours. ${BUSINESS.name}, ${BUSINESS.address}, ${BUSINESS.email}` };
}

export function adminEmail(enquiry) {
  const html = layout(`New ${enquiry.requirementType === 'SAMPLE' ? 'sample request' : 'enquiry'}`, 'A new lead has been recorded in the Manavta Agro Foods admin console.', details(enquiry, true), enquiry.referenceId);
  return { to: env.jetEmailAdminTo, subject: `New Manavta Enquiry — ${enquiry.productName} — ${enquiry.referenceId}`, html, text: `NEW ENQUIRY\nReference: ${enquiry.referenceId}\nCustomer: ${fullName(enquiry)}\nEmail: ${enquiry.email}\nProduct: ${enquiry.productName}\nRequirement: ${enquiry.requirementType}\nQuantity: ${enquiry.quantity}\nMessage: ${enquiry.message}` };
}

export async function sendJetEmail(message, idempotencyKey) {
  if (!env.jetEmailApiKey || !env.jetEmailFrom || !env.jetEmailAdminTo) return { skipped: true };
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), 8000);
  try {
    const response = await fetch(`${env.jetEmailApiUrl}/email`, { method: 'POST', headers: { Authorization: `Bearer ${env.jetEmailApiKey}`, 'Content-Type': 'application/json', 'Idempotency-Key': idempotencyKey }, body: JSON.stringify({ from: env.jetEmailFrom, to: message.to, subject: message.subject, html: message.html, text: message.text, reply_to: message.to === env.jetEmailAdminTo ? undefined : env.jetEmailAdminTo }), signal: controller.signal });
    const payload = await response.json().catch(() => ({}));
    if (!response.ok) throw new Error(`JetEmail returned ${response.status}`);
    return { sent: true, providerId: payload.id || null };
  } finally { clearTimeout(timer); }
}

export async function sendCustomerEnquiryConfirmation(enquiry) { return sendJetEmail(customerEmail(enquiry), `manavta:${enquiry.referenceId}:customer`); }
export async function sendAdminNewEnquiryNotification(enquiry) { return sendJetEmail(adminEmail(enquiry), `manavta:${enquiry.referenceId}:admin`); }

export async function notifyNewEnquiry(enquiry, requestId) {
  const result = { customerEmailStatus: 'pending', adminEmailStatus: 'pending', errors: [] };
  if (!env.jetEmailApiKey || !env.jetEmailFrom || !env.jetEmailAdminTo) return { customerEmailStatus: 'skipped', adminEmailStatus: 'skipped', errors: [] };
  const tasks = [['customerEmailStatus', sendCustomerEnquiryConfirmation], ['adminEmailStatus', sendAdminNewEnquiryNotification]];
  for (const [key, sender] of tasks) {
    try { const response = await sender(enquiry); result[key] = response.skipped ? 'skipped' : 'sent'; }
    catch (error) { result[key] = 'failed'; result.errors.push(`${key}: ${error.message}`); }
  }
  return result;
}

export async function sendTestEmail() {
  return sendJetEmail({ to: env.jetEmailAdminTo, subject: 'Manavta Agro Foods — JetEmail configuration test', html: layout('JetEmail test', 'This is a safe transactional configuration test for Manavta Agro Foods.', '<p>The email service is configured to send enquiry notifications.</p>', 'CONFIG-TEST'), text: 'JetEmail configuration test for Manavta Agro Foods.' }, `manavta:config-test:${crypto.randomUUID()}`);
}
