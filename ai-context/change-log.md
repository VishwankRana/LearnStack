# MindVault Change Log

---

## 2026-06-17 — Note Editor Default Preview Mode

### Files Changed

**Modified:**
- `src/features/notes/pages/NoteEditorPage.jsx` — default editor mode set to preview

### Summary

Opening a note in the editor now shows the Preview tab by default instead of Write.

### Impacted Modules

- Notes

### Risk Level

**Low**

---

## 2026-06-17 — Auth Form Centering & Icons

### Files Changed

**Added:**
- `src/features/auth/components/AuthFormIcons.jsx`

**Modified:**
- `src/features/auth/components/AuthLayout.jsx` — optional form icon at top of card
- `src/features/auth/auth.css` — centered card content and icon styling
- `src/features/auth/pages/LoginPage.jsx` — login form icon
- `src/features/auth/pages/RegisterPage.jsx` — register form icon

### Summary

Centered auth card content and added distinct SVG icons at the top of the login and signup forms.

### Impacted Modules

- Auth

### Risk Level

**Low**

---

## 2026-06-17 — Public Pages UI Refinement

### Files Changed

**Modified:**
- `src/components/layout/AppShell.jsx` — hide topbar on home, login, and register
- `src/features/auth/components/AuthLayout.jsx` — centered form, logo top-left, removed aside panel
- `src/features/auth/auth.css` — flat layout styling, no gradients
- `src/features/home/pages/HomePage.jsx` — page header with nav, SVG icons instead of emojis
- `src/features/home/home.css` — solid colors, feature icon styling, home header
- `src/App.css` — flat auth shell backdrop

### Summary

Removed the global top header from the home page and simplified auth pages to a centered form with logo in the top-left corner. Replaced gradient styling and emoji feature icons with solid colors and shared SVG icons.

### Impacted Modules

- Auth, Home, App shell

### Risk Level

**Low**

---

## 2026-06-17 — Auth & Home Page UI Refresh

### Files Changed

**Added:**
- `src/features/auth/components/AuthLayout.jsx`
- `src/features/auth/auth.css`
- `src/features/home/home.css`

**Modified:**
- `src/components/layout/AppShell.jsx` — hide topbar on login/register
- `src/features/auth/pages/LoginPage.jsx` — split auth layout, ui components
- `src/features/auth/pages/RegisterPage.jsx` — split auth layout, ui components
- `src/features/home/pages/HomePage.jsx` — redesigned landing page
- `src/App.css` — auth shell full-width styles

### Summary

Removed the top header from login and register pages. Redesigned auth forms with a split-panel layout and shared UI inputs. Improved the home page with hero, feature cards, and CTA section.

### Impacted Modules

- Auth, Home, App shell

### Risk Level

**Low**

---

## 2026-06-17 — Cascade Delete Notes & Documents with Collection

### Files Changed

**Added:**
- `server/prisma/migrations/20260617150000_cascade_delete_collection_content/migration.sql`

**Modified:**
- `server/prisma/schema.prisma` — `Note` and `Document` use `onDelete: Cascade` on `collectionId`
- `server/src/modules/collection/collection.service.js` — delete document storage files before collection delete

### Summary

Deleting a collection now deletes all notes and documents in that collection. Document files are removed from storage first. Bookmarks remain and are unlinked (`SetNull` unchanged).

### Impacted Modules

- Collections, Notes, Documents, Database

### Risk Level

**Medium** — requires migration; deleting a collection is destructive for its notes and documents.

---

## 2026-06-17 — Dashboard Analytics Section

### Files Changed

**Added:**
- `server/prisma/migrations/20260617140000_add_quiz_attempts/migration.sql`
- `server/src/modules/analytics/analytics.service.js`
- `server/src/modules/analytics/analytics.controller.js`
- `server/src/modules/analytics/analytics.routes.js`
- `src/features/dashboard/api/analyticsApi.js`
- `src/features/dashboard/hooks/useAnalytics.js`
- `src/features/dashboard/components/DashboardAnalyticsSection.jsx`
- `src/features/dashboard/components/ContentGrowthChart.jsx`
- `src/features/dashboard/components/StudyHeatmap.jsx`
- `src/features/dashboard/components/QuizPerformanceChart.jsx`

