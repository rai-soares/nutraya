# Architecture Rules

## Application Model

Nutraya must use a Next.js fullstack architecture for the initial MVP.

This means:

- one repository
- one deployable web application
- frontend and server capabilities kept in the same application boundary

The MVP should remain monolithic and intentionally simple.

## Organizational Principle

Code organization must be driven by domain modules, not by isolated technical layers alone.

Prefer structures shaped around business areas such as:

- auth
- users
- patients
- macros
- meals
- chat
- photos

Shared infrastructure may exist, but it must support modules rather than replace them.

## Layering Convention

Within each module, keep responsibilities clearly separated:

- UI
- application logic
- data access
- external integrations

These layers do not need heavy boilerplate, but business rules must not be mixed directly into rendering or persistence details.

## Integration Boundaries

External concerns such as storage and AI analysis must be introduced through simple internal interfaces.

Examples:

- image storage should not leak provider-specific logic into UI code
- macro estimation should be called through an internal service boundary

The purpose is to allow future replacement of providers without rewriting core flows.

## Scalability Rule

The architecture should be scalable by discipline, not by early distribution.

Do not introduce:

- microservices
- event-driven orchestration
- complex async pipelines
- separate frontend and backend apps

until the MVP proves a real need.

## Decision Standard

When there are multiple valid implementation options, prefer the one that:

- keeps the module boundary clear
- reduces setup and maintenance cost
- is easy for future contributors to understand
- does not expand the MVP scope

## Quality Gate

- new behavior must be accompanied by automated tests at the module boundary where the behavior lives
- tests should stay close to the domain they protect and remain easy to understand
- implementation convenience is not a reason to skip regression coverage
