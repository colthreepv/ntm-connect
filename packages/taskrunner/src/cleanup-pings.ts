import { exit as processExit } from 'node:process'
import { parentPort } from 'node:worker_threads'
import { db } from '@ntm-connect/shared/database'
import { consola } from 'consola'
import { sql } from 'drizzle-orm'

async function cleanupOldPings() {
  const result = await db.run(sql`
    WITH ranked_pings AS (
      SELECT 
        sale_point_id,
        timestamp,
        ROW_NUMBER() OVER (PARTITION BY sale_point_id ORDER BY timestamp DESC) as rn
      FROM ping_stats
    )
    DELETE FROM ping_stats 
    WHERE (sale_point_id, timestamp) IN (
      SELECT sale_point_id, timestamp FROM ranked_pings WHERE rn > 10
    )
  `)

  consola.info(`Cleaned up ${result.rowsAffected} old ping records`)
}

async function main() {
  await cleanupOldPings()

  if (parentPort)
    parentPort.postMessage('done')
  else
    processExit(0)
}

main()
