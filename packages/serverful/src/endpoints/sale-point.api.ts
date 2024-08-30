import type { Context } from 'hono'
import { SalePointCredentials } from 'ntm-shared/database'
import { Exception, returnHonoError } from 'ntm-shared/exception'
import { validateJwt } from 'ntm-shared/firebase'

export async function getSalePoints(c: Context) {
  try {
    const user = await validateJwt(c)
    console.log('User:', user)

    const salePoints = await SalePointCredentials.query()
      .select('id', 'company', 'storeId', 'storeFullName', 'deviceType', 'publicIp')
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
