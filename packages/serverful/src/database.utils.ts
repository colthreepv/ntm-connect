import { createException } from './exception.js'
import { SalePointCredentials } from './database.js'

const SalePointCredentialsNotFound = createException('SalePoint credentials not found', 'DATABASE_UTILS_01')

export async function fetchSalePointCredentials(id: string): Promise<SalePointCredentials> {
  const credentials = await SalePointCredentials.query().findById(id)

  if (!credentials) {
    throw new SalePointCredentialsNotFound({ reason: `${id} not found` })
  }

  return credentials
}
