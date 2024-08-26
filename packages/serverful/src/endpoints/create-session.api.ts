import type { Context } from 'hono'
import { setCookie } from 'hono/cookie'
import { HTTPException } from 'hono/http-exception'
import { env, sessionPrefix } from '../config.js'
import { getJSessionFromDevice } from '../device.utils.js'
import { fetchSalePointCredentials } from '../database.utils.js'
import { firebaseAdminAuth } from '../firebase.js'

export async function createSession(c: Context) {
  try {
    const { userToken, salePointId } = await c.req.json()

    if (userToken == null) {
      throw new HTTPException(400, { message: 'ID Token is required' })
    }

    if (salePointId == null) {
      throw new HTTPException(400, { message: 'SalePointId is required' })
    }

    let sessionCookie: string
    try {
      sessionCookie = await firebaseAdminAuth.createSessionCookie(userToken, { expiresIn: env.SESSION_EXPIRY })
    }
    catch (error) {
      console.error('Error creating session cookie:', error)
      throw new HTTPException(401, { message: 'Error creating firebase session cookie, probably expired' })
    }

    const credentials = await fetchSalePointCredentials(salePointId)

    let deviceCookie: { name: string, value: string, path: string }
    try {
      deviceCookie = await getJSessionFromDevice(credentials.publicIp, credentials.username, credentials.password)
    }
    catch (error) {
      console.error('Unable to login on device:', error)
      throw new HTTPException(401, { message: 'Unable to login on device' })
    }

    setCookie(c, deviceCookie.name, deviceCookie.value, {
      httpOnly: true,
      secure: env.NODE_ENV === 'production',
      sameSite: 'Strict',
      path: `${sessionPrefix}/${salePointId}${deviceCookie.path}`,
    })

    setCookie(c, 'session', sessionCookie, {
      maxAge: env.SESSION_EXPIRY,
      httpOnly: true,
      secure: env.NODE_ENV === 'production',
      path: '/',
    })

    return c.json({ status: 'success' })
  }
  catch (error) {
    if (error instanceof HTTPException) {
      throw error
    }
    console.error('Unexpected error:', error)
    throw new HTTPException(500, { message: 'An unexpected error occurred' })
  }
}
