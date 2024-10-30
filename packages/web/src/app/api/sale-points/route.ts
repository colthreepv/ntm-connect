import type { NextRequest } from 'next/server'
import { NextResponse } from 'next/server'
import { Exception, createException } from '@ntm-connect/shared/exception'
import type { DecodedIdToken } from 'firebase-admin/auth'
import { headers } from 'next/headers'
import { firebaseAdminAuth } from '@ntm-connect/shared/firebase'
import { returnError } from '../exception'
import { db, sql } from '../database'

async function getSalePointsWithStatus(limit = 100) {
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

const MissingAuthorizationHeader = createException('Missing Authorization header', 'JWT_01')
const InvalidAuthorizationFormat = createException('Invalid Authorization header format', 'JWT_02')
const ErrorVerifyingIdToken = createException('Error verifying ID token', 'JWT_03')

async function validateJwt(): Promise<DecodedIdToken> {
  const headersList = await headers()
  const authHeader = headersList.get('authorization')

  if (!authHeader) {
    throw new MissingAuthorizationHeader()
  }

  const [bearer, token] = authHeader.split(' ')

  if (bearer !== 'Bearer' || !token) {
    throw new InvalidAuthorizationFormat()
  }

  try {
    const decodedToken = await firebaseAdminAuth.verifyIdToken(token)
    return decodedToken
  }
  catch (error) {
    throw new ErrorVerifyingIdToken({ cause: error })
  }
}

export async function GET(_: NextRequest) {
  try {
    await validateJwt()

    const salePoints = await getSalePointsWithStatus()
    return NextResponse.json({ status: 'success', data: salePoints })
  }
  catch (error) {
    console.error('Error fetching sale points:', error)
    if (error instanceof Exception) {
      return returnError(error)
    }

    console.error('Unexpected error:', error)
    return NextResponse.json({ message: 'Unexpected error' }, { status: 502 })
  }
}
