import mongoose from 'mongoose';
const schema = new mongoose.Schema({
  reportDate: { type: String, required: true, unique: true },
  status: { type: String, enum: ['pending','sent','failed'], default: 'pending' },
  sentAt: Date, attempts: { type: Number, default: 0 }, errorCode: String,
  createdAt: { type: Date, default: Date.now }
}, { timestamps: true });
export const DailyReport = mongoose.models.DailyReport || mongoose.model('DailyReport', schema);
