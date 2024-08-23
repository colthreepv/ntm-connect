import type { HttpFunction } from '@google-cloud/functions-framework'
import { Agent, fetch } from 'undici'
import { firebaseAdminAuth } from '../firebase.js'
import { env } from '../config.js'
import { Exception, createException } from '../exception.js'

const expiresIn = 60 * 60 * 24 * 2 * 1000 // 2 days

interface SessionCookie {
  name: string
  value: string
  path: string
}

const MissingUserTokenError = createException('ID Token is required', 'CREATE_SESSION_01')
const CreateSessionCookieError = createException('Error creating session cookie', 'CREATE_SESSION_02')
const DeviceLoginError = createException('Unable to login on device', 'CREATE_SESSION_03')
const JSessionParseError = createException('Failed to parse JSESSIONID cookie', 'CREATE_SESSION_04')

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
    throw new DeviceLoginError({ status: response.status })
  }

  const setCookieHeader = response.headers.get('set-cookie')
  if (setCookieHeader == null) {
    throw new DeviceLoginError({ details: 'Failed to obtain JSESSIONID' })
  }

  const regex = /^JSESSIONID=(.*?);\s*Path=(.*?);/i
  const match = setCookieHeader.match(regex)

  if (!match) {
    throw new JSessionParseError()
  }

  const [, value, path] = match

  return {
    name: 'JSSESSIONID',
    value,
    path: path || '/',
  }
}

export const createSession: HttpFunction = async (req, res) => {
  try {
    const { userToken } = req.body

    if (!userToken) {
      throw new MissingUserTokenError()
    }

    let sessionCookie: string
    try {
      sessionCookie = await firebaseAdminAuth.createSessionCookie(userToken, { expiresIn })
    }
    catch (error) {
      console.error('Error creating session cookie:', error)
      throw new CreateSessionCookieError({ error })
    }

    let deviceCookie: SessionCookie
    try {
      deviceCookie = await getJSessionFromDevice('IP', 'user', 'passwd')
    }
    catch (error) {
      console.error('Unable to login on device:', error)
      throw new DeviceLoginError({ error })
    }

    res.cookie(deviceCookie.name, deviceCookie.value, {
      httpOnly: true,
      secure: true,
      sameSite: 'strict',
      path: deviceCookie.path,
    })

    res.cookie('session', sessionCookie, {
      maxAge: expiresIn,
      httpOnly: true,
      secure: env.NODE_ENV === 'production',
      path: '/',
    })

    return res.json({ status: 'success' })
  }
  catch (error) {
    if (error instanceof Exception) {
      const statusCode = error.code === 'CREATE_SESSION_01' ? 400 : 401
      return res.status(statusCode).json({ message: error.message, code: error.code })
    }

    console.error('Unexpected error:', error)
    return res.status(500).json({ message: 'An unexpected error occurred' })
  }
}
