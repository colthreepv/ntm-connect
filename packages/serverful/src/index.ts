/* eslint-disable no-console */
import { exit } from 'node:process'
import { Hono } from 'hono'
import { serve } from '@hono/node-server'
import { createSession } from './endpoints/create-session.api.js'
import { knexInstance } from './database.js'

const app = new Hono()

app.get('/', c => c.text('Hello Hono!'))
app.post('/api/create-session', createSession)

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
