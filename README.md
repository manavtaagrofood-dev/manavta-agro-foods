# Manavta Agro Foods

A full-stack business website and enquiry-management platform for **Manavta Agro Foods**, a parboiled rice mill established in 2016 in Rureke Kalan, Barnala, Punjab, India.

The platform presents rice products and milling capabilities and supports quote requests, sample requests, enquiry administration, and customer communication.

> **Release metadata:** The root `package.json` currently declares version `15.0.0`. This README describes the source package; production readiness must be confirmed by running the verification checklist and testing the deployed services.

## Project highlights

- Responsive business website and product catalogue
- Quote and request-a-sample workflows
- Backend enquiry persistence using MongoDB/Mongoose
- Idempotency and duplicate-submit protections
- Admin enquiry management, status updates, and audit events
- Customer/admin email notification workflow
- API specification and architecture/deployment documentation
- Vercel frontend configuration and Render-oriented backend guidance

## Technology

| Layer | Technologies |
|---|---|
| Frontend | React, Vite, HTML, CSS, JavaScript |
| Backend | Node.js, Express |
| Database | MongoDB, Mongoose |
| Authentication | JWT |
| Email | Configurable email provider (see `.env.example` and deployment docs) |
| Deployment | Vercel (frontend), Render (backend) |

## Repository layout

```text
Manavta_Agro_Foods/
├── frontend/       # Public site, account/admin UI, assets and policies
├── backend/        # Express API, routes, models, middleware and tests
├── docs/           # OpenAPI and architecture decision records
├── ops/            # MongoDB backup guidance/scripts
├── scripts/        # Build, smoke-test and verification utilities
├── .env.example    # Placeholder configuration only
├── DEPLOYMENT.md
├── SECURITY.md
├── TESTING.md
└── package.json
```

## Run locally

Requirements: a supported Node.js LTS release, npm, and MongoDB (local or Atlas).

```bash
npm ci
```

Create a local `.env` from `.env.example`, then fill in the required values:

```bash
cp .env.example .env
```

Start the frontend:

```bash
npm run dev
```

Start the API in a second terminal:

```bash
npm run backend:dev
```

Typical local addresses:

- Frontend: `http://localhost:5173`
- API: `http://localhost:5000`

Exact ports and required variables are defined by the current configuration and `.env.example`. Never commit `.env` or real credentials.

## Verification

Run from the repository root:

```bash
npm run lint
npm test
npm run test:api:smoke
npm run test:email
npm run build
npm audit --workspaces --omit=dev
```

Some checks require a reachable database, configured email provider, or deployed environment. Record which checks passed; do not describe the project as production-certified until deployment-specific checks have been completed.

## API and technical documentation

- `API.md` and `docs/openapi.yaml` — API reference
- `ARCHITECTURE.md` and `SYSTEM_DESIGN.md` — system design
- `DEPLOYMENT.md` and `PRODUCTION_HANDOFF.md` — deployment guidance and known verification requirements
- `SECURITY.md` — security notes
- `TESTING.md` and `VERIFICATION.md` — test and release checks
- `CHANGELOG.md` — project changes

## Environment and deployment safety

- Keep database URIs, JWT secrets, email credentials, and admin passwords in the backend environment only.
- Treat all `VITE_*` values as public client-side configuration.
- Do not expose secrets in screenshots, logs, commits, or issue reports.
- Preserve existing production services and databases while migrating source control or deployment settings.
- Confirm Vercel/Render environment variables and run smoke tests after any deployment change.

## Business information

**Manavta Agro Foods**  
Tajoke Road, Rureke Kalan, District Barnala, Punjab, India  
Business email: `manavtaagrofood@gmail.com`  
Established: 2016

## License

No open-source license is specified in this package. Add a license only if the project owner intends to grant reuse rights.
