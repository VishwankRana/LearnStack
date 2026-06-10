import { useState } from 'react';
import { Input } from '../../../components/ui/Input';
import { UploadZone } from './UploadZone';

/**
 * DocumentUploadForm — file upload form with title and collection fields.
 */
export function DocumentUploadForm({
  formId = 'upload-document-form',
  onSubmit,
  isSubmitting = false,
  collections = [],
  defaultCollectionId = '',
}) {
  const [file, setFile] = useState(null);
  const [title, setTitle] = useState('');
  const [collectionId, setCollectionId] = useState(defaultCollectionId);
  const [error, setError] = useState(null);

  function handleFormSubmit(e) {
    e.preventDefault();
    if (!file) {
      setError('Please select a file to upload.');
      return;
    }
    setError(null);

    const formData = new FormData();
    formData.append('file', file);
    if (title.trim()) formData.append('title', title.trim());
    if (collectionId) formData.append('collectionId', collectionId);

    onSubmit(formData);
  }

  return (
    <form id={formId} className="upload-form" onSubmit={handleFormSubmit}>
      <UploadZone
        file={file}
        onFileSelect={(f) => { setFile(f); setError(null); }}
        onFileClear={() => setFile(null)}
        disabled={isSubmitting}
      />

      {error && <span className="ui-field__error">{error}</span>}

      <Input
        label="Title (optional)"
        placeholder="Leave empty to use the file name"
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        disabled={isSubmitting}
      />

      <div className="ui-field">
        <label className="ui-field__label">Collection (optional)</label>
        <select
          className="ui-input"
          value={collectionId}
          onChange={(e) => setCollectionId(e.target.value)}
          disabled={isSubmitting}
        >
          <option value="">No collection</option>
          {collections.map((c) => (
            <option key={c.id} value={c.id}>{c.name}</option>
          ))}
        </select>
      </div>
    </form>
  );
}
