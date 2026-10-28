# Joy Preparatory School - Frontend

Next.js 14 + TypeScript + Tailwind CSS frontend for the school management system.

## Features

- Modern, responsive UI
- React Hook Form + Zod validation
- TanStack Query for data fetching
- Recharts for analytics
- Tailwind CSS for styling
- JWT-based authentication
- Offline support ready (IndexedDB)

## Setup

```bash
npm install
cp .env.local.example .env.local
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) to start.

## Structure

```
src/
├── app/           # Next.js app directory
├── components/    # Reusable UI components
├── lib/           # Utilities, API client, hooks
└── types/         # TypeScript types
```

## Development

- `npm run dev` - Start dev server
- `npm run build` - Build for production
- `npm run start` - Start production server
- `npm run lint` - Run ESLint

## Environment Variables

- `NEXT_PUBLIC_API_URL` - Backend API URL (default: http://localhost:4000)

## Connected to API

The frontend expects the API running on `http://localhost:4000` with endpoints:
- `GET /api/school` - Fetch school info
- `POST /api/auth/login` - User login
- `GET /api/users/me` - Get current user
