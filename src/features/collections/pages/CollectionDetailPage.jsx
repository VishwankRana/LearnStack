import { useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { Button } from '../../../components/ui/Button';
import { Spinner } from '../../../components/ui/Spinner';
import { EmptyState } from '../../../components/ui/EmptyState';
import {
  Dialog,
  DialogHeader,
  DialogBody,
  DialogFooter,
} from '../../../components/ui/Dialog';
import { CollectionForm } from '../components/CollectionForm';
import { DeleteCollectionDialog } from '../components/DeleteCollectionDialog';
import {
  useCollection,
  useUpdateCollection,
  useDeleteCollection,
} from '../hooks/useCollections';
import { useNotes, useDeleteNote } from '../../notes/hooks/useNotes';
import { NoteCard, NoteCardSkeleton } from '../../notes/components/NoteCard';
import { DeleteNoteDialog } from '../../notes/components/DeleteNoteDialog';
import '../collections.css';

/* ── Icons ── */
function BackArrowIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="m12 19-7-7 7-7" /><path d="M19 12H5" />
    </svg>
  );
}

function FolderIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M20 20a2 2 0 0 0 2-2V8a2 2 0 0 0-2-2h-7.9a2 2 0 0 1-1.69-.9L9.6 3.9A2 2 0 0 0 7.93 3H4a2 2 0 0 0-2 2v13a2 2 0 0 0 2 2Z" />
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

function DocIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M15 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7Z" />
      <path d="M14 2v4a2 2 0 0 0 2 2h4" />
    </svg>
  );
}

function BookmarkIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="m19 21-7-4-7 4V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2v16z" />
    </svg>
  );
}

function EditIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M17 3a2.85 2.83 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5Z" />
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

function PlusIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 5v14M5 12h14" />
    </svg>
  );
}

function ArrowRightIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M5 12h14" /><path d="m12 5 7 7-7 7" />
    </svg>
  );
}

/** Placeholder panel for features not yet implemented */
function ComingSoonSection({ icon, label, count }) {
  return (
    <div className="collection-detail__content">
      <div className="collection-detail__section-header">
        <div className="collection-detail__section-title-group">
          <span className="collection-detail__section-title">{icon}{label}</span>
          {count > 0 && (
            <span className="collection-detail__section-badge">{count}</span>
          )}
        </div>
      </div>
      <EmptyState
        icon={icon}
        title={`${label} coming soon`}
        description={`${label} support will be available in an upcoming phase.`}
      />
    </div>
  );
}

/* ══════════════════════════════════════════════════════════
   CollectionDetailPage
   ══════════════════════════════════════════════════════════ */
