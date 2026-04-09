export const recurrenceOptions = [
  { value: 'weekdays', label: 'Monday to Friday' },
  { value: 'mwf', label: 'MWF' },
  { value: 'tth', label: 'TTH' },
  { value: 'custom', label: 'Custom weekdays' },
]

export const customWeekdayOptions = [
  { value: 0, label: 'Mon' },
  { value: 1, label: 'Tue' },
  { value: 2, label: 'Wed' },
  { value: 3, label: 'Thu' },
  { value: 4, label: 'Fri' },
  { value: 5, label: 'Sat' },
  { value: 6, label: 'Sun' },
]

function resolveWeekdays(recurrencePattern, customWeekdays) {
  if (recurrencePattern === 'weekdays') return new Set([0, 1, 2, 3, 4])
  if (recurrencePattern === 'mwf') return new Set([0, 2, 4])
  if (recurrencePattern === 'tth') return new Set([1, 3])
  return new Set(customWeekdays)
}

export function validateSessionForm(form) {
  if (!form.name.trim()) {
    return 'Session name is required.'
  }

  const interval = Number(form.qr_refresh_interval_seconds)
  if (!Number.isInteger(interval) || interval < 1) {
    return 'QR refresh interval must be a whole number greater than 0.'
  }

  if (!form.is_recurring) {
    if (!form.start_time || !form.end_time) {
      return 'Please provide start and end date/time for a single session.'
    }

    const start = new Date(form.start_time)
    const end = new Date(form.end_time)
    if (Number.isNaN(start.getTime()) || Number.isNaN(end.getTime())) {
      return 'Invalid start or end time.'
    }
    if (start >= end) {
      return 'End time must be later than start time.'
    }
    return ''
  }

  if (
    !form.recurrence_start_time ||
    !form.recurrence_end_time ||
    !form.recurrence_start_date ||
    !form.recurrence_end_date
  ) {
    return 'Please complete recurrence time and date range fields.'
  }

  if (form.recurrence_start_time >= form.recurrence_end_time) {
    return 'Recurring end time must be later than recurring start time.'
  }

  if (form.recurrence_start_date > form.recurrence_end_date) {
    return 'Recurring end date must be on or after recurring start date.'
  }

  if (form.recurrence_pattern === 'custom' && form.recurrence_days.length === 0) {
    return 'Select at least one weekday for custom recurrence.'
  }

  return ''
}

export function buildSessionPayload(form) {
  if (!form.is_recurring) {
    return {
      name: form.name,
      session_type: form.session_type,
      start_time: new Date(form.start_time).toISOString(),
      end_time: new Date(form.end_time).toISOString(),
      is_active: form.is_active,
      qr_refresh_interval_seconds: Number(form.qr_refresh_interval_seconds),
      is_recurring: false,
    }
  }

  return {
    name: form.name,
    session_type: form.session_type,
    is_active: form.is_active,
    qr_refresh_interval_seconds: Number(form.qr_refresh_interval_seconds),
    is_recurring: true,
    recurrence_pattern: form.recurrence_pattern,
    recurrence_days: form.recurrence_pattern === 'custom' ? form.recurrence_days : [],
    recurrence_start_date: form.recurrence_start_date,
    recurrence_end_date: form.recurrence_end_date,
    recurrence_start_time: `${form.recurrence_start_time}:00`,
    recurrence_end_time: `${form.recurrence_end_time}:00`,
  }
}

export function getRecurringPreviewCount(form) {
  if (!form.is_recurring || !form.recurrence_start_date || !form.recurrence_end_date) return 0

  const weekdays = resolveWeekdays(form.recurrence_pattern, form.recurrence_days)
  if (weekdays.size === 0) return 0

  const startDate = new Date(`${form.recurrence_start_date}T00:00:00`)
  const endDate = new Date(`${form.recurrence_end_date}T00:00:00`)
  if (Number.isNaN(startDate.getTime()) || Number.isNaN(endDate.getTime()) || startDate > endDate) {
    return 0
  }

  let count = 0
  const cursor = new Date(startDate)
  while (cursor <= endDate) {
    const weekday = (cursor.getDay() + 6) % 7
    if (weekdays.has(weekday)) {
      count += 1
    }
    cursor.setDate(cursor.getDate() + 1)
  }
  return count
}
