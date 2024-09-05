import { env as nodeEnv } from 'node:process'
import { cleanEnv, str } from 'envalid'

export const env = cleanEnv(nodeEnv, {
  ALLOWED_ORIGIN: str({ devDefault: 'ntm-connect.local:3004' }),
})
