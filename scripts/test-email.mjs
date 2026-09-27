import 'dotenv/config';
import nodemailer from 'nodemailer';

const required = ['SMTP_HOST', 'SMTP_PORT', 'SMTP_USER', 'SMTP_PASS', 'MAIL_FROM', 'ADMIN_EMAIL'];
const missing = required.filter(key => !process.env[key]);

if (missing.length) {
  console.error(`Missing SMTP environment variables: ${missing.join(', ')}`);
  process.exit(1);
}

const host = process.env.SMTP_HOST.trim();
const port = Number(process.env.SMTP_PORT);
const secure = String(process.env.SMTP_SECURE ?? 'true').toLowerCase() === 'true';
const user = process.env.SMTP_USER.trim();
const pass = process.env.SMTP_PASS.replace(/\s+/g, '');
const from = process.env.MAIL_FROM.trim();
const to = process.env.ADMIN_EMAIL.trim();

const transporter = nodemailer.createTransport({
  host,
  port,
  secure,
  auth: { user, pass },
  connectionTimeout: 10000,
  greetingTimeout: 10000,
  socketTimeout: 15000,
});

try {
  await transporter.verify();
  console.log('SMTP verification: PASS');

  const info = await transporter.sendMail({
    from,
    to,
    replyTo: to,
    subject: 'Manavta Agro Foods — Gmail SMTP test',
    text: 'This is a transactional Gmail SMTP test for Manavta Agro Foods.',
    html: '<p>This is a transactional Gmail SMTP test for Manavta Agro Foods.</p>',
  });

  console.log(`SMTP send: PASS (${info.messageId})`);
} catch (error) {
  console.error(JSON.stringify({
    smtpTest: 'FAILED',
    code: error?.code || null,
    responseCode: error?.responseCode || null,
    response: error?.response || null,
    message: error?.message || 'SMTP test failed'
  }, null, 2));
  process.exit(1);
}
