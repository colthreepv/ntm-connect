import { Agent, Request, fetch } from 'undici'
import type { Context } from 'hono'
import { getCookie } from 'hono/cookie'
import type { StatusCode } from 'hono/utils/http-status'
import { stream } from 'hono/streaming'
import { Exception, createException, returnHonoError } from '../exception.js'
import { validateSession } from '../firebase.js'
import { fetchSalePointCredentials } from '../database.utils.js'

const forbiddenReqHeaders = ['host', 'connection']

const agent = new Agent({
  connect: {
    rejectUnauthorized: false, // Ignore self-signed certificates
  },
})

const MissingSalePointIdError = createException('Missing salePointId in URL', 'PROXY_01')
const MissingJSessionIdError = createException('Missing JSESSIONID cookie', 'PROXY_02')

export async function proxyRequest(c: Context) {
  try {
    const salePointId = c.req.param('salePointId')
    const remainingPath = c.req.param('path')

    if (!salePointId) {
      throw new MissingSalePointIdError()
    }

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

    // Handle potentially conflicting headers
    const headersToForward = new Headers(response.headers)
    if (headersToForward.has('transfer-encoding')) {
      headersToForward.delete('content-length')
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
