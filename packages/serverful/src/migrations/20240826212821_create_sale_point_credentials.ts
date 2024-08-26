import type { Knex } from 'knex'

export async function up(knex: Knex): Promise<void> {
  return knex.schema.createTable('sale_point_credentials', (table) => {
    table.string('id').primary()
    table.string('company').notNullable()
    table.string('storeId').notNullable()
    table.string('storeFullName').notNullable()
    table.string('deviceType').notNullable()
    table.string('publicIp').notNullable()
    table.string('username').notNullable()
    table.string('password').notNullable()
    table.string('email').notNullable()
    table.timestamps(true, true)
  })
}

export async function down(knex: Knex): Promise<void> {
  return knex.schema.dropTable('sale_point_credentials')
}
