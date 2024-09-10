import { env as nodeEnv } from 'node:process'
import { cleanEnv, str } from 'envalid'

export const env = cleanEnv(nodeEnv, {
  NODE_ENV: str({ choices: ['production', 'development'], default: 'development' }),
  FIREBASE_PROJECT_ID: str(),
  FIREBASE_CLIENT_EMAIL: str(),
  FIREBASE_PRIVATE_KEY: str(),
})
