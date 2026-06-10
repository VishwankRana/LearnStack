import { Link, useParams, useNavigate } from 'react-router-dom';
import { useState } from 'react';
import { Button } from '../../../components/ui/Button';
import { EmptyState } from '../../../components/ui/EmptyState';
import { Spinner } from '../../../components/ui/Spinner';
import { Badge } from '../../../components/ui/Badge';
import {
  Dialog,
  DialogHeader,
  DialogBody,
  DialogFooter,
} from '../../../components/ui/Dialog';
import { Input } from '../../../components/ui/Input';
import { DeleteDocumentDialog } from '../components/DeleteDocumentDialog';
import { useDocument, useUpdateDocument, useDeleteDocument } from '../hooks/useDocuments';
import { useCollections } from '../../collections/hooks/useCollections';
import '../documents.css';

function ArrowLeftIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="m12 19-7-7 7-7" /><path d="M19 12H5" />
    </svg>
  );
}

function DownloadIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
      <polyline points="7 10 12 15 17 10" />
      <line x1="12" x2="12" y1="15" y2="3" />
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

function FileTextIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z" />
      <polyline points="14 2 14 8 20 8" />
      <path d="M10 12h4" /><path d="M10 16h4" />
    </svg>
  );
}

function getFileTypeInfo(mimeType) {
  if (mimeType === 'application/pdf') return { label: 'PDF', cls: 'pdf' };
  if (mimeType?.includes('wordprocessingml')) return { label: 'DOCX', cls: 'docx' };
  if (mimeType === 'text/plain') return { label: 'TXT', cls: 'txt' };
  return { label: 'FILE', cls: 'default' };
}

