import mongoose from 'mongoose';
import { env } from '../src/config/env.js';
import { Enquiry } from '../src/models/Enquiry.js';
import { DailyReport } from '../src/models/DailyReport.js';
import { sendMail } from '../src/services/notificationService.js';

const dateKey = new Intl.DateTimeFormat('en-CA', { timeZone: 'Asia/Kolkata', year:'numeric', month:'2-digit', day:'2-digit' }).format(new Date());
// Compute the previous Indian calendar day as UTC boundaries without relying on server timezone.
const [y,m,d] = dateKey.split('-').map(Number);
const start = new Date(Date.UTC(y,m-1,d) - 330*60000);
const end = new Date(start.getTime() + 86400000);
await mongoose.connect(env.mongoUri);
try {
  let report = await DailyReport.findOne({ reportDate: dateKey });
  if (report?.status === 'sent') { console.log(`Report ${dateKey} already sent`); process.exitCode=0; }
  else {
    report ||= await DailyReport.create({ reportDate: dateKey, status:'pending' });
    const rows = await Enquiry.find({ createdAt: { $gte:start, $lt:end } }).sort({ createdAt:1 }).lean();
    const quote = rows.filter(x=>x.requirementType==='QUOTE').length;
    const sample = rows.filter(x=>x.requirementType==='SAMPLE').length;
    const failed = rows.filter(x=>x.customerEmailStatus==='failed'||x.adminEmailStatus==='failed').length;
    const esc = x=>String(x??'—').replace(/[&<>]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;'}[c]));
    const table = rows.map(x=>`<tr><td>${esc(x.referenceId)}</td><td>${esc(x.firstName)} ${esc(x.lastName)}</td><td>${esc(x.email)}</td><td>${esc(x.phone)}</td><td>${esc(x.productName)}</td><td>${esc(x.quantity)}</td><td>${esc(x.destination)}</td><td>${esc(x.requirementType)}</td><td>${esc(x.status)}</td><td>${esc(x.customerEmailStatus)} / ${esc(x.adminEmailStatus)}</td></tr>`).join('');
    const html=`<h2>Manavta Agro Foods — Daily Enquiry Report</h2><p>India date: ${dateKey} | Total: ${rows.length} | Quotes: ${quote} | Samples: ${sample} | Email failures: ${failed}</p><table border="1" cellpadding="6"><thead><tr><th>Reference</th><th>Customer</th><th>Email</th><th>Phone</th><th>Product</th><th>Quantity</th><th>Destination</th><th>Type</th><th>Status</th><th>Email status</th></tr></thead><tbody>${table}</tbody></table>`;
    try { await sendMail({to:env.adminEmail,subject:`Daily enquiries ${dateKey} (${rows.length})`,html,text:`Daily report ${dateKey}: ${rows.length} enquiries; quotes ${quote}; samples ${sample}; email failures ${failed}.`},`manavta:daily-report:${dateKey}`); await DailyReport.updateOne({_id:report._id},{$set:{status:'sent',sentAt:new Date()},$inc:{attempts:1}}); }
    catch(e) { await DailyReport.updateOne({_id:report._id},{$set:{status:'failed',errorCode:String(e.code||'SMTP_ERROR').slice(0,80)},$inc:{attempts:1}}); throw e; }
  }
} finally { await mongoose.disconnect(); }
