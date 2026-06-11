# MindVault — AI Change Log

---

## 2026-06-11 18:17 UTC+5:30 — Phase 8: AI Summarization (Complete)

### Files Changed
| File | Change |
|---|---|
| `server/src/lib/openrouter.js` | **Created** — OpenRouter chat completions client using `OPENROUTER_API_KEY` |
| `server/src/lib/summarizer.js` | **Created** — `summarizeDocument`, `summarizeNote`, `summarizeBookmark` using LLaMA 3.1 8B via OpenRouter |
| `server/src/modules/document/document.service.js` | **Modified** — added `summarize(id, userId)` method |
| `server/src/modules/document/document.controller.js` | **Modified** — added `summarizeDocument` handler |
| `server/src/modules/document/document.routes.js` | **Modified** — registered `POST /:id/summarize` |
| `server/src/modules/note/note.service.js` | **Modified** — added `summarize(id, userId)` method |
| `server/src/modules/note/note.controller.js` | **Modified** — added `summarizeNote` handler |
| `server/src/modules/note/note.routes.js` | **Modified** — registered `POST /:id/summarize` |
| `server/src/modules/bookmark/bookmark.service.js` | **Modified** — added `summarize(id, userId)` method |
| `server/src/modules/bookmark/bookmark.controller.js` | **Modified** — added `summarizeBookmark` handler |
| `server/src/modules/bookmark/bookmark.routes.js` | **Modified** — registered `POST /:id/summarize` |
| `src/features/documents/api/documentsApi.js` | **Modified** — added `summarizeDocument` API call |
| `src/features/documents/hooks/useDocuments.js` | **Modified** — added `useSummarizeDocument` mutation |
| `src/features/documents/pages/DocumentViewPage.jsx` | **Modified** — added AI Summary panel with Generate/Regenerate button |
| `src/features/documents/documents.css` | **Modified** — added `.document-view__summary-*` styles |
| `src/features/notes/api/notesApi.js` | **Modified** — added `summarizeNote` API call |
| `src/features/notes/hooks/useNotes.js` | **Modified** — added `useSummarizeNote` mutation |
| `src/features/notes/pages/NoteEditorPage.jsx` | **Modified** — added AI Summary panel below editor for existing notes |
| `src/features/notes/notes.css` | **Modified** — added `.note-editor__summary-*` styles |
| `src/features/bookmarks/api/bookmarksApi.js` | **Modified** — added `summarizeBookmark` API call |
| `src/features/bookmarks/hooks/useBookmarks.js` | **Modified** — added `useSummarizeBookmark` mutation |
| `src/features/bookmarks/components/BookmarkCard.jsx` | **Modified** — added sparkles button + inline summary display |
| `src/features/bookmarks/bookmarks.css` | **Modified** — added `.bookmark-card__summary` and `--summarize` button styles |

### Summary of Change
Implemented Phase 8 AI Summarization end-to-end. A new OpenRouter client (`openrouter.js`) calls the `meta-llama/llama-3.1-8b-instruct:free` model using the existing `OPENROUTER_API_KEY`. Three summarizer functions handle documents (uses `extractedText`), notes (uses `content`), and bookmarks (uses title + URL + description). Each content type gets a `POST /:id/summarize` endpoint that runs the LLM call, writes the result to the `summary` DB column, and returns the full updated record. On the frontend, documents and notes get a dedicated indigo-tinted "AI Summary" panel with a Generate/Regenerate button; bookmarks get a sparkles icon action button on the card and the summary renders inline below the description.

### Impacted Modules
- `server/src/lib/` — 2 new utility files (openrouter, summarizer)
- `server/src/modules/document/` — new summarize action
- `server/src/modules/note/` — new summarize action
- `server/src/modules/bookmark/` — new summarize action
- `src/features/documents/` — API, hook, page, CSS
- `src/features/notes/` — API, hook, page, CSS
- `src/features/bookmarks/` — API, hook, card component, CSS

### Risk Level
**Medium** — new LLM API dependency (OpenRouter); failures are surfaced to the user as inline error messages and do not affect existing CRUD flows. The `summary` column is nullable so missing summaries never break rendering.

---

## 2026-06-11 18:07 UTC+5:30 — Bug Fix: Supabase Storage Bucket Missing

