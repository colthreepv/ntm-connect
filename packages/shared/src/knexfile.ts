import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'
import type { Knex } from 'knex'

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)

export const knexConfig: Knex.Config = {
  client: 'better-sqlite3',
  connection: {
    filename: '../database.sqlite3',
  },
  useNullAsDefault: true,
  migrations: {
    directory: join(__dirname, './migrations'),
  },
}

const config: { [key: string]: Knex.Config } = {
  development: knexConfig,
  production: knexConfig,
}

export default config
