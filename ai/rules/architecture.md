# Architecture Rules

## Application Model

Nutraya runs as a single Next.js fullstack application with App Router.

This means:

- one repository
- one web application boundary
- frontend pages and backend route handlers in the same codebase
- shared domain modules used by both UI and server-side flows

The project should remain monolithic unless a real operational need proves otherwise.

## Organizational Principle

Code organization must stay module-oriented.

Primary domain modules currently include:

- auth
- patient profile
- macro goals
- daily macro logs
- meal plans
- meal completions
- chat
- meal substitutions
- uploads
- Gemini estimation

Shared code may live in `src/lib`, `src/modules/shared`, `src/modules/app-shell`, and `src/theme`, but shared layers must support the domain modules instead of replacing them.

## Route And Module Boundary

Use this responsibility split:

- `src/app/*`: route handlers and page entry points
- `src/modules/*`: domain services, types, APIs, and feature UI
- `src/lib/*`: framework-agnostic infrastructure helpers such as auth enforcement, errors, crypto, Prisma access, and HTTP helpers

Route handlers should stay thin:

- authenticate and authorize
- parse and validate input
- call a module service
- map success or failure to HTTP responses

Business rules should live in the module services, not inside route handlers or UI components.

## Client And Server Conventions

- Use React Query for client-side server-state flows.
- Use module-local API clients for frontend access to route handlers.
- Keep server logic in services that are testable without rendering UI.
- Keep DTOs and validation rules close to the modules they belong to.

## Integration Boundaries

External providers are already integrated and must stay behind internal service boundaries:

- JWT auth through auth services and `src/lib/auth.ts`
- Cloudinary upload through the uploads module
- Gemini image estimation through the Gemini and meal substitution estimation modules

Do not leak provider-specific SDK logic into page components, feature components, or unrelated services.

## Current Runtime Simplicity

Prefer synchronous, easy-to-debug flows where they already exist.

Examples of current intentional simplicity:

- polling-based chat instead of websockets
- direct API route handling instead of background workers
- transactional Prisma updates instead of event-driven orchestration
- immediate substitution estimation and progress application inside the request flow

Do not introduce microservices, queues, event buses, or distributed workflows unless correctness or scale clearly requires them.

## Decision Standard

When multiple options are valid, prefer the one that:

- keeps module ownership clear
- matches the patterns already used in the codebase
- minimizes cognitive load for future contributors
- keeps test coverage straightforward
- preserves the current product boundaries unless a task explicitly expands them

## Quality Gate

- new behavior must be covered by automated tests close to the module or route where the behavior lives
- route tests should protect authorization, validation, and response behavior
- service tests should protect business rules and regression-prone logic
- component tests should protect important user-facing states and interactions
