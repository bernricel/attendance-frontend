export function getDisplayName(user, fallback = 'User') {
  const firstName = user?.first_name?.trim() || ''
  const lastName = user?.last_name?.trim() || ''
  const fullName = `${firstName} ${lastName}`.trim()

  return fullName || fallback
}
