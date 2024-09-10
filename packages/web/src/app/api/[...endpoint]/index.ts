import { Hono } from 'hono'
import type { PageConfig } from 'next'
import { getSalePoints } from './sale-point.api'

export const config: PageConfig = {
  api: {
    bodyParser: false,
  },
}

const app = new Hono().basePath('/api')
app.get('/api/sale-points', getSalePoints)

export { app }
