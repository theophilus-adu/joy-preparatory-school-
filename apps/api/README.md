API (NestJS) placeholder

Run (from apps/api):

```
npm install
npm run dev
```

The API includes:
- Prisma integration (`PrismaModule`, `PrismaService`)
- Auth skeleton (JWT strategy, AuthService)
- Users module with `register` and protected `me` endpoint

Next steps: run `npm install` in `apps/api`, generate Prisma client from root and run migrations + seed.
