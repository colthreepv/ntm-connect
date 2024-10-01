import { sql } from 'drizzle-orm'
import { pingStats, salePointCredentials } from './database.schema.js'
import { db } from './database.js'

interface RawDeadDevice {
  salePointId: string
  lastSeen: number // Unix timestamp
  company: string
  storeId: string
  storeFullName: string
  deviceType: string
  publicIp: string
}

export interface DeadDevice {
  salePointId: string
  lastSeen: Date
  company: string
  storeId: string
  storeFullName: string
  deviceType: string
  publicIp: string
}

export async function findDeadDevices(database = db): Promise<DeadDevice[]> {
  const rawDeadDevices = await database.all<RawDeadDevice>(sql`
    WITH LastSuccessfulPing AS (
      SELECT ${pingStats.salePointId}, MAX(${pingStats.timestamp}) as ${sql.raw('lastSeen')}
      FROM ${pingStats}
      WHERE ${pingStats.isResponsive} = ${sql`true`}
      GROUP BY ${pingStats.salePointId}
    ),
    RecentPings AS (
      SELECT 
        ps.${sql.raw(pingStats.salePointId.name)},
        ps.${sql.raw(pingStats.timestamp.name)},
        ps.${sql.raw(pingStats.isResponsive.name)},
        ROW_NUMBER() OVER (PARTITION BY ps.${sql.raw(pingStats.salePointId.name)} ORDER BY ps.${sql.raw(pingStats.timestamp.name)} DESC) as ${sql.raw('pingRank')}
      FROM ${pingStats} ps
      JOIN LastSuccessfulPing lsp ON ps.${sql.raw(pingStats.salePointId.name)} = lsp.${sql.raw(pingStats.salePointId.name)}
      WHERE ps.${sql.raw(pingStats.timestamp.name)} > lsp.${sql.raw('lastSeen')}
    )
    SELECT 
      rp.${sql.raw(pingStats.salePointId.name)} as ${sql.raw('salePointId')},
      lsp.${sql.raw('lastSeen')},
      spc.${sql.raw(salePointCredentials.company.name)} as ${sql.raw('company')},
      spc.${sql.raw(salePointCredentials.storeId.name)} as ${sql.raw('storeId')},
      spc.${sql.raw(salePointCredentials.storeFullName.name)} as ${sql.raw('storeFullName')},
      spc.${sql.raw(salePointCredentials.deviceType.name)} as ${sql.raw('deviceType')},
      spc.${sql.raw(salePointCredentials.publicIp.name)} as ${sql.raw('publicIp')}
    FROM RecentPings rp
    JOIN LastSuccessfulPing lsp ON rp.${sql.raw(pingStats.salePointId.name)} = lsp.${sql.raw(pingStats.salePointId.name)}
    JOIN ${salePointCredentials} spc ON rp.${sql.raw(pingStats.salePointId.name)} = spc.${sql.raw(salePointCredentials.id.name)}
    WHERE rp.${sql.raw('pingRank')} <= ${sql`3`}
    GROUP BY rp.${sql.raw(pingStats.salePointId.name)}
    HAVING SUM(rp.${sql.raw(pingStats.isResponsive.name)}) = ${sql`0`} AND COUNT(*) = ${sql`3`}
  `)

  return rawDeadDevices.map(device => ({
    ...device,
    lastSeen: new Date(device.lastSeen * 1000),
  }))
}

interface RawResurrectedDevice {
  salePointId: string
  resurrectedAt: number // Unix timestamp
  company: string
  storeId: string
  storeFullName: string
  deviceType: string
  publicIp: string
}

export interface ResurrectedDevice {
  salePointId: string
  resurrectedAt: Date
  company: string
  storeId: string
  storeFullName: string
  deviceType: string
  publicIp: string
}

export async function findResurrectedDevices(database = db): Promise<ResurrectedDevice[]> {
  const rawResurrectedDevices = await database.all<RawResurrectedDevice>(sql`
    WITH RecentPings AS (
      SELECT 
        ps.${sql.raw(pingStats.salePointId.name)},
        ps.${sql.raw(pingStats.timestamp.name)},
        ps.${sql.raw(pingStats.isResponsive.name)},
        ROW_NUMBER() OVER (PARTITION BY ps.${sql.raw(pingStats.salePointId.name)} ORDER BY ps.${sql.raw(pingStats.timestamp.name)} DESC) as ${sql.raw('pingRank')}
      FROM ${pingStats} ps
    )
    SELECT 
      rp.${sql.raw(pingStats.salePointId.name)} as ${sql.raw('salePointId')},
      MAX(rp.${sql.raw(pingStats.timestamp.name)}) as ${sql.raw('resurrectedAt')},
      spc.${sql.raw(salePointCredentials.company.name)} as ${sql.raw('company')},
      spc.${sql.raw(salePointCredentials.storeId.name)} as ${sql.raw('storeId')},
      spc.${sql.raw(salePointCredentials.storeFullName.name)} as ${sql.raw('storeFullName')},
      spc.${sql.raw(salePointCredentials.deviceType.name)} as ${sql.raw('deviceType')},
      spc.${sql.raw(salePointCredentials.publicIp.name)} as ${sql.raw('publicIp')}
    FROM RecentPings rp
    JOIN ${salePointCredentials} spc ON rp.${sql.raw(pingStats.salePointId.name)} = spc.${sql.raw(salePointCredentials.id.name)}
    WHERE rp.${sql.raw('pingRank')} <= ${sql`4`}
    GROUP BY rp.${sql.raw(pingStats.salePointId.name)}
    HAVING 
      SUM(CASE WHEN rp.${sql.raw('pingRank')} = 1 THEN rp.${sql.raw(pingStats.isResponsive.name)} ELSE 0 END) = ${sql`1`} AND
      SUM(CASE WHEN rp.${sql.raw('pingRank')} > 1 THEN rp.${sql.raw(pingStats.isResponsive.name)} ELSE 0 END) = ${sql`0`}
  `)

  return rawResurrectedDevices.map(device => ({
    ...device,
    resurrectedAt: new Date(device.resurrectedAt * 1000),
  }))
}
