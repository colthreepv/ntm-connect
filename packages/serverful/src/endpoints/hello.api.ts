import type { HttpFunction } from '@google-cloud/functions-framework'
import type { DecodedIdToken } from 'firebase-admin/auth'
import { validateSession } from './firebase.js'
import { Exception } from './exception.js'

export const hello: HttpFunction = async (req, res) => {
  let decodedClaims: DecodedIdToken
  try {
    decodedClaims = await validateSession(req)
  }
  catch (error) {
    if (error instanceof Exception) {
      return res.status(401).json({ error: error.message })
    }

    console.error('Unexpected error:', error)
    return res.status(502).json({ error: 'Unexpected error' })
  }

  return res.json({ message: 'Hello World', userId: decodedClaims.uid })
}
