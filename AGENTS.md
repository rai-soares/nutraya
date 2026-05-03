# Nutraya

## Product Overview

Nutraya is a responsive web MVP for nutrition follow-up between nutritionists and patients.

The platform must allow:

- nutritionists to define meal plans and macro goals
- patients to track their diet and daily macro progress
- patients to send meal photos and receive estimated macros
- both sides to communicate through chat

This repository is documentation-first at this stage. The goal is to establish a clear implementation standard before application code is introduced.

## Official MVP Stack

The official architecture for the initial MVP is:

- Next.js fullstack
- React
- Tailwind CSS
- MUI
- React Query
- React Hook Form
- PostgreSQL
- Prisma

Auth must be implemented in a way that preserves MVP simplicity. The implementation may use JWT directly or a managed provider later, but current project decisions must not depend on a specific vendor.

Storage and AI providers are integration points, not fixed platform commitments at this stage.

Frontend styling should combine Tailwind CSS and MUI with clear responsibilities:

- Tailwind CSS for layout, spacing, responsive composition, and utility styling
- MUI for accessible UI primitives, form controls, feedback components, and interaction patterns

## MVP Principles

All work in this repository should follow these principles:

- simplify without removing required features
- prioritize usable delivery over technical perfection
- avoid premature abstractions and excessive modeling
- keep meal plan food definitions as text in the MVP
- keep chat asynchronous and non-realtime at first
- accept estimation error in AI-assisted photo analysis
- prefer direct, maintainable flows over highly generic systems

## Core Product Modules

The MVP must cover these functional modules:

- auth
- users
- nutritionist to patient relationship
- macro goals
- daily consumption tracking
- meal plans
- chat
- meal photos and macro estimation

## Delivery Priority

Development should follow this order unless a specific implementation need justifies a small adjustment:

1. auth
2. users
3. nutritionist to patient relationship
4. macro goals
5. patient home with daily progress
6. meal plans
7. chat
8. photo upload
9. AI macro estimation

## Working Rules

- Follow the detailed decisions in `./ai/rules`.
- When `AGENTS.md` and a rule file differ in detail, the specific rule file takes precedence.
- Prefer module-oriented decisions over technical convenience.
- Every new implementation choice should preserve the MVP scope defined here.

## Rule Index

- `./ai/rules/product.md`
- `./ai/rules/architecture.md`
- `./ai/rules/frontend.md`
- `./ai/rules/backend.md`
- `./ai/rules/data.md`
