# LearnStack — Personal knowledge vault with AI study tools

LearnStack (MindVault) is a full-stack web app for organizing notes, documents, and bookmarks in collections, then turning that content into AI-generated study guides, flashcards, and quizzes. The frontend is a React SPA; the backend is an Express REST API backed by PostgreSQL, with file storage on Supabase and AI requests routed through OpenRouter.

---

## Features

### Authentication
- Register with name, email, password, and optional avatar URL and bio
- Login and logout with email and password
- JWT stored in `localStorage`; session restored on page load via `GET /auth/me`
- Protected `/app/*` routes redirect unauthenticated users to login

### Dashboard
- View counts of notes, documents, bookmarks, and collections
- See recent activity feed and recently created content
- Analytics section with content growth chart (weekly notes/documents/bookmarks), 12-month study activity heatmap, and quiz performance chart

### Collections
- Create, edit, and delete collections with name, description, and color
- Open a collection detail page to manage its notes, bookmarks, and documents in one place
- Deleting a collection cascades to its notes and documents (bookmarks are unlinked, not deleted)

### Notes
- Create, edit, and delete markdown notes
- Assign notes to a collection
- Filter notes by search term or collection
- Markdown editor with toolbar, write/preview modes, auto-save, manual save, and word count
- Commit snapshots and browse/restore version history
- Generate an AI study-guide summary from note content

### Documents
- Upload PDF, DOCX, or TXT files (up to 10 MB) to Supabase Storage
- Automatic text extraction on upload; manual re-extract from the document view
- Edit title and collection assignment; download the original file
- Generate an AI study-guide summary from extracted text

### Bookmarks
- Save bookmarks with title, URL, optional description, and collection
- Edit and delete bookmarks
- Generate an AI summary from bookmark metadata (API endpoint exists; summarize flow is wired on the backend)

### Search
- Global search across notes, documents, bookmarks, and collections (case-insensitive)
- Search modal opened from the top bar (`Ctrl/Cmd+K`) and dedicated search page at `/app/search`
- Paginated API results (`page`, `limit` query params; default limit 10, max 50)

### Study Tools
- Generate flashcard decks and 10-question multiple-choice quizzes from a note or document (one deck/quiz per source; reuses existing materials)
- Study flashcards with flip navigation; reviews are tracked for analytics
- Take quizzes, submit answers, see score and explanations; attempts are persisted

### Activity
- Paginated activity log of content and study events (note/document/bookmark/collection changes, flashcard reviews, quiz attempts)
- Infinite-scroll style loading on the activity page

---

## Tech Stack

**Frontend**
- React 19 — UI
- Vite 8 — dev server and production build
- React Router 7 — client-side routing
- TanStack React Query — server state and caching
- React Hook Form — login/register forms
- React Markdown + remark-gfm — markdown preview and AI summary rendering
- Recharts — dashboard analytics charts
- Plain CSS — global and feature-scoped stylesheets (`App.css`, `src/features/*/*.css`, `src/components/ui/ui.css`)

**Backend**
- Node.js + Express 5 — REST API (`/api/v1`)
- Prisma 6 — ORM and migrations
- bcryptjs — password hashing
- jsonwebtoken — JWT access tokens
- multer — in-memory file upload handling
- pdf-parse — PDF text extraction
- mammoth — DOCX text extraction
- helmet, cors, morgan — security headers, CORS, request logging

**Database**
- PostgreSQL — primary data store (users, content, activities, study materials, quiz attempts)

**Infrastructure / Services**
- Supabase Storage — document file uploads (public bucket)
- OpenRouter — AI chat completions for summaries, flashcards, and quizzes (`meta-llama/llama-3.1-8b-instruct` by default)

---

## Getting Started

### Prerequisites
- Node.js 18+ (ES modules; project uses `"type": "module"`)
- PostgreSQL 14+ (local instance or hosted, e.g. Supabase Postgres)
- Supabase project — required for document uploads
- OpenRouter API key — required for AI summaries, flashcards, and quizzes

### 1. Clone the Repository

```bash
git clone https://github.com/your-username/MindVault.git
cd MindVault
```

### 2. Install Dependencies

```bash
npm install
```

This is a single-package monorepo: frontend (`src/`) and backend (`server/`) share the root `package.json`.

### 3. Configure Environment Variables

Create `server/.env` (loaded by the backend):

```env
# Server
NODE_ENV=development
PORT=4000
CLIENT_URL=http://localhost:5173

# Database (PostgreSQL connection strings)
DATABASE_URL=postgresql://postgres:postgres@localhost:5432/mindvault
DIRECT_URL=postgresql://postgres:postgres@localhost:5432/mindvault

# Auth
JWT_SECRET=change-this-to-a-long-random-string
JWT_EXPIRES_IN=7d

# Supabase (https://supabase.com — Project Settings → API)
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
SUPABASE_STORAGE_BUCKET=mindvault-assets

# AI (https://openrouter.ai — API Keys)
OPENROUTER_API_KEY=your-openrouter-api-key
```

Optional frontend override — create `.env` in the project root if the API is not on the default host:

```env
VITE_API_URL=http://localhost:4000/api/v1
```

### 4. Run Database Migrations and Generate Prisma Client

```bash
npm run prisma:migrate:dev
npm run prisma:generate
```

Applies all migrations in `server/prisma/migrations/` and generates the Prisma client. On Windows, stop running dev servers before `prisma:generate` if file locking errors occur.

### 5. Create the Supabase Storage Bucket (one-time)

From the project root, after Supabase env vars are set:

```bash
node server/scripts/create-bucket.js
```

