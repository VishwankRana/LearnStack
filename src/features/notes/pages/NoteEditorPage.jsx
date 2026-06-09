import { useState, useEffect, useRef, useCallback } from 'react';
import { useParams, useNavigate, useSearchParams, Link } from 'react-router-dom';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { Button } from '../../../components/ui/Button';
import { Spinner } from '../../../components/ui/Spinner';
import { DeleteNoteDialog } from '../components/DeleteNoteDialog';
import { useNote, useCreateNote, useUpdateNote, useDeleteNote } from '../hooks/useNotes';
import { useCollections } from '../../collections/hooks/useCollections';
import '../notes.css';

/* ── Icons ── */
function BackIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="m12 19-7-7 7-7" /><path d="M19 12H5" />
    </svg>
  );
}
function BoldIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M6 4h8a4 4 0 0 1 4 4 4 4 0 0 1-4 4H6z" /><path d="M6 12h9a4 4 0 0 1 4 4 4 4 0 0 1-4 4H6z" />
    </svg>
  );
}
function ItalicIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <line x1="19" y1="4" x2="10" y2="4" /><line x1="14" y1="20" x2="5" y2="20" /><line x1="15" y1="4" x2="9" y2="20" />
    </svg>
  );
}
function CodeIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="16 18 22 12 16 6" /><polyline points="8 6 2 12 8 18" />
    </svg>
  );
}
function HeadingIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M4 12h16" /><path d="M4 18V6" /><path d="M20 18V6" />
    </svg>
  );
}
function ListIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <line x1="9" y1="6" x2="20" y2="6" /><line x1="9" y1="12" x2="20" y2="12" /><line x1="9" y1="18" x2="20" y2="18" />
      <circle cx="4" cy="6" r="1" fill="currentColor" stroke="none" />
      <circle cx="4" cy="12" r="1" fill="currentColor" stroke="none" />
      <circle cx="4" cy="18" r="1" fill="currentColor" stroke="none" />
    </svg>
  );
}
function LinkIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71" />
      <path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71" />
    </svg>
  );
}
function QuoteIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M3 21c3 0 7-1 7-8V5c0-1.25-.756-2.017-2-2H4c-1.25 0-2 .75-2 1.972V11c0 1.25.75 2 2 2 1 0 1 0 1 1v1c0 1-1 2-2 2s-1 .008-1 1.031V20c0 1 0 1 1 1z" />
      <path d="M15 21c3 0 7-1 7-8V5c0-1.25-.757-2.017-2-2h-4c-1.25 0-2 .75-2 1.972V11c0 1.25.75 2 2 2h.75c0 2.25.25 4-2.75 4v3c0 1 0 1 1 1z" />
    </svg>
  );
}
function TrashIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M3 6h18" /><path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6" />
      <path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2" />
    </svg>
  );
}
function SaveIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z" />
      <polyline points="17 21 17 13 7 13 7 21" />
      <polyline points="7 3 7 8 15 8" />
    </svg>
  );
}

/* ── Toolbar ── */
function wrapSelection(textarea, before, after = before) {
  const { selectionStart: start, selectionEnd: end, value } = textarea;
  const selected = value.slice(start, end);
  const newValue = value.slice(0, start) + before + selected + after + value.slice(end);
  const newCursorPos = selected ? end + before.length + after.length : start + before.length;
  return { newValue, newCursorPos, newSelectionEnd: selected ? end + before.length + after.length : start + before.length };
}

function prefixLine(textarea, prefix) {
  const { selectionStart: start, value } = textarea;
  const lineStart = value.lastIndexOf('\n', start - 1) + 1;
  const alreadyHas = value.slice(lineStart).startsWith(prefix);
  const newValue = alreadyHas
    ? value.slice(0, lineStart) + value.slice(lineStart + prefix.length)
    : value.slice(0, lineStart) + prefix + value.slice(lineStart);
  const offset = alreadyHas ? -prefix.length : prefix.length;
  return { newValue, newCursorPos: start + offset };
}

