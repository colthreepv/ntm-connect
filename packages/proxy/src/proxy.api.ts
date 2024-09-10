import type { RequestOptions } from 'node:https'
import { Buffer } from 'node:buffer'
import type { Context } from 'hono'
import { getCookie } from 'hono/cookie'
import type { StatusCode } from 'hono/utils/http-status'
import { Exception, createException, returnHonoError } from '@ntm-connect/shared/exception'
import { validateSession } from '@ntm-connect/shared/firebase'
import { fetchSalePointCredentials } from '@ntm-connect/shared/sale-point'
import { httpsRequest } from '@ntm-connect/shared/request'
import { browserProtocol, env, proxyDomain } from './config.js'

const forbiddenReqHeaders = ['host', 'connection']

const DOMAIN_REGEX = new RegExp(`(.*?)\.${env.DOMAIN}`)

const MissingSalePointIdError = createException('Missing salePointId in URL', 'PROXY_01')
const MissingJSessionIdError = createException('Missing JSESSIONID cookie', 'PROXY_02')
const MissingHostHeader = createException('Missing Host header', 'PROXY_03')
const MalformedDeviceRequest = createException('Malformed device request', 'PROXY_04')

export async function proxyEndpoint(c: Context) {
  try {
    const hostHeader = c.req.header('host')
    if (hostHeader == null)
      throw new MissingHostHeader()

    const match = hostHeader.match(DOMAIN_REGEX)
    if (!match)
      throw new MissingSalePointIdError()

    const [, salePointId] = match
    if (!salePointId)
      throw new MissingSalePointIdError()

    await validateSession(c)
    const credentials = await fetchSalePointCredentials(salePointId)

    // Filter out forbidden request headers
    const reqHeaders: Record<string, string> = {}
    c.req.raw.headers.forEach((value, key) => {
      if (!forbiddenReqHeaders.includes(key.toLowerCase())) {
        reqHeaders[key] = value
      }
    })
    reqHeaders.host = credentials.publicIp // replace Host with something familiar

    // requestUrl should be like /asdomasdo?querystring=1
    const parsedUrl = new URL(c.req.url)
    const requestUrl = parsedUrl.pathname + parsedUrl.search

    const options: RequestOptions = {
      hostname: credentials.publicIp,
      path: requestUrl,
      method: c.req.method,
      headers: reqHeaders,
      rejectUnauthorized: false, // Ignore self-signed certificate warnings
      signal: c.req.raw.signal,
    }

    // check JSESSIONID, and only forward this cookie
    const jsessionidCookie = getCookie(c, 'JSESSIONID')
    if (!jsessionidCookie)
      throw new MissingJSessionIdError()
    reqHeaders.cookie = `JSESSIONID=${jsessionidCookie}`

    // Replace REFERER header with original domain
    const referer = c.req.header('referer')
    if (referer != null) {
      reqHeaders.referer = referer.replace(`${browserProtocol}://${salePointId}.${proxyDomain}`, `https://${credentials.publicIp}`)
    }

    const requestBodyBuffer = Buffer.from(await c.req.arrayBuffer())
    const { data: proxyBody, response: proxyRes } = await httpsRequest(options, requestBodyBuffer)

    if (proxyRes.statusCode === 301 || proxyRes.statusCode === 302) {
      if (proxyRes.headers.location == null)
        throw new MalformedDeviceRequest({ reason: 'Missing Location header on redirect' })
      const newLocation = proxyRes.headers.location?.replace(`https://${credentials.publicIp}`, `${browserProtocol}://${salePointId}.${proxyDomain}`)
      return c.redirect(newLocation)
    }

    c.status(proxyRes.statusCode! as StatusCode)
    for (const [key, value] of Object.entries(proxyRes.headers)) {
      if (key === 'content-length') // will get set by hono anyway
        continue
      c.header(key, value as string)
    }

    const contentType = proxyRes.headers['content-type']
    // Read HTML, manipulate the base path and then return it
    if (contentType != null && contentType.startsWith('text/html')) {
      return c.html(proxyBody.toString().replace(/<base.*?href=".*?">/g, `<base id="basePath" href="${browserProtocol}://${salePointId}.${proxyDomain}/boss/">`))
    }

    return c.body(proxyBody)
  }
  catch (error) {
    if (error instanceof Exception) {
      return returnHonoError(c, error)
    }

    console.error('Unexpected error:', error)
    return c.json({ message: 'An unexpected error occurred' }, 502)
  }
}
