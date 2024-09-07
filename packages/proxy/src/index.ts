/* eslint-disable no-console */
import { exit } from 'node:process'
import { Hono } from 'hono'
import { serve } from '@hono/node-server'
import { knexInstance } from '@ntm-connect/shared/database'
import { env as sharedEnv } from '@ntm-connect/shared/config'
import { proxyEndpoint } from './proxy.api.js'
import { createSession } from './endpoints/create-session.endpoint.js'
import { testSession } from './endpoints/test-session.api.js'
import { clearSession } from './endpoints/clear-session.api.js'

const app = new Hono()

const environment = sharedEnv.NODE_ENV

// app.get('/__api/debug-host') To be done
app.get('/__api/session', testSession)
app.delete('/__api/session', clearSession)
app.get('/prepare-route/:salePointId/:jwt', createSession)

app.all('/:path{.+}', proxyEndpoint)

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
