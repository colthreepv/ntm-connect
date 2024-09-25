import type { Context } from 'hono'
import { salePointCredentials } from '@ntm-connect/shared/database.schema'
import { Exception, returnHonoError } from '@ntm-connect/shared/exception'
import { validateJwt } from '@ntm-connect/shared/firebase'
import { db } from '@ntm-connect/shared/database'

export async function getSalePoints(c: Context) {
  try {
    await validateJwt(c)

    const salePoints = await db
      .select({
        id: salePointCredentials.id,
        company: salePointCredentials.company,
        storeId: salePointCredentials.storeId,
        storeFullName: salePointCredentials.storeFullName,
        deviceType: salePointCredentials.deviceType,
        publicIp: salePointCredentials.publicIp,
      })
      .from(salePointCredentials)
      .limit(100)

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
