# Architecture

Manavta Agro Foods is designed as a **modular monolith** with a browser frontend and a versioned Express REST API backed by MongoDB Atlas.

```text
                         ┌──────────────────────┐
                         │ Customer / Admin UI   │
                         │ Public + Account UI   │
                         └──────────┬───────────┘
                                    │ HTTPS / JSON
                         ┌──────────▼───────────┐
                         │ Express REST API      │
                         │ /api/v1               │
                         ├───────────────────────┤
                         │ request-id            │
                         │ Helmet / CORS         │
                         │ rate limiting         │
                         │ JWT + RBAC            │
                         │ Zod validation        │
                         └──────────┬───────────┘
                                    │
                         ┌──────────▼───────────┐
                         │ Controllers           │
                         │ HTTP concerns only    │
                         └──────────┬───────────┘
                                    │
                         ┌──────────▼───────────┐
                         │ Services              │
                         │ business rules        │
                         │ transactions          │
                         └──────────┬───────────┘
                                    │
                    ┌───────────────┼────────────────┐
                    ▼               ▼                ▼
               Mongoose         Audit Log        Utilities
                    │
                    ▼
             MongoDB Atlas
```

## Design principles

- Modular monolith instead of premature microservices.
- Controllers remain thin; business rules belong in services.
- Database writes are validated server-side.
- Customer resources enforce ownership on the server.
- Admin mutations are role-protected and auditable.
- Order creation uses a MongoDB transaction to keep stock and order state consistent.
- Collection endpoints are paginated and indexed.
- Request IDs and normalized errors improve troubleshooting.
- Idempotency is supported for important write endpoints.
- Environment variables hold deployment secrets.

See `SYSTEM_DESIGN.md` for the detailed architecture, request lifecycle, data model, consistency model, security model, scaling path and trade-offs.
