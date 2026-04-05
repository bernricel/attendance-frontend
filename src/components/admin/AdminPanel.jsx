export default function AdminPanel({ title, subtitle, children }) {
  return (
    <section className="admin-panel">
      {(title || subtitle) && (
        <header className="admin-panel-header">
          {title ? <h2>{title}</h2> : null}
          {subtitle ? <p>{subtitle}</p> : null}
        </header>
      )}
      {children}
    </section>
  )
}
