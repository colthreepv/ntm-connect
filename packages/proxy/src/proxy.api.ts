import { Agent, Request, fetch } from 'undici'
import type { Context } from 'hono'
import { getCookie } from 'hono/cookie'
import type { StatusCode } from 'hono/utils/http-status'
import { stream } from 'hono/streaming'
import { Exception, createException, returnHonoError } from '@ntm-connect/shared/exception'
import { validateSession } from '@ntm-connect/shared/firebase'
import { fetchSalePointCredentials } from '@ntm-connect/shared/database.utils'
import { env } from './config.js'

// if-modified-since saves bandwidth, but creates problems with empty responses
const forbiddenReqHeaders = ['host', 'connection', 'if-modified-since']

const agent = new Agent({
  connect: {
    rejectUnauthorized: false, // Ignore self-signed certificates
  },
})

const DOMAIN_REGEX = new RegExp(`(.*?)\.${env.ALLOWED_ORIGIN}`)

const MissingSalePointIdError = createException('Missing salePointId in URL', 'PROXY_01')
const MissingJSessionIdError = createException('Missing JSESSIONID cookie', 'PROXY_02')
const MissingHostHeader = createException('Missing Host header', 'PROXY_03')

export async function proxyRequest(c: Context) {
  try {
    const hostHeader = c.req.header('host')
    if (hostHeader == null)
      throw new MissingHostHeader()

    const match = hostHeader.match(DOMAIN_REGEX)
    if (!match)
      throw new MissingSalePointIdError()

    const [, salePointId] = match
    const remainingPath = c.req.param('path')

    if (!salePointId) {
      throw new MissingSalePointIdError()
    }

    console.log('proxyRequest', salePointId, remainingPath)

    await validateSession(c)
    const credentials = await fetchSalePointCredentials(salePointId)
    const deviceEndpoint = `https://${credentials.publicIp}/${remainingPath}`

    // Filter out forbidden request headers
    const reqHeaders: Record<string, string> = {}
    c.req.raw.headers.forEach((value, key) => {
      if (!forbiddenReqHeaders.includes(key.toLowerCase())) {
        reqHeaders[key] = value
      }
    })

    // Handle JSESSIONID cookie
    const jsessionidCookie = getCookie(c, 'JSESSIONID')
    if (!jsessionidCookie)
      throw new MissingJSessionIdError()
    reqHeaders.cookie = `JSESSIONID=${jsessionidCookie}`

    const controller = new AbortController()
    const timeout = setTimeout(() => {
      controller.abort()
    }, 30000) // Default to 30 seconds if not set

    const request = new Request(deviceEndpoint, {
      method: c.req.method,
      headers: new Headers(reqHeaders),
      body: c.req.method !== 'GET' && c.req.method !== 'HEAD' ? c.req.raw.body : undefined,
      signal: controller.signal,
      duplex: 'half',
    })

    const response = await fetch(request, { dispatcher: agent })
    clearTimeout(timeout)

    const contentType = response.headers.get('Content-Type')
    // Handle Timer.js or Manager.js exception
    if (contentType != null && contentType.startsWith('application/javascript') && remainingPath.includes('Timer.js') || remainingPath.includes('Manager.js')) {
      const timerScript = await response.text()

      c.header('Content-Type', 'application/javascript')
      return c.body(timerScript.replace(/servlet\//g, `/device/${salePointId}/servlet/`))
    }

    // Read HTML, manipulate the base path and then return it
    if (contentType != null && contentType.startsWith('text/html')) {
      const html = await response.text()

      return c.html(html.replace(/<base.*?href=".*?">/g, `<base href="/device/${salePointId}/boss/">`))
    }

    // Set response headers
    response.headers.forEach((value, key) => {
      c.header(key, value)
    })

    // Set status code
    c.status(response.status as StatusCode)

    // Stream the response body
    if (response.body === null) {
      return c.body(null)
    }

    return stream(c, async (stream) => {
      await stream.pipe(response.body as ReadableStream<any>)
    })
  }
  catch (error) {
    if (error instanceof Exception) {
      return returnHonoError(c, error)
    }

    console.error('Unexpected error:', error)
    return c.json({ message: 'An unexpected error occurred' }, 502)
  }
}