Creates the public storage bucket defined in `SUPABASE_STORAGE_BUCKET` (default: `mindvault-assets`).

### 6. Start Development Servers

Terminal 1 — frontend (port **5173**):

```bash
npm run dev
```

Terminal 2 — backend (port **4000**):

```bash
npm run server:dev
```

Open `http://localhost:5173`. The API is available at `http://localhost:4000/api/v1`.

---

## Environment Variables

| Variable | Required | Description |
|----------|----------|-------------|
| `DATABASE_URL` | Yes | PostgreSQL connection URL used by Prisma at runtime. Defaults to `postgresql://postgres:postgres@localhost:5432/mindvault` if unset. |
| `DIRECT_URL` | Yes* | Direct PostgreSQL URL for Prisma migrations (required in `schema.prisma`; use a non-pooled URL with Supabase). |
| `CLIENT_URL` | Yes | Frontend origin for CORS-related config. Defaults to `http://localhost:5173`. |
| `JWT_SECRET` | Yes | Secret for signing JWT access tokens. Defaults to `phase-2-secret` if unset (not safe for production). |
| `PORT` | No | API server port. Default: `4000`. |
| `NODE_ENV` | No | Environment name. Default: `development`. |
| `JWT_EXPIRES_IN` | No | JWT expiry passed to `jsonwebtoken`. Default: `7d`. |
| `SUPABASE_URL` | Yes** | Supabase project URL. Required for document uploads. |
| `SUPABASE_SERVICE_ROLE_KEY` | Yes** | Supabase service role key used by the server for storage operations. |
| `SUPABASE_ANON_KEY` | No | Loaded in env config but not used by current server code. |
| `SUPABASE_STORAGE_BUCKET` | No | Storage bucket name. Default: `mindvault-assets`. |
| `OPENROUTER_API_KEY` | Yes*** | OpenRouter API key for AI features. Empty string disables AI calls and causes summarize/generate endpoints to fail. |
| `VITE_API_URL` | No | Frontend API base URL. Default: `http://localhost:4000/api/v1`. |

\*Required by Prisma schema; migrations fail without it.  
\**Required for document upload/delete. Other features work without Supabase.  
\***Required for AI summaries, flashcards, and quizzes.

---

## API Reference

All authenticated routes expect `Authorization: Bearer <token>`. Base path: `/api/v1`.

### Auth
- `POST /auth/register` — Create account; returns JWT and user
- `POST /auth/login` — Login; returns JWT and user
- `POST /auth/logout` — Logout (authenticated)
- `GET /auth/me` — Get current user (authenticated)

### Collections
- `GET /collections` — List user's collections
- `GET /collections/:id` — Get collection
- `POST /collections` — Create collection
- `PATCH /collections/:id` — Update collection
- `DELETE /collections/:id` — Delete collection and cascade-delete its notes/documents

### Notes
- `GET /notes` — List notes (`search`, `collectionId` query params)
- `GET /notes/:id` — Get note
- `POST /notes` — Create note
- `PATCH /notes/:id` — Update note
- `DELETE /notes/:id` — Delete note
- `POST /notes/:id/summarize` — Generate AI study-guide summary
- `GET /notes/:id/versions` — List version snapshots
- `GET /notes/:id/versions/:versionId` — Get a version
- `POST /notes/:id/snapshot` — Commit a version snapshot
- `POST /notes/:id/restore/:versionId` — Restore note from a version

### Documents
- `GET /documents` — List documents (`search`, `collectionId` query params)
- `GET /documents/:id` — Get document
- `POST /documents` — Upload file (`multipart/form-data`, field `file`)
- `PATCH /documents/:id` — Update document metadata
- `DELETE /documents/:id` — Delete document and storage file
- `POST /documents/:id/summarize` — Generate AI study-guide summary
- `POST /documents/:id/reextract` — Re-run text extraction on stored file

### Bookmarks
- `GET /bookmarks` — List bookmarks
- `GET /bookmarks/:id` — Get bookmark
- `POST /bookmarks` — Create bookmark
- `PATCH /bookmarks/:id` — Update bookmark
- `DELETE /bookmarks/:id` — Delete bookmark
- `POST /bookmarks/:id/summarize` — Generate AI summary

### Search
- `GET /search?q=&page=&limit=` — Search notes, documents, bookmarks, and collections

### Activity
- `GET /activities?page=&limit=` — Paginated activity log
- `GET /activities/recent?limit=` — Recent activities

### Dashboard
- `GET /dashboard/stats` — Content counts
- `GET /dashboard/recent-activity?limit=` — Recent activity items
- `GET /dashboard/recent-content` — Recent notes, documents, and bookmarks

### Study
- `GET /study/materials?sourceType=&sourceId=` — Existing flashcard deck/quiz for a source
- `GET /study/flashcards` — List flashcard decks
- `POST /study/flashcards/generate` — Generate flashcards from note or document
- `GET /study/flashcards/:id` — Get deck with cards
- `POST /study/flashcards/:id/review` — Record a flashcard review
- `GET /study/quizzes` — List quizzes
- `POST /study/quiz/generate` — Generate quiz from note or document
- `GET /study/quizzes/:id` — Get quiz with questions
- `POST /study/quizzes/:id/attempt` — Submit quiz attempt and score

### Analytics
- `GET /analytics` — Combined dashboard analytics payload
- `GET /analytics/content-growth?weeks=` — Weekly content creation chart data
- `GET /analytics/study-heatmap?days=` — Daily study activity heatmap (default 365 days)
- `GET /analytics/quiz-performance` — Quiz attempt history and stats

### System
- `GET /health` — Health check
- `GET /system/manifest` — API manifest (public)

---

## License

MIT
