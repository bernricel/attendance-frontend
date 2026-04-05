import { NavLink, useNavigate } from 'react-router-dom'
import { ROUTES } from '../../constants/routes'
import { clearAuthSession, getStoredAuth } from '../../services/authStorage'
import { useResponsiveSidebar } from '../../hooks/useResponsiveSidebar'
import { getDisplayName } from '../../utils/userName'

const facultyNav = [
  { to: ROUTES.FACULTY_DASHBOARD, label: 'Dashboard' },
  { to: ROUTES.FACULTY_HISTORY, label: 'Attendance History' },
]

export default function FacultyLayout({ title, subtitle, actions, children }) {
  const navigate = useNavigate()
  const { user } = getStoredAuth()
  const { isSidebarOpen, closeSidebar, toggleSidebar } = useResponsiveSidebar()

  const handleLogout = () => {
    clearAuthSession()
    navigate(ROUTES.LOGIN, { replace: true })
  }

  return (
    <div className="faculty-shell">
      <div
        className={`layout-backdrop ${isSidebarOpen ? 'show' : ''}`}
        onClick={closeSidebar}
        aria-hidden="true"
      />

      <aside
        id="faculty-sidebar-nav"
        className={`faculty-sidebar ${isSidebarOpen ? 'is-open' : ''}`}
      >
        <div className="faculty-brand">Faculty Portal</div>
        <nav className="faculty-nav">
          {facultyNav.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              className={({ isActive }) => `faculty-nav-item${isActive ? ' active' : ''}`}
              onClick={closeSidebar}
            >
              {item.label}
            </NavLink>
          ))}
        </nav>
      </aside>
      <section className="faculty-main">
        <header className="faculty-topbar">
          <div className="topbar-title-wrap">
            <div className="topbar-title-row">
              <button
                type="button"
                className="sidebar-toggle"
                onClick={toggleSidebar}
                aria-label="Toggle navigation menu"
                aria-expanded={isSidebarOpen}
                aria-controls="faculty-sidebar-nav"
              >
                &#9776;
              </button>
              <h1>{title}</h1>
            </div>
            {subtitle ? <p>{subtitle}</p> : null}
          </div>
          <div className="faculty-topbar-right">
            <div className="faculty-user-badge">
              <strong>{getDisplayName(user, 'Faculty')}</strong>
              <span>{user?.department || '-'}</span>
            </div>
            <button type="button" className="ghost-btn compact" onClick={handleLogout}>
              Logout
            </button>
          </div>
        </header>
        {actions ? <div className="faculty-actions">{actions}</div> : null}
        <div className="faculty-content">{children}</div>
      </section>
    </div>
  )
}
