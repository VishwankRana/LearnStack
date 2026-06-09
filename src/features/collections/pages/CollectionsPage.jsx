import { useState } from 'react';
import { Button } from '../../../components/ui/Button';
import { EmptyState } from '../../../components/ui/EmptyState';
import { Spinner } from '../../../components/ui/Spinner';
import {
  Dialog,
  DialogHeader,
  DialogBody,
  DialogFooter,
} from '../../../components/ui/Dialog';
import { CollectionCard, CollectionCardSkeleton } from '../components/CollectionCard';
import { CollectionForm } from '../components/CollectionForm';
import { DeleteCollectionDialog } from '../components/DeleteCollectionDialog';
import {
  useCollections,
  useCreateCollection,
  useUpdateCollection,
  useDeleteCollection,
} from '../hooks/useCollections';
import '../collections.css';

function PlusIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 5v14M5 12h14" />
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

export function CollectionsPage() {
  const [createOpen, setCreateOpen] = useState(false);
  const [editTarget, setEditTarget] = useState(null);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [formError, setFormError] = useState(null);

  const { data: collections, isLoading, isError } = useCollections();

  const createMutation = useCreateCollection();
  const updateMutation = useUpdateCollection();
  const deleteMutation = useDeleteCollection();

  async function handleCreate(values) {
    setFormError(null);
    try {
      await createMutation.mutateAsync(values);
      setCreateOpen(false);
    } catch (err) {
      setFormError(err.message ?? 'Failed to create collection.');
    }
  }

  async function handleUpdate(values) {
    setFormError(null);
    try {
      await updateMutation.mutateAsync({ id: editTarget.id, data: values });
      setEditTarget(null);
    } catch (err) {
      setFormError(err.message ?? 'Failed to update collection.');
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

  function openEdit(collection) {
    setFormError(null);
    setEditTarget(collection);
  }

  function openDelete(collection) {
    setDeleteTarget(collection);
  }

  const count = collections?.length ?? 0;

  return (
    <section className="collections-page">
      {/* — Page Header — */}
      <div className="collections-page__header">
        <div className="collections-page__title-group">
          <p className="collections-page__eyebrow">Knowledge Vault</p>
          <h2 className="collections-page__title">
            Collections{' '}
            {!isLoading && count > 0 && (
              <span className="collections-page__count">({count})</span>
            )}
          </h2>
        </div>
        <Button
          variant="primary"
          size="md"
          onClick={() => {
            setFormError(null);
            setCreateOpen(true);
          }}
        >
          <PlusIcon />
          New Collection
        </Button>
      </div>

      {/* — Grid / States — */}
      {isLoading ? (
        <div className="collections-grid">
          {Array.from({ length: 6 }).map((_, i) => (
            <CollectionCardSkeleton key={i} />
          ))}
        </div>
      ) : isError ? (
        <EmptyState
          icon={<FolderIcon />}
          title="Could not load collections"
          description="Something went wrong fetching your collections. Please refresh the page."
        />
      ) : count === 0 ? (
        <EmptyState
          icon={<FolderIcon />}
          title="No collections yet"
          description="Collections help you organize your notes, documents, and bookmarks into focused topics."
          action={
            <Button
              variant="primary"
              size="md"
              onClick={() => {
                setFormError(null);
                setCreateOpen(true);
              }}
            >
              <PlusIcon />
              Create your first collection
            </Button>
          }
        />
      ) : (
        <div className="collections-grid">
          {collections.map((collection) => (
            <CollectionCard
              key={collection.id}
              collection={collection}
              onEdit={openEdit}
              onDelete={openDelete}
            />
          ))}
        </div>
      )}

      {/* — Create Dialog — */}
      <Dialog open={createOpen} onClose={() => setCreateOpen(false)}>
        <DialogHeader
          title="New Collection"
          description="Organize your knowledge into a focused collection."
          onClose={() => setCreateOpen(false)}
        />
        <DialogBody>
          {formError && (
            <p className="delete-dialog__warning" style={{ marginBottom: 12 }}>
              {formError}
            </p>
          )}
          <CollectionForm
            formId="create-collection-form"
            onSubmit={handleCreate}
            isSubmitting={createMutation.isPending}
          />
        </DialogBody>
        <DialogFooter>
          <Button
            variant="secondary"
            size="sm"
            onClick={() => setCreateOpen(false)}
            disabled={createMutation.isPending}
          >
            Cancel
          </Button>
          <Button
            variant="primary"
            size="sm"
            type="submit"
            form="create-collection-form"
            isLoading={createMutation.isPending}
          >
            Create Collection
          </Button>
        </DialogFooter>
      </Dialog>

      {/* — Edit Dialog — */}
      <Dialog open={!!editTarget} onClose={() => setEditTarget(null)}>
        <DialogHeader
          title="Edit Collection"
          description="Update the name, description, or color."
          onClose={() => setEditTarget(null)}
        />
        <DialogBody>
          {formError && (
            <p className="delete-dialog__warning" style={{ marginBottom: 12 }}>
              {formError}
            </p>
          )}
          {editTarget && (
            <CollectionForm
              formId="edit-collection-form"
              defaultValues={editTarget}
              onSubmit={handleUpdate}
              isSubmitting={updateMutation.isPending}
            />
          )}
        </DialogBody>
        <DialogFooter>
          <Button
            variant="secondary"
            size="sm"
            onClick={() => setEditTarget(null)}
            disabled={updateMutation.isPending}
          >
            Cancel
          </Button>
          <Button
            variant="primary"
            size="sm"
            type="submit"
            form="edit-collection-form"
            isLoading={updateMutation.isPending}
          >
            Save Changes
          </Button>
        </DialogFooter>
      </Dialog>

      {/* — Delete Dialog — */}
      <DeleteCollectionDialog
        open={!!deleteTarget}
        onClose={() => setDeleteTarget(null)}
        collection={deleteTarget}
        onConfirm={handleDelete}
        isDeleting={deleteMutation.isPending}
      />
    </section>
  );
}
