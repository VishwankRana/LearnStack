import { useForm, Controller } from 'react-hook-form';
import { Input } from '../../../components/ui/Input';
import { Textarea } from '../../../components/ui/Textarea';

const COLOR_PRESETS = [
  '#6366f1', // Indigo
  '#8b5cf6', // Violet
  '#ec4899', // Pink
  '#ef4444', // Red
  '#f59e0b', // Amber
  '#10b981', // Emerald
  '#06b6d4', // Cyan
  '#3b82f6', // Blue
  '#f97316', // Orange
  '#84cc16', // Lime
  '#14b8a6', // Teal
  '#64748b', // Slate
];

/**
 * CollectionForm — reusable create/edit form.
 *
 * @param {object} [defaultValues] — initial form values for editing
 * @param {(values) => void} onSubmit
 * @param {string} [submitLabel='Create']
 * @param {boolean} [isSubmitting]
 * @param {string} formId — HTML form id for external submit buttons
 */
export function CollectionForm({
  defaultValues,
  onSubmit,
  formId = 'collection-form',
  isSubmitting = false,
}) {
  const {
    register,
    handleSubmit,
    control,
    formState: { errors },
  } = useForm({
    defaultValues: {
      name: defaultValues?.name || '',
      description: defaultValues?.description || '',
      color: defaultValues?.color || '#6366f1',
    },
  });

  return (
    <form
      id={formId}
      className="collection-form"
      onSubmit={handleSubmit(onSubmit)}
    >
      <Input
        label="Name"
        placeholder="e.g. Machine Learning, Travel Ideas..."
        error={errors.name?.message}
        disabled={isSubmitting}
        {...register('name', {
          required: 'Collection name is required.',
          maxLength: {
            value: 60,
            message: 'Name must be 60 characters or fewer.',
          },
        })}
      />

      <Textarea
        label="Description"
        placeholder="What will this collection contain?"
        rows={3}
        error={errors.description?.message}
        disabled={isSubmitting}
        {...register('description', {
          maxLength: {
            value: 500,
            message: 'Description must be 500 characters or fewer.',
          },
        })}
      />

      <div className="ui-field">
        <label className="ui-field__label">Color</label>
        <Controller
          name="color"
          control={control}
          render={({ field }) => (
            <div className="collection-form__colors">
              {COLOR_PRESETS.map((color) => (
                <button
                  key={color}
                  type="button"
                  className={`collection-form__color-btn ${
                    field.value === color
                      ? 'collection-form__color-btn--selected'
                      : ''
                  }`}
                  style={{ background: color }}
                  onClick={() => field.onChange(color)}
                  aria-label={`Select color ${color}`}
                  disabled={isSubmitting}
                />
              ))}
            </div>
          )}
        />
      </div>
    </form>
  );
}
