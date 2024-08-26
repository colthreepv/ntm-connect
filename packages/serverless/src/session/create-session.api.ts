import { join as pathJoin } from 'node:path/posix'
import type { HttpFunction } from '@google-cloud/functions-framework'
import { Agent, fetch } from 'undici'
import { fetchSalePointCredentials, firebaseAdminAuth } from '../firebase.js'
import { env, sessionPrefix } from '../config.js'
import { Exception, createException } from '../exception.js'

const expiresIn = 60 * 60 * 24 * 2 * 1000 // 2 days

interface SessionCookie {
  name: string
  value: string
  path: string
}

const MissingUserTokenError = createException('ID Token is required', 'CREATE_SESSION_01')
const CreateSessionCookieError = createException('Error creating firebase session cookie, probably expired', 'CREATE_SESSION_02')
const DeviceLoginError = createException('Unable to login on device', 'CREATE_SESSION_03')
const JSessionParseError = createException('Failed to parse JSESSIONID cookie', 'CREATE_SESSION_04')
const MissingSalePointIdError = createException('SalePointId is required', 'CREATE_SESSION_05')

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
  formData.append('browser', 'FF')
  formData.append('screenw', '2560')
  formData.append('screenh', '1440')
  formData.append('cmd', 'normal')
  formData.append('pagetype', 'standard')
  formData.append('txtEnterPassword', 'Inserisci la password')
  formData.append('txtStandardPassword', 'La password deve essere composta di almeno 6 caratteri')
  formData.append('txtStrictPassword', 'La password deve essere lunga almeno 8 caratteri, deve contenere almeno un numero e uno dei seguenti simboli: . , _ ! ? $ % &')
  formData.append('txtConfPwdIncorrect', 'La password di conferma non è corretta')
  formData.append('txtLanguage', 'IT_it')
  formData.append('txtAutoLogin', '')
  formData.append('npassword', '')
  formData.append('cpassword', '')

  const response = await fetch(loginUrl, {
    method: 'POST',
    body: formData,
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    dispatcher: agent,
  })

  if (!response.ok) {
    throw new DeviceLoginError({ reason: `statusCode: ${response.status}` })
  }

  const setCookieHeader = response.headers.get('set-cookie')
  if (setCookieHeader == null) {
    throw new DeviceLoginError({ reason: 'device responded without JSESSION' })
  }

  const regex = /^JSESSIONID=(.*?);\s*Path=(.*?);/i
  const match = setCookieHeader.match(regex)

  if (!match) {
    throw new JSessionParseError()
  }

  const responseBody = await response.text()
  if (responseBody.includes('txtPassword'))
    throw new DeviceLoginError({ reason: 'device responded with login page' })

  const [, value, path] = match

  return {
    name: 'JSESSIONID',
    value,
    path: path || '/',
  }
}

/**
 * Creates a new session for the user and logs in on the device.
 * @param req.body.userToken The Firebase ID token of the user.
 * @param req.body.salePointId The ID of the sale point to log in on.
 * @returns A JSON response with a success message.
 * @throws {@link MissingUserTokenError} If the user token is missing.
 * @throws {@link MissingSalePointIdError} If the sale point ID is missing.
 * @throws {@link CreateSessionCookieError} If there's an error creating the session cookie.
 * @throws {@link DeviceLoginError} If there's an error logging in on the device.
 */
export const createSession: HttpFunction = async (req, res) => {
  try {
    const { userToken, salePointId } = req.body

    if (userToken == null)
      throw new MissingUserTokenError()

    if (salePointId == null)
      throw new MissingSalePointIdError()

    let sessionCookie: string
    try {
      sessionCookie = await firebaseAdminAuth.createSessionCookie(userToken, { expiresIn })
    }
    catch (error) {
      console.error('Error creating session cookie:', error)
      throw new CreateSessionCookieError({ cause: error })
    }

    const credentials = await fetchSalePointCredentials(salePointId)

    let deviceCookie: SessionCookie
    try {
      deviceCookie = await getJSessionFromDevice(credentials.publicIp, credentials.username, credentials.password)
    }
    catch (error) {
      console.error('Unable to login on device:', error)
      throw new DeviceLoginError({ cause: error })
    }

    res.cookie(deviceCookie.name, deviceCookie.value, {
      httpOnly: true,
      // secure: true,
      sameSite: 'strict',
      path: pathJoin(sessionPrefix, salePointId, deviceCookie.path),
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
