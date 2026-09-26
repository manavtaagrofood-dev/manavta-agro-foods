# Manavta Agro Foods Platform

Production-oriented public website and operations API for Manavta Agro Foods, a Punjab-based commercial rice processing mill established in 2016 at Tajoke Road, Rureke Kalan, District Barnala, Punjab, India. The public business model is bulk processed parboiled rice, seasonal contract milling and buyer-specific processing; it does not claim undisclosed export destinations, certifications, laboratories or production statistics.

## Release 14.0.0 — working enquiry pipeline

This release wires the customer-to-admin flow end to end:

- Quote and **Request a Sample** forms with inline browser validation, duplicate-submit protection, offline-aware messaging and reference IDs.
- Secure `POST /api/v1/enquiries` persistence to MongoDB with idempotency and audit creation.
- JetEmail transactional customer confirmation and admin notification delivered asynchronously after persistence.
- Per-recipient notification status (`pending`, `sent`, `failed`, `skipped`), safe error metadata and an admin retry endpoint.
- Admin dashboard new-enquiry count, search, pagination, full submitted details, status changes and audit events.
- JetEmail uses `JETEMAIL_API_KEY`, `JETEMAIL_API_URL`, `JETEMAIL_FROM` and `JETEMAIL_ADMIN_TO`; no secret is shipped to the browser or ZIP.
- Product-specific visuals, corrected business claims, analytics opt-in, offline messaging, responsive layout and environment-driven canonical/sitemap support.

## Local installation

```bash
npm install
cp .env.example .env
npm run dev
```

In a second terminal, from the repository root:

```bash
npm run backend:dev
```

The frontend runs at `http://localhost:5173`; the API runs at `http://localhost:5000`. MongoDB is required for enquiries, authentication, admin data and readiness.

## Required environment

- `MONGODB_URI`
- `JWT_SECRET`
- `FRONTEND_ORIGIN`
- `ADMIN_SEED_EMAIL` and `ADMIN_SEED_PASSWORD` for local admin seeding
- `JETEMAIL_API_KEY` (optional locally; required when real notifications are required)
- `JETEMAIL_API_URL=https://api.jetemail.com`
- `JETEMAIL_FROM` must be a JetEmail-verified sender/domain in production
- `JETEMAIL_ADMIN_TO=manavtaagrofood@gmail.com`
- `VITE_SITE_URL` at frontend build time for production canonical and absolute sitemap URLs
- `VITE_GA4_MEASUREMENT_ID` at build time; empty disables analytics

## API surface

- `GET /api/health`
- `GET /api/ready`
- `POST /api/v1/enquiries` and `POST /api/enquiries`
- `GET /api/v1/enquiries`
- `GET /api/v1/enquiries/:id`
- `PATCH /api/v1/enquiries/:id`
- `POST /api/v1/enquiries/:id/notifications/retry`
- `POST /api/v1/auth/login`, `/refresh`, `/logout`
- `GET /api/v1/admin/dashboard` and `/api/v1/admin/audit-logs`

## Verification commands

```bash
npm run verify:hardening
npm run lint
npm test
npm run test:api:smoke
npm run test:email
npm run build
npm audit --workspaces --omit=dev
```

See `DEPLOYMENT.md`, `SECURITY.md`, `TESTING.md` and `VERIFICATION.md` for deployment-controlled checks.
