import 'dotenv/config';

const requiredInProd = [
  'MONGODB_URI',
  'JWT_SECRET',
  'FRONTEND_ORIGIN'
];

const smtpKeys = [
  'SMTP_HOST',
  'SMTP_PORT',
  'SMTP_USER',
  'SMTP_PASS',
  'MAIL_FROM',
  'ADMIN_EMAIL'
];

const smtpConfigured = smtpKeys.every(key => process.env[key]);

if (
  process.env.NODE_ENV === 'production' &&
  process.env.REQUIRE_LEAD_NOTIFICATIONS === 'true' &&
  !smtpConfigured
) {
  throw new Error(
    'Lead notifications are required in production but Gmail SMTP is not fully configured'
  );
}

for (const key of requiredInProd) {
  if (process.env.NODE_ENV === 'production' && !process.env[key]) {
    throw new Error(`${key} must be configured in production`);
  }
}

export const env = {
  nodeEnv: process.env.NODE_ENV || 'development',

  port: Number(process.env.PORT || 5000),

  mongoUri: process.env.MONGODB_URI || '',

  jwtSecret:
    process.env.JWT_SECRET ||
    'development-only-secret-change-me',

  jwtExpiresIn:
    process.env.JWT_EXPIRES_IN || '15m',

  refreshTokenDays:
    Number(process.env.REFRESH_TOKEN_DAYS || 7),

  adminSeedEmail:
    process.env.ADMIN_SEED_EMAIL || '',

  adminSeedPassword:
    process.env.ADMIN_SEED_PASSWORD || '',

  frontendOrigin:
    (process.env.FRONTEND_ORIGIN || 'http://localhost:5173')
      .split(',')
      .map(x => x.trim())
      .filter(Boolean),

  // Gmail SMTP
  smtpHost:
    process.env.SMTP_HOST || 'smtp.gmail.com',

  smtpPort:
    Number(process.env.SMTP_PORT || 465),

  smtpSecure:
    String(process.env.SMTP_SECURE || 'true').toLowerCase() === 'true',

  smtpUser:
    (process.env.SMTP_USER || '').trim(),

  // Google may display App Passwords grouped with spaces. Remove whitespace
  // so both "abcd efgh ijkl mnop" and "abcdefghijklmnop" work.
  smtpPass:
    (process.env.SMTP_PASS || '').replace(/\s+/g, ''),

  mailFrom:
    (process.env.MAIL_FROM || process.env.SMTP_USER || '').trim(),

  adminEmail:
    (process.env.ADMIN_EMAIL || 'manavtaagrofood@gmail.com').trim(),

  requireLeadNotifications:
    process.env.REQUIRE_LEAD_NOTIFICATIONS === 'true',

  siteUrl:
    (process.env.SITE_URL || 'http://localhost:5173')
      .replace(/\/$/, '')
};