# ADR-003 — Persistent Idempotency Keys

## Decision
Use MongoDB-backed idempotency records for important write operations instead of an in-process Map.

## Why
An in-memory Map disappears on restart and is inconsistent across multiple API instances. MongoDB gives the application a shared source of truth and a TTL index for automatic cleanup.

## Behavior
1. Client optionally sends `Idempotency-Key`.
2. The server scopes the key to authenticated actor + method + route.
3. A unique database record is created atomically.
4. A concurrent duplicate receives `409 IDEMPOTENCY_IN_PROGRESS`.
5. A completed duplicate receives the original status/body.
6. Records expire automatically after 24 hours.

## Trade-off
This adds one database lookup/write to idempotent operations. That cost is accepted for correctness on retried business mutations.
