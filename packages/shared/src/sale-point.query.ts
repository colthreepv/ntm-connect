import { eq, sql } from 'drizzle-orm'
import { db } from './database.js'
import { salePointCredentials } from './database.schema.js'
import { createException } from './exception.js'

const SalePointCredentialsNotFound = createException('SalePoint credentials not found', 'DATABASE_UTILS_01')

export async function fetchSalePointCredentials(id: string) {
  const credentials = await db.select().from(salePointCredentials).where(eq(salePointCredentials.id, id))

  if (credentials.length === 0) {
    throw new SalePointCredentialsNotFound({ reason: `${id} not found` })
  }

  return credentials[0]
}

export async function getSalePointsWithStatus(limit = 100) {
  const query = sql`
    WITH ranked_pings AS (
      SELECT 
        sale_point_id,
        response_time,
        is_responsive,
        ROW_NUMBER() OVER (PARTITION BY sale_point_id ORDER BY timestamp DESC) as row_num
      FROM ping_stats
    ),
    last_three_pings AS (
      SELECT 
        sale_point_id,
        MAX(CASE WHEN is_responsive = 1 THEN 1 ELSE 0 END) as is_alive
      FROM ranked_pings
      WHERE row_num <= 3
      GROUP BY sale_point_id
    ),
    avg_latency AS (
      SELECT 
        sale_point_id,
        AVG(response_time) as average_latency
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
      spc.publicIp,
      COALESCE(ltp.is_alive, 0) as is_alive,
      COALESCE(al.average_latency, 0) as average_latency
    FROM sale_point_credentials spc
    LEFT JOIN last_three_pings ltp ON spc.id = ltp.sale_point_id
    LEFT JOIN avg_latency al ON spc.id = al.sale_point_id
    ORDER BY spc.storeFullName
    LIMIT ${limit}
  `

  return db.run(query)
}
