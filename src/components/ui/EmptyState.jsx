/**
 * EmptyState — placeholder content for empty lists/pages.
 *
 * @param {React.ReactNode} icon — icon component to render
 * @param {string} title
 * @param {string} [description]
 * @param {React.ReactNode} [action] — button or link to render below
 */
export function EmptyState({ icon, title, description, action }) {
  return (
    <div className="ui-empty">
      {icon && <div className="ui-empty__icon">{icon}</div>}
      <h4 className="ui-empty__title">{title}</h4>
      {description && (
        <p className="ui-empty__description">{description}</p>
      )}
      {action && <div className="ui-empty__action">{action}</div>}
    </div>
  );
}
