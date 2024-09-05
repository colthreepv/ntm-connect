import type { Context } from 'hono'
import { setCookie } from 'hono/cookie'
import { fetchSalePointCredentials } from '@ntm-connect/shared/database.utils'
import { firebaseAdminAuth } from '@ntm-connect/shared/firebase'
import { env as sharedEnv } from '@ntm-connect/shared/config'
import { Exception, createException, returnHonoError } from '@ntm-connect/shared/exception'
import { getJSessionFromDevice } from '../device.utils.js'
import { env } from '../config.js'

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
      sessionCookie = await firebaseAdminAuth.createSessionCookie(userToken, { expiresIn: sharedEnv.SESSION_EXPIRY * 1000 })
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
      secure: sharedEnv.NODE_ENV === 'production',
      sameSite: 'None',
      path: deviceCookie.path,
      domain: env.ALLOWED_ORIGIN,
      maxAge: sharedEnv.SESSION_EXPIRY,
    })

    setCookie(c, 'session', sessionCookie, {
      maxAge: sharedEnv.SESSION_EXPIRY,
      httpOnly: true,
      sameSite: 'None',
      secure: sharedEnv.NODE_ENV === 'production',
      path: '/',
      domain: env.ALLOWED_ORIGIN,
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
