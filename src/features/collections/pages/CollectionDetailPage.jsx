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
import { useBookmarks, useCreateBookmark, useUpdateBookmark, useDeleteBookmark } from '../../bookmarks/hooks/useBookmarks';
import { BookmarkCard, BookmarkCardSkeleton } from '../../bookmarks/components/BookmarkCard';
import { BookmarkForm } from '../../bookmarks/components/BookmarkForm';
import { DeleteBookmarkDialog } from '../../bookmarks/components/DeleteBookmarkDialog';
import { useDocuments, useUploadDocument, useDeleteDocument } from '../../documents/hooks/useDocuments';
import { DocumentCard, DocumentCardSkeleton } from '../../documents/components/DocumentCard';
import { DocumentUploadForm } from '../../documents/components/DocumentUploadForm';
import { DeleteDocumentDialog } from '../../documents/components/DeleteDocumentDialog';
import '../collections.css';
import '../../bookmarks/bookmarks.css';
import '../../documents/documents.css';

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
  const [bookmarkCreateOpen, setBookmarkCreateOpen] = useState(false);
  const [bookmarkEditTarget, setBookmarkEditTarget] = useState(null);
  const [bookmarkDeleteTarget, setBookmarkDeleteTarget] = useState(null);
  const [bookmarkFormError, setBookmarkFormError] = useState(null);
  const [docUploadOpen, setDocUploadOpen] = useState(false);
  const [docDeleteTarget, setDocDeleteTarget] = useState(null);
  const [docFormError, setDocFormError] = useState(null);

  /* — Collection — */
  const { data: collection, isLoading, isError } = useCollection(id);
  const updateMutation = useUpdateCollection();
  const deleteMutation = useDeleteCollection();

  /* — Notes for this collection — */
  const { data: notes, isLoading: notesLoading } = useNotes({ collectionId: id });
  const deleteNoteMutation = useDeleteNote();

  /* — Bookmarks for this collection — */
  const { data: bookmarks, isLoading: bookmarksLoading } = useBookmarks({ collectionId: id });
  const createBookmarkMutation = useCreateBookmark();
  const updateBookmarkMutation = useUpdateBookmark();
  const deleteBookmarkMutation = useDeleteBookmark();

  /* — Documents for this collection — */
  const { data: documents, isLoading: docsLoading } = useDocuments({ collectionId: id });
  const uploadDocMutation = useUploadDocument();
  const deleteDocMutation = useDeleteDocument();

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

  async function handleCreateBookmark(values) {
    setBookmarkFormError(null);
    try {
      await createBookmarkMutation.mutateAsync({ ...values, collectionId: id });
      setBookmarkCreateOpen(false);
    } catch (err) {
      setBookmarkFormError(err.message ?? 'Failed to save bookmark.');
    }
  }

  async function handleDeleteBookmark() {
    try {
      await deleteBookmarkMutation.mutateAsync(bookmarkDeleteTarget.id);
      setBookmarkDeleteTarget(null);
    } catch {
      // error visible via mutation state
    }
  }

  async function handleUploadDocument(formData) {
    setDocFormError(null);
    try {
      await uploadDocMutation.mutateAsync(formData);
      setDocUploadOpen(false);
    } catch (err) {
      setDocFormError(err.message ?? 'Upload failed.');
    }
  }

  async function handleDeleteDocument() {
    try {
      await deleteDocMutation.mutateAsync(docDeleteTarget.id);
      setDocDeleteTarget(null);
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
  const visibleNotes = notes?.slice(0, 6) ?? [];
  const hasMoreNotes = noteCount > 6;

  const bookmarkCount = bookmarks?.length ?? counts.bookmarks ?? 0;
  const visibleBookmarks = bookmarks?.slice(0, 6) ?? [];
  const hasMoreBookmarks = bookmarkCount > 6;

  const docCount = documents?.length ?? counts.documents ?? 0;
  const visibleDocs = documents?.slice(0, 6) ?? [];
  const hasMoreDocs = docCount > 6;

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

      {/* ── Documents Section ── */}
      <div className="collection-detail__content">
        <div className="collection-detail__section-header">
          <div className="collection-detail__section-title-group">
            <span className="collection-detail__section-title">Documents</span>
            {docCount > 0 && (
              <span className="collection-detail__section-badge">{docCount}</span>
            )}
          </div>
          <div className="collection-detail__section-actions">
            {docCount > 0 && (
              <Link
                to={`/app/documents?collectionId=${id}`}
                className="collection-detail__view-all"
              >
                Show all documents
                <ArrowRightIcon />
              </Link>
            )}
            <Button
              variant="primary"
              size="sm"
              onClick={() => { setDocFormError(null); setDocUploadOpen(true); }}
            >
              <PlusIcon />
              Upload Document
            </Button>
          </div>
        </div>

        {docsLoading ? (
          <div className="documents-grid">
            {Array.from({ length: 3 }).map((_, i) => (
              <DocumentCardSkeleton key={i} />
            ))}
          </div>
        ) : visibleDocs.length > 0 ? (
          <>
            <div className="documents-grid">
              {visibleDocs.map((doc) => (
                <DocumentCard
                  key={doc.id}
                  document={doc}
                  onEdit={() => navigate(`/app/documents/${doc.id}`)}
                  onDelete={setDocDeleteTarget}
                />
              ))}
            </div>
            {hasMoreDocs && (
              <div className="collection-detail__show-more">
                <Link
                  to={`/app/documents?collectionId=${id}`}
                  className="collection-detail__view-all"
                >
                  Show all {docCount} documents
                  <ArrowRightIcon />
                </Link>
              </div>
            )}
          </>
        ) : (
          <EmptyState
            icon={<DocIcon />}
            title="No documents yet"
            description="Upload PDFs, Word docs, and text files to this collection."
            action={
              <Button
                variant="primary"
                size="sm"
                onClick={() => { setDocFormError(null); setDocUploadOpen(true); }}
              >
                <PlusIcon />
                Upload Document
              </Button>
            }
          />
        )}
      </div>

      {/* ── Bookmarks Section ── */}
      <div className="collection-detail__content">
        <div className="collection-detail__section-header">
          <div className="collection-detail__section-title-group">
            <span className="collection-detail__section-title">Bookmarks</span>
            {bookmarkCount > 0 && (
              <span className="collection-detail__section-badge">{bookmarkCount}</span>
            )}
          </div>
          <div className="collection-detail__section-actions">
            {bookmarkCount > 0 && (
              <Link
                to={`/app/bookmarks?collectionId=${id}`}
                className="collection-detail__view-all"
              >
                Show all bookmarks
                <ArrowRightIcon />
              </Link>
            )}
            <Button
              variant="secondary"
              size="sm"
              onClick={() => { setBookmarkFormError(null); setBookmarkCreateOpen(true); }}
            >
              <PlusIcon />
              Save Bookmark
            </Button>
          </div>
        </div>

        {bookmarksLoading ? (
          <div className="bookmarks-grid">
            {Array.from({ length: 3 }).map((_, i) => (
              <BookmarkCardSkeleton key={i} />
            ))}
          </div>
        ) : visibleBookmarks.length > 0 ? (
          <>
            <div className="bookmarks-grid">
              {visibleBookmarks.map((bookmark) => (
                <BookmarkCard
                  key={bookmark.id}
                  bookmark={bookmark}
                  onEdit={setBookmarkEditTarget}
                  onDelete={setBookmarkDeleteTarget}
                />
              ))}
            </div>
            {hasMoreBookmarks && (
              <div className="collection-detail__show-more">
                <Link
                  to={`/app/bookmarks?collectionId=${id}`}
                  className="collection-detail__view-all"
                >
                  Show all {bookmarkCount} bookmarks
                  <ArrowRightIcon />
                </Link>
              </div>
            )}
          </>
        ) : (
          <EmptyState
            icon={<BookmarkIcon />}
            title="No bookmarks yet"
            description="Save links, articles, and resources to this collection."
            action={
              <Button
                variant="secondary"
                size="sm"
                onClick={() => { setBookmarkFormError(null); setBookmarkCreateOpen(true); }}
              >
                <PlusIcon />
                Save Bookmark
              </Button>
            }
          />
        )}
      </div>

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

      {/* — Save Bookmark Dialog — */}
      <Dialog open={bookmarkCreateOpen} onClose={() => setBookmarkCreateOpen(false)}>
        <DialogHeader
          title="Save Bookmark"
          description={`This bookmark will be added to "${collection.name}".`}
          onClose={() => setBookmarkCreateOpen(false)}
        />
        <DialogBody>
          {bookmarkFormError && (
            <p className="delete-dialog__warning" style={{ marginBottom: 12 }}>{bookmarkFormError}</p>
          )}
          <BookmarkForm
            formId="collection-create-bookmark-form"
            onSubmit={handleCreateBookmark}
            isSubmitting={createBookmarkMutation.isPending}
          />
        </DialogBody>
        <DialogFooter>
          <Button variant="secondary" size="sm" onClick={() => setBookmarkCreateOpen(false)} disabled={createBookmarkMutation.isPending}>
            Cancel
          </Button>
          <Button variant="primary" size="sm" type="submit" form="collection-create-bookmark-form" isLoading={createBookmarkMutation.isPending}>
            Save Bookmark
          </Button>
        </DialogFooter>
      </Dialog>

      {/* — Edit Bookmark Dialog — */}
      <Dialog open={!!bookmarkEditTarget} onClose={() => setBookmarkEditTarget(null)}>
        <DialogHeader
          title="Edit Bookmark"
          description="Update the title, URL, or description."
          onClose={() => setBookmarkEditTarget(null)}
        />
        <DialogBody>
          {bookmarkFormError && (
            <p className="delete-dialog__warning" style={{ marginBottom: 12 }}>{bookmarkFormError}</p>
          )}
          {bookmarkEditTarget && (
            <BookmarkForm
              formId="collection-edit-bookmark-form"
              defaultValues={bookmarkEditTarget}
              onSubmit={async (values) => {
                setBookmarkFormError(null);
                try {
                  await updateBookmarkMutation.mutateAsync({ id: bookmarkEditTarget.id, data: values });
                  setBookmarkEditTarget(null);
                } catch (err) {
                  setBookmarkFormError(err.message ?? 'Failed to update bookmark.');
                }
              }}
              isSubmitting={updateBookmarkMutation.isPending}
            />
          )}
        </DialogBody>
        <DialogFooter>
          <Button variant="secondary" size="sm" onClick={() => setBookmarkEditTarget(null)} disabled={updateBookmarkMutation.isPending}>
            Cancel
          </Button>
          <Button variant="primary" size="sm" type="submit" form="collection-edit-bookmark-form" isLoading={updateBookmarkMutation.isPending}>
            Save Changes
          </Button>
        </DialogFooter>
      </Dialog>

      {/* — Delete Bookmark Dialog — */}
      <DeleteBookmarkDialog
        open={!!bookmarkDeleteTarget}
        onClose={() => setBookmarkDeleteTarget(null)}
        bookmark={bookmarkDeleteTarget}
        onConfirm={handleDeleteBookmark}
        isDeleting={deleteBookmarkMutation.isPending}
      />

      {/* — Upload Document Dialog — */}
      <Dialog open={docUploadOpen} onClose={() => setDocUploadOpen(false)}>
        <DialogHeader
          title="Upload Document"
          description={`This document will be added to "${collection.name}".`}
          onClose={() => setDocUploadOpen(false)}
        />
        <DialogBody>
          {docFormError && (
            <p className="delete-dialog__warning" style={{ marginBottom: 12 }}>{docFormError}</p>
          )}
          <DocumentUploadForm
            formId="collection-upload-doc-form"
            onSubmit={handleUploadDocument}
            isSubmitting={uploadDocMutation.isPending}
            collections={[]}
            defaultCollectionId={id}
          />
        </DialogBody>
        <DialogFooter>
          <Button variant="secondary" size="sm" onClick={() => setDocUploadOpen(false)} disabled={uploadDocMutation.isPending}>
            Cancel
          </Button>
          <Button variant="primary" size="sm" type="submit" form="collection-upload-doc-form" isLoading={uploadDocMutation.isPending}>
            Upload
          </Button>
        </DialogFooter>
      </Dialog>

      {/* — Delete Document Dialog — */}
      <DeleteDocumentDialog
        open={!!docDeleteTarget}
        onClose={() => setDocDeleteTarget(null)}
        document={docDeleteTarget}
        onConfirm={handleDeleteDocument}
        isDeleting={deleteDocMutation.isPending}
      />
    </section>
  );
}
