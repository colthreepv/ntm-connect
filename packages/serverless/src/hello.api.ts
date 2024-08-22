import type { HttpFunction } from '@google-cloud/functions-framework'
import { firebaseAdminAuth } from './firebase.js'

// This is an example route that requires authentication
export const hello: HttpFunction = async (req, res) => {
  const authHeader = req.headers.authorization
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    res.status(401).json({ error: 'Unauthorized' })
    return
  }

  const token = authHeader.split('Bearer ')[1]

  try {
    await firebaseAdminAuth.verifyIdToken(token)
    res.json({ message: 'Hello World' })
  }
  catch (error) {
    console.error('Error verifying token:', error)
    res.status(401).json({ error: 'Unauthorized' })
  }
}
