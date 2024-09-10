import type { IncomingMessage } from 'node:http'
import type { RequestOptions } from 'node:https'
import { request } from 'node:https'
import { Buffer } from 'node:buffer'

export function httpsRequest(options: RequestOptions, body?: Buffer | null) {
  return new Promise<{ data: Buffer, response: IncomingMessage }>((resolve, reject) => {
    const req = request(options, (response) => {
      const data: Buffer[] = []

      response.on('data', chunk => data.push(chunk))
      response.on('end', () => resolve({ data: Buffer.concat(data), response }))
    })

    req.on('error', (error) => { reject(error) })
    if (body) { req.write(body) }
    req.end()
  })
}
