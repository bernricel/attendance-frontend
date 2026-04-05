export function validateSessionForm(form) {
  if (!form.name.trim() || !form.department.trim() || !form.start_time || !form.end_time) {
    return 'Please complete all required fields.'
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

export function buildSessionPayload(form) {
  return {
    ...form,
    start_time: new Date(form.start_time).toISOString(),
    end_time: new Date(form.end_time).toISOString(),
  }
}
