import { beforeAll, describe, expect, it } from 'vitest'
import type { LibSQLDatabase } from 'drizzle-orm/libsql'

import { pingStats, salePointCredentials } from '../src/database/database.schema.js'
import { findDeadDevices, findResurrectedDevices } from '../src/database/devices.query.js'
import { setupTestDatabase } from './test-database.js'

describe('findDeadDevices', () => {
  let testDb: LibSQLDatabase

  beforeAll(async () => {
    testDb = await setupTestDatabase()
    // Insert test data
    await testDb.insert(salePointCredentials).values([
      {
        id: 'test-device-1',
        company: 'Test Company',
        storeId: 'Store1',
        storeFullName: 'Test Store 1',
        deviceType: 'POS',
        publicIp: '192.168.1.1',
        username: 'testuser1',
        password: 'password1',
      },
      {
        id: 'test-device-2',
        company: 'Test Company',
        storeId: 'Store2',
        storeFullName: 'Test Store 2',
        deviceType: 'POS',
        publicIp: '192.168.1.2',
        username: 'testuser2',
        password: 'password2',
      },
    ])

    const now = new Date()
    // For test-device-1 (should be considered "dead")
    await testDb.insert(pingStats).values([
      { salePointId: 'test-device-1', timestamp: new Date(now.getTime() - 5000), isResponsive: true },
      { salePointId: 'test-device-1', timestamp: new Date(now.getTime() - 4000), isResponsive: false },
      { salePointId: 'test-device-1', timestamp: new Date(now.getTime() - 3000), isResponsive: false },
      { salePointId: 'test-device-1', timestamp: new Date(now.getTime() - 2000), isResponsive: false },
    ])

    // For test-device-2 (should not be considered "dead")
    await testDb.insert(pingStats).values([
      { salePointId: 'test-device-2', timestamp: new Date(now.getTime() - 5000), isResponsive: true },
      { salePointId: 'test-device-2', timestamp: new Date(now.getTime() - 4000), isResponsive: false },
      { salePointId: 'test-device-2', timestamp: new Date(now.getTime() - 3000), isResponsive: true },
      { salePointId: 'test-device-2', timestamp: new Date(now.getTime() - 2000), isResponsive: false },
    ])
  })

  it('should find dead devices correctly', async () => {
    const deadDevices = await findDeadDevices(testDb)

    expect(deadDevices).toHaveLength(1)
    expect(deadDevices[0]).toMatchObject({
      salePointId: 'test-device-1',
      company: 'Test Company',
      storeId: 'Store1',
      storeFullName: 'Test Store 1',
      deviceType: 'POS',
      publicIp: '192.168.1.1',
    })
    expect(deadDevices[0].lastSeen).toBeInstanceOf(Date)
  })
})

describe('findResurrectedDevices', () => {
  let testDb: LibSQLDatabase

  beforeAll(async () => {
    testDb = await setupTestDatabase()

    // Insert test data
    await testDb.insert(salePointCredentials).values([
      {
        id: 'test-device-1',
        company: 'Test Company',
        storeId: 'Store1',
        storeFullName: 'Test Store 1',
        deviceType: 'POS',
        publicIp: '192.168.1.1',
        username: 'testuser1',
        password: 'password1',
      },
      {
        id: 'test-device-2',
        company: 'Test Company',
        storeId: 'Store2',
        storeFullName: 'Test Store 2',
        deviceType: 'POS',
        publicIp: '192.168.1.2',
        username: 'testuser2',
        password: 'password2',
      },
    ])

    const now = new Date()
    // For test-device-1 (should be considered "resurrected")
    await testDb.insert(pingStats).values([
      { salePointId: 'test-device-1', timestamp: new Date(now.getTime() - 5000), isResponsive: false },
      { salePointId: 'test-device-1', timestamp: new Date(now.getTime() - 4000), isResponsive: false },
      { salePointId: 'test-device-1', timestamp: new Date(now.getTime() - 3000), isResponsive: false },
      { salePointId: 'test-device-1', timestamp: new Date(now.getTime() - 2000), isResponsive: true },
    ])

    // For test-device-2 (should not be considered "resurrected")
    await testDb.insert(pingStats).values([
      { salePointId: 'test-device-2', timestamp: new Date(now.getTime() - 5000), isResponsive: false },
      { salePointId: 'test-device-2', timestamp: new Date(now.getTime() - 4000), isResponsive: false },
      { salePointId: 'test-device-2', timestamp: new Date(now.getTime() - 3000), isResponsive: true },
      { salePointId: 'test-device-2', timestamp: new Date(now.getTime() - 2000), isResponsive: true },
    ])
  })

  it('should find resurrected devices correctly', async () => {
    const resurrectedDevices = await findResurrectedDevices(testDb)

    expect(resurrectedDevices).toHaveLength(1)
    expect(resurrectedDevices[0]).toMatchObject({
      salePointId: 'test-device-1',
      company: 'Test Company',
      storeId: 'Store1',
      storeFullName: 'Test Store 1',
      deviceType: 'POS',
      publicIp: '192.168.1.1',
    })
    expect(resurrectedDevices[0].resurrectedAt).toBeInstanceOf(Date)
  })
})
