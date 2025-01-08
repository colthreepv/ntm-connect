import { serve } from '@hono/node-server'
import { Hono } from 'hono'
import { cors } from 'hono/cors'
import { env } from './config.js'
import { createSession } from './create-session/index.js'
import { pages } from './pages.js'
import { getSalePoints } from './sale-point.api.js'

const api = new Hono()
api.use('*', cors({ origin: '*' }))
api.get('/sale-points', getSalePoints)
api.get('/prepare-route/:salePointId/:jwt', createSession)

const app = new Hono()
app.route('/api', api)
app.route('/', pages)

const port = 3000

async function main() {
  serve({ fetch: app.fetch, port, hostname: '0.0.0.0' })
  console.log(`Server is running on port ${port}, environment: ${env.NODE_ENV}`)
}

main()
