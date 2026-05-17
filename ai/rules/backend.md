# Backend Rules

## Backend Model

Backend behavior lives inside the Next.js application through route handlers backed by domain services.

Current backend conventions are:

- bearer token authentication through JWT
- role enforcement at the route boundary
- input parsing and validation before service execution
- Prisma for persistence
- `AppError`-based domain and HTTP error handling

## Implemented Domain Coverage

The backend currently supports these domains:

- auth
- users
- nutritionist and patient relationship
- macro goals
- daily macro logs and progress
- meal plans and meals
- meal completions
- chat conversations and messages
- image uploads
- meal substitutions
- AI macro estimation

New work should extend these modules directly unless a truly new domain is being introduced.

## Auth And Authorization Rules

- Registration and login produce role-aware users.
- Authenticated API access requires a bearer token.
- Authorization must remain explicit at the route or service boundary.
- `NUTRI` and `PATIENT` permissions must stay clearly separated.
- Nutritionist access to patient data must be restricted to linked patients.

## Domain Rules

### Users And Patient Linkage

- The system currently supports only `NUTRI` and `PATIENT` roles.
- A patient is currently linked to a single nutritionist.
- Nutritionists can create or link patient access through the existing patient-profile flows.

### Macro Goals

- Macro goals are manually defined per patient.
- There is at most one macro goal record per patient.
- Goal retrieval must remain simple for patient progress screens.

### Daily Macro Logs

- Daily logs are keyed by patient and date.
- Consumed totals are the source for progress calculations.
- Daily logs may be created implicitly by other business actions such as meal completion or substitution application.

### Meal Plans And Meals

- Meal plans belong to a patient and the responsible nutritionist.
- Only one meal plan should be active per patient at a time.
- Meals carry explicit macro values and display metadata such as order and optional scheduled time.

### Meal Completions

- Completing a meal currently increments the patient's daily consumed macros for that date.
- Uncompleting a meal currently decrements those consumed values and clamps them at zero.
- Meal completion is unique by patient, meal, and date.

### Chat

- Conversations are unique per patient and nutritionist pair.
- Messages support `TEXT` and `IMAGE`.
- Read state is stored on messages.
- Chat is asynchronous and works with polling, not realtime transport.

### Uploads

- Image uploads are currently validated by type and size before storage.
- Cloudinary-specific logic must remain isolated in the uploads module.

### Meal Substitutions And AI Estimation

- A substitution request belongs to a patient, nutritionist, and meal.
- Substitution requests require a valid image URL.
- Estimation uses the existing AI service boundary and stores structured macro output.
- Current creation flow estimates macros immediately.
- Current creation flow applies estimated macros to the daily log automatically when estimation succeeds.
- Nutritionist feedback is stored as part of the substitution review flow.

## Validation And Service Ownership

- Validate external input at the application boundary with the module schemas already used in the project.
- Keep domain behavior in services, not inline in route handlers.
- Keep persistence code close to the service that owns the rule.
- Prefer explicit service methods over generic repositories or abstraction layers that add little value.

## Testing Rule

- every new backend route, service, validation schema, and business rule change must include automated tests
- tests must cover success paths and the main failure paths
- authorization and ownership checks must be tested when relevant
- bug fixes must add regression coverage if the failing path was not already protected

## Delivery Rule

Prefer flows that are easy to inspect and debug in the current monolith.

Defer introducing these patterns unless they become necessary:

- websocket chat
- background job orchestration
- provider-specific logic spread across multiple modules
- event buses
- premature generic infrastructure around persistence or external APIs
