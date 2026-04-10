import { useEffect, useMemo, useState } from 'react'
import AdminPanel from '../components/admin/AdminPanel'
import { DataEmpty, DataError, DataLoading } from '../components/admin/DataState'
import LayoutPageMeta from '../components/layout/LayoutPageMeta'
import {
  getAttendanceByDate,
  getFacultyAttendanceRecords,
  verifyAttendanceSignature,
} from '../services/attendanceApi'
import { getApiErrorMessage } from '../utils/apiError'
import { formatDateTime, toIsoDate } from '../utils/dateTime'

function buildFacultyName(record) {
  return `${record.user_first_name || ''} ${record.user_last_name || ''}`.trim() || 'Unknown'
}

export default function AdminAttendanceLogsPage() {
  const [selectedDate, setSelectedDate] = useState(toIsoDate())
  const [records, setRecords] = useState([])
  const [verificationMap, setVerificationMap] = useState({})
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState('')
  const [faculties, setFaculties] = useState([])
  const [selectedFacultyId, setSelectedFacultyId] = useState('')
  const [facultyRecords, setFacultyRecords] = useState([])
  const [selectedFaculty, setSelectedFaculty] = useState(null)
  const [isFacultyLoading, setIsFacultyLoading] = useState(true)
  const [facultyError, setFacultyError] = useState('')

  const loadLogs = async (date) => {
    setIsLoading(true)
    setError('')
    try {
      const data = await getAttendanceByDate(date)
      const fetchedRecords = data.records || []
      setRecords(fetchedRecords)

      // For each record, ask backend to verify DSA signature integrity.
      const verifications = await Promise.all(
        fetchedRecords.map(async (record) => {
          try {
            const result = await verifyAttendanceSignature(record.id)
            // Map backend boolean to UI-friendly status chip text.
            return [record.id, result.is_valid ? 'valid' : 'invalid']
          } catch {
            // Network/server issue while verifying this specific row.
            return [record.id, 'unknown']
          }
        }),
      )
      setVerificationMap(Object.fromEntries(verifications))
    } catch (apiError) {
      setError(getApiErrorMessage(apiError, 'Failed to load attendance logs.'))
      setRecords([])
      setVerificationMap({})
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    loadLogs(selectedDate)
  }, [selectedDate])

  useEffect(() => {
    const loadFacultyOptions = async () => {
      setIsFacultyLoading(true)
      setFacultyError('')
      try {
        const data = await getFacultyAttendanceRecords()
        const options = data.faculties || []
        setFaculties(options)
        if (options.length > 0) {
          setSelectedFacultyId(String(options[0].id))
        }
      } catch (apiError) {
        setFacultyError(getApiErrorMessage(apiError, 'Failed to load faculty members.'))
      } finally {
        setIsFacultyLoading(false)
      }
    }

    loadFacultyOptions()
  }, [])

  useEffect(() => {
    if (!selectedFacultyId) {
      setFacultyRecords([])
      setSelectedFaculty(null)
      return
    }

    const loadFacultyHistory = async () => {
      setIsFacultyLoading(true)
      setFacultyError('')
      try {
        const data = await getFacultyAttendanceRecords(selectedFacultyId)
        setFacultyRecords(data.records || [])
        setSelectedFaculty(data.faculty || null)
      } catch (apiError) {
        setFacultyError(getApiErrorMessage(apiError, 'Failed to load faculty attendance history.'))
        setFacultyRecords([])
        setSelectedFaculty(null)
      } finally {
        setIsFacultyLoading(false)
      }
    }

    loadFacultyHistory()
  }, [selectedFacultyId])

  const hasData = useMemo(() => records.length > 0, [records])
  const hasFacultyData = useMemo(() => facultyRecords.length > 0, [facultyRecords])

  return (
    <>
      <LayoutPageMeta
        title="Attendance Logs"
        subtitle="Daily attendance records with digital signature status."
        actions={
          <label className="field-block logs-date-picker" htmlFor="logs_date">
            <span className="field-label">Date</span>
            <input
              id="logs_date"
              type="date"
              value={selectedDate}
              onChange={(event) => setSelectedDate(event.target.value)}
            />
          </label>
        }
      />
      <AdminPanel>
        {isLoading ? <DataLoading message="Loading attendance logs..." /> : null}
        {error ? <DataError message={error} /> : null}
        {!isLoading && !error && !hasData ? (
          <DataEmpty message="No attendance logs for this date." />
        ) : null}

        {!isLoading && !error && hasData ? (
          <div className="table-wrap">
            <table className="admin-table">
              <thead>
                <tr>
                  <th>Faculty Name</th>
                  <th>Session</th>
                  <th>Attendance Type</th>
                  <th>Time</th>
                  <th>Signature Status</th>
                </tr>
              </thead>
              <tbody>
                {records.map((record) => (
                  <tr key={record.id}>
                    <td>{buildFacultyName(record)}</td>
                    <td>{record.session_name}</td>
                    <td>{record.attendance_type}</td>
                    <td>{formatDateTime(record.check_time)}</td>
                    <td>
                      <span className={`chip ${verificationMap[record.id] || 'muted'}`}>
                        {verificationMap[record.id] || 'unknown'}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : null}
      </AdminPanel>

      <AdminPanel title="Faculty Attendance Records" subtitle="Select a faculty member to browse attendance history.">
        {isFacultyLoading ? <DataLoading message="Loading faculty records..." /> : null}
        {facultyError ? <DataError message={facultyError} /> : null}

        {!isFacultyLoading && !facultyError && faculties.length === 0 ? (
          <DataEmpty message="No faculty accounts found." />
        ) : null}

        {!isFacultyLoading && !facultyError && faculties.length > 0 ? (
          <>
            <label className="field-block logs-date-picker" htmlFor="faculty_picker">
              <span className="field-label">Faculty Member</span>
              <select
                id="faculty_picker"
                value={selectedFacultyId}
                onChange={(event) => setSelectedFacultyId(event.target.value)}
              >
                {faculties.map((faculty) => (
                  <option key={faculty.id} value={faculty.id}>
                    {faculty.full_name}
                  </option>
                ))}
              </select>
            </label>

            {selectedFaculty ? <p className="subtle-note">Viewing history for {selectedFaculty.full_name}</p> : null}

            {!hasFacultyData ? (
              <DataEmpty message="No attendance records found for this faculty member." />
            ) : (
              <div className="table-wrap">
                <table className="admin-table">
                  <thead>
                    <tr>
                      <th>Faculty Name</th>
                      <th>Department</th>
                      <th>Session</th>
                      <th>Date</th>
                      <th>Check-in Time</th>
                      <th>Check-out Time</th>
                      <th>Attendance Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {facultyRecords.map((record) => (
                      <tr key={`${record.session_id}-${record.date}`}>
                        <td>{selectedFaculty?.full_name || 'Unknown'}</td>
                        <td>{record.department || '-'}</td>
                        <td>{record.session_name}</td>
                        <td>{record.date}</td>
                        <td>{formatDateTime(record.check_in_time)}</td>
                        <td>{formatDateTime(record.check_out_time)}</td>
                        <td>{record.attendance_status || '-'}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </>
        ) : null}
      </AdminPanel>
    </>
  )
}
