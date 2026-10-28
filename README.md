# Joy Preparatory School - Management Portal

Monorepo scaffold for the Joy Preparatory School management system.

Getting started (local development):

1. Copy `.env.example` to `.env` and update values.
2. Start PostgreSQL with Docker Compose:

```bash
docker-compose up -d
```

3. Install dependencies (root):

```bash
npm run bootstrap
```

4. Generate Prisma client:

```bash
npm run prisma:generate
```

5. Run migrations and seed (ensure `DATABASE_URL` in `.env` points to the DB):

```bash
npx prisma migrate dev --schema=prisma/schema.prisma
npm run prisma:seed
```

Next steps: scaffold `apps/web` (Next.js) and `apps/api` (NestJS) and implement features incrementally as specified in the project plan.
