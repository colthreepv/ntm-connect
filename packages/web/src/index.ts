import { Hono } from 'hono'
import { cors } from 'hono/cors'
import { serve } from '@hono/node-server'
import { getSalePoints } from './sale-point.api.js'
import { createSession } from './create-session/index.js'
import { env } from './config.js'

const app = new Hono().basePath('/api')
app.use('*', cors({ origin: '*' }))
app.get('/sale-points', getSalePoints)
app.get('/prepare-route/:salePointId/:jwt', createSession)

const port = 3000

async function main() {
  serve({ fetch: app.fetch, port, hostname: '0.0.0.0' })
  console.log(`Server is running on port ${port}, environment: ${env.NODE_ENV}`)
}

main()
