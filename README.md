# Task Manager App

A small full-stack task manager built to practice authentication, API routes, Prisma, PostgreSQL, and Docker in a Next.js app.

## What This Project Does

- redirects users to login or dashboard based on the refresh-token cookie
- logs users in with JWT-based access and refresh tokens
- stores users and tasks in PostgreSQL
- uses Prisma as the ORM layer
- lets authenticated users create, update, list, and soft-delete tasks
- runs locally with Docker Compose

## Tech Stack

- Next.js 16
- React 19
- TypeScript
- Prisma
- PostgreSQL
- Docker Compose
- `jose` for JWT handling

## Project Goal

This project was built as a learning exercise for:

- connecting a Next.js app to PostgreSQL
- using Prisma with a relational database
- understanding Docker images, containers, networks, and volumes
- handling simple authentication with access and refresh tokens

## Environment Variables

Create a `.env` file from `.env.example`.

Required variables:

```env
DATABASE_URL="postgresql://postgres:example@localhost:5432/postgres"
NEXT_LOGIN_ACCESS_SECRET="replace-with-a-long-random-string"
NEXT_LOGIN_REFRESH_SECRET="replace-with-a-different-long-random-string"
NEXT_PUBLIC_SUPABASE_URL="https://your-project.supabase.co"
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY="your-supabase-publishable-key"
```

Note:
The codebase still contains Supabase helper files, so the Supabase public variables are still expected at runtime even though PostgreSQL is now running in Docker.

## Run Locally Without Docker

Install dependencies:

```bash
pnpm install
```

Generate the Prisma client:

```bash
pnpm prisma generate
```

Run database migrations:

```bash
pnpm prisma migrate dev
```

Start the app:

```bash
pnpm dev
```

The app runs on [http://localhost:3002](http://localhost:3002).

## Run With Docker

Build and start the containers:

```bash
docker compose -f Compose.yml up --build
```

Services:

- app: `http://localhost:3002`
- Adminer: `http://localhost:8080`
- PostgreSQL: `localhost:5432`

If you want a fresh database volume while learning:

```bash
docker compose -f Compose.yml down -v
docker compose -f Compose.yml up --build
```

## Database

Prisma schema and migrations are stored in:

- [`prisma/schema.prisma`](./prisma/schema.prisma)
- [`prisma/migrations`](./prisma/migrations)

Current models:

- `users`
- `tasks`

## API Routes

Main route handlers live in `app/api`:

- `/api/login`
- `/api/logout`
- `/api/refresh`
- `/api/tasks`

## Known Limitations

- the project still has some Supabase-specific helper code even though the main database is now PostgreSQL with Prisma
- `script.ts` is treated as a local scratch/seed script and is ignored from Git
- Docker uses a simple development setup and is not production-hardened

## What I Learned

You can update this section with your own notes. A good README does not need to be fancy. It should clearly answer:

- what the project is
- why you built it
- how to run it
- what stack it uses
- what is incomplete or intentionally simple

## Before Pushing To GitHub

Recommended checks:

```bash
git status
pnpm lint
```

Make sure you are not committing:

- `.env`
- `.next`
- `node_modules`
- local Docker volumes
- temporary seed or scratch files
