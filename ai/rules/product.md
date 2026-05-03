# Product Rules

## MVP Scope

Nutraya must ship first as a responsive web MVP focused on nutrition follow-up and daily adherence.

The MVP includes:

- nutritionist and patient users
- patient assignment to a nutritionist
- meal plan definition
- macro goal definition
- daily macro progress tracking
- chat between nutritionist and patient
- meal photo submission with estimated macros

The MVP does not require:

- food database modeling
- realtime chat
- advanced analytics
- social features
- automation-heavy backoffice workflows

## User Roles

The product has exactly two roles in the MVP:

- `NUTRI`
- `PATIENT`

Any authorization and UI branching should be based on these roles.

## Primary Flows

### Nutritionist

- create or manage patient access
- define meal plans
- define macro goals
- review patient context
- answer chat messages
- review meal photos when needed

### Patient

- view daily goals
- view daily progress
- view meal plan
- send meal photos
- exchange messages with the nutritionist

## Minimum Screens

### Patient

- Home
- Diet
- Chat

Home must expose:

- current macro goals
- consumed versus remaining progress
- meal plan summary
- primary action to send a photo

### Nutritionist

- patient list
- patient profile
- meal plan editing
- macro goal management
- chat

## MVP Simplification Rules

- meal plan foods remain text-based in the MVP
- macro goals are entered manually
- AI estimation may be approximate
- chat starts as standard request-response data flow
- the system should prefer clarity over configurability

## Success Criteria

The MVP is successful if:

- patients can understand and follow their daily macro goals
- patients can log progress through the intended flows
- patients use photo submission as part of the routine
- patients and nutritionists can communicate continuously
- nutritionists can guide and adjust care without needing external tools
