import { Spinner } from './Spinner';

/**
 * Button — composable button with variants, sizes, and loading state.
 *
 * @param {'primary'|'secondary'|'danger'|'ghost'} [variant='primary']
 * @param {'sm'|'md'|'lg'} [size='md']
 * @param {boolean} [isLoading]
 * @param {boolean} [fullWidth]
 * @param {boolean} [iconOnly] — render as square icon button
 * @param {React.ReactNode} children
 */
export function Button({
  variant = 'primary',
  size = 'md',
  isLoading = false,
  fullWidth = false,
  iconOnly = false,
  children,
  className = '',
  disabled,
  ...props
}) {
  const classes = [
    'ui-btn',
    `ui-btn--${variant}`,
    `ui-btn--${size}`,
    fullWidth && 'ui-btn--full',
    iconOnly && 'ui-btn--icon',
    className,
  ]
    .filter(Boolean)
    .join(' ');

  return (
    <button
      className={classes}
      disabled={disabled || isLoading}
      {...props}
    >
      {isLoading ? (
        <>
          <Spinner size="sm" />
          {!iconOnly && children}
        </>
      ) : (
        children
      )}
    </button>
  );
}
