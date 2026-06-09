import {
  Dialog,
  DialogHeader,
  DialogBody,
  DialogFooter,
} from '../../../components/ui/Dialog';
import { Button } from '../../../components/ui/Button';

export function DeleteNoteDialog({ open, onClose, note, onConfirm, isDeleting }) {
  if (!note) return null;

  return (
    <Dialog open={open} onClose={onClose}>
      <DialogHeader
        title="Delete Note"
        description="This action cannot be undone."
        onClose={onClose}
      />
      <DialogBody>
        <p className="delete-dialog__warning">
          <strong>"{note.title}"</strong> will be permanently deleted along with all its content.
        </p>
      </DialogBody>
      <DialogFooter>
        <Button variant="secondary" size="sm" onClick={onClose} disabled={isDeleting}>
          Cancel
        </Button>
        <Button variant="danger" size="sm" onClick={onConfirm} isLoading={isDeleting}>
          Delete Note
        </Button>
      </DialogFooter>
    </Dialog>
  );
}
