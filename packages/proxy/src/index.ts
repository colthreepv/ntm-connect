/* eslint-disable no-console */
import { exit } from 'node:process'
import { Hono } from 'hono'
import { serve } from '@hono/node-server'
import { knexInstance } from '@ntm-connect/shared/database'
import { proxyRequest } from './proxy.api.js'
import { createSession } from './endpoints/create-session.api.js'
import { clearSession } from './endpoints/clear-session.api.js'
import { testSession } from './endpoints/test-session.api.js'

const app = new Hono()

app.get('/api/debug-host')
app.get('/api/session', testSession)
app.post('/api/session', createSession)
app.delete('/api/session', clearSession)
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
    })
    console.log(`Server is running on port ${port}`)
  }
  catch (error) {
    console.error('Failed to run migrations:', error)
    exit(1)
  }
}

main()
