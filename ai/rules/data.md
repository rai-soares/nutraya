# Data Rules

## Data Model Scope

The MVP data model must start from these core entities:

- `User`
- `PatientProfile`
- `MealPlan`
- `Meal`
- `MacroGoal`
- `DailyLog`
- `MealPhoto`
- `Message`

These names should be preserved in code and schema unless a later architectural decision explicitly replaces them.

## Entity Intent

### `User`

Represents the base authenticated actor and must include role information.

### `PatientProfile`

Represents the link between a patient user and the responsible nutritionist.

### `MealPlan`

Represents a named plan associated with a patient.

### `Meal`

Represents a meal item within a meal plan. In the MVP, food content remains text-based.

### `MacroGoal`

Represents daily nutritional targets for a patient.

### `DailyLog`

Represents consumed macro totals for a patient on a specific date.

### `MealPhoto`

Represents an uploaded meal image and its estimated macros.

### `Message`

Represents a message exchanged between users, optionally with an image.

## Modeling Rules

- keep `foods` as text in the MVP
- prefer explicit relations over implicit conventions
- add timestamps to main entities when operationally useful
- keep schema naming in English

## Macro Progress Rule

The main progress calculation is:

`remaining = goal - consumed`

This rule must guide the patient home experience and any summary logic derived from macro goals and daily logs.

## Photo Estimation Rule

Meal photo estimation data must be stored independently from the daily log record.

However:

- photo results must be attributable to a patient
- photo estimates must be available for progress updates
- daily progress should reflect accepted consumption impact from photo-based flows

This separation keeps estimation history auditable while preserving a clean progress model.

## Naming and Consistency

- use English identifiers in code and schema
- keep business roles explicit
- use naming that reflects the domain directly
- avoid abbreviations unless they are already standardized in the project
