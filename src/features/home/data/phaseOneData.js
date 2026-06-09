export const setupChecklist = [
  {
    title: 'Routing, providers, and auth state',
    description:
      'Browser router, shared layout, TanStack Query, and auth context are wired at the application boundary.',
  },
  {
    title: 'Protected navigation',
    description:
      'A protected route wrapper prevents unauthenticated access to the app workspace and redirects to login.',
  },
  {
    title: 'Backend authentication module',
    description:
      'Controllers, services, routes, JWT helpers, and authentication middleware are separated for maintainable auth flows.',
  },
]

export const stackSections = [
  {
    label: 'Frontend',
    value: 'React + Vite',
    description:
      'Feature-based folders, auth pages, shared UI building blocks, and protected route composition.',
  },
  {
    label: 'Backend',
    value: 'Express API',
    description:
      'Versioned auth routes, request context, error middleware, and JWT verification for protected requests.',
  },
  {
    label: 'Data',
    value: 'Prisma ORM',
    description:
      'Schema-first user modeling with unique emails, hashed passwords, and generated access through Prisma Client.',
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
    method: 'POST',
    title: '/api/v1/auth/register',
    description:
      'Creates a new user, hashes the password, and returns a JWT plus a safe user payload.',
  },
  {
    method: 'POST',
    title: '/api/v1/auth/login',
    description:
      'Validates credentials and returns a fresh JWT for the matching account.',
  },
  {
    method: 'GET',
    title: '/api/v1/auth/me',
    description:
      'Reads the current signed-in user from a Bearer token and powers session restoration on the client.',
  },
  {
    method: 'POST',
    title: '/api/v1/auth/logout',
    description:
      'Acknowledges client-side logout so the frontend can clear its stored token consistently.',
  },
]

export const architectureTokens = [
  {
    title: 'Feature-first UI',
    description:
      'Pages stay close to feature forms and auth calls, while reusable layout and UI elements remain shared.',
  },
  {
    title: 'Service isolation',
    description:
      'Controllers stay thin and delegate register/login behavior to a dedicated auth service, keeping business logic testable.',
  },
  {
    title: 'Operational defaults',
    description:
      'Security headers, CORS, JSON parsing, request IDs, error serialization, and token verification remain centralized.',
  },
]

export const roadmapItems = [
  {
    title: 'Phase 3 dashboard',
    description:
      'Statistics, recent activity, and recent content can now rely on authenticated user identity.',
  },
  {
    title: 'Content ownership',
    description:
      'Collections, notes, bookmarks, and documents can safely attach records to a signed-in user.',
  },
  {
    title: 'AI personalization',
    description:
      'Later AI summaries, search, and recommendations can scope results to the authenticated account context.',
  },
]
