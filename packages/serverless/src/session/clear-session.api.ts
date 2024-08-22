import type { HttpFunction } from '@google-cloud/functions-framework'

export const clearSession: HttpFunction = async (req, res) => {
  // Set an expired cookie to clear the session
  res.setHeader('Set-Cookie', 'session=; HttpOnly; Secure; SameSite=Strict; Path=/; Expires=Thu, 01 Jan 1970 00:00:00 GMT')
  res.json({ status: 'success' })
}
