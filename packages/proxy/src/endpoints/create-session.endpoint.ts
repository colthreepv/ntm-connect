import type { Context } from 'hono'
import { setCookie } from 'hono/cookie'
import { fetchSalePointCredentials } from '@ntm-connect/shared/database.utils'
import { firebaseAdminAuth } from '@ntm-connect/shared/firebase'
import { env as sharedEnv } from '@ntm-connect/shared/config'
import { Exception, createException, returnHonoError } from '@ntm-connect/shared/exception'
import { getJSessionFromDevice } from '../device.utils.js'
import { env, proxyDomain } from '../config.js'

const FirebaseSessionError = createException('Error creating firebase session cookie, probably expired', 'CREATE_SESSION_01')
const DeviceLoginError = createException('Unable to login on device', 'CREATE_SESSION_02')

export async function createSession(c: Context) {
  try {
    const salePointId = c.req.param('salePointId')
    const jwt = c.req.param('jwt')

    let sessionCookie: string
    try {
      sessionCookie = await firebaseAdminAuth.createSessionCookie(jwt, { expiresIn: sharedEnv.SESSION_EXPIRY * 1000 })
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
      sameSite: 'Lax',
      path: deviceCookie.path,
      domain: env.DOMAIN,
    })

    setCookie(c, 'session', sessionCookie, {
      maxAge: sharedEnv.SESSION_EXPIRY,
      httpOnly: true,
      sameSite: 'Lax',
      secure: sharedEnv.NODE_ENV === 'production',
      path: '/',
      domain: env.DOMAIN,
    })

    return c.redirect(`${proxyDomain.protocol}://${salePointId}.${proxyDomain.domain}/boss/`)
  }
  catch (error) {
    if (error instanceof Exception)
      return returnHonoError(c, error)

    console.error('Unexpected error:', error)
    return c.json({ message: 'Unexpected error' }, 502)
  }
}
