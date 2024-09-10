import { Hono } from 'hono'
import { getSalePoints } from './sale-point.api'
import { createSession } from './create-session'

const app = new Hono().basePath('/api')
app.get('/sale-points', getSalePoints)
app.get('/prepare-route/:salePointId/:jwt', createSession)

export { app }
