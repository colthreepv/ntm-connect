import type { Context } from 'hono'
import { setCookie } from 'hono/cookie'
import { fetchSalePointCredentials } from '@ntm-connect/shared/sale-point'
import { firebaseAdminAuth } from '@ntm-connect/shared/firebase'
import { Exception, createException, returnHonoError } from '@ntm-connect/shared/exception'
import { NODE_ENV, browserProtocol, cookieDomain, proxyDomain, sessionExpiry } from '@/config'

import { getJSessionFromDevice } from '@/server/create-session/device'

const FirebaseSessionError = createException('Error creating firebase session cookie, probably expired', 'CREATE_SESSION_01')
const DeviceLoginError = createException('Unable to login on device', 'CREATE_SESSION_02')

export async function createSession(c: Context) {
  try {
    const salePointId = c.req.param('salePointId')
    const jwt = c.req.param('jwt')

    let sessionCookie: string
    try {
      sessionCookie = await firebaseAdminAuth.createSessionCookie(jwt, { expiresIn: sessionExpiry * 1000 })
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
      domain: cookieDomain,
      httpOnly: true,
      path: deviceCookie.path,
      sameSite: 'Lax',
      secure: NODE_ENV === 'production',
    })

    setCookie(c, 'session', sessionCookie, {
      domain: cookieDomain,
      httpOnly: true,
      maxAge: sessionExpiry,
      path: '/',
      sameSite: 'Lax',
      secure: NODE_ENV === 'production',
    })

    return c.redirect(`${browserProtocol}://${salePointId}.${proxyDomain}/boss/`)
  }
  catch (error) {
    if (error instanceof Exception)
      return returnHonoError(c, error)

    console.error('Unexpected error:', error)
    return c.json({ message: 'Unexpected error' }, 502)
  }
}
