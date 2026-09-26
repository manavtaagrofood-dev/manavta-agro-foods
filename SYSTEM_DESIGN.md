# Manavta Agro Foods — System Design v3

## 1. Architecture

The platform uses a **modular monolith**: one deployable Node.js API containing independently structured business modules, backed by MongoDB, and a browser frontend composed of the public site plus customer/admin workspaces.

```text
Browser
 ├─ Public Website
 ├─ Customer Workspace
 └─ Admin Control Plane
          │ HTTPS/JSON
          ▼
      Express API
 ┌────────────────────────────────────────────┐
 │ Request ID → Security → Auth/RBAC → Route │
 │        Controller → Service → Model        │
 └────────────────────────────────────────────┘
          │
          ├── Products / Categories
          ├── Enquiries / CRM
          ├── Orders / Inventory
          ├── Users / RBAC
          └── Audit / Idempotency
          │
          ▼
       MongoDB Atlas
```

## 2. Core design principles

- Server is authoritative for authorization, pricing and stock.
- Business rules live in services/controllers, not browser code.
- Public reads are separated from protected writes.
- Customer resources are ownership-scoped.
- Admin operations require explicit RBAC.
- Critical writes support idempotency.
- Order stock reservation uses a MongoDB transaction and conditional decrement.
- APIs are versioned under `/api/v1`.
- Every request receives a correlation ID.
- Operational mutations produce audit records where implemented.

## 3. Order consistency

Order creation is a transactional workflow:

1. Validate the request.
2. Load active products.
3. Resolve prices from the database.
4. Verify stock.
5. Conditionally decrement stock.
6. Create the order with immutable product/name/price snapshots.
7. Commit the transaction.
8. Record an audit event.

If a concurrent stock update makes the conditional decrement fail, the transaction aborts and the client receives a conflict rather than an oversold order.

## 4. Idempotency

Important writes accept `Idempotency-Key`. Records are persisted in MongoDB with a TTL index. This prevents a browser/network retry from creating duplicate business operations and remains meaningful when multiple API instances are deployed.

## 5. Security boundary

```text
Untrusted client
   ↓
HTTPS / CORS / Helmet / rate limit
   ↓
Zod validation
   ↓
JWT authentication
   ↓
RBAC
   ↓
Resource ownership checks
   ↓
Business operation
   ↓
MongoDB
```

Passwords are hashed with bcrypt. Password hashes are never returned. Secrets are supplied through environment variables.

## 6. Data model

- User
- Category
- Product
- Enquiry
- InventoryMovement
- Order
- AuditLog
- IdempotencyRecord

Indexes target identity lookups, active catalog queries, inventory state, order ownership, timestamps and TTL cleanup.

## 7. API standards

Responses use a consistent envelope:

```json
{ "success": true, "data": {}, "meta": {} }
```

Errors use:

```json
{
  "success": false,
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Request validation failed",
    "requestId": "..."
  }
}
```

OpenAPI documentation is available at `docs/openapi.yaml`.

## 8. Availability

`GET /api/health` is a liveness endpoint. `GET /api/ready` verifies MongoDB readiness and returns HTTP 503 when the dependency is unavailable. The server performs graceful shutdown and closes database connections.

## 9. Scaling path

The current design deliberately avoids premature microservices. At higher load:

1. Run multiple stateless API instances.
2. Keep idempotency and sessions in shared infrastructure.
3. Add a cache for read-heavy catalog data.
4. Move long-running work to a queue/worker.
5. Add observability metrics/tracing.
6. Extract a service only when ownership, scaling or deployment boundaries justify it.

## 10. Key trade-offs

| Decision | Benefit | Cost |
|---|---|---|
| Modular monolith | Simple deployment and clear boundaries | Less independent scaling |
| MongoDB transaction for orders | Strong stock/order consistency | Transaction overhead |
| JWT access token | Stateless API auth | Revocation requires token/session strategy |
| MongoDB idempotency | Retry safety across instances | Extra DB operation |
| REST API | Simple integration and interview clarity | More client round trips than a custom aggregation API |

## 11. Interview walkthrough

A complete request can be explained as:

**Customer → HTTPS → rate limiter → JWT → ownership/RBAC → controller → service/business rule → MongoDB → audit → JSON response.**

For an order:

**Order request → validation → product lookup → server-side price → transactional stock decrement → order snapshot → commit → audit → response.**

## 12. Frontend experience and mobile architecture (v4)

The public experience remains intentionally lightweight but now follows a progressive-enhancement model:

```text
Mobile / Desktop Browser
        │
        ├── Static-first catalogue + SEO HTML
        ├── Responsive interaction layer
        ├── PWA service worker / offline shell
        └── API-first enquiry workflow
                    │
                    ▼
              HTTPS / JSON
                    │
              Express API v1
```

### Interaction design
- Product cards support keyboard and touch quick-view interactions.
- Product-to-enquiry flow preselects the requested product.
- Contact submission is API-first with timeout, idempotency key and email fallback.
- Draft enquiry fields survive accidental refreshes through session storage.
- Mobile users receive persistent WhatsApp / Request Quote actions.
- Scroll progress, reduced-motion support, focus states and offline status improve usability.

### Performance strategy
- Product and content imagery is served as WebP.
- Hero imagery is prioritized; secondary imagery is lazy-loaded.
- The service worker caches the static application shell and imagery.
- API traffic is never cached by the service worker.
- Animations are disabled/reduced when the device requests reduced motion.

### Failure handling
The enquiry flow uses API-first submission. If the API is unavailable or times out, the visitor is not falsely told that the enquiry was stored; an email client fallback is prepared instead. This keeps the user journey usable while preserving truthful delivery semantics.
