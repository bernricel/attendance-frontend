import { Navigate, Route, Routes } from 'react-router-dom'
import {
  RequireAdminRole,
  RequireAuth,
  RequireCompleteProfile,
  RequireFacultyRole,
  RequireIncompleteProfile,
} from './components/RouteGuards'
import AdminAttendanceCalendarPage from './pages/AdminAttendanceCalendarPage'
import AdminAttendanceLogsPage from './pages/AdminAttendanceLogsPage'
import AdminCreateSessionPage from './pages/AdminCreateSessionPage'
import { getDefaultRouteForUser, getStoredAuth } from './services/authStorage'
import AdminDashboardPage from './pages/AdminDashboardPage'
import AdminQrDisplayPage from './pages/AdminQrDisplayPage'
import { ROUTES } from './constants/routes'
import CompleteProfilePage from './pages/CompleteProfilePage'
import FacultyAttendanceHistoryPage from './pages/FacultyAttendanceHistoryPage'
import FacultyDashboardPage from './pages/FacultyDashboardPage'
import FacultyScanConfirmationPage from './pages/FacultyScanConfirmationPage'
import LoginPage from './pages/LoginPage'

function HomeRedirect() {
  const { token, user } = getStoredAuth()
  if (!token) {
    return <Navigate to={ROUTES.LOGIN} replace />
  }

  if (!user?.is_profile_complete) {
    return <Navigate to={ROUTES.COMPLETE_PROFILE} replace />
  }

  return <Navigate to={getDefaultRouteForUser(user)} replace />
}

function App() {
  return (
    <Routes>
      <Route path={ROUTES.HOME} element={<HomeRedirect />} />
      <Route path={ROUTES.LOGIN} element={<LoginPage />} />
      <Route
        path={ROUTES.COMPLETE_PROFILE}
        element={
          <RequireAuth>
            <RequireIncompleteProfile>
              <CompleteProfilePage />
            </RequireIncompleteProfile>
          </RequireAuth>
        }
      />
      <Route
        path={ROUTES.FACULTY_DASHBOARD}
        element={
          <RequireAuth>
            <RequireCompleteProfile>
              <RequireFacultyRole>
                <FacultyDashboardPage />
              </RequireFacultyRole>
            </RequireCompleteProfile>
          </RequireAuth>
        }
      />
      <Route
        path={ROUTES.FACULTY_HISTORY}
        element={
          <RequireAuth>
            <RequireCompleteProfile>
              <RequireFacultyRole>
                <FacultyAttendanceHistoryPage />
              </RequireFacultyRole>
            </RequireCompleteProfile>
          </RequireAuth>
        }
      />
      <Route
        path={ROUTES.FACULTY_SCAN}
        element={
          <RequireAuth>
            <RequireCompleteProfile>
              <RequireFacultyRole>
                <FacultyScanConfirmationPage />
              </RequireFacultyRole>
            </RequireCompleteProfile>
          </RequireAuth>
        }
      />
      <Route
        path={`${ROUTES.FACULTY_SCAN}/:qrToken`}
        element={
          <RequireAuth>
            <RequireCompleteProfile>
              <RequireFacultyRole>
                <FacultyScanConfirmationPage />
              </RequireFacultyRole>
            </RequireCompleteProfile>
          </RequireAuth>
        }
      />
      <Route
        path={ROUTES.ADMIN_DASHBOARD}
        element={
          <RequireAuth>
            <RequireCompleteProfile>
              <RequireAdminRole>
                <AdminDashboardPage />
              </RequireAdminRole>
            </RequireCompleteProfile>
          </RequireAuth>
        }
      />
      <Route
        path={ROUTES.ADMIN_CREATE_SESSION}
        element={
          <RequireAuth>
            <RequireCompleteProfile>
              <RequireAdminRole>
                <AdminCreateSessionPage />
              </RequireAdminRole>
            </RequireCompleteProfile>
          </RequireAuth>
        }
      />
      <Route
        path={ROUTES.ADMIN_QR_DISPLAY}
        element={
          <RequireAuth>
            <RequireCompleteProfile>
              <RequireAdminRole>
                <AdminQrDisplayPage />
              </RequireAdminRole>
            </RequireCompleteProfile>
          </RequireAuth>
        }
      />
      <Route
        path={ROUTES.ADMIN_LOGS}
        element={
          <RequireAuth>
            <RequireCompleteProfile>
              <RequireAdminRole>
                <AdminAttendanceLogsPage />
              </RequireAdminRole>
            </RequireCompleteProfile>
          </RequireAuth>
        }
      />
      <Route
        path={ROUTES.ADMIN_CALENDAR}
        element={
          <RequireAuth>
            <RequireCompleteProfile>
              <RequireAdminRole>
                <AdminAttendanceCalendarPage />
              </RequireAdminRole>
            </RequireCompleteProfile>
          </RequireAuth>
        }
      />
      <Route path="*" element={<Navigate to={ROUTES.HOME} replace />} />
    </Routes>
  )
}

export default App
