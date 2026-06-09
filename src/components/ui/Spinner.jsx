/**
 * Spinner — CSS-animated loading indicator.
 *
 * @param {'sm'|'md'|'lg'} [size='md']
 * @param {string} [className]
 */
export function Spinner({ size = 'md', className = '' }) {
  return (
    <span
      className={`ui-spinner ui-spinner--${size} ${className}`}
      role="status"
      aria-label="Loading"
    />
  );
}