export function CollectionDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [editOpen, setEditOpen] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [formError, setFormError] = useState(null);
  const [noteDeleteTarget, setNoteDeleteTarget] = useState(null);

  /* — Collection — */
  const { data: collection, isLoading, isError } = useCollection(id);
  const updateMutation = useUpdateCollection();
  const deleteMutation = useDeleteCollection();

  /* — Notes for this collection — */
  const { data: notes, isLoading: notesLoading } = useNotes({ collectionId: id });
  const deleteNoteMutation = useDeleteNote();

  async function handleUpdate(values) {
    setFormError(null);
    try {
      await updateMutation.mutateAsync({ id, data: values });
      setEditOpen(false);
    } catch (err) {
      setFormError(err.message ?? 'Failed to update collection.');
    }
  }

  async function handleDeleteCollection() {
    try {
      await deleteMutation.mutateAsync(id);
      navigate('/app/collections');
    } catch {
      // stays open so user sees the error state
    }
  }

  async function handleDeleteNote() {
    try {
      await deleteNoteMutation.mutateAsync(noteDeleteTarget.id);
      setNoteDeleteTarget(null);
    } catch {
      // error visible via mutation state
    }
  }

  /* — Loading / Error states — */
  if (isLoading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', padding: 64 }}>
        <Spinner size="lg" />
      </div>
    );
  }

  if (isError || !collection) {
    return (
      <section className="collection-detail">
        <Link to="/app/collections" className="collection-detail__back">
          <BackArrowIcon />
          Back to Collections
        </Link>
        <EmptyState
          icon={<FolderIcon />}
          title="Collection not found"
          description="This collection may have been deleted or you don't have access to it."
          action={
            <Button variant="primary" size="md" onClick={() => navigate('/app/collections')}>
              Go to Collections
            </Button>
          }
        />
      </section>
    );
  }

  const counts = collection._count ?? {};
  const noteCount = notes?.length ?? counts.notes ?? 0;
  // Show at most 6 notes inline; user can see all via the link
  const visibleNotes = notes?.slice(0, 6) ?? [];
  const hasMoreNotes = noteCount > 6;

  return (
    <section className="collection-detail">
      {/* — Back Navigation — */}
      <Link to="/app/collections" className="collection-detail__back">
        <BackArrowIcon />
        Back to Collections
      </Link>

      {/* — Collection Header — */}
      <div className="collection-detail__header">
        <div className="collection-detail__info">
          <div
            className="collection-detail__icon"
            style={{ background: collection.color || '#6366f1' }}
          >
            <FolderIcon />
          </div>
          <div className="collection-detail__text">
            <h2 className="collection-detail__name">{collection.name}</h2>
            {collection.description && (
              <p className="collection-detail__description">
                {collection.description}
              </p>
            )}
          </div>
        </div>

        <div className="collection-detail__actions">
          <Button
            variant="secondary"
            size="sm"
            onClick={() => { setFormError(null); setEditOpen(true); }}
          >
            <EditIcon />
            Edit
          </Button>
          <Button variant="danger" size="sm" onClick={() => setDeleteOpen(true)}>
            <TrashIcon />
            Delete
          </Button>
        </div>
      </div>

      {/* — Stat Cards — */}
      <div className="collection-detail__stats">
        <div className="collection-detail__stat-card">
          <div className="collection-detail__stat-icon" style={{ background: 'rgba(99,102,241,0.1)', color: '#6366f1' }}>
            <NoteIcon />
          </div>
          <div>
            <div className="collection-detail__stat-value">{counts.notes ?? 0}</div>
            <div className="collection-detail__stat-label">Notes</div>
          </div>
        </div>
        <div className="collection-detail__stat-card">
          <div className="collection-detail__stat-icon" style={{ background: 'rgba(16,185,129,0.1)', color: '#059669' }}>
            <DocIcon />
          </div>
          <div>
            <div className="collection-detail__stat-value">{counts.documents ?? 0}</div>
            <div className="collection-detail__stat-label">Documents</div>
          </div>
        </div>
        <div className="collection-detail__stat-card">
          <div className="collection-detail__stat-icon" style={{ background: 'rgba(245,158,11,0.1)', color: '#d97706' }}>
            <BookmarkIcon />
          </div>
          <div>
            <div className="collection-detail__stat-value">{counts.bookmarks ?? 0}</div>
            <div className="collection-detail__stat-label">Bookmarks</div>
          </div>
        </div>
      </div>

      {/* ── Notes Section ── */}
      <div className="collection-detail__content">
        <div className="collection-detail__section-header">
          <div className="collection-detail__section-title-group">
            <span className="collection-detail__section-title">Notes</span>
            {noteCount > 0 && (
              <span className="collection-detail__section-badge">{noteCount}</span>
            )}
          </div>
          <div className="collection-detail__section-actions">
            {noteCount > 0 && (
              <Link
                to={`/app/notes?collectionId=${id}`}
                className="collection-detail__view-all"
              >
                Show all notes
                <ArrowRightIcon />
              </Link>
            )}
            <Button
              variant="primary"
              size="sm"
              onClick={() => navigate(`/app/notes/new?collectionId=${id}`)}
            >
              <PlusIcon />
              New Note
            </Button>
          </div>
        </div>

        {notesLoading ? (
          <div className="notes-grid">
            {Array.from({ length: 3 }).map((_, i) => (
              <NoteCardSkeleton key={i} />
            ))}
          </div>
        ) : visibleNotes.length > 0 ? (
          <>
            <div className="notes-grid">
              {visibleNotes.map((note) => (
                <NoteCard
                  key={note.id}
                  note={note}
                  onDelete={setNoteDeleteTarget}
                />
              ))}
            </div>
            {hasMoreNotes && (
              <div className="collection-detail__show-more">
                <Link
                  to={`/app/notes?collectionId=${id}`}
                  className="collection-detail__view-all"
                >
                  Show all {noteCount} notes
                  <ArrowRightIcon />
                </Link>
              </div>
            )}
          </>
        ) : (
          <EmptyState
            icon={<NoteIcon />}
            title="No notes yet"
            description="Start adding notes to this collection to build your knowledge base."
            action={
              <Button
                variant="primary"
                size="sm"
                onClick={() => navigate(`/app/notes/new?collectionId=${id}`)}
              >
                <PlusIcon />
                New Note
              </Button>
            }
          />
        )}
      </div>

      {/* ── Documents (coming soon) ── */}
      <ComingSoonSection icon={<DocIcon />} label="Documents" count={counts.documents ?? 0} />

      {/* ── Bookmarks (coming soon) ── */}
      <ComingSoonSection icon={<BookmarkIcon />} label="Bookmarks" count={counts.bookmarks ?? 0} />

      {/* — Edit Collection Dialog — */}
      <Dialog open={editOpen} onClose={() => setEditOpen(false)}>
        <DialogHeader
          title="Edit Collection"
          description="Update the name, description, or color."
          onClose={() => setEditOpen(false)}
        />
        <DialogBody>
          {formError && (
            <p className="delete-dialog__warning" style={{ marginBottom: 12 }}>
              {formError}
            </p>
          )}
          <CollectionForm
            formId="detail-edit-collection-form"
            defaultValues={collection}
            onSubmit={handleUpdate}
            isSubmitting={updateMutation.isPending}
          />
        </DialogBody>
        <DialogFooter>
          <Button variant="secondary" size="sm" onClick={() => setEditOpen(false)} disabled={updateMutation.isPending}>
            Cancel
          </Button>
          <Button variant="primary" size="sm" type="submit" form="detail-edit-collection-form" isLoading={updateMutation.isPending}>
            Save Changes
          </Button>
        </DialogFooter>
      </Dialog>

      {/* — Delete Collection Dialog — */}
      <DeleteCollectionDialog
        open={deleteOpen}
        onClose={() => setDeleteOpen(false)}
        collection={collection}
        onConfirm={handleDeleteCollection}
        isDeleting={deleteMutation.isPending}
      />

      {/* — Delete Note Dialog — */}
      <DeleteNoteDialog
        open={!!noteDeleteTarget}
        onClose={() => setNoteDeleteTarget(null)}
        note={noteDeleteTarget}
        onConfirm={handleDeleteNote}
        isDeleting={deleteNoteMutation.isPending}
      />
    </section>
  );
}
