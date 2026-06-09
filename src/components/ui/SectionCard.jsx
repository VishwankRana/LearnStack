export function SectionCard({
  badge,
  children,
  description,
  eyebrow,
  title,
}) {
  return (
    <section className="section-card">
      <div className="section-card__header">
        <div>
          <p className="section-card__eyebrow">{eyebrow}</p>
          <h2 className="section-card__title">{title}</h2>
          <p className="section-card__description">{description}</p>
        </div>
        {badge ? <span className="section-card__badge">{badge}</span> : null}
      </div>
      {children}
    </section>
  )
}
