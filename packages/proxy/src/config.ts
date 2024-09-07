import { env as nodeEnv } from 'node:process'
import { cleanEnv, str } from 'envalid'
import { env as sharedEnv } from '@ntm-connect/shared/config'

export const env = cleanEnv(nodeEnv, {
  DOMAIN: str({ devDefault: 'ntm-connect.local:3004' }),
})

export const proxyDomain = {
  protocol: sharedEnv.NODE_ENV === 'development' ? 'http' : 'https',
  domain:
    sharedEnv.NODE_ENV === 'development'
      ? 'ntm-connect.local:3004'
      : env.DOMAIN,
}
