/* eslint-disable no-console */
import { exit } from 'node:process'
import { Hono } from 'hono'
import { serve } from '@hono/node-server'
import { knexInstance } from 'ntm-shared/database'
import { proxyRequest } from './proxy.api.js'

const app = new Hono()

app.all('/:path{.+}', proxyRequest)

const port = 3003

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
