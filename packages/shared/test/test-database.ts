import { fileURLToPath } from 'node:url'
import { dirname, resolve } from 'node:path'
import { type LibSQLDatabase, drizzle } from 'drizzle-orm/libsql'
import { migrate } from 'drizzle-orm/libsql/migrator'
import { createClient } from '@libsql/client'

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)

export async function setupTestDatabase(): Promise<LibSQLDatabase> {
  const sqlite = createClient({ url: ':memory:' })
  const memoryDb = drizzle(sqlite)
  const migrationsPath = resolve(__dirname, '../src/migrations')
  await migrate(memoryDb, { migrationsFolder: migrationsPath })

  return memoryDb
}
