import { sql } from 'drizzle-orm'
import { integer, sqliteTable, text } from 'drizzle-orm/sqlite-core'

export const salePointCredentials = sqliteTable('sale_point_credentials', {
  id: text('id').primaryKey(),
  company: text('company').notNull(),
  storeId: text('storeId').notNull(),
  storeFullName: text('storeFullName').notNull(),
  deviceType: text('deviceType').notNull(),
  publicIp: text('publicIp').notNull(),
  username: text('username').notNull(),
  password: text('password').notNull(),
  email: text('email').notNull(),
  createdAt: integer('created_at', { mode: 'timestamp' }).notNull().default(sql`CURRENT_TIMESTAMP`),
  updatedAt: integer('updated_at', { mode: 'timestamp' }).notNull().default(sql`CURRENT_TIMESTAMP`),
})

export const seedTracker = sqliteTable('seed_tracker', {
  id: text('id').primaryKey(),
  runAt: integer('run_at', { mode: 'timestamp' }).notNull().default(sql`CURRENT_TIMESTAMP`),
})
