import type { Config } from 'drizzle-kit'

export default {
  dialect: 'sqlite',
  dbCredentials: {
    url: 'file:../../sqlite/database.sqlite3',
  },
  out: './src/migrations',
  schema: './src/database/database.schema.ts',
  migrations: {
    table: 'migrations',
  },
} satisfies Config
