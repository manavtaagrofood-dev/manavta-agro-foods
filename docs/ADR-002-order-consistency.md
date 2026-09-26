# ADR-002: Transactional Order Creation

## Decision
Create an order and decrement stock inside a MongoDB transaction.

## Reason
Without an atomic transaction, two concurrent requests can both observe available stock and create orders that exceed inventory.

## Required deployment
MongoDB transactions require a transaction-capable deployment such as MongoDB Atlas or a MongoDB replica set.

## Additional controls
- conditional stock decrement
- server-side price lookup
- request idempotency key
- status history
- audit event
