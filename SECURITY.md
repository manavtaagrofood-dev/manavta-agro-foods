# Security — Release 14.0.0

- Mongo/NoSQL operators and dotted keys are recursively removed from body, query and params.
- Supported free-text fields are HTML/script-sanitized before Zod validation and storage.
- Helmet includes an explicit CSP, no framing, a self-only script policy and JetEmail API origin configuration.
- JSON bodies are limited to 1 MB; public, authentication and write rate limits remain enabled.
- Access JWTs are short-lived; refresh tokens are opaque, hashed, rotated, revocable and TTL-expiring in MongoDB.
- Repeated login failures trigger account lockout. Passwords are bcrypt-hashed and admin routes require RBAC.
- Enquiry writes support Mongo-backed idempotency; JetEmail sends use provider idempotency keys.
- Request IDs, endpoint, status and duration are logged without passwords, JWTs, API keys or full authentication tokens.
- Email provider failures are stored as bounded safe metadata and are never returned to customers.

## Data protection

Enquiry contact details are stored in MongoDB for commercial follow-up. Use encrypted connections, least privilege, restricted network access and tested backups in production. Do not add unnecessary IP or authentication-token data to enquiry records.

## Deployment-controlled checks

TLS termination, MongoDB backup/restore, JetEmail sender verification/DNS, production dependency audit, error tracking delivery and GA4 collection require the real deployment environment. They are not claimed as verified by this source checkout.