### Files Changed
| File | Change |
|---|---|
| `server/scripts/create-bucket.js` | **Created** — one-time setup script to create the `mindvault-assets` Supabase Storage bucket |

### Summary of Change
Fixed "File upload failed: Bucket not found" error that appeared when uploading documents. The `mindvault-assets` Supabase Storage bucket referenced in `server/.env` and `server/src/lib/storage.js` did not exist in the Supabase project. A setup script was created and executed to create the bucket as a **public** bucket with a 10 MB file-size limit and allowed MIME types matching the app's upload policy (PDF, DOCX, TXT). The bucket is now live and document uploads work correctly.

### Impacted Modules
- `server/src/lib/storage.js` — upload calls now succeed (bucket exists)
- `server/scripts/create-bucket.js` — new utility script (idempotent, safe to re-run)

### Risk Level
**Low** — infrastructure-only fix. No application code changed. Script is idempotent (handles "already exists" gracefully).

---

## 2026-06-10 01:55 UTC+5:30 — Phase 6: Bookmarks Module (Complete)

### Files Changed
| File | Change |
|---|---|
| `server/src/modules/bookmark/bookmark.service.js` | **Created** — CRUD + search, URL validation |
| `server/src/modules/bookmark/bookmark.controller.js` | **Created** — request handlers |
| `server/src/modules/bookmark/bookmark.routes.js` | **Created** — `/bookmarks` router |
| `server/src/routes/index.js` | **Modified** — registered `/bookmarks` |
| `src/features/bookmarks/api/bookmarksApi.js` | **Created** |
| `src/features/bookmarks/hooks/useBookmarks.js` | **Created** |
| `src/features/bookmarks/components/BookmarkCard.jsx` | **Created** — card with Google favicon, external link |
| `src/features/bookmarks/components/BookmarkForm.jsx` | **Created** — URL + title + description + collection |
| `src/features/bookmarks/components/DeleteBookmarkDialog.jsx` | **Created** |
| `src/features/bookmarks/pages/BookmarksPage.jsx` | **Created** — list page with search + filter + create/edit dialogs |
| `src/features/bookmarks/bookmarks.css` | **Created** |
| `src/features/collections/pages/CollectionDetailPage.jsx` | **Modified** — bookmarks section now live |
| `src/app/router.jsx` | **Modified** — added `/app/bookmarks` |
| `src/components/layout/AppShell.jsx` | **Modified** — added Bookmarks nav link |

### Summary of Change
Implemented the complete Bookmarks module (Phase 6). Bookmarks are managed via inline dialogs (no full-page editor needed). The `BookmarksPage` supports search across title/URL/description and collection filtering. `BookmarkCard` displays favicons via Google's favicon service, shows the domain name, links open in a new tab. The `CollectionDetailPage` bookmarks section is now live — shows up to 6 cards, "Save Bookmark" pre-assigns the collection, "Show all" links to `/app/bookmarks?collectionId=X`. All mutations invalidate both `bookmarks` and `collections` caches so stat counts stay current.

### Impacted Modules
- `server/src/modules/bookmark/` — new
- `src/features/bookmarks/` — new feature module
- `src/features/collections/pages/CollectionDetailPage.jsx` — bookmarks section live
- `src/app/router.jsx` — 1 new route
- `src/components/layout/AppShell.jsx` — nav link

### Risk Level
**Low** — new additive module. Only existing change is CollectionDetailPage (bookmarks section).

---

## 2026-06-10 01:25 UTC+5:30 — Phase 5: Notes Module (Complete)

