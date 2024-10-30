import { fileURLToPath } from 'node:url'
import { dirname, resolve } from 'node:path'
import { createClient } from '@libsql/client'
import { drizzle } from 'drizzle-orm/libsql'
import { sql } from 'drizzle-orm'

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)

const projectRoot = resolve(__dirname, '../../../../../')
const dbPath = resolve(projectRoot, 'sqlite', 'database.sqlite3')

const db = drizzle(createClient({ url: `file:${dbPath}` }))

export { db, sql }
