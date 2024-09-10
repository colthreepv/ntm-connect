import { z } from 'zod'

export const NODE_ENV = z.enum(['development', 'test', 'production']).default('development').parse(process.env.NODE_ENV)

if (NODE_ENV !== 'development' && process.env.NEXT_PUBLIC_CONNECT_DOMAIN == null) {
  throw new Error('NEXT_PUBLIC_CONNECT_DOMAIN is not set')
}

export const browserProtocol = NODE_ENV === 'production' ? 'https' : 'http'
export const serverDomain = NODE_ENV === 'production' ? process.env.NEXT_PUBLIC_CONNECT_DOMAIN : 'ntm-connect.local:3000'
export const cookieDomain = NODE_ENV === 'production' ? process.env.NEXT_PUBLIC_CONNECT_DOMAIN : 'ntm-connect.local'
export const proxyDomain = NODE_ENV === 'production' ? process.env.NEXT_PUBLIC_CONNECT_DOMAIN : 'ntm-connect.local:3004'
