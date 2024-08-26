import type { ServiceAccount } from 'firebase-admin/app'
import { cert, initializeApp } from 'firebase-admin/app'
import type { DecodedIdToken } from 'firebase-admin/auth'
import { getAuth } from 'firebase-admin/auth'
import type { Request } from '@google-cloud/functions-framework'
import { getFirestore } from 'firebase-admin/firestore'
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

const ErrorVerifyingSessionCookie = createException('Error verifying session cookie', 'FIREBASE_01')
const NoSessionCookieFound = createException('Unauthorized: No session cookie found', 'FIREBASE_02')

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
    throw new ErrorVerifyingSessionCookie({ cause: error })
  }
}

export interface SalePointCredentials {
  deviceType: string
  password: string
  company: string
  publicIp: string
  storeId: string
  storeFullName: string
  email: string
  group: string
  username: string
}

const db = getFirestore(firebaseAdminApp)

const SalePointCredentialsNotFound = createException('SalePoint credentials not found', 'FIREBASE_03')
const ErrorFetchingSalePointCredentials = createException('Error fetching SalePoint credentials', 'FIREBASE_04')

export async function fetchSalePointCredentials(id: string) {
  try {
    const docRef = db.collection('salePointCredentials').doc(id)
    const doc = await docRef.get()

    if (!doc.exists) {
      throw new SalePointCredentialsNotFound({ reason: `${id} not found` })
    }

    return doc.data()! as SalePointCredentials
  }
  catch (error) {
    if (error instanceof SalePointCredentialsNotFound) {
      throw error
    }
    console.error('Error fetching SalePoint credentials:', error)
    throw new ErrorFetchingSalePointCredentials({ cause: error, reason: `Unexpected error returned from firebase` })
  }
}
