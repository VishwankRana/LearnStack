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
import { DocumentCard, DocumentCardSkeleton } from '../components/DocumentCard';
import { DocumentUploadForm } from '../components/DocumentUploadForm';
import { DeleteDocumentDialog } from '../components/DeleteDocumentDialog';
import {
  useDocuments,
  useUploadDocument,
  useUpdateDocument,
  useDeleteDocument,
} from '../hooks/useDocuments';
import { useCollections } from '../../collections/hooks/useCollections';
import { Input } from '../../../components/ui/Input';
import '../documents.css';

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

function UploadIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
      <polyline points="17 8 12 3 7 8" />
      <line x1="12" x2="12" y1="3" y2="15" />
    </svg>
  );
}

export function DocumentsPage() {
  const [searchParams] = useSearchParams();

  const [search, setSearch] = useState('');
  const [collectionId, setCollectionId] = useState(() => searchParams.get('collectionId') ?? '');
  const [uploadOpen, setUploadOpen] = useState(false);
  const [editTarget, setEditTarget] = useState(null);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [formError, setFormError] = useState(null);

  const deferredSearch = useDeferredValue(search);

  const { data: documents, isLoading, isError } = useDocuments({
    search: deferredSearch || undefined,
    collectionId: collectionId || undefined,
  });

  const { data: collections } = useCollections();
  const uploadMutation = useUploadDocument();
  const updateMutation = useUpdateDocument();
  const deleteMutation = useDeleteDocument();

  async function handleUpload(formData) {
    setFormError(null);
    try {
      await uploadMutation.mutateAsync(formData);
      setUploadOpen(false);
    } catch (err) {
      setFormError(err.message ?? 'Upload failed.');
    }
  }

  async function handleUpdate(e) {
    e.preventDefault();
    setFormError(null);
    const form = new FormData(e.target);
    const title = form.get('title')?.trim();
    const col = form.get('collectionId') || null;

    if (!title) {
      setFormError('Title is required.');
      return;
    }

    try {
      await updateMutation.mutateAsync({
        id: editTarget.id,
        data: { title, collectionId: col },
      });
      setEditTarget(null);
    } catch (err) {
      setFormError(err.message ?? 'Update failed.');
    }
  }

  async function handleDelete() {
    try {
      await deleteMutation.mutateAsync(deleteTarget.id);
      setDeleteTarget(null);
    } catch {
      // error visible via mutation state
    }
  }

  function openEdit(doc) {
    setFormError(null);
    setEditTarget(doc);
  }

  const count = documents?.length ?? 0;
  const hasFilters = !!deferredSearch || !!collectionId;

  return (
    <section className="documents-page">
      {/* — Page Header — */}
      <div className="documents-page__header">
        <div className="documents-page__title-group">
          <p className="documents-page__eyebrow">Knowledge Vault</p>
          <h2 className="documents-page__title">
            Documents{' '}
            {!isLoading && count > 0 && (
              <span className="documents-page__count">({count})</span>
            )}
          </h2>
        </div>
        <Button variant="primary" size="md" onClick={() => { setFormError(null); setUploadOpen(true); }}>
          <PlusIcon />
          Upload Document
        </Button>
      </div>

      {/* — Filters — */}
      <div className="documents-page__filters">
        <div className="documents-search">
          <SearchIcon />
          <input
            type="search"
            className="documents-search__input"
            placeholder="Search by title…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>

        <select
          className="documents-filter-select"
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
        <div className="documents-grid">
          {Array.from({ length: 6 }).map((_, i) => (
            <DocumentCardSkeleton key={i} />
          ))}
        </div>
      ) : isError ? (
        <EmptyState
          icon={<UploadIcon />}
          title="Could not load documents"
          description="Something went wrong. Please refresh the page."
        />
      ) : count === 0 ? (
        <EmptyState
          icon={<UploadIcon />}
          title={hasFilters ? 'No documents match your search' : 'No documents yet'}
          description={
            hasFilters
              ? 'Try adjusting your search or filter.'
              : 'Upload PDFs, Word docs, and text files to your vault.'
          }
          action={
            !hasFilters ? (
              <Button variant="primary" size="md" onClick={() => { setFormError(null); setUploadOpen(true); }}>
                <PlusIcon />
                Upload your first document
              </Button>
            ) : null
          }
        />
      ) : (
        <div className="documents-grid">
          {documents.map((doc) => (
            <DocumentCard
              key={doc.id}
              document={doc}
              onEdit={openEdit}
              onDelete={setDeleteTarget}
            />
          ))}
        </div>
      )}

      {/* — Upload Dialog — */}
      <Dialog open={uploadOpen} onClose={() => setUploadOpen(false)}>
        <DialogHeader
          title="Upload Document"
          description="Add a PDF, DOCX, or TXT file to your vault."
          onClose={() => setUploadOpen(false)}
        />
        <DialogBody>
          {formError && (
            <p className="delete-doc-warning" style={{ marginBottom: 12 }}>{formError}</p>
          )}
          <DocumentUploadForm
            formId="upload-document-form"
            onSubmit={handleUpload}
            isSubmitting={uploadMutation.isPending}
            collections={collections ?? []}
            defaultCollectionId={collectionId}
          />
        </DialogBody>
        <DialogFooter>
          <Button variant="secondary" size="sm" onClick={() => setUploadOpen(false)} disabled={uploadMutation.isPending}>
            Cancel
          </Button>
          <Button variant="primary" size="sm" type="submit" form="upload-document-form" isLoading={uploadMutation.isPending}>
            Upload
          </Button>
        </DialogFooter>
      </Dialog>

      {/* — Edit Dialog — */}
      <Dialog open={!!editTarget} onClose={() => setEditTarget(null)}>
        <DialogHeader
          title="Edit Document"
          description="Update the title or collection."
          onClose={() => setEditTarget(null)}
        />
        <DialogBody>
          {formError && (
            <p className="delete-doc-warning" style={{ marginBottom: 12 }}>{formError}</p>
          )}
          {editTarget && (
            <form id="edit-document-form" className="upload-form" onSubmit={handleUpdate}>
              <Input
                label="Title"
                name="title"
                defaultValue={editTarget.title}
                disabled={updateMutation.isPending}
              />
              <div className="ui-field">
                <label className="ui-field__label">Collection</label>
                <select
                  className="ui-input"
                  name="collectionId"
                  defaultValue={editTarget.collectionId ?? ''}
                  disabled={updateMutation.isPending}
                >
                  <option value="">No collection</option>
                  {collections?.map((c) => (
                    <option key={c.id} value={c.id}>{c.name}</option>
                  ))}
                </select>
              </div>
            </form>
          )}
        </DialogBody>
        <DialogFooter>
          <Button variant="secondary" size="sm" onClick={() => setEditTarget(null)} disabled={updateMutation.isPending}>
            Cancel
          </Button>
          <Button variant="primary" size="sm" type="submit" form="edit-document-form" isLoading={updateMutation.isPending}>
            Save Changes
          </Button>
        </DialogFooter>
      </Dialog>

      {/* — Delete Dialog — */}
      <DeleteDocumentDialog
        open={!!deleteTarget}
        onClose={() => setDeleteTarget(null)}
        document={deleteTarget}
        onConfirm={handleDelete}
        isDeleting={deleteMutation.isPending}
      />
    </section>
  );
}
