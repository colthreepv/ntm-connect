import { env as nodeEnv } from 'node:process'
import { cleanEnv, num, str } from 'envalid'

export const env = cleanEnv(nodeEnv, {
  NODE_ENV: str({ choices: ['development', 'test', 'production'], default: 'development' }),
  FIREBASE_PROJECT_ID: str(),
  FIREBASE_CLIENT_EMAIL: str(),
  FIREBASE_PRIVATE_KEY: str(),
  SESSION_EXPIRY: num({ default: 60 * 60 * 24 * 2 }), // 2 days
})
