export function decodeJwt(token) {
  try {
    const payload = token.split('.')[1]
    if (!payload) {
      return null
    }

    const base64 = payload.replace(/-/g, '+').replace(/_/g, '/')
    const padded = base64 + '='.repeat((4 - (base64.length % 4)) % 4)
    const jsonPayload = decodeURIComponent(
      atob(padded)
        .split('')
        .map((char) => `%${`00${char.charCodeAt(0).toString(16)}`.slice(-2)}`)
        .join(''),
    )

    return JSON.parse(jsonPayload)
  } catch {
    return null
  }
}
