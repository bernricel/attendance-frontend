export default function AuthCard({ title, description, children }) {
  return (
    <article className="auth-card">
      <header className="auth-card-header">
        <h2>{title}</h2>
        {description ? <p>{description}</p> : null}
      </header>
      {children}
    </article>
  )
}
