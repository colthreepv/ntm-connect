/* eslint-disable no-console */
import { exit } from 'node:process'
import { Hono } from 'hono'
import { serve } from '@hono/node-server'
import { createSession } from './endpoints/create-session.api.js'
import { knexInstance } from './database.js'
import { clearSession } from './endpoints/clear-session.api.js'
import { testSession } from './endpoints/test-session.api.js'
import { proxyRequest } from './endpoints/proxy.api.js'

const app = new Hono()

app.get('/', c => c.json('Hello Hono!'))
app.get('/api/session', testSession)
app.post('/api/session', createSession)
app.delete('/api/session', clearSession)
app.all('/device/:salePointId/:path{.+}', proxyRequest)

const port = 3003

async function main() {
  try {
    await knexInstance.migrate.latest()
    console.log('Migrations completed')
    serve({
      fetch: app.fetch,
      port,
    })
    console.log(`Server is running on port ${port}`)
  }
  catch (error) {
    console.error('Failed to run migrations:', error)
    exit(1)
  }
}

main()