function MarkdownToolbar({ textareaRef, onContentChange }) {
  function applyWrap(before, after) {
    const el = textareaRef.current;
    if (!el) return;
    const { newValue, newCursorPos } = wrapSelection(el, before, after ?? before);
    onContentChange(newValue);
    requestAnimationFrame(() => {
      el.focus();
      el.setSelectionRange(newCursorPos, newCursorPos);
    });
  }

  function applyPrefix(prefix) {
    const el = textareaRef.current;
    if (!el) return;
    const { newValue, newCursorPos } = prefixLine(el, prefix);
    onContentChange(newValue);
    requestAnimationFrame(() => {
      el.focus();
      el.setSelectionRange(newCursorPos, newCursorPos);
    });
  }

  function insertLink() {
    const el = textareaRef.current;
    if (!el) return;
    const selected = el.value.slice(el.selectionStart, el.selectionEnd);
    const text = selected || 'link text';
    const { newValue } = wrapSelection(el, `[${text}](`, ')');
    const insertedText = `[${text}](url)`;
    const pos = el.selectionStart + insertedText.length - 1;
    onContentChange(newValue);
    requestAnimationFrame(() => {
      el.focus();
      el.setSelectionRange(pos - 3, pos);
    });
  }

  const tools = [
    { label: 'Bold (Ctrl+B)', icon: <BoldIcon />, action: () => applyWrap('**') },
    { label: 'Italic (Ctrl+I)', icon: <ItalicIcon />, action: () => applyWrap('*') },
    { label: 'Inline code', icon: <CodeIcon />, action: () => applyWrap('`') },
    { label: 'Heading', icon: <HeadingIcon />, action: () => applyPrefix('## ') },
    { label: 'Bullet list', icon: <ListIcon />, action: () => applyPrefix('- ') },
    { label: 'Blockquote', icon: <QuoteIcon />, action: () => applyPrefix('> ') },
    { label: 'Link', icon: <LinkIcon />, action: insertLink },
  ];

  return (
    <div className="note-editor__toolbar" role="toolbar" aria-label="Markdown formatting">
      {tools.map((tool) => (
        <button
          key={tool.label}
          type="button"
          className="note-editor__tool-btn"
          title={tool.label}
          aria-label={tool.label}
          onMouseDown={(e) => { e.preventDefault(); tool.action(); }}
        >
          {tool.icon}
        </button>
      ))}
    </div>
  );
}

/* ── Save Status Badge ── */
const STATUS_CONFIG = {
  idle: null,
  unsaved: { label: 'Unsaved changes', className: 'note-editor__status--unsaved' },
  saving: { label: 'Saving…', className: 'note-editor__status--saving' },
  saved: { label: 'Saved', className: 'note-editor__status--saved' },
  error: { label: 'Failed to save', className: 'note-editor__status--error' },
};

function SaveStatus({ status }) {
  const config = STATUS_CONFIG[status];
  if (!config) return null;
  return (
    <span className={`note-editor__status ${config.className}`}>
      {status === 'saving' && <Spinner size="sm" />}
      {config.label}
    </span>
  );
}

/* ── Word Count ── */
function wordCount(text) {
  return (text || '').split(/\s+/).filter(Boolean).length;
}

/* ══════════════════════════════════════════════════════════════
   NoteEditorPage
   Routes:
     /app/notes/new   — create mode (no id param)
     /app/notes/:id   — edit mode
   ══════════════════════════════════════════════════════════════ */
