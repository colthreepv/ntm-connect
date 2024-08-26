import { Readable } from 'node:stream'
import type { HttpFunction } from '@google-cloud/functions-framework'
import { Agent, Request, fetch } from 'undici'
import type { SalePointCredentials } from './firebase.js'
import { fetchSalePointCredentials, validateSession } from './firebase.js'
import { Exception, createException } from './exception.js'

const forbiddenReqHeaders = ['host', 'connection']

const agent = new Agent({
  connect: {
    rejectUnauthorized: false, // Ignore self-signed certificates
  },
})

const MissingSalePointIdError = createException('Missing salePointId in URL', 'PROXY_01')
const MissingJSessionIdError = createException('Missing JSESSIONID cookie', 'PROXY_02')

/**
 * A Cloud Function that forwards incoming requests to the corresponding device.
 *
 * The URL of the incoming request is expected to be in the format:
 *   /device/{salePointId}/{remainingPath}
 *
 * The function verifies the session cookie of the incoming request, and then
 * forwards the request to the device with the specified salePointId, using the
 * credentials stored in the "salePointCredentials" collection in Firestore.
 * The response from the device is then proxied back to the client.
 *
 * If the session cookie is invalid, or the salePointId is not found, the
 * function returns a 401 or 404 error respectively. If the function encounters
 * an unexpected error, it returns a 502 error.
 */
export const deviceRoute: HttpFunction = async (req, res) => {
  try {
    // Parse the URL to extract salePointId and the rest of the path
    const urlParts = req.url.split('/').filter(Boolean)
    const salePointId = urlParts[1]
    const remainingPath = urlParts.slice(2).join('/')

    if (!salePointId) {
      throw new MissingSalePointIdError()
    }

    console.log('Request received:', req.url, salePointId, remainingPath)

    await validateSession(req)
    const credentials = await fetchSalePointCredentials(salePointId)
    const deviceEndpoint = `https://${credentials.publicIp}/${remainingPath}`

    // Filter out forbidden request headers
    const reqHeaders = Object.fromEntries(
      Object.entries(req.headers as Record<string, string>)
        .filter(([k]) => !forbiddenReqHeaders.includes(k.toLowerCase())),
    )

    // Handle JSESSIONID cookie
    if (req.headers.cookie == null)
      throw new MissingJSessionIdError()
    const cookies = req.headers.cookie.split(';')
    const jsessionidMatch = cookies.find(cookie => cookie.trim().startsWith('JSESSIONID='))
    if (jsessionidMatch == null)
      throw new MissingJSessionIdError()

    const jsessionidCookie = jsessionidMatch.trim()
    reqHeaders.cookie = jsessionidCookie

    const controller = new AbortController()
    req.on('close', () => controller.abort())

    const request = new Request(deviceEndpoint, {
      method: req.method,
      headers: new Headers(reqHeaders),
      body: req.method !== 'GET' && req.method !== 'HEAD' ? req : undefined,
      signal: controller.signal,
      duplex: 'half',
    })

    const response = await fetch(request, { dispatcher: agent })
    response.headers.forEach((value, key) => { res.setHeader(key, value) })
    res.status(response.status)

    if (response.body == null)
      return res.end()
    Readable.fromWeb(response.body).pipe(res)
  }
  catch (error) {
    if (error instanceof Exception) {
      const statusCode = error.code === 'PROXY_01' ? 400 : 401
      return res.status(statusCode).json({ message: error.message, code: error.code })
    }

    console.error('Unexpected error:', error)
    return res.status(502).json({ message: 'An unexpected error occurred' })
  }
}
