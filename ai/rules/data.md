# Data Rules

## Current Data Model

The current schema is centered on these entities:

- `User`
- `PatientProfile`
- `MacroGoal`
- `DailyMacroLog`
- `MealPlan`
- `Meal`
- `MealCompletion`
- `Conversation`
- `Message`
- `MealSubstitution`

These names already exist in the Prisma schema and should remain stable unless a deliberate migration changes them.

## Enums In Use

The schema currently uses these enums:

- `UserRole`
- `MessageType`
- `MealSubstitutionStatus`
- `MealMacroConfidence`

Business logic and API types should stay aligned with these enum values.

## Entity Intent

### `User`

Represents an authenticated actor with identity, credentials, and role.

### `PatientProfile`

Represents the link between a patient user and the responsible nutritionist.

### `MacroGoal`

Represents the patient's daily calorie and macro targets.

### `DailyMacroLog`

Represents consumed macro totals for a patient on a specific date.

### `MealPlan`

Represents a nutritionist-defined plan for a patient, with activation state.

### `Meal`

Represents a meal inside a meal plan, including manual macro values, order, and optional schedule context.

### `MealCompletion`

Represents whether a patient completed a specific meal on a date.

### `Conversation`

Represents the chat channel between one patient and one nutritionist.

### `Message`

Represents a text or image message exchanged inside a conversation.

### `MealSubstitution`

Represents a patient substitution request tied to a meal, image, AI estimation output, feedback, and optional application to daily progress.

## Relationship Rules

- A `PatientProfile` is unique per patient user.
- A patient is currently linked to one nutritionist.
- A `MacroGoal` is unique per patient.
- A `DailyMacroLog` is unique by `patientId` and `date`.
- A `MealPlan` belongs to one patient and one nutritionist.
- Multiple meal plans may exist for a patient, but only one should be active at a time by application rule.
- A `Meal` belongs to one meal plan.
- A `MealCompletion` is unique by `patientId`, `mealId`, and `date`.
- A `Conversation` is unique by `patientId` and `nutritionistId`.
- A `Message` belongs to one conversation and stores sender and receiver explicitly.
- A `MealSubstitution` belongs to one patient, one nutritionist, and one meal.
- A `MealSubstitution` may also reference the user who applied it and the `DailyMacroLog` it affected.

## Progress Calculation Rules

Current progress relies on:

- `MacroGoal` for targets
- `DailyMacroLog` for consumed totals
- `MealCompletion` for completion state
- `MealSubstitution` application for extra consumed macros added from AI estimation

The main progress calculation remains:

`remaining = goal - consumed`

This rule must guide patient progress screens and nutritionist progress summaries.

## Current Consumption Update Rules

- Completing a meal adds that meal's macros to the daily log for the selected date.
- Uncompleting a meal subtracts that meal's macros from the daily log and clamps values at zero.
- Applying a substitution adds the estimated macros to the linked daily log.
- Daily logs may therefore be updated by more than one product flow and must remain consistent across those flows.

## Image And AI Data Rules

- Image files are stored externally and referenced by URL in application data.
- Substitution image URLs must remain valid HTTP or HTTPS URLs.
- AI estimation output is stored directly on `MealSubstitution`.
- Stored estimation data includes estimated macros, identified foods, portion estimate, confidence, notes, and timestamp.
- Estimation history must remain attributable to the substitution request that produced it.

## Naming And Consistency

- Use English identifiers in schema and code.
- Keep role and relationship names explicit.
- Prefer direct domain names over generic abstractions.
- Keep DTO and schema naming aligned with Prisma entities where practical.
