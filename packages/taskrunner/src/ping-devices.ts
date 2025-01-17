import type { RequestOptions } from 'node:https'
import { exit as processExit } from 'node:process'
import { parentPort } from 'node:worker_threads'
import { db } from '@ntm-connect/shared/database'
import { pingStats, salePointCredentials } from '@ntm-connect/shared/database.schema'
import { httpsRequest } from '@ntm-connect/shared/request'
import { consola } from 'consola'

const TIMEOUT_IN_SECONDS = 5

async function pingDevice(salePoint: { id: string, publicIp: string, port: number }) {
  const controller = new AbortController()
  const requestTimeout = setTimeout(() => {
    controller.abort()
  }, TIMEOUT_IN_SECONDS * 1000)

  const startTime = Date.now()

  const options: RequestOptions = {
    hostname: salePoint.publicIp,
    port: salePoint.port,
    path: '/boss/',
    method: 'HEAD',
    rejectUnauthorized: false, // Ignore self-signed certificate warnings
    signal: controller.signal,
  }

  try {
    await httpsRequest(options)
    const duration = Date.now() - startTime

    await db.insert(pingStats).values({
      salePointId: salePoint.id,
      latency: duration,
      isResponsive: true,
      ipAddress: salePoint.publicIp,
    })

    consola.success(`Pinged ${salePoint.id} in ${duration}ms`)
  }
  catch (err) {
    if (err instanceof Error && err.name === 'AbortError') {
      consola.info(`Timed out pinging ${salePoint.id} after ${TIMEOUT_IN_SECONDS} seconds`)
      await db.insert(pingStats).values({
        salePointId: salePoint.id,
        isResponsive: false,
        ipAddress: salePoint.publicIp,
      })
    }
    else {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error'
      await db.insert(pingStats).values({
        salePointId: salePoint.id,
        isResponsive: false,
        ipAddress: salePoint.publicIp,
        errorMessage,
      })
      consola.error(`Failed to ping ${salePoint.id}: ${errorMessage}`)
    }
  }
  finally {
    clearTimeout(requestTimeout)
  }
}

async function pingAllDevices() {
  const salePoints = await db
    .select({
      id: salePointCredentials.id,
      publicIp: salePointCredentials.publicIp,
      port: salePointCredentials.port,
    })
    .from(salePointCredentials)

  consola.info(`Found ${salePoints.length} sale points to process`)

  await Promise.all(salePoints.map(pingDevice))
}

async function main() {
  await pingAllDevices()

  if (parentPort)
    parentPort.postMessage('done')
  else processExit(0)
}

main()
