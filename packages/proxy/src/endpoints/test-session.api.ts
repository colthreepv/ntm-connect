import type { Context } from 'hono'
import { validateSession } from '@ntm-connect/shared/firebase'
import { Exception, returnHonoError } from '@ntm-connect/shared/exception'

export async function testSession(c: Context) {
  try {
    const decodedClaims = await validateSession(c)
    return c.json({ message: 'Session is valid', userId: decodedClaims.uid })
  }
  catch (error) {
    if (error instanceof Exception)
      return returnHonoError(c, error)

    console.error('Unexpected error:', error)
    return c.json({ message: 'Unexpected error' }, 502)
  }
}
