export const setupChecklist = [
  {
    title: 'Routing and providers',
    description:
      'Browser router, shared layout, and TanStack Query are wired at the application boundary.',
  },
  {
    title: 'Backend layering',
    description:
      'Controllers, services, routes, middleware, and config modules are separated for Phase 2 growth.',
  },
  {
    title: 'Prisma and Supabase',
    description:
      'A PostgreSQL datasource and generated Prisma client are configured for future domain models.',
  },
]

export const stackSections = [
  {
    label: 'Frontend',
    value: 'React + Vite',
    description:
      'Feature-based folders, shared UI building blocks, route-level composition, and query-ready data flow.',
  },
  {
    label: 'Backend',
    value: 'Express API',
    description:
      'Versioned REST routes, central error middleware, request logging, and environment validation.',
  },
  {
    label: 'Data',
    value: 'Prisma ORM',
    description:
      'Schema-first database modeling with a clean place for migrations, seeds, and generated access.',
  },
  {
    label: 'Scale Path',
    value: 'AI + Search',
    description:
      'Interfaces are prepared for summaries, embeddings, semantic search, and future RAG features.',
  },
]

export const apiFoundations = [
  {
    method: 'GET',
    title: '/api/v1/health',
    description:
      'Confirms API readiness, environment mode, and server uptime for local and hosted deployments.',
  },
  {
    method: 'GET',
    title: '/api/v1/system/manifest',
    description:
      'Returns the current backend feature map so the frontend can introspect the scaffold during setup.',
  },
]

export const architectureTokens = [
  {
    title: 'Feature-first UI',
    description:
      'Pages stay close to feature data and future forms, while reusable layout and UI elements remain shared.',
  },
  {
    title: 'Service isolation',
    description:
      'Controllers stay thin and delegate behavior to service modules, keeping business logic testable.',
  },
  {
    title: 'Operational defaults',
    description:
      'Security headers, CORS, JSON parsing, request IDs, and error serialization are in place from the start.',
  },
]

export const roadmapItems = [
  {
    title: 'Phase 2 authentication',
    description:
      'User model, JWT flows, password hashing, and protected application sections plug into the new scaffold.',
  },
  {
    title: 'Phase 3 dashboard',
    description:
      'Statistics and activity views can consume shared query utilities and backend route namespaces.',
  },
  {
    title: 'Knowledge modules',
    description:
      'Collections, notes, bookmarks, and documents can each add isolated routes, services, validators, and pages.',
  },
]
