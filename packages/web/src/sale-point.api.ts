import type { Context } from 'hono'
import { db, sql } from '@ntm-connect/shared/database'
import { Exception, returnHonoError } from '@ntm-connect/shared/exception'
import { validateJwt } from '@ntm-connect/shared/firebase'

export async function getSalePointsWithStatus(limit = 500) {
  const query = sql`
    WITH ranked_pings AS (
      SELECT
        sale_point_id,
        latency,
        is_responsive,
        timestamp,
        ROW_NUMBER() OVER (PARTITION BY sale_point_id ORDER BY timestamp DESC) as row_num
      FROM ping_stats
    ),
    last_three_pings AS (
      SELECT
        sale_point_id,
        MAX(CASE WHEN is_responsive = 1 THEN 1 ELSE 0 END) as isAlive,
        MAX(CASE WHEN is_responsive = 1 THEN timestamp ELSE NULL END) as lastSeen
      FROM ranked_pings
      WHERE row_num <= 3
      GROUP BY sale_point_id
    ),
    avg_latency AS (
      SELECT
        sale_point_id,
        AVG(latency) as avgLatency
      FROM ping_stats
      WHERE is_responsive = 1 AND timestamp > datetime('now', '-1 hour')
      GROUP BY sale_point_id
    )
    SELECT
      spc.id,
      spc.company,
      spc.storeId,
      spc.storeFullName,
      spc.deviceType,
      COALESCE(ltp.isAlive, 0) as isAlive,
      COALESCE(al.avgLatency, 0) as avgLatency,
      ltp.lastSeen
    FROM sale_point_credentials spc
    LEFT JOIN last_three_pings ltp ON spc.id = ltp.sale_point_id
    LEFT JOIN avg_latency al ON spc.id = al.sale_point_id
    ORDER BY spc.id
    LIMIT ${limit}
  `

  return db.all(query)
}

export async function getSalePoints(c: Context) {
  try {
    await validateJwt(c)

    const salePoints = await getSalePointsWithStatus()
    return c.json({ status: 'success', data: salePoints })
  }
  catch (error) {
    console.error('Error fetching sale points:', error)
    if (error instanceof Exception)
      return returnHonoError(c, error)

    console.error('Unexpected error:', error)
    return c.json({ message: 'Unexpected error' }, 502)
  }
}
