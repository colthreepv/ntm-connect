import { env as nodeEnv } from 'node:process'
import { cleanEnv, str } from 'envalid'

export const env = cleanEnv(nodeEnv, {
  NODE_ENV: str({ choices: ['production', 'development'], default: 'development' }),
  DOMAIN: str({ default: 'ntm-connect.local' }),
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
