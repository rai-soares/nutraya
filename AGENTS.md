# Nutraya

## Product Overview

Nutraya is a responsive web application for nutrition follow-up between nutritionists and patients.

The repository is no longer documentation-first. The current codebase already includes implemented frontend flows, API routes, Prisma schema, provider integrations, and automated tests. Documentation in this file and in `./ai/rules` must reflect the implemented product, not the original planning-only MVP.

## Current Product Scope

The application currently supports these main capabilities:

- authentication with register and login flows
- role-based access for `NUTRI` and `PATIENT`
- patient creation/linking by the nutritionist
- nutritionist to patient relationship management
- manual macro goal configuration per patient
- meal plan creation, activation, and meal management
- patient daily progress based on macro goals and consumed macros
- meal completion tracking by date
- asynchronous chat between nutritionist and patient with text and image messages
- meal substitution requests with image upload
- AI macro estimation for substitution images
- nutritionist feedback on substitution requests
- automatic application of estimated substitution macros to the daily log

## Official Stack In Use

The current application stack is:

- Next.js App Router fullstack
- React
- Tailwind CSS
- MUI
- React Query
- React Hook Form
- PostgreSQL
- Prisma
- Vitest

Current integration decisions already present in the codebase:

- JWT bearer auth
- Cloudinary for image upload/storage
- Gemini for image-based macro estimation

These provider choices are now part of the implemented architecture. They may be replaced later, but new work must respect the existing service boundaries instead of spreading provider-specific logic across the app.

## Current Product Principles

All work in this repository should follow these principles:

- preserve the implemented module boundaries
- prefer direct flows over premature abstraction
- keep the monolithic fullstack architecture simple and understandable
- treat the current application behavior as the source of truth unless the change intentionally redesigns it
- keep chat asynchronous and polling-based unless a clear product need justifies realtime
- accept estimation error in AI-assisted meal analysis
- prefer maintainable behavior over speculative extensibility

## Core Product Modules

The current codebase is centered on these modules:

- auth
- users
- patient profile and nutritionist linkage
- macro goals
- daily macro logs and progress
- meal plans and meals
- meal completions
- chat
- uploads
- meal substitutions
- Gemini-based macro estimation

## Current Delivery State

The original MVP foundation has already been implemented in code.

The active application surface includes:

- `/login`
- `/register`
- `/patient`
- `/patient/chat`
- `/nutritionist`
- `/nutritionist/patients`
- `/nutritionist/patients/[patientId]`
- `/nutritionist/chat`
- `/nutritionist/substitutions`

When planning new work, assume we are extending an existing product foundation rather than defining the first MVP from scratch.

## Working Rules

- Follow the detailed decisions in `./ai/rules`.
- When `AGENTS.md` and a rule file differ in detail, the specific rule file takes precedence.
- Prefer module-oriented decisions over technical convenience.
- Preserve current business behavior unless the task explicitly changes the product rule.
- Every new backend or frontend behavior must ship with unit tests in the same change.
- Bug fixes must update tests when the current suite does not already protect the regression.
- Changes are not complete until the relevant automated tests are updated and passing.

## Rule Index

- `./ai/rules/product.md`
- `./ai/rules/architecture.md`
- `./ai/rules/frontend.md`
- `./ai/rules/backend.md`
- `./ai/rules/data.md`
