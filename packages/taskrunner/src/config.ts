import { env as nodeEnv } from 'node:process'
import { cleanEnv, str } from 'envalid'

export const env = cleanEnv(nodeEnv, {
  NODE_ENV: str({ choices: ['production', 'development'], default: 'development' }),
  TELEGRAM_BOT_KEY: str(),
})
