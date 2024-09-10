import type { Config } from 'drizzle-kit'

export default {
  dialect: 'sqlite',
  dbCredentials: {
    url: 'file:../../database.sqlite3',
  },
  out: './src/migrations',
  schema: './src/database.schema.ts',
  migrations: {
    table: 'migrations',
  },
} satisfies Config
