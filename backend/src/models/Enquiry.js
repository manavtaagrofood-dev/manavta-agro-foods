import mongoose from 'mongoose';

const emailStatus = ['pending', 'sent', 'failed', 'skipped'];
const schema = new mongoose.Schema({
  referenceId: { type: String, required: true, unique: true, index: true },
  customer: { type: mongoose.Schema.Types.ObjectId, ref: 'User', index: true },
  firstName: { type: String, required: true, trim: true, maxLength: 60 },
  lastName: { type: String, default: '', trim: true, maxLength: 60 },
  email: { type: String, required: true, trim: true, lowercase: true, index: true },
  phone: { type: String, trim: true, maxLength: 30 },
  country: { type: String, trim: true, maxLength: 80 },
  destination: { type: String, trim: true, maxLength: 160 },
  company: { type: String, trim: true, maxLength: 120 },
  product: { type: mongoose.Schema.Types.ObjectId, ref: 'Product' },
  productName: { type: String, required: true, trim: true, maxLength: 160 },
  requirementType: { type: String, enum: ['QUOTE', 'SAMPLE'], default: 'QUOTE', index: true },
  quantity: { type: String, required: true, trim: true, maxLength: 80 },
  packaging: { type: String, trim: true, maxLength: 160 },
  message: { type: String, required: true, trim: true, maxLength: 5000 },
  sourcePage: { type: String, trim: true, maxLength: 200 },
  status: { type: String, enum: ['NEW', 'CONTACTED', 'QUALIFIED', 'QUOTED', 'NEGOTIATION', 'CONVERTED', 'SAMPLE_REQUESTED', 'CLOSED', 'CANCELLED'], default: 'NEW', index: true },
  internalNotes: { type: String, select: false, maxLength: 5000 },
  assignedTo: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  customerEmailStatus: { type: String, enum: emailStatus, default: 'pending', index: true },
  adminEmailStatus: { type: String, enum: emailStatus, default: 'pending', index: true },
  notificationError: { type: String, maxLength: 500 },
  notificationAttempts: { type: Number, default: 0, min: 0 },
  lastNotificationAt: { type: Date },
  idempotencyKey: { type: String, maxLength: 120 },
}, { timestamps: true });

schema.index({ createdAt: -1, status: 1 });
schema.index({ email: 1, createdAt: -1 });
export const Enquiry = mongoose.model('Enquiry', schema);