function formatFileSize(bytes) {
  if (!bytes) return '0 B';
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

function formatDate(dateStr) {
  return new Date(dateStr).toLocaleDateString('en-US', {
    month: 'long', day: 'numeric', year: 'numeric',
    hour: 'numeric', minute: '2-digit',
  });
}

export function DocumentViewPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { data: document, isLoading, isError } = useDocument(id);
  const { data: collections } = useCollections();
  const updateMutation = useUpdateDocument();
  const deleteMutation = useDeleteDocument();

  const [editOpen, setEditOpen] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [formError, setFormError] = useState(null);

  async function handleUpdate(e) {
    e.preventDefault();
    setFormError(null);
    const form = new FormData(e.target);
    const title = form.get('title')?.trim();
    const col = form.get('collectionId') || null;

    if (!title) { setFormError('Title is required.'); return; }

    try {
      await updateMutation.mutateAsync({ id, data: { title, collectionId: col } });
      setEditOpen(false);
    } catch (err) {
      setFormError(err.message ?? 'Update failed.');
    }
  }

  async function handleDelete() {
    try {
      await deleteMutation.mutateAsync(id);
      navigate('/app/documents', { replace: true });
    } catch {
      // error visible via mutation state
    }
  }

  if (isLoading) {
    return (
      <section className="document-view" style={{ justifyItems: 'center', paddingTop: 80 }}>
        <Spinner size="lg" />
      </section>
    );
  }

  if (isError || !document) {
    return (
      <section className="document-view">
        <Link to="/app/documents" className="document-view__back">
          <ArrowLeftIcon /> Back to Documents
        </Link>
        <EmptyState
          icon={<FileTextIcon />}
          title="Document not found"
          description="This document may have been deleted or you don't have access."
          action={<Button variant="primary" size="md" onClick={() => navigate('/app/documents')}>Go to Documents</Button>}
        />
      </section>
    );
  }

  const type = getFileTypeInfo(document.fileType);
  const isPdf = document.fileType === 'application/pdf';
  const wordCount = document.extractedText
    ? document.extractedText.split(/\s+/).filter(Boolean).length
    : 0;

  return (
    <section className="document-view">
      <Link to="/app/documents" className="document-view__back">
        <ArrowLeftIcon /> Back to Documents
      </Link>

      {/* — Header — */}
      <div className="document-view__header">
        <div className="document-view__info">
          <div className={`document-view__icon document-card__icon--${type.cls}`}>
            <FileTextIcon />
          </div>
          <div className="document-view__text">
            <h2 className="document-view__title">{document.title}</h2>
            <div className="document-view__file-meta">
              <span className={`document-card__file-type document-card__file-type--${type.cls}`}>
                {type.label}
              </span>
              <span>{formatFileSize(document.fileSize)}</span>
              <span>·</span>
              <span>{formatDate(document.createdAt)}</span>
              {document.collection && (
                <>
                  <span>·</span>
                  <Badge color={document.collection.color}>{document.collection.name}</Badge>
                </>
              )}
            </div>
          </div>
        </div>

        <div className="document-view__actions">
          <Button
            variant="secondary"
            size="sm"
            onClick={() => window.open(document.fileUrl, '_blank')}
          >
            <DownloadIcon /> Download
          </Button>
          <Button variant="secondary" size="sm" onClick={() => { setFormError(null); setEditOpen(true); }}>
            <EditIcon /> Edit
          </Button>
          <Button variant="danger" size="sm" onClick={() => setDeleteOpen(true)}>
            <TrashIcon /> Delete
          </Button>
        </div>
      </div>

      {/* — Stats — */}
      <div className="document-view__stats">
        <div className="document-view__stat-card">
          <div>
            <div className="document-view__stat-value">{type.label}</div>
            <div className="document-view__stat-label">File Type</div>
          </div>
        </div>
        <div className="document-view__stat-card">
          <div>
            <div className="document-view__stat-value">{formatFileSize(document.fileSize)}</div>
            <div className="document-view__stat-label">File Size</div>
          </div>
        </div>
        {wordCount > 0 && (
          <div className="document-view__stat-card">
            <div>
              <div className="document-view__stat-value">{wordCount.toLocaleString()}</div>
              <div className="document-view__stat-label">Words Extracted</div>
            </div>
          </div>
        )}
      </div>

      {/* — Content — */}
      {isPdf && (
        <div className="document-view__content">
          <h3 className="document-view__content-title">Document Preview</h3>
          <iframe
            src={document.fileUrl}
            className="document-view__pdf-embed"
            title="PDF Preview"
          />
        </div>
      )}

      {document.extractedText && (
        <div className="document-view__content">
          <h3 className="document-view__content-title">Extracted Text</h3>
          <div className="document-view__extracted-text">
            {document.extractedText}
          </div>
        </div>
      )}

      {!isPdf && !document.extractedText && (
        <div className="document-view__content">
          <EmptyState
            icon={<FileTextIcon />}
            title="No text extracted"
            description="Text extraction was not available for this file."
          />
        </div>
      )}

      {/* — Edit Dialog — */}
      <Dialog open={editOpen} onClose={() => setEditOpen(false)}>
        <DialogHeader title="Edit Document" description="Update the title or collection." onClose={() => setEditOpen(false)} />
        <DialogBody>
          {formError && <p className="delete-doc-warning" style={{ marginBottom: 12 }}>{formError}</p>}
          <form id="edit-doc-view-form" className="upload-form" onSubmit={handleUpdate}>
            <Input label="Title" name="title" defaultValue={document.title} disabled={updateMutation.isPending} />
            <div className="ui-field">
              <label className="ui-field__label">Collection</label>
              <select className="ui-input" name="collectionId" defaultValue={document.collectionId ?? ''} disabled={updateMutation.isPending}>
                <option value="">No collection</option>
                {collections?.map((c) => (
                  <option key={c.id} value={c.id}>{c.name}</option>
                ))}
              </select>
            </div>
          </form>
        </DialogBody>
        <DialogFooter>
          <Button variant="secondary" size="sm" onClick={() => setEditOpen(false)} disabled={updateMutation.isPending}>Cancel</Button>
          <Button variant="primary" size="sm" type="submit" form="edit-doc-view-form" isLoading={updateMutation.isPending}>Save Changes</Button>
        </DialogFooter>
      </Dialog>

      {/* — Delete Dialog — */}
      <DeleteDocumentDialog
        open={deleteOpen}
        onClose={() => setDeleteOpen(false)}
        document={document}
        onConfirm={handleDelete}
        isDeleting={deleteMutation.isPending}
      />
    </section>
  );
}