**Modified:**
- `server/prisma/schema.prisma` — added `QuizAttempt` model
- `server/src/routes/index.js` — mounted `/analytics` router
- `server/src/modules/activity/activity.service.js` — `FLASHCARD_REVIEWED`, `QUIZ_ATTEMPTED`
- `server/src/modules/study/study.service.js` — record review/attempt endpoints
- `server/src/modules/study/study.controller.js`, `study.routes.js`
- `src/features/dashboard/pages/DashboardPage.jsx` — analytics section
- `src/features/dashboard/dashboard.css` — analytics styles
- `src/features/study/pages/QuizPage.jsx`, `FlashcardStudyPage.jsx` — track activity
- `src/features/study/api/studyApi.js`, `hooks/useStudy.js`
- `package.json` — added `recharts`

### Summary

Added dashboard analytics: content growth line chart (notes/documents/bookmarks per week), GitHub-style study activity heatmap, and quiz performance chart with average/highest scores. Quiz attempts and flashcard reviews are persisted for analytics.

### Impacted Modules

- Analytics (new), Dashboard, Study, Database

### Risk Level

**Medium** — requires migration `20260617140000_add_quiz_attempts` and `npm install`.

---

## 2026-06-17 — Document Summary & Quiz Align with Notes Pattern

### Files Changed

**Modified:**
- `server/src/lib/summarizer.js` — document summary uses same structured study-guide prompt as notes (from extracted PDF text)
- `src/features/documents/pages/DocumentViewPage.jsx` — markdown summary rendering matching notes page
- `src/features/documents/documents.css` — summary panel styles aligned with notes
- `src/features/study/components/StudyGeneratePanel.jsx` — document hints for PDF-extracted quiz/flashcards

### Summary

Document AI summary now produces and displays the same markdown study guide as notes, sourced from extracted PDF text. Quiz/flashcard panel clarifies that generation uses extracted PDF content. Notes summary behavior unchanged.

### Impacted Modules

- Documents, Study UI

### Risk Level

**Low**

---

## 2026-06-17 — Document Summary Requires Extracted PDF Text

### Files Changed

**Modified:**
- `server/src/lib/summarizer.js` — `summarizeDocument` requires `extractedText`; removed title-only fallback
- `server/src/modules/document/document.service.js` — validate extracted text before summarizing
- `src/features/documents/pages/DocumentViewPage.jsx` — disable summary button without extracted text; updated messaging

### Summary

Document AI summaries now always use extracted PDF/document text. Notes summary behavior is unchanged.

### Impacted Modules

- Documents (summary only)

### Risk Level

**Low**

---

## 2026-06-17 — Persist & Reuse AI Study Materials

### Files Changed

**Modified:**
- `server/src/modules/study/study.service.js` — return existing deck/quiz for source; added `getMaterialsForSource`
- `server/src/modules/study/study.controller.js` — materials endpoint; 200 when reusing existing
- `server/src/modules/study/study.routes.js` — `GET /study/materials`
- `server/src/modules/note/note.service.js` — skip AI if summary already saved
- `server/src/modules/document/document.service.js` — skip AI if summary already saved
- `src/features/study/api/studyApi.js` — `fetchStudyMaterials`
- `src/features/study/hooks/useStudy.js` — `useStudyMaterials` hook
- `src/features/study/components/StudyGeneratePanel.jsx` — Study/Take buttons when saved
- `src/features/notes/pages/NoteEditorPage.jsx` — hide Regenerate summary button
- `src/features/documents/pages/DocumentViewPage.jsx` — hide Regenerate summary button

### Summary

Flashcards, quizzes, and summaries are now one-per note/document. Existing materials are returned instead of calling the AI again. UI shows saved study actions (Study Flashcards / Take Quiz) and hides summary regenerate.

### Impacted Modules

- Study, Notes, Documents

### Risk Level

**Low** — read-before-generate logic only; no schema changes.

---

## 2026-06-17 — Fix PDF Text Extraction (pdf-parse v2)

### Files Changed

**Modified:**
- `server/src/lib/text-extractor.js` — use `PDFParse` v2 API for PDF extraction
- `server/src/modules/document/document.service.js` — added `reextractText` for existing uploads
- `server/src/modules/document/document.controller.js` — added re-extract handler
- `server/src/modules/document/document.routes.js` — `POST /documents/:id/reextract`
- `src/features/documents/api/documentsApi.js` — `reextractDocumentText` API call
- `src/features/documents/hooks/useDocuments.js` — `useReextractDocumentText` hook
- `src/features/documents/pages/DocumentViewPage.jsx` — Extract Text button when no text

### Summary

Fixed broken PDF text extraction caused by pdf-parse v1 API usage against v2.4.5. New uploads now store `extractedText` correctly. Added a re-extract endpoint and UI so previously uploaded PDFs can be parsed without re-uploading.

