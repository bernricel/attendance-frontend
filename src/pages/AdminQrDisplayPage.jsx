import { useCallback, useEffect, useMemo, useState } from 'react'
import { QRCodeCanvas } from 'qrcode.react'
import AdminLayout from '../components/admin/AdminLayout'
import AdminPanel from '../components/admin/AdminPanel'
import { DataEmpty, DataError, DataLoading } from '../components/admin/DataState'
import { getAdminSessionQrStatus, getAdminSessions } from '../services/attendanceApi'
import { getApiErrorMessage } from '../utils/apiError'
import { formatDateTime } from '../utils/dateTime'

export default function AdminQrDisplayPage() {
  const [sessions, setSessions] = useState([])
  const [selectedId, setSelectedId] = useState('')
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState('')
  const [qrStatus, setQrStatus] = useState(null)
  const [qrError, setQrError] = useState('')
  const [secondsRemaining, setSecondsRemaining] = useState(0)
  const [isRefreshingQr, setIsRefreshingQr] = useState(false)

  useEffect(() => {
    const loadSessions = async () => {
      setIsLoading(true)
      setError('')
      try {
        const data = await getAdminSessions()
        setSessions(data.sessions || [])
        if (data.sessions?.length) {
          setSelectedId(String(data.sessions[0].id))
        }
      } catch (apiError) {
        setError(getApiErrorMessage(apiError, 'Failed to load sessions.'))
      } finally {
        setIsLoading(false)
      }
    }
    loadSessions()
  }, [])

  const loadQrStatus = useCallback(async (sessionId) => {
    if (!sessionId) {
      setQrStatus(null)
      setSecondsRemaining(0)
      return
    }

    setIsRefreshingQr(true)
    setQrError('')
    try {
      const data = await getAdminSessionQrStatus(sessionId)
      setQrStatus(data)
      setSecondsRemaining(data.seconds_until_rotation ?? 0)
      setSessions((prev) =>
        prev.map((session) =>
          String(session.id) === String(sessionId)
            ? {
                ...session,
                qr_token: data.qr_token,
                qr_refresh_interval_seconds: data.qr_refresh_interval_seconds,
              }
            : session,
        ),
      )
    } catch (apiError) {
      setQrError(getApiErrorMessage(apiError, 'Failed to refresh QR token status.'))
    } finally {
      setIsRefreshingQr(false)
    }
  }, [])

  useEffect(() => {
    if (!selectedId) return
    loadQrStatus(selectedId)
  }, [loadQrStatus, selectedId])

  useEffect(() => {
    if (!selectedId || !qrStatus?.qr_token_expires_at) return

    const timerId = window.setInterval(() => {
      const expiresAtMs = new Date(qrStatus.qr_token_expires_at).getTime()
      const remainingSeconds = Math.max(0, Math.ceil((expiresAtMs - Date.now()) / 1000))
      setSecondsRemaining(remainingSeconds)

      if (remainingSeconds <= 0 && !isRefreshingQr) {
        loadQrStatus(selectedId)
      }
    }, 1000)

    return () => window.clearInterval(timerId)
  }, [isRefreshingQr, loadQrStatus, qrStatus?.qr_token_expires_at, selectedId])

  const selectedSession = useMemo(
    () => sessions.find((session) => String(session.id) === String(selectedId)),
    [sessions, selectedId],
  )
  const currentQrToken = qrStatus?.qr_token || selectedSession?.qr_token || ''
  const qrUrl = currentQrToken
    ? `${window.location.origin}/faculty/scan/${currentQrToken}`
    : ''

  return (
    <AdminLayout
      title="QR Display"
      subtitle="Select a CIT session and display a full-size QR for faculty scanning."
    >
      <AdminPanel>
        {isLoading ? <DataLoading message="Loading sessions..." /> : null}
        {error ? <DataError message={error} /> : null}
        {qrError ? <DataError message={qrError} /> : null}
        {!isLoading && !error && sessions.length === 0 ? (
          <DataEmpty message="No sessions available. Create a session first." />
        ) : null}

        {!isLoading && !error && sessions.length > 0 ? (
          <>
            <label className="field-block" htmlFor="session_picker">
              <span className="field-label">Attendance Session</span>
              <select
                id="session_picker"
                value={selectedId}
                onChange={(event) => setSelectedId(event.target.value)}
              >
                {sessions.map((session) => (
                  <option key={session.id} value={session.id}>
                    {session.name}
                  </option>
                ))}
              </select>
            </label>

            {selectedSession ? (
              <div className="qr-stage">
                <div className="qr-box">
                  <QRCodeCanvas
                    value={qrUrl}
                    size={320}
                    level="H"
                    includeMargin
                  />
                </div>
                <div className="qr-meta">
                  <h3>{selectedSession.name}</h3>
                  <p>Type: {selectedSession.session_type}</p>
                  <p>Start: {formatDateTime(selectedSession.start_time)}</p>
                  <p>End: {formatDateTime(selectedSession.end_time)}</p>
                  <p>QR Token: {currentQrToken}</p>
                  <p>
                    Refresh Interval:{' '}
                    {qrStatus?.qr_refresh_interval_seconds ??
                      selectedSession.qr_refresh_interval_seconds ??
                      30}
                    s
                  </p>
                  <p>Next Rotation In: {secondsRemaining}s</p>
                  <p className="subtle-note">
                    Rotating QR codes improve security by limiting reuse of old screenshots.
                  </p>
                </div>
              </div>
            ) : null}
          </>
        ) : null}
      </AdminPanel>
    </AdminLayout>
  )
}
