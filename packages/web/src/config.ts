import { env as nodeEnv } from 'node:process'
import { cleanEnv, str } from 'envalid'

export const env = cleanEnv(nodeEnv, {
  NODE_ENV: str({ choices: ['production', 'development'], default: 'development' }),
  DOMAIN: str({ default: 'ntm-connect.local' }),
  // inherited from shared
  FIREBASE_PROJECT_ID: str(),
  FIREBASE_CLIENT_EMAIL: str(),
  FIREBASE_PRIVATE_KEY: str(),
  // app specific
  APP_FIREBASE_API_KEY: str(),
  APP_FIREBASE_AUTH_DOMAIN: str(),
  APP_FIREBASE_STORAGE_BUCKET: str(),
  APP_FIREBASE_MESSAGING_SENDER_ID: str(),
  APP_FIREBASE_APP_ID: str(),
})

export function serverDomain(): string {
  const domain = env.DOMAIN
  return env.NODE_ENV === 'production' ? domain : `${domain}:3000`
}

export function proxyDomain(): string {
  const domain = env.DOMAIN
  return env.NODE_ENV === 'production' ? domain : `${domain}:3004`
}

export const sessionExpiry = 60 * 60 * 24 * 2 // 2 days
export const browserProtocol = env.NODE_ENV === 'production' ? 'https' : 'http'
export const cookieDomain = env.DOMAIN
export const NODE_ENV = env.NODE_ENV
