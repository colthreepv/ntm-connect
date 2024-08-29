import type { Context } from 'hono'
import { setCookie } from 'hono/cookie'
import { env } from '../config.js'

export async function clearSession(c: Context) {
  setCookie(c, 'session', '', {
    httpOnly: true,
    secure: env.NODE_ENV === 'production',
    path: '/',
    expires: new Date(0),
  })

  return c.json({ status: 'success' })
}
