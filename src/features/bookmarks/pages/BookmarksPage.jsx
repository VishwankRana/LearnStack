import { useState, useDeferredValue } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Button } from '../../../components/ui/Button';
import { EmptyState } from '../../../components/ui/EmptyState';
import {
  Dialog,
  DialogHeader,
  DialogBody,
  DialogFooter,
} from '../../../components/ui/Dialog';
import { BookmarkCard, BookmarkCardSkeleton } from '../components/BookmarkCard';
import { BookmarkForm } from '../components/BookmarkForm';
import { DeleteBookmarkDialog } from '../components/DeleteBookmarkDialog';
import {
  useBookmarks,
  useCreateBookmark,
  useUpdateBookmark,
  useDeleteBookmark,
} from '../hooks/useBookmarks';
import { useCollections } from '../../collections/hooks/useCollections';
import '../bookmarks.css';

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
      <circle cx="11" cy="11" r="8" /><path d="m21 21-4.3-4.3" />
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

export function BookmarksPage() {
  const [searchParams] = useSearchParams();

  const [search, setSearch] = useState('');
  const [collectionId, setCollectionId] = useState(() => searchParams.get('collectionId') ?? '');
  const [createOpen, setCreateOpen] = useState(false);
  const [editTarget, setEditTarget] = useState(null);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [formError, setFormError] = useState(null);

  const deferredSearch = useDeferredValue(search);

  const { data: bookmarks, isLoading, isError } = useBookmarks({
    search: deferredSearch || undefined,
    collectionId: collectionId || undefined,
  });

  const { data: collections } = useCollections();
  const createMutation = useCreateBookmark();
  const updateMutation = useUpdateBookmark();
  const deleteMutation = useDeleteBookmark();

  async function handleCreate(values) {
    setFormError(null);
    try {
      await createMutation.mutateAsync(values);
      setCreateOpen(false);
    } catch (err) {
      setFormError(err.message ?? 'Failed to save bookmark.');
    }
  }

  async function handleUpdate(values) {
    setFormError(null);
    try {
      await updateMutation.mutateAsync({ id: editTarget.id, data: values });
      setEditTarget(null);
    } catch (err) {
      setFormError(err.message ?? 'Failed to update bookmark.');
    }
  }

  async function handleDelete() {
    try {
      await deleteMutation.mutateAsync(deleteTarget.id);
      setDeleteTarget(null);
    } catch {
      // error is visible via mutation state
    }
  }

  function openEdit(bookmark) {
    setFormError(null);
    setEditTarget(bookmark);
  }

  const count = bookmarks?.length ?? 0;
  const hasFilters = !!deferredSearch || !!collectionId;

  return (
    <section className="bookmarks-page">
      {/* — Page Header — */}
      <div className="bookmarks-page__header">
        <div className="bookmarks-page__title-group">
          <p className="bookmarks-page__eyebrow">Knowledge Vault</p>
          <h2 className="bookmarks-page__title">
            Bookmarks{' '}
            {!isLoading && count > 0 && (
              <span className="bookmarks-page__count">({count})</span>
            )}
          </h2>
        </div>
        <Button
          variant="primary"
          size="md"
          onClick={() => { setFormError(null); setCreateOpen(true); }}
        >
          <PlusIcon />
          Save Bookmark
        </Button>
      </div>

      {/* — Filters — */}
      <div className="bookmarks-page__filters">
        <div className="bookmarks-search">
          <SearchIcon />
          <input
            type="search"
            className="bookmarks-search__input"
            placeholder="Search by title, URL, or description…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>

        <select
          className="bookmarks-filter-select"
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
        <div className="bookmarks-grid">
          {Array.from({ length: 6 }).map((_, i) => (
            <BookmarkCardSkeleton key={i} />
          ))}
        </div>
      ) : isError ? (
        <EmptyState
          icon={<BookmarkIcon />}
          title="Could not load bookmarks"
          description="Something went wrong. Please refresh the page."
        />
      ) : count === 0 ? (
        <EmptyState
          icon={<BookmarkIcon />}
          title={hasFilters ? 'No bookmarks match your search' : 'No bookmarks yet'}
          description={
            hasFilters
              ? 'Try adjusting your search or filter.'
              : 'Save articles, tools, and resources to your vault for later.'
          }
          action={
            !hasFilters ? (
              <Button
                variant="primary"
                size="md"
                onClick={() => { setFormError(null); setCreateOpen(true); }}
              >
                <PlusIcon />
                Save your first bookmark
              </Button>
            ) : null
          }
        />
      ) : (
        <div className="bookmarks-grid">
          {bookmarks.map((bookmark) => (
            <BookmarkCard
              key={bookmark.id}
              bookmark={bookmark}
              onEdit={openEdit}
              onDelete={setDeleteTarget}
            />
          ))}
        </div>
      )}

      {/* — Create Dialog — */}
      <Dialog open={createOpen} onClose={() => setCreateOpen(false)}>
        <DialogHeader
          title="Save Bookmark"
          description="Save a link to your knowledge vault."
          onClose={() => setCreateOpen(false)}
        />
        <DialogBody>
          {formError && (
            <p className="delete-dialog__warning" style={{ marginBottom: 12 }}>{formError}</p>
          )}
          <BookmarkForm
            formId="create-bookmark-form"
            onSubmit={handleCreate}
            isSubmitting={createMutation.isPending}
            collections={collections ?? []}
            defaultCollectionId={collectionId}
          />
        </DialogBody>
        <DialogFooter>
          <Button variant="secondary" size="sm" onClick={() => setCreateOpen(false)} disabled={createMutation.isPending}>
            Cancel
          </Button>
          <Button variant="primary" size="sm" type="submit" form="create-bookmark-form" isLoading={createMutation.isPending}>
            Save Bookmark
          </Button>
        </DialogFooter>
      </Dialog>

      {/* — Edit Dialog — */}
      <Dialog open={!!editTarget} onClose={() => setEditTarget(null)}>
        <DialogHeader
          title="Edit Bookmark"
          description="Update the title, URL, or description."
          onClose={() => setEditTarget(null)}
        />
        <DialogBody>
          {formError && (
            <p className="delete-dialog__warning" style={{ marginBottom: 12 }}>{formError}</p>
          )}
          {editTarget && (
            <BookmarkForm
              formId="edit-bookmark-form"
              defaultValues={editTarget}
              onSubmit={handleUpdate}
              isSubmitting={updateMutation.isPending}
              collections={collections ?? []}
            />
          )}
        </DialogBody>
        <DialogFooter>
          <Button variant="secondary" size="sm" onClick={() => setEditTarget(null)} disabled={updateMutation.isPending}>
            Cancel
          </Button>
          <Button variant="primary" size="sm" type="submit" form="edit-bookmark-form" isLoading={updateMutation.isPending}>
            Save Changes
          </Button>
        </DialogFooter>
      </Dialog>

      {/* — Delete Dialog — */}
      <DeleteBookmarkDialog
        open={!!deleteTarget}
        onClose={() => setDeleteTarget(null)}
        bookmark={deleteTarget}
        onConfirm={handleDelete}
        isDeleting={deleteMutation.isPending}
      />
    </section>
  );
}
