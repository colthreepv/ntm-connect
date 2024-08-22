import type { ServiceAccount } from 'firebase-admin/app'
import { cert, initializeApp } from 'firebase-admin/app'
import { getAuth } from 'firebase-admin/auth'
import { env } from './config.js'

const serviceAccount: ServiceAccount = {
  projectId: env.FIREBASE_PROJECT_ID,
  clientEmail: env.FIREBASE_CLIENT_EMAIL,
  privateKey: env.FIREBASE_PRIVATE_KEY,
}

const firebaseAdminApp = initializeApp({
  credential: cert(serviceAccount),
})

export const firebaseAdminAuth = getAuth(firebaseAdminApp)
