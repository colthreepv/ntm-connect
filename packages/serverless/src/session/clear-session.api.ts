import type { HttpFunction } from '@google-cloud/functions-framework'

export const clearSession: HttpFunction = async (req, res) => {
  res.cookie('session', '', {
    httpOnly: true,
    secure: true,
    sameSite: 'strict',
    path: '/',
    expires: new Date(0),
  })
  res.json({ status: 'success' })
}
