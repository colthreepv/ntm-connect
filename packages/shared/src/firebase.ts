import type { ServiceAccount } from 'firebase-admin/app'
import { cert, initializeApp } from 'firebase-admin/app'
import type { DecodedIdToken } from 'firebase-admin/auth'
import { getAuth } from 'firebase-admin/auth'
import type { Context } from 'hono'
import { getCookie } from 'hono/cookie'
import { env } from './config.js'
import { createException } from './exception.js'

const parsedPrivateKey = env.NODE_ENV === 'production' ? env.FIREBASE_PRIVATE_KEY.replace(/\\n/g, '\n') : env.FIREBASE_PRIVATE_KEY

const serviceAccount: ServiceAccount = {
  projectId: env.FIREBASE_PROJECT_ID,
  clientEmail: env.FIREBASE_CLIENT_EMAIL,
  privateKey: parsedPrivateKey,
}

const firebaseAdminApp = initializeApp({
  credential: cert(serviceAccount),
})

export const firebaseAdminAuth = getAuth(firebaseAdminApp)

const ErrorVerifyingSessionCookie = createException('Error verifying session cookie', 'FIREBASE_01')
const NoSessionCookieFound = createException('Unauthorized: No session cookie found', 'FIREBASE_02')

export async function validateSession(c: Context, checkRevoked = false): Promise<DecodedIdToken> {
  const sessionCookie = getCookie(c, 'session')

  if (sessionCookie == null)
    throw new NoSessionCookieFound()

  try {
    return await firebaseAdminAuth.verifySessionCookie(sessionCookie, checkRevoked)
  }
  catch (error) {
    throw new ErrorVerifyingSessionCookie({ cause: error })
  }
}

const MissingAuthorizationHeader = createException('Missing Authorization header', 'FIREBASE_03')
const InvalidAuthorizationFormat = createException('Invalid Authorization header format', 'FIREBASE_04')
const ErrorVerifyingIdToken = createException('Error verifying ID token', 'FIREBASE_05')

export async function validateJwt(c: Context): Promise<DecodedIdToken> {
  const authHeader = c.req.header('Authorization')

  if (!authHeader) {
    throw new MissingAuthorizationHeader()
  }

  const [bearer, token] = authHeader.split(' ')

  if (bearer !== 'Bearer' || !token) {
    throw new InvalidAuthorizationFormat()
  }

  try {
    const decodedToken = await firebaseAdminAuth.verifyIdToken(token)
    return decodedToken
  }
  catch (error) {
    throw new ErrorVerifyingIdToken({ cause: error })
  }
}
