/* eslint-disable no-console */
import { env, exit } from 'node:process'
import { Hono } from 'hono'
import { serve } from '@hono/node-server'
import { knexInstance } from '@ntm-connect/shared/database'
import { cors } from 'hono/cors'
import { proxyRequest } from './proxy.api.js'
import { createSession } from './endpoints/create-session.api.js'
import { clearSession } from './endpoints/clear-session.api.js'
import { testSession } from './endpoints/test-session.api.js'

const app = new Hono()

const environment = env.NODE_ENV === 'production' ? 'production' : 'development'
if (environment === 'production' && !env.ALLOWED_ORIGIN) {
  throw new Error('ALLOWED_ORIGIN is required in production')
}
const allowedOrigin = environment === 'development' ? '*' : env.ALLOWED_ORIGIN!

const corsMiddleware = cors({
  origin: allowedOrigin,
  allowMethods: ['GET', 'HEAD', 'PUT', 'POST', 'DELETE', 'PATCH', 'OPTIONS'],
})

// CORS applied only to API routes
const apiRoutes = new Hono()
apiRoutes.use('*', corsMiddleware)

apiRoutes.get('/debug-host')
apiRoutes.get('/session', testSession)
apiRoutes.post('/session', createSession)
apiRoutes.delete('/session', clearSession)

app.route('/api', apiRoutes)
app.all('/:path{.+}', proxyRequest)

const port = 3004

async function main() {
  try {
    const [, runMigrations] = await knexInstance.migrate.latest()
    if ((runMigrations as string[]).length === 0) {
      console.log('No migrations to run')
    }
    else {
      console.log(`Migrations executed ${runMigrations.length}`, runMigrations)
    }

    serve({
      fetch: app.fetch,
      port,
      hostname: '0.0.0.0',
    })
    console.log(`Server is running on port ${port}, environment: ${environment}`)
  }
  catch (error) {
    console.error('Failed to run migrations:', error)
    exit(1)
  }
}

main()
