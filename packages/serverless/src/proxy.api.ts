import { Readable } from 'node:stream'
import type { HttpFunction } from '@google-cloud/functions-framework'
import { Agent, Request, fetch } from 'undici'
import { validateSession } from './firebase.js'
import { Exception } from './exception.js'

const forbiddenReqHeaders = ['host', 'connection']

const agent = new Agent({
  connect: {
    rejectUnauthorized: false, // Ignore self-signed certificates
  },
})

export const deviceRoute: HttpFunction = async (req, res) => {
  try {
    await validateSession(req)
  }
  catch (error) {
    if (error instanceof Exception) {
      return res.status(401).json({ error: error.message })
    }

    console.error('Unexpected error:', error)
    return res.status(502).json({ error: 'Unexpected error' })
  }

  const deviceId = req.params.id
  const deviceEndpoint = `https://${deviceId}/${req.url}`

  // Filter out forbidden request headers
  const reqHeaders = Object.fromEntries(
    Object.entries(req.headers as Record<string, string>)
      .filter(([k]) => !forbiddenReqHeaders.includes(k.toLowerCase())),
  )

  try {
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

    if (response.body == null) {
      return res.end()
    }
    Readable.fromWeb(response.body).pipe(res)
  }
  catch (error) {
    console.error('Error forwarding request to device:', error)
    return res.status(500).json({ message: 'Error forwarding request to device' })
  }
}
