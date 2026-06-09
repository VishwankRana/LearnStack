import {
  Dialog,
  DialogHeader,
  DialogBody,
  DialogFooter,
} from '../../../components/ui/Dialog';
import { Button } from '../../../components/ui/Button';

export function DeleteBookmarkDialog({ open, onClose, bookmark, onConfirm, isDeleting }) {
  if (!bookmark) return null;

  return (
    <Dialog open={open} onClose={onClose}>
      <DialogHeader
        title="Delete Bookmark"
        description="This action cannot be undone."
        onClose={onClose}
      />
      <DialogBody>
        <p className="delete-dialog__warning">
          <strong>"{bookmark.title}"</strong> will be permanently removed from your vault.
        </p>
      </DialogBody>
      <DialogFooter>
        <Button variant="secondary" size="sm" onClick={onClose} disabled={isDeleting}>
          Cancel
        </Button>
        <Button variant="danger" size="sm" onClick={onConfirm} isLoading={isDeleting}>
          Delete Bookmark
        </Button>
      </DialogFooter>
    </Dialog>
  );
}
