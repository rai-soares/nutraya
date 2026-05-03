# Nutraya Backend Foundation

Initial backend foundation for the Nutraya MVP using Next.js, Prisma, and PostgreSQL.

## Available API routes

- `POST /api/users`
- `GET /api/users`
- `POST /api/macro-goals`
- `GET /api/macro-goals/patient/:patientId`

## Environment

Copy `.env.example` to `.env` and set your PostgreSQL connection string:

```bash
DATABASE_URL=
```

## Run locally

```bash
npm install
npm run prisma:generate
npm run prisma:migrate -- --name init
npm run dev
```

## Tests

Unit tests are mandatory for every new module, service, route handler, and validation rule added to the project.

```bash
npm test
```
