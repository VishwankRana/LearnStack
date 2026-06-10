import {
  Dialog,
  DialogHeader,
  DialogBody,
  DialogFooter,
} from '../../../components/ui/Dialog';
import { Button } from '../../../components/ui/Button';

export function DeleteDocumentDialog({
  open,
  onClose,
  document,
  onConfirm,
  isDeleting,
}) {
  if (!document) return null;

  return (
    <Dialog open={open} onClose={onClose}>
      <DialogHeader
        title="Delete Document"
        description="This action cannot be undone."
        onClose={onClose}
      />
      <DialogBody>
        <p className="delete-doc-warning">
          <strong>{document.title}</strong> will be permanently deleted from
          your vault and removed from storage.
        </p>
      </DialogBody>
      <DialogFooter>
        <Button variant="secondary" size="sm" onClick={onClose} disabled={isDeleting}>
          Cancel
        </Button>
        <Button variant="danger" size="sm" onClick={onConfirm} isLoading={isDeleting}>
          Delete Document
        </Button>
      </DialogFooter>
    </Dialog>
  );
}
