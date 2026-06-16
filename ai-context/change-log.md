# MindVault Change Log

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
