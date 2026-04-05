import { useEffect, useMemo, useState } from 'react'
import { Link, useLocation, useNavigate, useParams, useSearchParams } from 'react-router-dom'
import MessageBanner from '../components/MessageBanner'
import { ROUTES } from '../constants/routes'
import DepartmentMismatchModal from '../components/faculty/DepartmentMismatchModal'
import FacultyLayout from '../components/faculty/FacultyLayout'
import { getFacultySessionPreview, scanAttendance } from '../services/attendanceApi'
import { getStoredAuth } from '../services/authStorage'
import { getApiErrorMessage } from '../utils/apiError'
import { formatDateTime } from '../utils/dateTime'

export default function FacultyScanConfirmationPage() {
  const navigate = useNavigate()
  const location = useLocation()
  const params = useParams()
  const [searchParams] = useSearchParams()
  const { token, user } = getStoredAuth()

  const qrToken = useMemo(
    () => params.qrToken || searchParams.get('token') || '',
    [params.qrToken, searchParams],
  )

  const [session, setSession] = useState(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isConfirming, setIsConfirming] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [showMismatchModal, setShowMismatchModal] = useState(false)
  const [mismatchMessage, setMismatchMessage] = useState('')

  useEffect(() => {
    if (!token) {
      navigate(ROUTES.LOGIN, {
        replace: true,
        state: { from: `${location.pathname}${location.search}` },
      })
    }
  }, [location.pathname, location.search, navigate, token])

  useEffect(() => {
    const loadSession = async () => {
      if (!token) return
      if (!qrToken) {
        setError('Missing QR token. Please scan a valid QR link.')
        setIsLoading(false)
        return
      }
      setIsLoading(true)
      setError('')
      try {
        const data = await getFacultySessionPreview(qrToken)
        setSession(data.session)
      } catch (apiError) {
        setError(getApiErrorMessage(apiError, 'Unable to load session details.'))
      } finally {
        setIsLoading(false)
      }
    }
    loadSession()
  }, [qrToken, token])

  const handleConfirm = async () => {
    if (!qrToken || !session) return
    setIsConfirming(true)
    setError('')
    setSuccess('')
    try {
      const data = await scanAttendance(qrToken, session.session_type)
      setShowMismatchModal(false)
      setSuccess(data?.message || 'Attendance recorded successfully.')
    } catch (apiError) {
      const message = getApiErrorMessage(apiError, 'Unable to process attendance request.')
      if (apiError?.response?.status === 403 && message.toLowerCase().includes('department mismatch')) {
        setMismatchMessage(message)
        setShowMismatchModal(true)
      } else {
        setError(message)
      }
    } finally {
      setIsConfirming(false)
    }
  }

  return (
    <FacultyLayout
      title="Attendance Confirmation"
      subtitle="Review session details before confirming your attendance."
      actions={
        <Link className="ghost-btn compact link-button" to={ROUTES.FACULTY_HISTORY}>
          View My History
        </Link>
      }
    >
      <section className="faculty-panel">
        {isLoading ? <p className="data-state loading">Loading session details...</p> : null}
        {!isLoading && error ? <MessageBanner type="error" message={error} /> : null}
        {!isLoading && success ? <MessageBanner type="info" message={success} /> : null}

        {!isLoading && session ? (
          <div className="scan-confirm-grid">
            <div className="summary-grid">
              <div className="summary-item">
                <span>Session Name</span>
                <strong>{session.name}</strong>
              </div>
              <div className="summary-item">
                <span>Department</span>
                <strong>{session.department_name}</strong>
              </div>
              <div className="summary-item">
                <span>Type</span>
                <strong>{session.session_type}</strong>
              </div>
              <div className="summary-item">
                <span>Start</span>
                <strong>{formatDateTime(session.start_time)}</strong>
              </div>
              <div className="summary-item">
                <span>End</span>
                <strong>{formatDateTime(session.end_time)}</strong>
              </div>
              <div className="summary-item">
                <span>Your Department</span>
                <strong>{user?.department || '-'}</strong>
              </div>
            </div>

            <button
              type="button"
              className="primary-btn"
              onClick={handleConfirm}
              disabled={isConfirming || Boolean(success)}
            >
              {isConfirming ? 'Confirming...' : success ? 'Attendance Confirmed' : 'Confirm Attendance'}
            </button>
          </div>
        ) : null}
      </section>

      <DepartmentMismatchModal
        isOpen={showMismatchModal}
        message={mismatchMessage}
        onClose={() => setShowMismatchModal(false)}
      />
    </FacultyLayout>
  )
}
