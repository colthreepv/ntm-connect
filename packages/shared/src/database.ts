import { fileURLToPath } from 'node:url'
import { dirname, resolve } from 'node:path'
import Database from 'better-sqlite3'
import { type BetterSQLite3Database, drizzle } from 'drizzle-orm/better-sqlite3'

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)

const projectRoot = resolve(__dirname, '../../../')
const sqlite = new Database(resolve(projectRoot, 'sqlite', 'database.sqlite3'))
const db: BetterSQLite3Database = drizzle(sqlite)

export { db }
