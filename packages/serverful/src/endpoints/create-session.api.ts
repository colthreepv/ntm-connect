import type { Context } from 'hono'
import { setCookie } from 'hono/cookie'
import { env, sessionPrefix } from '../config.js'
import { getJSessionFromDevice } from '../device.utils.js'
import { fetchSalePointCredentials } from '../database.utils.js'
import { firebaseAdminAuth } from '../firebase.js'
import { Exception, createException, returnHonoError } from '../exception.js'

const MissingUserTokenError = createException('ID Token is required', 'CREATE_SESSION_01')
const MissingSalePointIdError = createException('SalePointId is required', 'CREATE_SESSION_02')
const FirebaseSessionError = createException('Error creating firebase session cookie, probably expired', 'CREATE_SESSION_03')
const DeviceLoginError = createException('Unable to login on device', 'CREATE_SESSION_04')

export async function createSession(c: Context) {
  try {
    const { userToken, salePointId } = await c.req.json()

    if (userToken == null) {
      throw new MissingUserTokenError()
    }

    if (salePointId == null) {
      throw new MissingSalePointIdError()
    }

    let sessionCookie: string
    try {
      sessionCookie = await firebaseAdminAuth.createSessionCookie(userToken, { expiresIn: env.SESSION_EXPIRY * 1000 })
    }
    catch (error) {
      console.error('Error creating session cookie:', error)
      throw new FirebaseSessionError({ cause: error })
    }

    const credentials = await fetchSalePointCredentials(salePointId)

    let deviceCookie: { name: string, value: string, path: string }
    try {
      deviceCookie = await getJSessionFromDevice(credentials.publicIp, credentials.username, credentials.password)
    }
    catch (error) {
      console.error('Unable to login on device:', error)
      throw new DeviceLoginError({ cause: error })
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
    if (error instanceof Exception)
      return returnHonoError(c, error)

    console.error('Unexpected error:', error)
    return c.json({ message: 'Unexpected error' }, 502)
  }
}
