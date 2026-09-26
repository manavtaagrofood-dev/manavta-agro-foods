import 'dotenv/config';

const key = process.env.JETEMAIL_API_KEY || '';
const apiUrl = (process.env.JETEMAIL_API_URL || 'https://api.jetemail.com').replace(/\/$/, '');
const from = process.env.JETEMAIL_FROM || '';
const to = process.env.JETEMAIL_ADMIN_TO || 'manavtaagrofood@gmail.com';

if (!key) {
  console.log('JETEMAIL_API_KEY not configured — email test skipped.');
  process.exit(0);
}
if (!from || !to) {
  console.error('JETEMAIL_FROM and JETEMAIL_ADMIN_TO must be configured — email test failed.');
  process.exit(1);
}
const response = await fetch(`${apiUrl}/email`, {
  method: 'POST',
  headers: { Authorization: `Bearer ${key}`, 'Content-Type': 'application/json', 'Idempotency-Key': `manavta:test:${Date.now()}` },
  body: JSON.stringify({ from, to, subject: 'Manavta Agro Foods — JetEmail configuration test', text: 'This is a safe transactional email configuration test.', html: '<p>This is a safe transactional email configuration test.</p>' }),
});
const body = await response.json().catch(() => ({}));
console.log(`JetEmail HTTP status: ${response.status}`);
console.log(`Provider response ID: ${body.id || 'not returned'}`);
if (!response.ok) {
  console.error('JetEmail test failed. The API key was not printed.');
  process.exit(1);
}
console.log('JetEmail test succeeded.');
