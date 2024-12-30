import { Hono } from 'hono'
import { cors } from 'hono/cors'
import { getSalePoints } from './sale-point.api.js'
import { createSession } from './create-session/index.js'

const app = new Hono().basePath('/api')
app.use('*', cors({ origin: '*' }))
app.get('/sale-points', getSalePoints)
app.get('/prepare-route/:salePointId/:jwt', createSession)

export { app }
