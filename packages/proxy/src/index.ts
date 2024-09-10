/* eslint-disable no-console */
import { Hono } from 'hono'
import { serve } from '@hono/node-server'
import { env } from './config.js'
import { proxyEndpoint } from './proxy.api.js'

const port = 3004
const app = new Hono()

app.all('/:path{.+}', proxyEndpoint)

async function main() {
  serve({ fetch: app.fetch, port, hostname: '0.0.0.0' })
  console.log(`Server is running on port ${port}, environment: ${env.NODE_ENV}`)
}

main()
