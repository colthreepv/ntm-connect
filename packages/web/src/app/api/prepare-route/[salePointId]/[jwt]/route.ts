import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'
import { Exception, createException } from '@ntm-connect/shared/exception'
import { fetchSalePointCredentials } from '@ntm-connect/shared/sale-point'
import { firebaseAdminAuth } from '@ntm-connect/shared/firebase'
import type { NextRequest } from 'next/server'
import { NextResponse } from 'next/server'
import { getJSessionFromDevice } from './device'
import { NODE_ENV, browserProtocol, cookieDomain, proxyDomain, sessionExpiry } from '@/config'
import { returnError } from '@/app/api/exception'

interface SessionCookie {
  name: string
  value: string
  path: string
}

const FirebaseSessionError = createException('Error creating firebase session cookie, probably expired', 'CREATE_SESSION_01')
const DeviceLoginError = createException('Unable to login on device', 'CREATE_SESSION_02')

export async function GET(_: NextRequest, { params }: { params: Promise<{ salePointId: string, jwt: string }> }) {
  try {
    const { salePointId, jwt } = await params
    const cookieStore = await cookies()

    let sessionCookie: string
    try {
      sessionCookie = await firebaseAdminAuth.createSessionCookie(jwt, { expiresIn: sessionExpiry * 1000 })
    }
    catch (error) {
      console.error('Error creating session cookie:', error)
      throw new FirebaseSessionError({ cause: error })
    }

    const credentials = await fetchSalePointCredentials(salePointId)

    let deviceCookie: SessionCookie
    try {
      deviceCookie = await getJSessionFromDevice(credentials.publicIp, credentials.username, credentials.password)
    }
    catch (error) {
      console.error('Unable to login on device:', error)
      throw new DeviceLoginError({ cause: error })
    }

    // Set cookies using Next.js cookies API
    cookieStore.set(deviceCookie.name, deviceCookie.value, {
      domain: cookieDomain(),
      httpOnly: true,
      path: deviceCookie.path,
      sameSite: 'lax',
      secure: NODE_ENV === 'production',
    })

    cookieStore.set('session', sessionCookie, {
      domain: cookieDomain(),
      httpOnly: true,
      maxAge: sessionExpiry,
      path: '/',
      sameSite: 'lax',
      secure: NODE_ENV === 'production',
    })

    return redirect(`${browserProtocol}://${salePointId}.${proxyDomain()}/boss/`)
  }
  catch (error) {
    if (error instanceof Exception) {
      return returnError(error)
    }

    console.error('Unexpected error:', error)
    return NextResponse.json({ message: 'Unexpected error' }, { status: 502 })
  }
}
