# Product Rules

## Current Product Scope

Nutraya is no longer a planning-only MVP. The current repository already implements the first working version of the product and documentation must match the behavior that exists today.

The current scope includes:

- nutritionist and patient accounts
- nutritionist-managed patient linking
- macro goal management per patient
- active meal plans with meal-level macros
- patient daily macro progress
- meal completion tracking by date
- chat between nutritionist and patient
- image upload for chat and meal substitution flows
- meal substitution requests based on patient meal photos
- AI macro estimation for substitution photos
- nutritionist feedback on substitution requests

## User Roles

The product currently has exactly two roles:

- `NUTRI`
- `PATIENT`

Authorization, route protection, and UI branching must remain based on these roles.

## Primary Flows

### Nutritionist

- create or link patient access
- view linked patients
- open a patient detail view
- define or update macro goals
- create meal plans
- activate one meal plan at a time per patient
- create, edit, and remove meals inside the active plan
- exchange text and image messages with linked patients
- review substitution requests and save feedback

### Patient

- register and login
- access a protected home screen
- view macro goals, consumed macros, and remaining macros for the day
- view the active meal plan and scheduled meals
- mark meals as completed or uncompleted
- request a meal substitution by sending a meal image
- view AI estimation and nutritionist feedback for substitution requests
- exchange text and image messages with the nutritionist

## Active Screens

### Patient

- Login
- Register
- Home
- Chat

Patient home currently prioritizes:

- daily macro summary
- consumed versus remaining progress
- active meal plan context
- meal checklist
- substitution request flow

### Nutritionist

- Patient list
- Patient detail
- Chat
- Substitution requests

The nutritionist flow is centered on managing linked patients rather than a separate analytics-heavy dashboard.

## Product Behavior Rules

- Each patient is currently linked to one nutritionist.
- Macro goals are manually entered and updated by the nutritionist.
- Meal plans are patient-specific.
- Only one meal plan should be active per patient at a time.
- Daily progress is derived from the patient's macro goal and the consumed totals stored for a date.
- Meal completion currently affects daily consumed macros automatically.
- Meal substitution requests currently trigger image-based macro estimation immediately after creation.
- Successful substitution creation currently applies the estimated macros to the patient's daily log automatically.
- Nutritionist feedback is part of the substitution review flow.
- Chat remains asynchronous and polling-based; realtime delivery is not part of the current product behavior.

## Current Simplifications

- Meals remain simple records with manual macros instead of a structured food database.
- Chat works as a standard request-response flow with periodic refetching.
- AI estimations are approximate and may include confidence and notes rather than exact nutrition analysis.
- The product favors clear operational flows over configurable workflow engines.
- Advanced analytics, backoffice automation, and multi-nutritionist ownership models are outside the current scope.

## Success Criteria For Ongoing Work

Changes are aligned with the product when they help preserve or improve these outcomes:

- nutritionists can configure patient guidance without leaving the app
- patients can understand the day plan and act on it quickly
- consumed macro progress stays consistent with completed meals and applied substitutions
- communication between nutritionist and patient remains simple and reliable
- image-based substitution flows remain practical even with estimation uncertainty
