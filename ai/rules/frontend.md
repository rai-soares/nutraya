# Frontend Rules

## Core Frontend Stack

Frontend implementation must continue using:

- React
- Next.js App Router
- Tailwind CSS
- MUI
- React Query
- React Hook Form

Tailwind CSS and MUI should keep distinct responsibilities:

- Tailwind CSS for layout, spacing, responsive composition, and utility styling
- MUI for accessible components, form controls, feedback states, dialogs, and interaction primitives

## Current Frontend Shape

The frontend is already implemented as a role-based application shell with protected routes.

Current primary routes are:

- `/login`
- `/register`
- `/patient`
- `/patient/chat`
- `/nutritionist`
- `/nutritionist/patients`
- `/nutritionist/patients/[patientId]`
- `/nutritionist/chat`
- `/nutritionist/substitutions`

New screens should fit this established navigation model instead of inventing parallel structures.

## UI Priorities

Frontend decisions must optimize for:

- clarity
- fast task completion
- visible status
- low-friction forms
- mobile and desktop usability

The product should feel operational and direct, not dashboard-heavy or visually overloaded.

## Current Screen Conventions

Patient screens should continue prioritizing:

- daily macro context
- meal progress
- substitution actions
- direct communication with the nutritionist

Nutritionist screens should continue prioritizing:

- linked patient management
- patient setup context
- meal plan editing
- substitution review
- communication

## Data Fetching And Mutation Rules

- Use React Query for fetching, caching, invalidation, and polling flows.
- Keep query keys explicit and feature-oriented.
- Keep mutation side effects focused on invalidating the smallest useful set of queries.
- Use polling only where it matches the current product behavior, such as chat refresh.

## Forms And Interaction Rules

- Use React Hook Form for forms that collect or edit user input.
- Keep validation and submit intent explicit.
- Prefer dialogs and focused forms for editing operations already modeled that way in the app.
- Keep error and success feedback close to the user action that triggered it.

## Component Strategy

- Reuse the existing app-shell building blocks for layout and common states.
- Prefer MUI primitives plus local feature components over introducing a custom design system layer.
- Build reusable components when they represent real repeated product patterns, not speculative abstractions.
- Keep feature-specific UI inside the owning module whenever possible.

## UX Constraints

Do not introduce unnecessary frontend complexity such as:

- dense admin dashboards as the default pattern
- multiple competing navigation models
- overly generic form builders
- realtime assumptions in flows that are currently polling-based
- styling decisions that blur the Tailwind versus MUI ownership split

## Frontend Testing Rule

- new frontend behavior must include component or route-level automated tests where appropriate
- tests should cover loading, error, empty, and success states when they are meaningful to the feature
- changes to protected flows should preserve role-based behavior