### Files Changed
| File | Change |
|---|---|
| `server/src/modules/note/note.service.js` | **Created** — CRUD + search service |
| `server/src/modules/note/note.controller.js` | **Created** — request/response handlers |
| `server/src/modules/note/note.routes.js` | **Created** — `/notes` router |
| `server/src/routes/index.js` | **Modified** — registered `/notes` route |
| `src/components/ui/Select.jsx` | **Created** — reusable native select component |
| `src/components/ui/ui.css` | **Modified** — added `.ui-select` styles |
| `src/features/notes/api/notesApi.js` | **Created** — fetch/create/update/delete API wrappers |
| `src/features/notes/hooks/useNotes.js` | **Created** — TanStack Query hooks |
| `src/features/notes/components/NoteCard.jsx` | **Created** — card with markdown strip preview + skeleton |
| `src/features/notes/components/DeleteNoteDialog.jsx` | **Created** — delete confirmation dialog |
| `src/features/notes/pages/NotesPage.jsx` | **Created** — list page with search + collection filter |
| `src/features/notes/pages/NoteEditorPage.jsx` | **Created** — full-page editor (new + edit modes) |
| `src/features/notes/notes.css` | **Created** — all notes feature styles |
| `src/app/router.jsx` | **Modified** — added `/app/notes`, `/app/notes/new`, `/app/notes/:id` |
| `src/components/layout/AppShell.jsx` | **Modified** — added Notes nav link |
| `package.json` | **Modified** — added `react-markdown`, `remark-gfm` |

### Summary of Change
Implemented the complete Notes module (Phase 5). The `NoteEditorPage` supports two modes (`/app/notes/new` for creation, `/app/notes/:id` for editing) with:
- **Auto-save debounce** (2s) for existing notes with status badges (Unsaved / Saving / Saved / Error)
- **Ctrl+S** manual save shortcut
- **Markdown toolbar** (Bold, Italic, Code, Heading, List, Blockquote, Link) with textarea selection manipulation
- **Ctrl+B / Ctrl+I** keyboard shortcuts
- **Tab** inserts 2 spaces in the editor
- **Write / Preview** tab toggle with full GFM markdown rendering (`react-markdown` + `remark-gfm`)
- **Collection picker** to assign/change note's collection
- Word count display

The `NotesPage` provides a responsive grid with real-time text search (`useDeferredValue`) and collection filtering, loading skeletons, and an empty state CTA.

Backend supports `GET /api/v1/notes?q=search&collectionId=X` for full-text `ILIKE` search across title and content.

### Impacted Modules
- `server/src/modules/note/` — new
- `server/src/routes/index.js` — registered
- `src/features/notes/` — new feature module
- `src/components/ui/` — Select component added
- `src/app/router.jsx` — 3 new protected routes
- `src/components/layout/AppShell.jsx` — nav link

### Risk Level
**Low** — additive new feature module. No existing logic modified except route registration and nav.

---

## 2026-06-10 00:50 UTC+5:30 — Phase 4: Collections UI (Complete)

### Files Changed
| File | Change |
|---|---|
| `src/features/collections/pages/CollectionsPage.jsx` | **Created** — main collections list page |
| `src/features/collections/pages/CollectionDetailPage.jsx` | **Created** — single collection detail/view page |
| `src/app/router.jsx` | **Modified** — registered `/app/collections` and `/app/collections/:id` routes |
| `src/components/layout/AppShell.jsx` | **Modified** — added Collections nav link for authenticated users |

### Summary of Change
Completed Phase 4 (Collections) by implementing the two missing frontend pages. The backend was already fully implemented (service, controller, routes, API router registration). The reusable components (`CollectionCard`, `CollectionForm`, `DeleteCollectionDialog`), hooks (`useCollections`, `useCollection`, `useCreateCollection`, `useUpdateCollection`, `useDeleteCollection`), API layer (`collectionsApi.js`), and all CSS (`collections.css`) were also already present.

**CollectionsPage** provides:
- Responsive grid of collection cards with skeleton loading states
- "New Collection" dialog (React Hook Form + color picker)
- Inline edit dialog per card (pre-filled with existing values)
- Delete confirmation dialog (with warning about uncategorized items)
- Empty state with a CTA for first-time users
- Error state handling

**CollectionDetailPage** provides:
- Breadcrumb back-navigation to the list
- Collection header with color icon, name, description
- Three stat cards (Notes / Documents / Bookmarks counts from `_count`)
- Per-type content sections (placeholder/coming-soon until Phases 5–7)
- Edit and delete actions with full dialog flows
- Loading spinner and 404-style error state

### Impacted Modules
- `src/features/collections/` — pages directory added
- `src/app/router.jsx` — two new protected routes
- `src/components/layout/AppShell.jsx` — nav updated

### Risk Level
**Low** — purely additive changes. No existing code modified beyond routing and nav. Backend unchanged.
