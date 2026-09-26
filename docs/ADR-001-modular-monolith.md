# ADR-001: Modular Monolith

## Decision
Use a modular monolith for the current Manavta Agro Foods platform.

## Context
The application has related domains—catalog, CRM, inventory, orders, authentication and administration—that share the same MongoDB database and have straightforward transaction boundaries.

## Why
- lower deployment complexity
- simpler local development
- simpler debugging and testing
- fewer network failure modes
- easier atomic operations across product stock and orders
- clear internal boundaries still allow future extraction

## Rejected for now
Microservices, Kafka, Kubernetes and Redis are not introduced solely for complexity. They can be added when there is a demonstrated scaling or reliability requirement.
