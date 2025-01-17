import { exit as processExit } from 'node:process'
import { parentPort } from 'node:worker_threads'
import { db } from '@ntm-connect/shared/database'
import { consola } from 'consola'
import { sql } from 'drizzle-orm'

async function vacuumDb() {
  await db.run(sql`VACUUM`)
  consola.info('Database vacuumed successfully')
}

async function main() {
  await vacuumDb()

  if (parentPort)
    parentPort.postMessage('done')
  else
    processExit(0)
}

main()
