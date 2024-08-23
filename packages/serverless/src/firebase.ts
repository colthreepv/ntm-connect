import type { ServiceAccount } from 'firebase-admin/app'
import { cert, initializeApp } from 'firebase-admin/app'
import type { DecodedIdToken } from 'firebase-admin/auth'
import { getAuth } from 'firebase-admin/auth'
import type { Request } from '@google-cloud/functions-framework'
import { env } from './config.js'
import { createException } from './exception.js'

const serviceAccount: ServiceAccount = {
  projectId: env.FIREBASE_PROJECT_ID,
  clientEmail: env.FIREBASE_CLIENT_EMAIL,
  privateKey: env.FIREBASE_PRIVATE_KEY,
}

const firebaseAdminApp = initializeApp({
  credential: cert(serviceAccount),
})

export const firebaseAdminAuth = getAuth(firebaseAdminApp)

const ErrorVerifyingSessionCookie = createException('Error verifying session cookie', 'HELLO01')
const NoSessionCookieFound = createException('Unauthorized: No session cookie found', 'HELLO02')

export async function validateSession(req: Request, checkRevoked = false): Promise<DecodedIdToken> {
  const cookies = req.headers.cookie?.split(';').map(cookie => cookie.trim())
  const sessionCookie = cookies?.find(cookie => cookie.startsWith('session='))?.split('=')[1]

  if (sessionCookie == null)
    throw new NoSessionCookieFound()

  try {
    return firebaseAdminAuth.verifySessionCookie(sessionCookie, checkRevoked)
  }
  catch (error) {
    console.error('Error verifying session cookie:', error)
    throw new ErrorVerifyingSessionCookie({ error })
  }
}
