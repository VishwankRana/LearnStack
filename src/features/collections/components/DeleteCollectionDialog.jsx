import {
  Dialog,
  DialogHeader,
  DialogBody,
  DialogFooter,
} from '../../../components/ui/Dialog';
import { Button } from '../../../components/ui/Button';

/**
 * DeleteCollectionDialog — confirmation before deleting a collection.
 */
export function DeleteCollectionDialog({
  open,
  onClose,
  collection,
  onConfirm,
  isDeleting,
}) {
  if (!collection) return null;

  return (
    <Dialog open={open} onClose={onClose}>
      <DialogHeader
        title="Delete Collection"
        description="This action cannot be undone."
        onClose={onClose}
      />
      <DialogBody>
        <p className="delete-dialog__warning">
          All items in <strong>{collection.name}</strong> will be uncategorized.
          The notes, documents, and bookmarks themselves will not be deleted.
        </p>
      </DialogBody>
      <DialogFooter>
        <Button
          variant="secondary"
          size="sm"
          onClick={onClose}
          disabled={isDeleting}
        >
          Cancel
        </Button>
        <Button
          variant="danger"
          size="sm"
          onClick={onConfirm}
          isLoading={isDeleting}
        >
          Delete Collection
        </Button>
      </DialogFooter>
    </Dialog>
  );
}
