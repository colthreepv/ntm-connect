/* eslint-disable no-console */
import { createHash } from 'node:crypto'
import { readFileSync } from 'node:fs'
import { dirname, resolve } from 'node:path'
import { exit } from 'node:process'
import { fileURLToPath } from 'node:url'
import { eq } from 'drizzle-orm'
import { db } from './database.js'
import { salePointCredentials, seedTracker } from './database.schema.js'

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)

function generateHash(input: string): string {
  return createHash('md5').update(input).digest('hex').slice(0, 4)
}

function generateCustomId(item: any): string {
  const hash = generateHash(item.storeFullName)
  return `${item.company}-${item.storeId}-${hash}`.toLowerCase()
}

async function runSeed(seeds: Array<SeedMigration>) {
  for (const seed of seeds) {
    // Check if this seed has been run before
    const existingSeed = await db.select().from(seedTracker).where(eq(seedTracker.id, seed.name))

    if (existingSeed.length > 0) {
      console.log(`Seed ${seed.name} has already been run. Skipping...`)
    }
    else {
      console.log(`Running seed: ${seed.name}`)
      await seed.fn()

      // Record that this seed has been run
      await db.insert(seedTracker).values({ id: seed.name })
      console.log(`Seed ${seed.name} completed successfully.`)
    }
  }
}

async function initSalePoints() {
  const jsonData = JSON.parse(readFileSync(resolve(__dirname, '../../../bootstrap/data.json'), 'utf8'))

  const records = jsonData.map((item: any) => ({
    id: generateCustomId(item),
    company: item.company,
    storeId: item.storeId,
    deviceType: item.deviceType,
    password: item.password,
    publicIp: item.publicIp,
    storeFullName: item.storeFullName,
    username: item.username,
  }))

  console.log('Inserting records...')
  await db.insert(salePointCredentials).values(records)
  console.log('Seed completed successfully.')
}

async function additionalSalePoints(name: string) {
  const jsonData = JSON.parse(readFileSync(resolve(__dirname, `../../../bootstrap/${name}.json`), 'utf8'))

  const records = jsonData.map((item: any) => ({
    id: generateCustomId(item),
    company: item.company,
    storeId: item.storeId,
    deviceType: item.deviceType,
    password: item.password,
    publicIp: item.publicIp,
    storeFullName: item.storeFullName,
    username: item.username,
  }))

  console.log('Inserting records...')
  await db.insert(salePointCredentials).values(records)
  console.log('Seed completed successfully.')
}

interface SeedMigration {
  name: string
  fn: () => Promise<void>
}

const seeds: Array<SeedMigration> = [
  { name: 'first_batch_of_sale_points', fn: initSalePoints },
  { name: 'additional_sale_points_17dec2024', fn: async () => additionalSalePoints('17dec2024') },
]

runSeed(seeds).catch((error) => {
  console.error('Error seeding database:', error)
  exit(1)
})
