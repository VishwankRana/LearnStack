/**
 * Badge — small label with optional color dot.
 *
 * @param {string} [color] — hex color for colored variant
 * @param {React.ReactNode} children
 */
export function Badge({ color, children, className = '' }) {
  const isColored = Boolean(color);

  return (
    <span
      className={`ui-badge ${isColored ? 'ui-badge--color' : 'ui-badge--default'} ${className}`}
      style={isColored ? { backgroundColor: color } : undefined}
    >
      <span className="ui-badge__dot" />
      {children}
    </span>
  );
}
