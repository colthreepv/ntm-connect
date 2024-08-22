import type { HttpFunction } from '@google-cloud/functions-framework'
import { Agent, fetch } from 'undici'
import { firebaseAdminAuth } from '../firebase.js'
import { env } from '../config.js' // 2 days

const expiresIn = 60 * 60 * 24 * 2 * 1000

interface SessionCookie {
  name: string
  value: string
  path: string
}

// example of set-cookie header:
// 'JSESSIONID=node05xej81a1atf01cvu5b9fxsuv7649.node0; Path=/boss; Secure; HttpOnly; SameSite=Strict'
async function getJSessionFromDevice(ip: string, username: string, password: string): Promise<SessionCookie> {
  const agent = new Agent({
    connect: {
      rejectUnauthorized: false,
    },
  })

  const loginUrl = `https://${ip}/boss/servlet/login`
  const formData = new URLSearchParams()
  formData.append('txtUser', username)
  formData.append('txtPassword', password)

  const response = await fetch(loginUrl, {
    method: 'POST',
    body: formData,
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    dispatcher: agent,
  })

  if (!response.ok) {
    throw new Error(`Login failed with status: ${response.status}`)
  }

  const setCookieHeader = response.headers.get('set-cookie')
  if (setCookieHeader == null) {
    throw new Error('Failed to obtain JSESSIONID')
  }

  const regex = /^JSESSIONID=(.*?);\s*Path=(.*?);/i
  const match = setCookieHeader.match(regex)

  if (!match)
    throw new Error('Failed to parse JSESSIONID cookie')

  const [, value, path] = match

  return {
    name: 'JSSESSIONID',
    value,
    path: path || '/',
  }
}

export const createSession: HttpFunction = async (req, res) => {
  const { userToken } = req.body

  if (!userToken)
    return res.status(400).json({ error: 'ID Token is required' })

  let sessionCookie: string
  try {
    sessionCookie = await firebaseAdminAuth.createSessionCookie(userToken, { expiresIn })
  }
  catch (error) {
    console.error('Error creating session cookie:', error)
    return res.status(401).json({ error: 'Error creating session cookie' })
  }

  let deviceCookie: SessionCookie
  try {
    deviceCookie = await getJSessionFromDevice('IP', 'user', 'passwd')
  }
  catch (error) {
    console.error('Unable to login on device:', error)
    return res.status(401).json({ error: 'Unable to login on device' })
  }

  res.cookie(deviceCookie.name, deviceCookie.value, {
    httpOnly: true,
    secure: true,
    sameSite: 'strict',
    path: deviceCookie.path, // maybe has to be changed
  })

  res.cookie('session', sessionCookie, {
    maxAge: expiresIn,
    httpOnly: true,
    secure: env.NODE_ENV === 'production',
    path: '/',
  })

  return res.json({ status: 'success' })
}
