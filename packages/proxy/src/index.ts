/* eslint-disable no-console */
import { serve } from '@hono/node-server'
import { Hono } from 'hono'
import { logger } from 'hono/logger'
import { env } from './config.js'
import { proxyEndpoint } from './proxy.api.js'

const port = 3004
const app = new Hono()

if (env.REQUEST_LOG === true) {
  app.use('*', logger())
}

app.all('/', proxyEndpoint)
app.all('/:path{.+}', proxyEndpoint)

async function main() {
  serve({ fetch: app.fetch, port, hostname: '0.0.0.0' })
  console.log(`Server is running on port ${port}, environment: ${env.NODE_ENV}`)
}

main()
