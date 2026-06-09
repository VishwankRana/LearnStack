# MindVault

MindVault is a personal knowledge management system scaffolded in phases. This repository now contains the completed Phase 1 foundation: a React frontend shell and an Express backend scaffold prepared for Prisma, Supabase PostgreSQL, and future AI/search modules.

## Phase 1 scope

Phase 1 intentionally stops at infrastructure. It includes:

- Frontend routing and application providers
- A shared layout and setup dashboard
- TanStack Query wiring
- Backend Express bootstrap and route structure
- Centralized config, middleware, and error handling
- Prisma configuration for PostgreSQL
- Environment examples for client and server

Business features such as authentication, notes, collections, and AI workflows begin in later phases.

## Project structure

```text
.
|-- server/
|   |-- prisma/
|   |   `-- schema.prisma
|   |-- src/
|   |   |-- config/
|   |   |-- lib/
|   |   |-- middleware/
|   |   |-- modules/
|   |   |   `-- system/
|   |   |-- routes/
|   |   |-- app.js
|   |   `-- server.js
|   `-- .env.example
|-- src/
|   |-- app/
|   |-- components/
|   |-- features/
|   |-- App.jsx
|   |-- App.css
|   |-- index.css
|   `-- main.jsx
|-- .env.example
`-- package.json
```

## Frontend commands

```bash
npm run dev
npm run build
```

## Backend commands

```bash
npm run server:dev
npm run server:start
npm run prisma:generate
npm run prisma:migrate:dev
```

## Environment setup

1. Copy `.env.example` to `.env` in the project root.
2. Copy `server/.env.example` to `server/.env` if you prefer separate server-local configuration.
3. Update `DATABASE_URL` with your Supabase PostgreSQL connection string.
4. Keep `JWT_SECRET`, Supabase keys, and API keys private.

## Initial API endpoints

- `GET /api/v1/health`
- `GET /api/v1/system/manifest`
