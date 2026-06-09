import { useForm } from 'react-hook-form';
import { Input } from '../../../components/ui/Input';
import { Textarea } from '../../../components/ui/Textarea';
import { Select } from '../../../components/ui/Select';

function validateUrl(value) {
  try {
    const parsed = new URL(value);
    if (!['http:', 'https:'].includes(parsed.protocol)) {
      return 'URL must start with http:// or https://';
    }
    return true;
  } catch {
    return 'Please enter a valid URL (e.g. https://example.com)';
  }
}

/**
 * BookmarkForm — reusable create/edit form for a bookmark.
 *
 * @param {object}   [defaultValues]
 * @param {Function} onSubmit
 * @param {string}   [formId]
 * @param {boolean}  [isSubmitting]
 * @param {Array}    [collections]  — list of { id, name } objects
 * @param {string}   [defaultCollectionId] — pre-selected collection id
 */
export function BookmarkForm({
  defaultValues,
  onSubmit,
  formId = 'bookmark-form',
  isSubmitting = false,
  collections = [],
  defaultCollectionId = '',
}) {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({
    defaultValues: {
      title: defaultValues?.title ?? '',
      url: defaultValues?.url ?? '',
      description: defaultValues?.description ?? '',
      collectionId: defaultValues?.collectionId ?? defaultCollectionId,
    },
  });

  return (
    <form id={formId} className="bookmark-form" onSubmit={handleSubmit(onSubmit)}>
      <Input
        label="URL"
        placeholder="https://example.com"
        error={errors.url?.message}
        disabled={isSubmitting}
        {...register('url', {
          required: 'URL is required.',
          validate: validateUrl,
        })}
      />

      <Input
        label="Title"
        placeholder="e.g. How JWT Authentication Works"
        error={errors.title?.message}
        disabled={isSubmitting}
        {...register('title', {
          required: 'Title is required.',
          maxLength: { value: 255, message: 'Title must be 255 characters or fewer.' },
        })}
      />

      <Textarea
        label="Description"
        placeholder="What's interesting about this link?"
        rows={3}
        error={errors.description?.message}
        disabled={isSubmitting}
        {...register('description', {
          maxLength: { value: 1000, message: 'Description must be 1000 characters or fewer.' },
        })}
      />

      {collections.length > 0 && (
        <Select
          label="Collection"
          disabled={isSubmitting}
          {...register('collectionId')}
        >
          <option value="">No collection</option>
          {collections.map((c) => (
            <option key={c.id} value={c.id}>{c.name}</option>
          ))}
        </Select>
      )}
    </form>
  );
}
