# Backend Rules

## Backend Model

Backend behavior must live inside the Next.js fullstack application and follow the product modules.

Server-side implementation may use route handlers, server actions, or equivalent framework-native patterns, as long as module boundaries remain understandable.

## Module Coverage

The backend must support these domains:

- users
- nutritionist and patient relationship
- macro goals
- daily logs
- meal plans
- chat
- meal photos

Each domain should expose only the minimum operations needed for the MVP flows.

## Domain Rules

### Users

- support role-aware access for `NUTRI` and `PATIENT`
- keep user records simple and focused on identity and access

### Nutritionist and Patient Relationship

- each patient must be associated with a nutritionist for MVP flows
- relationship rules should be explicit and easy to query

### Macro Goals

- macro goals are set intentionally, not inferred
- the current goal state must be easy to retrieve for patient home

### Daily Logs

- daily log data must support consumed totals by date
- updates should preserve a clear daily progress view

### Meal Plans

- meal plans must be manageable without structured food composition
- text-based meal descriptions are valid for the MVP

### Chat

- messages must be stored and retrieved by conversation context
- realtime delivery is not required initially

### Photos

- meal photos must support upload reference plus estimated macros
- estimation can be synchronous at first if operationally simpler

## Validation and Logic Separation

- validate input at application boundaries
- keep business rules outside persistence details
- avoid placing domain decisions directly inside raw query code

Lightweight implementations are welcome, but domain behavior still needs explicit ownership.

## Testing Rule

- every new backend module, service, route handler, and validation schema must include unit tests
- tests must cover both success paths and the main failure paths
- bug fixes must add or update tests that protect against regression
- backend work is not complete until the relevant automated tests are passing

## Delivery Rule

Implement synchronous, easy-to-debug flows first.

Defer advanced patterns such as:

- websocket chat
- background job orchestration
- complex retry systems
- event buses

unless they become necessary for correctness.
