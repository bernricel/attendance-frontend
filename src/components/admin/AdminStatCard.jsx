export default function AdminStatCard({ label, value, tone = 'blue', hint }) {
  return (
    <article className={`admin-stat-card ${tone}`}>
      <span>{label}</span>
      <strong>{value}</strong>
      {hint ? <small>{hint}</small> : null}
    </article>
  )
}
