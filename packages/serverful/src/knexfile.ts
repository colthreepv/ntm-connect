import type { Knex } from 'knex'

export const knexConfig: Knex.Config = {
  client: 'better-sqlite3',
  connection: {
    filename: '../database.sqlite3',
  },
  useNullAsDefault: true,
  migrations: {
    directory: './migrations',
  },
}

const config: { [key: string]: Knex.Config } = {
  development: knexConfig,
  production: knexConfig,
}

export default config
