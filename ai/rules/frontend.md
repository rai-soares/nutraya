# Frontend Rules

## Core Frontend Stack

Frontend implementation must use:

- React
- MUI
- React Query
- React Hook Form

Next.js is the application framework and delivery shell for the frontend.

## Product Requirement

The MVP must be responsive by default.

Every primary flow should be usable on:

- desktop
- tablet
- mobile web

Responsiveness is not optional or deferred.

## UI Priorities

Frontend decisions must optimize for:

- clarity
- fast comprehension
- low friction
- obvious primary actions

The interface should help users complete nutrition tasks quickly without requiring onboarding.

## Screen Conventions

MVP screens should avoid overloaded layouts.

Each primary screen should:

- focus on one main job
- expose only the most relevant actions
- surface status clearly
- minimize secondary branching

Patient home should always prioritize:

- macro goals
- consumed versus remaining progress
- access to meal plan context
- send-photo action

## Component Strategy

- Prefer MUI primitives and composable patterns over custom design systems in the MVP.
- Build custom components only when they reduce repetition in real product flows.
- Avoid generic abstraction layers that are not yet justified by repeated usage.

## Data and Forms

- Use React Query for server-state fetching, caching, and invalidation.
- Use React Hook Form for user input flows.
- Keep form logic explicit and close to the feature using it.

## UX Simplification Rule

Do not introduce advanced UI complexity early, including:

- dense dashboard patterns
- over-configurable forms
- multiple parallel navigation models
- visually heavy interactions that slow down core tasks

The MVP should feel direct and calm rather than feature-maximized.
