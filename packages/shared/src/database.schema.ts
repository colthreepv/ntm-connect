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

export const pingStats = sqliteTable('ping_stats', {
  salePointId: text('sale_point_id').notNull().references(() => salePointCredentials.id),
  timestamp: integer('timestamp', { mode: 'timestamp' }).notNull().default(sql`CURRENT_TIMESTAMP`),
  latency: integer('latency'), // in milliseconds
  isResponsive: integer('is_responsive', { mode: 'boolean' }).notNull(),
  ipAddress: text('ip_address'),
  errorMessage: text('error_message'),
})

export const seedTracker = sqliteTable('seed_tracker', {
  id: text('id').primaryKey(),
  runAt: integer('run_at', { mode: 'timestamp' }).notNull().default(sql`CURRENT_TIMESTAMP`),
})

export const subscribedUsers = sqliteTable('subscribed_users', {
  userId: integer('user_id').notNull().unique(),
  username: text('username'),
  subscribedAt: integer('subscribed_at', { mode: 'timestamp' }).notNull().default(sql`(unixepoch())`),
})