export function NoteEditorPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const isNew = !id;

  /* — Fetch existing note — */
  const { data: existingNote, isLoading: noteLoading } = useNote(id);
  const { data: collections } = useCollections();

  /* — Local editor state — */
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  // Pre-select collection when coming from ?collectionId= (e.g. from a collection detail page)
  const [collectionId, setCollectionId] = useState(() => searchParams.get('collectionId') ?? '');
  const [mode, setMode] = useState('write'); // 'write' | 'preview'
  const [saveStatus, setSaveStatus] = useState('idle');
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [initialized, setInitialized] = useState(false);

  const textareaRef = useRef(null);
  const autoSaveTimerRef = useRef(null);

  const createMutation = useCreateNote();
  const updateMutation = useUpdateNote();
  const deleteMutation = useDeleteNote();

  /* — Seed form from fetched note — */
  useEffect(() => {
    if (existingNote && !initialized) {
      setTitle(existingNote.title);
      setContent(existingNote.content ?? '');
      setCollectionId(existingNote.collectionId ?? '');
      setInitialized(true);
    }
  }, [existingNote, initialized]);

  /* — Auto-save for existing notes — */
  const performSave = useCallback(async (titleVal, contentVal, collectionIdVal) => {
    if (isNew) return;
    setSaveStatus('saving');
    try {
      await updateMutation.mutateAsync({
        id,
        data: { title: titleVal, content: contentVal, collectionId: collectionIdVal || null },
      });
      setSaveStatus('saved');
      setTimeout(() => setSaveStatus('idle'), 3000);
    } catch {
      setSaveStatus('error');
    }
  }, [id, isNew, updateMutation]);

  useEffect(() => {
    if (isNew || !initialized) return;

    setSaveStatus('unsaved');

    clearTimeout(autoSaveTimerRef.current);
    autoSaveTimerRef.current = setTimeout(() => {
      performSave(title, content, collectionId);
    }, 2000);

    return () => clearTimeout(autoSaveTimerRef.current);
  }, [title, content, collectionId]); // eslint-disable-line react-hooks/exhaustive-deps

  /* — Keyboard shortcuts — */
  function handleKeyDown(e) {
    if ((e.ctrlKey || e.metaKey) && e.key === 'b') {
      e.preventDefault();
      const el = textareaRef.current;
      if (!el) return;
      const { newValue, newCursorPos } = wrapSelection(el, '**');
      setContent(newValue);
      requestAnimationFrame(() => el.setSelectionRange(newCursorPos, newCursorPos));
    }
    if ((e.ctrlKey || e.metaKey) && e.key === 'i') {
      e.preventDefault();
      const el = textareaRef.current;
      if (!el) return;
      const { newValue, newCursorPos } = wrapSelection(el, '*');
      setContent(newValue);
      requestAnimationFrame(() => el.setSelectionRange(newCursorPos, newCursorPos));
    }
    if ((e.ctrlKey || e.metaKey) && e.key === 's') {
      e.preventDefault();
      if (!isNew) {
        clearTimeout(autoSaveTimerRef.current);
        performSave(title, content, collectionId);
      }
    }
  }

  /* — Create (manual save) — */
  async function handleCreate() {
    if (!title.trim()) return;
    try {
      const note = await createMutation.mutateAsync({
        title: title.trim(),
        content,
        collectionId: collectionId || null,
      });
      navigate(`/app/notes/${note.id}`, { replace: true });
    } catch {
      // error shown via mutation state
    }
  }

  /* — Delete — */
  async function handleDelete() {
    try {
      await deleteMutation.mutateAsync(id);
      navigate('/app/notes');
    } catch {
      // error visible via mutation state
    }
  }

  /* — Tab key in textarea inserts spaces — */
  function handleTextareaKeyDown(e) {
    if (e.key === 'Tab') {
      e.preventDefault();
      const el = e.target;
      const { selectionStart: start, selectionEnd: end, value } = el;
      const newValue = value.slice(0, start) + '  ' + value.slice(end);
      setContent(newValue);
      requestAnimationFrame(() => el.setSelectionRange(start + 2, start + 2));
    }
    handleKeyDown(e);
  }

  /* ── Loading state ── */
  if (!isNew && noteLoading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', padding: 64 }}>
        <Spinner size="lg" />
      </div>
    );
  }

  if (!isNew && !noteLoading && !existingNote) {
    return (
      <section className="note-editor">
        <Link to="/app/notes" className="note-editor__back">
          <BackIcon /> Back to Notes
        </Link>
        <div style={{ padding: 48, textAlign: 'center', color: 'var(--color-text-muted)' }}>
          Note not found.
        </div>
      </section>
    );
  }

  const words = wordCount(content);

  return (
    <section className="note-editor" onKeyDown={handleKeyDown}>
      {/* — Top Bar — */}
      <div className="note-editor__topbar">
        <Link to="/app/notes" className="note-editor__back">
          <BackIcon /> Notes
        </Link>

        <div className="note-editor__topbar-right">
          <SaveStatus status={saveStatus} />

          {isNew ? (
            <Button
              variant="primary"
              size="sm"
              onClick={handleCreate}
              isLoading={createMutation.isPending}
              disabled={!title.trim()}
            >
              <SaveIcon />
              Create Note
            </Button>
          ) : (
            <>
              <Button
                variant="secondary"
                size="sm"
                onClick={() => {
                  clearTimeout(autoSaveTimerRef.current);
                  performSave(title, content, collectionId);
                }}
                isLoading={saveStatus === 'saving'}
              >
                <SaveIcon />
                Save
              </Button>
              <Button
                variant="danger"
                size="sm"
                iconOnly
                onClick={() => setDeleteOpen(true)}
                aria-label="Delete note"
              >
                <TrashIcon />
              </Button>
            </>
          )}
        </div>
      </div>

      {/* — Title — */}
      <input
        type="text"
        className="note-editor__title"
        placeholder="Untitled note…"
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        aria-label="Note title"
      />

      {/* — Meta bar: collection + word count — */}
      <div className="note-editor__meta">
        <select
          className="note-editor__collection-select"
          value={collectionId}
          onChange={(e) => setCollectionId(e.target.value)}
          aria-label="Assign to collection"
        >
          <option value="">No collection</option>
          {collections?.map((c) => (
            <option key={c.id} value={c.id}>{c.name}</option>
          ))}
        </select>

        <span className="note-editor__word-count">
          {words} {words === 1 ? 'word' : 'words'}
        </span>
      </div>

      {/* — Mode Toggle — */}
      <div className="note-editor__mode-toggle">
        <button
          type="button"
          className={`note-editor__mode-btn ${mode === 'write' ? 'note-editor__mode-btn--active' : ''}`}
          onClick={() => setMode('write')}
        >
          Write
        </button>
        <button
          type="button"
          className={`note-editor__mode-btn ${mode === 'preview' ? 'note-editor__mode-btn--active' : ''}`}
          onClick={() => setMode('preview')}
        >
          Preview
        </button>
      </div>

      {/* — Editor Body — */}
      <div className="note-editor__body">
        {mode === 'write' ? (
          <>
            <MarkdownToolbar
              textareaRef={textareaRef}
              onContentChange={setContent}
            />
            <textarea
              ref={textareaRef}
              className="note-editor__textarea"
              placeholder="Start writing… Markdown is supported."
              value={content}
              onChange={(e) => setContent(e.target.value)}
              onKeyDown={handleTextareaKeyDown}
              spellCheck
            />
          </>
        ) : (
          <div className="note-editor__preview">
            {content ? (
              <ReactMarkdown remarkPlugins={[remarkGfm]}>
                {content}
              </ReactMarkdown>
            ) : (
              <p className="note-editor__preview-empty">Nothing to preview yet.</p>
            )}
          </div>
        )}
      </div>

      {/* — Delete Dialog — */}
      <DeleteNoteDialog
        open={deleteOpen}
        onClose={() => setDeleteOpen(false)}
        note={existingNote}
        onConfirm={handleDelete}
        isDeleting={deleteMutation.isPending}
      />
    </section>
  );
}
