import { eq } from 'drizzle-orm'
import { createException } from '../exception.js'
import { db } from './database.js'
import { salePointCredentials } from './database.schema.js'

const SalePointCredentialsNotFound = createException('SalePoint credentials not found', 'DATABASE_UTILS_01')

export async function fetchSalePointCredentials(id: string) {
  const credentials = await db.select().from(salePointCredentials).where(eq(salePointCredentials.id, id))

  if (credentials.length === 0) {
    throw new SalePointCredentialsNotFound({ reason: `${id} not found` })
  }

  return credentials[0]
}
