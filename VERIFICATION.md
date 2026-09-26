# Verification Evidence — Release 14.0.0

Generated: 2026-09-26

This file records commands actually run in the supplied workspace. It does not claim live MongoDB, admin authentication, or JetEmail delivery without those credentials.

## PASS — hardening

Command:

```text
npm run verify:hardening
```

Output:

```text
PASS  Mongo operator sanitization
PASS  HTML/XSS text sanitization
PASS  Supported free-text fields sanitized
PASS  explicit CSP
PASS  short JWT default
PASS  refresh rotation
PASS  account lockout
PASS  persistent logs
PASS  error tracking hook
PASS  backup runbook
PASS  staging env
PASS  admin audit API
PASS  admin enquiry search
PASS  analytics hook
PASS  structured data

15 hardening checks passed.
```

Result: **PASS**

## PASS — syntax/lint

Command:

```text
npm run lint
find backend/src scripts -name '*.js' -o -name '*.mjs' | sort | xargs -n1 node --check
```

Output:

```text
exit code: 0
```

Result: **PASS**

## PASS — automated tests

Command:

```text
npm test
```

Output:

```text
✔ sample request schema preserves the customer workflow fields
✔ transactional templates contain the reference and no marketing content
✔ registration rejects weak passwords
✔ enquiry accepts required business fields
✔ product requires a meaningful description
ℹ tests 5
ℹ pass 5
ℹ fail 0
```

Result: **PASS**

## PASS — API health/readiness smoke path

Command:

```text
npm run test:api:smoke
```

Output:

```text
GET /api/health -> 503 degraded (MongoDB not configured)
GET /api/ready -> 503 ready=false (MongoDB not configured)
API smoke checks passed for the dependency-free health/readiness path.
```

Result: **PASS for the no-database degraded/readiness contract**. A connected MongoDB environment is required to verify 200 responses and all database-backed routes.

## PASS — production frontend build

Command:

```text
npm run build
```

Output summary:

```text
Sitemap generated with relative URLs; set VITE_SITE_URL for production.
✓ 29 modules transformed.
✓ built in 1.08s
```

Result: **PASS**. Set `VITE_SITE_URL` before the production build to generate absolute sitemap URLs and the runtime canonical link.

## PASS — dependency audit

Command:

```text
npm audit --workspaces --omit=dev
```

Output:

```text
found 0 vulnerabilities
```

Result: **PASS**

## PASS — safe email test behavior

Command:

```text
npm run test:email
```

Output:

```text
JETEMAIL_API_KEY not configured — email test skipped.
```

Result: **PASS for safe skip behavior**. Real delivery is not claimed because no JetEmail credential was provided.

## PASS — responsive preview smoke check

Command:

```text
chromium --headless --window-size=<width>,1000 --screenshot=... http://127.0.0.1:4173/#contact
```

Observed screenshot dimensions:

```text
320x1000, 375x1000, 390x1000, 430x1000, 768x1000, 1024x1000, 1440x1000
```

Result: **PASS for page render at the requested viewport sizes**. Full interactive browser QA still belongs in staging with the API and MongoDB running.

## BLOCKED — live acceptance items

- MongoDB integration, enquiry persistence, authentication, refresh rotation against a live database, admin list/search/pagination, status update and audit-log persistence: **BLOCKED — no MongoDB URI/server was provided in this workspace**.
- Customer/admin JetEmail delivery: **BLOCKED — `JETEMAIL_API_KEY` was not provided**. The code uses JetEmail `POST /email` with a provider idempotency key and verified sender configuration, but this workspace cannot claim delivery.
- Production sender/domain DNS verification, TLS, backup/restore, PM2 restart behavior, external error tracking and GA4 collection: **BLOCKED — deployment credentials/infrastructure were not provided**.
