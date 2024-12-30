import { z } from 'zod'

export const NODE_ENV = z
  .enum(['development', 'test', 'production'])
  .default('development')
  .parse(import.meta.env.MODE)

function getDomain(): string {
  if (NODE_ENV === 'development') {
    return 'ntm-connect.local'
  }
  return window.location.hostname
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
