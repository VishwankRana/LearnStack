import { useState, useDeferredValue } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Button } from '../../../components/ui/Button';
import { EmptyState } from '../../../components/ui/EmptyState';
import { NoteCard, NoteCardSkeleton } from '../components/NoteCard';
import { DeleteNoteDialog } from '../components/DeleteNoteDialog';
import { useNotes, useDeleteNote } from '../hooks/useNotes';
import { useCollections } from '../../collections/hooks/useCollections';
import '../notes.css';

function PlusIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 5v14M5 12h14" />
    </svg>
  );
}

function SearchIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="11" cy="11" r="8" />
      <path d="m21 21-4.3-4.3" />
    </svg>
  );
}

function NoteIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z" />
      <polyline points="14 2 14 8 20 8" />
      <line x1="16" y1="13" x2="8" y2="13" />
      <line x1="16" y1="17" x2="8" y2="17" />
    </svg>
  );
}

export function NotesPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  const [search, setSearch] = useState('');
  // Initialize from ?collectionId= so "Show all notes" from a collection pre-filters the list
  const [collectionId, setCollectionId] = useState(() => searchParams.get('collectionId') ?? '');
  const [deleteTarget, setDeleteTarget] = useState(null);

  const deferredSearch = useDeferredValue(search);

  const { data: notes, isLoading, isError } = useNotes({
    search: deferredSearch || undefined,
    collectionId: collectionId || undefined,
  });

  const { data: collections } = useCollections();
  const deleteMutation = useDeleteNote();

  async function handleDelete() {
    try {
      await deleteMutation.mutateAsync(deleteTarget.id);
      setDeleteTarget(null);
    } catch {
      // error is displayed via mutation state
    }
  }

  const count = notes?.length ?? 0;
  const hasFilters = !!deferredSearch || !!collectionId;

  return (
    <section className="notes-page">
      {/* — Header — */}
      <div className="notes-page__header">
        <div className="notes-page__title-group">
          <p className="notes-page__eyebrow">Knowledge Vault</p>
          <h2 className="notes-page__title">
            Notes{' '}
            {!isLoading && count > 0 && (
              <span className="notes-page__count">({count})</span>
            )}
          </h2>
        </div>
        <Button variant="primary" size="md" onClick={() => navigate('/app/notes/new')}>
          <PlusIcon />
          New Note
        </Button>
      </div>

      {/* — Filters — */}
      <div className="notes-page__filters">
        <div className="notes-search">
          <SearchIcon />
          <input
            type="search"
            className="notes-search__input"
            placeholder="Search notes by title or content…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>

        <select
          className="notes-filter-select"
          value={collectionId}
          onChange={(e) => setCollectionId(e.target.value)}
          aria-label="Filter by collection"
        >
          <option value="">All collections</option>
          {collections?.map((c) => (
            <option key={c.id} value={c.id}>{c.name}</option>
          ))}
        </select>
      </div>

      {/* — Grid / States — */}
      {isLoading ? (
        <div className="notes-grid">
          {Array.from({ length: 6 }).map((_, i) => (
            <NoteCardSkeleton key={i} />
          ))}
        </div>
      ) : isError ? (
        <EmptyState
          icon={<NoteIcon />}
          title="Could not load notes"
          description="Something went wrong. Please refresh the page."
        />
      ) : count === 0 ? (
        <EmptyState
          icon={<NoteIcon />}
          title={hasFilters ? 'No notes match your search' : 'No notes yet'}
          description={
            hasFilters
              ? 'Try adjusting your search or filter.'
              : 'Start capturing your ideas, thoughts, and knowledge.'
          }
          action={
            !hasFilters ? (
              <Button variant="primary" size="md" onClick={() => navigate('/app/notes/new')}>
                <PlusIcon />
                Write your first note
              </Button>
            ) : null
          }
        />
      ) : (
        <div className="notes-grid">
          {notes.map((note) => (
            <NoteCard key={note.id} note={note} onDelete={setDeleteTarget} />
          ))}
        </div>
      )}

      {/* — Delete Dialog — */}
      <DeleteNoteDialog
        open={!!deleteTarget}
        onClose={() => setDeleteTarget(null)}
        note={deleteTarget}
        onConfirm={handleDelete}
        isDeleting={deleteMutation.isPending}
      />
    </section>
  );
}