### Impacted Modules

- Documents (upload extraction, re-extract, summary/quiz/flashcard inputs)

### Risk Level

**Low** — isolated to text extraction; re-extract downloads file from storage and re-parses.

---

## 2026-06-17 — AI Flashcard & Quiz Generation

### Files Changed

**Added:**
- `server/prisma/migrations/20260617120000_add_study_models/migration.sql`
- `server/src/modules/study/study.service.js`
- `server/src/modules/study/study.controller.js`
- `server/src/modules/study/study.routes.js`
- `src/features/study/api/studyApi.js`
- `src/features/study/hooks/useStudy.js`
- `src/features/study/components/StudyGeneratePanel.jsx`
- `src/features/study/pages/FlashcardStudyPage.jsx`
- `src/features/study/pages/QuizPage.jsx`
- `src/features/study/study.css`

**Modified:**
- `server/prisma/schema.prisma` — added `FlashcardDeck`, `Flashcard`, `Quiz`, `QuizQuestion` models
- `server/src/lib/openrouter.js` — JSON mode + rate-limit handling
- `server/src/routes/index.js` — mounted `/study` router
- `server/src/modules/activity/activity.service.js` — added `FLASHCARDS_GENERATED`, `QUIZ_GENERATED` activity types
- `src/app/router.jsx` — flashcard study and quiz routes
- `src/features/notes/pages/NoteEditorPage.jsx` — Generate Flashcards / Generate Quiz panel
- `src/features/documents/pages/DocumentViewPage.jsx` — Generate Flashcards / Generate Quiz panel

### Summary

Added AI-powered flashcard and quiz generation from notes and documents. Content is sent directly to OpenRouter (not RAG). Generated decks and quizzes are persisted in PostgreSQL. Users can study flashcards (flip, next/prev) and take quizzes with scoring and explanations.

### Impacted Modules

- Study (new backend module + frontend feature)
- Notes, Documents (generate buttons)
- OpenRouter integration
- Database schema (4 new tables)

### Risk Level

**Medium** — requires running Prisma migration `20260617120000_add_study_models` and `OPENROUTER_API_KEY` to be set. AI output is validated with up to 3 retries before failing.

---

## 2026-06-17 — Remove Note Linking & Backlinks (Phase 10)

### Files Changed

**Deleted:**
- `server/src/modules/note/note-link.service.js`
- `server/src/lib/link-parser.js`
- `server/src/modules/graph/graph.service.js`
- `server/src/modules/graph/graph.controller.js`
- `server/src/modules/graph/graph.routes.js`
- `src/features/notes/components/NoteLinksPanel.jsx`
- `src/features/notes/components/WikiLinkDropdown.jsx`
- `src/features/notes/hooks/useWikiLinkAutocomplete.js`
- `src/features/graph/pages/KnowledgeGraphPage.jsx`
- `src/features/graph/hooks/useGraph.js`
- `src/features/graph/api/graphApi.js`
- `src/features/graph/graph.css`

**Modified:**
- `server/prisma/schema.prisma` — removed `NoteLink` model and relations
- `server/prisma/migrations/20260617100000_drop_note_links/migration.sql` — drops `NoteLink` table
- `server/src/modules/note/note.service.js` — removed link sync on create/update
- `server/src/modules/note/note.controller.js` — removed linked-notes/backlinks handlers
- `server/src/modules/note/note.routes.js` — removed linked-notes/backlinks routes
- `server/src/routes/index.js` — removed `/graph` router
- `src/features/notes/pages/NoteEditorPage.jsx` — removed wiki-link autocomplete and links panel
- `src/features/notes/api/notesApi.js` — removed linked-notes/backlinks API calls
- `src/features/notes/hooks/useNotes.js` — removed `useLinkedNotes` / `useBacklinks`
- `src/features/notes/notes.css` — removed wiki-dropdown and note-links styles
- `package.json` — removed unused `@xyflow/react` dependency

### Summary

Removed the Note Linking and Backlinks feature entirely, including `[[wiki-link]]` parsing, link sync on save, linked-notes/backlinks API endpoints, the note editor autocomplete dropdown, and the links/backlinks panel. Also removed the dependent Knowledge Graph backend and frontend code.

### Impacted Modules

- Notes (backend + editor UI)
- Graph (removed)
- Database schema (`NoteLink` table dropped)

### Risk Level

**Medium** — requires running the new Prisma migration to drop the `NoteLink` table. Existing note content with `[[...]]` syntax is preserved but no longer parsed or linked.
