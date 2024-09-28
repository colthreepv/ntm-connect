import { env as nodeEnv } from 'node:process'
import { bool, cleanEnv, str } from 'envalid'

export const env = cleanEnv(nodeEnv, {
  NODE_ENV: str({ choices: ['production', 'development'], default: 'development' }),
  DOMAIN: str({ devDefault: 'ntm-connect.local:3004' }),
  REQUEST_LOG: bool({ default: true }),
})

export const proxyDomain = env.NODE_ENV === 'production' ? env.DOMAIN : 'ntm-connect.local:3004'
export const browserProtocol = env.NODE_ENV === 'production' ? 'https' : 'http'
