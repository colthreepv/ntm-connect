import { Agent, fetch } from 'undici'
import { createException } from '@ntm-connect/shared/exception'

export interface SessionCookie {
  name: string
  value: string
  path: string
}

const DeviceLoginError = createException('Unable to login on device', 'DEVICE_UTILS_01')
const JSessionParseError = createException('Failed to parse JSESSIONID cookie', 'DEVICE_UTILS_02')

export async function getJSessionFromDevice(ip: string, username: string, password: string): Promise<SessionCookie> {
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
