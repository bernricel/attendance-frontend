export default function AuthLayout({ title, subtitle, children, sideNote }) {
  return (
    <main className="auth-page">
      <section className="auth-brand-panel">
        <span className="brand-tag">Faculty Attendance System</span>
        <h1>{title}</h1>
        <p>{subtitle}</p>
        {sideNote ? <div className="brand-side-note">{sideNote}</div> : null}
      </section>
      <section className="auth-form-panel">{children}</section>
    </main>
  )
}
