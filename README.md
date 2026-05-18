# Nutraya

Nutraya is a responsive fullstack web application for nutrition follow-up between nutritionists and patients.

The repository is no longer an MVP foundation or planning-only codebase. It already includes implemented frontend flows, API routes, Prisma models, provider integrations, and automated tests for the current product.

## Current Product Scope

The application currently supports:

- registration and login
- forgot password and reset password flows
- role-based access for `NUTRI` and `PATIENT`
- nutritionist-managed patient creation and linking
- patient profile ownership by a single nutritionist
- manual macro goal configuration per patient
- meal plan creation, editing, activation, and meal management
- patient daily macro progress based on goals and consumed totals
- meal completion and uncompletion by date
- patient history and progress history views
- asynchronous chat between nutritionist and patient
- text and image chat messages
- image upload with Cloudinary
- meal substitution requests with image upload
- Gemini-based AI macro estimation for substitution images
- nutritionist feedback on substitution requests
- automatic application of estimated substitution macros to the daily log

## Tech Stack

- Next.js App Router fullstack
- React
- Tailwind CSS
- MUI
- React Query
- React Hook Form
- PostgreSQL
- Prisma
- Vitest

## Current Integrations

- JWT bearer authentication
- Cloudinary for image storage
- Gemini for image-based macro estimation
- Resend for password reset email delivery

These integrations are already part of the application architecture and are kept behind internal service boundaries.

## Main Routes

### Public

- `/`
- `/login`
- `/register`
- `/forgot-password`
- `/reset-password`

### Patient

- `/patient`
- `/patient/history`
- `/patient/chat`

### Nutritionist

- `/nutritionist`
- `/nutritionist/patients`
- `/nutritionist/patients/[patientId]`
- `/nutritionist/chat`
- `/nutritionist/substitutions`

## Core Modules

The codebase is organized around these modules:

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
- Gemini estimation

## Environment Variables

Copy `.env.example` to `.env` and configure:

```bash
# Prisma
DATABASE_URL=

# JWT
JWT_SECRET=

# Mail
RESEND_API_KEY=
MAIL_FROM=
APP_URL=

# Cloudinary
CLOUDINARY_CLOUD_NAME=
CLOUDINARY_API_KEY=
CLOUDINARY_API_SECRET=
CLOUDINARY_FOLDER=

# Gemini
GEMINI_API_KEY=
GEMINI_MODEL=
```

## Run Locally

```bash
npm install
npm run prisma:generate
npm run prisma:migrate -- --name init
npm run dev
```

Open `http://localhost:3000`.

## Quality Checks

```bash
npm run lint
npm test
npm run build
```

## Notes

- The application is a monolithic Next.js fullstack app with thin route handlers and domain logic in `src/modules`.
- Chat is intentionally asynchronous and polling-based.
- Macro estimation is AI-assisted and approximate by design.
- Only one meal plan should be active per patient at a time.
- Daily progress is derived from macro goals and consumed totals stored per date.
