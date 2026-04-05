import { useState } from 'react'
import AdminLayout from '../components/admin/AdminLayout'
import AdminPanel from '../components/admin/AdminPanel'
import FormField from '../components/FormField'
import MessageBanner from '../components/MessageBanner'
import { createAttendanceSession } from '../services/attendanceApi'
import { getApiErrorMessage } from '../utils/apiError'
import { buildSessionPayload, validateSessionForm } from '../utils/attendanceValidation'

const sessionTypeOptions = [
  { value: 'check-in', label: 'check-in' },
  { value: 'check-out', label: 'check-out' },
]

export default function AdminCreateSessionPage() {
  const [form, setForm] = useState({
    name: '',
    department: '',
    session_type: 'check-in',
    start_time: '',
    end_time: '',
    is_active: true,
  })
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [createdSession, setCreatedSession] = useState(null)

  const updateField = (field) => (event) => {
    const value = field === 'is_active' ? event.target.checked : event.target.value
    setForm((prev) => ({ ...prev, [field]: value }))
  }

  const handleSubmit = async (event) => {
    event.preventDefault()
    setIsSubmitting(true)
    setError('')
    setSuccess('')
    setCreatedSession(null)

    try {
      const validationMessage = validateSessionForm(form)
      if (validationMessage) {
        throw new Error(validationMessage)
      }

      const payload = buildSessionPayload(form)
      const data = await createAttendanceSession(payload)
      setSuccess('Attendance session created successfully.')
      setCreatedSession(data.session)
      setForm((prev) => ({ ...prev, name: '', start_time: '', end_time: '' }))
    } catch (apiError) {
      setError(getApiErrorMessage(apiError, 'Failed to create session.'))
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <AdminLayout
      title="Create Attendance Session"
      subtitle="Set time window, department scope, and attendance mode."
    >
      <AdminPanel>
        <form className="profile-form" onSubmit={handleSubmit}>
          <FormField
            id="session_name"
            label="Session Name"
            value={form.name}
            onChange={updateField('name')}
            placeholder="Example: Morning Faculty Check-in"
            disabled={isSubmitting}
          />
          <FormField
            id="department"
            label="Department"
            value={form.department}
            onChange={updateField('department')}
            placeholder="Example: faculty1"
            disabled={isSubmitting}
          />
          <FormField
            id="session_type"
            label="Session Type"
            value={form.session_type}
            onChange={updateField('session_type')}
            options={sessionTypeOptions}
            disabled={isSubmitting}
          />
          <FormField
            id="start_time"
            label="Start Time"
            type="datetime-local"
            value={form.start_time}
            onChange={updateField('start_time')}
            disabled={isSubmitting}
          />
          <FormField
            id="end_time"
            label="End Time"
            type="datetime-local"
            value={form.end_time}
            onChange={updateField('end_time')}
            disabled={isSubmitting}
          />

          <label className="toggle-field" htmlFor="is_active">
            <input
              id="is_active"
              type="checkbox"
              checked={form.is_active}
              onChange={updateField('is_active')}
              disabled={isSubmitting}
            />
            <span>Activate session immediately</span>
          </label>

          <MessageBanner type="error" message={error} />
          <MessageBanner type="info" message={success} />

          {createdSession ? (
            <p className="subtle-note">Generated QR token: {createdSession.qr_token}</p>
          ) : null}

          <button className="primary-btn" type="submit" disabled={isSubmitting}>
            {isSubmitting ? 'Creating...' : 'Create Session'}
          </button>
        </form>
      </AdminPanel>
    </AdminLayout>
  )
}
