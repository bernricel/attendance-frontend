import { useEffect, useMemo, useState } from 'react'
import { QRCodeCanvas } from 'qrcode.react'
import AdminLayout from '../components/admin/AdminLayout'
import AdminPanel from '../components/admin/AdminPanel'
import { DataEmpty, DataError, DataLoading } from '../components/admin/DataState'
import { getAdminSessions } from '../services/attendanceApi'
import { getApiErrorMessage } from '../utils/apiError'
import { formatDateTime } from '../utils/dateTime'

export default function AdminQrDisplayPage() {
  const [sessions, setSessions] = useState([])
  const [selectedId, setSelectedId] = useState('')
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState('')

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

  const selectedSession = useMemo(
    () => sessions.find((session) => String(session.id) === String(selectedId)),
    [sessions, selectedId],
  )
  const qrUrl = selectedSession
    ? `${window.location.origin}/faculty/scan/${selectedSession.qr_token}`
    : ''

  return (
    <AdminLayout
      title="QR Display"
      subtitle="Select a session and display a full-size QR for classroom scanning."
    >
      <AdminPanel>
        {isLoading ? <DataLoading message="Loading sessions..." /> : null}
        {error ? <DataError message={error} /> : null}
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
                    {session.name} ({session.department?.name})
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
                  <p>Department: {selectedSession.department?.name}</p>
                  <p>Type: {selectedSession.session_type}</p>
                  <p>Start: {formatDateTime(selectedSession.start_time)}</p>
                  <p>End: {formatDateTime(selectedSession.end_time)}</p>
                  <p>QR Token: {selectedSession.qr_token}</p>
                </div>
              </div>
            ) : null}
          </>
        ) : null}
      </AdminPanel>
    </AdminLayout>
  )
}
