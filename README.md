# Nutraya MVP Foundation

Nutraya is a Next.js fullstack MVP for nutrition follow-up between nutritionists and patients.

This repository now includes:

- backend API routes for auth, users, macro goals, daily progress, meal plans, and meal completions
- frontend foundation with MUI, React Query, and React Hook Form
- patient home with macro progress and meal checklist
- simple nutritionist dashboard with linked-patient discovery through existing endpoints

## Frontend routes

- `/login`
- `/register`
- `/patient`
- `/nutritionist`

## Environment

Copy `.env.example` to `.env` and set the required values:

```bash
DATABASE_URL=
JWT_SECRET=
```

## Run locally

```bash
npm install
npm run prisma:generate
npm run prisma:migrate -- --name init
npm run dev
```

Open `http://localhost:3000`.

## Verification

```bash
npm run lint
npm test
npm run build
```
