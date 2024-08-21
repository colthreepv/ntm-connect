import type { ServiceAccount } from 'firebase-admin/app'
import { cert, initializeApp } from 'firebase-admin/app'
import { getAuth } from 'firebase-admin/auth'

const serviceAccount: ServiceAccount = {
  projectId: process.env.FIREBASE_PROJECT_ID,
  clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
  privateKey: process.env.FIREBASE_PRIVATE_KEY,
}

const firebaseAdminApp = initializeApp({
  credential: cert(serviceAccount),
})

export const firebaseAdminAuth = getAuth(firebaseAdminApp)
