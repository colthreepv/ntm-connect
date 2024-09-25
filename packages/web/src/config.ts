// config.ts
import { z } from 'zod'

export const NODE_ENV = z
  .enum(['development', 'test', 'production'])
  .default('development')
  .parse(process.env.NODE_ENV)

function getDomain(): string {
  if (NODE_ENV === 'development') { // Development environment
    return 'ntm-connect.local'
  }

  // Production environment
  if (typeof window !== 'undefined') { // Client-side
    return window.location.hostname
  }
  else if (typeof globalThis !== 'undefined' && globalThis.process && globalThis.process.env.DOMAIN) {
    // Server-side with runtime environment variable
    return globalThis.process.env.DOMAIN
  }
  else {
    throw new Error('DOMAIN is not set')
  }
}

export const browserProtocol = NODE_ENV === 'production' ? 'https' : 'http'

export function serverDomain(): string {
  const domain = getDomain()
  return NODE_ENV === 'production' ? domain : `${domain}:3000`
}

export function cookieDomain(): string {
  return getDomain()
}

export function proxyDomain(): string {
  const domain = getDomain()
  return NODE_ENV === 'production' ? domain : `${domain}:3004`
}

export const sessionExpiry = 60 * 60 * 24 * 2 // 2 days
