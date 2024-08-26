import { readFileSync } from 'node:fs'
import { createHash } from 'node:crypto'
import type { Knex } from 'knex'
import type { SalePointCredentials } from '../database.js'

function generateHash(input: string): string {
  return createHash('md5').update(input).digest('hex').slice(0, 4)
}

function generateCustomId(item: any): string {
  const hash = generateHash(item.storeFullName)
  return `${item.company}-${item.storeId}-${hash}`.toLowerCase()
}

export async function up(knex: Knex): Promise<void> {
  const jsonData = JSON.parse(readFileSync('../data.json', 'utf8'))

  const records = jsonData.map((item: SalePointCredentials) => ({
    id: generateCustomId(item),
    company: item.company,
    storeId: item.storeId,
    deviceType: item.deviceType,
    password: item.password,
    publicIp: item.publicIp,
    storeFullName: item.storeFullName,
    email: item.email,
    username: item.username,
  }))

  await knex('sale_point_credentials').insert(records)
}

export async function down(knex: Knex): Promise<void> {
  await knex('sale_point_credentials').del()
}
