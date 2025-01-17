import type { RequestOptions } from 'node:https'
import { Buffer } from 'node:buffer'
import { createException } from '@ntm-connect/shared/exception'
import { httpsRequest } from '@ntm-connect/shared/request'

export interface SessionCookie {
  name: string
  value: string
  path: string
}

const DeviceLoginError = createException('Unable to login on device', 'DEVICE_UTILS_01')
const JSessionParseError = createException('Failed to parse JSESSIONID cookie', 'DEVICE_UTILS_02')

export async function getJSessionFromDevice(ip: string, port: number, username: string, password: string): Promise<SessionCookie> {
  const loginUrl = `/boss/servlet/login`
  const formData = new URLSearchParams({
    txtUser: username,
    txtPassword: password,
    browser: 'FF',
    screenw: '2560',
    screenh: '1440',
    cmd: 'normal',
    pagetype: 'standard',
    txtEnterPassword: 'Inserisci la password',
    txtStandardPassword: 'La password deve essere composta di almeno 6 caratteri',
    txtStrictPassword: 'La password deve essere lunga almeno 8 caratteri, deve contenere almeno un numero e uno dei seguenti simboli: . , _ ! ? $ % &',
    txtConfPwdIncorrect: 'La password di conferma non è corretta',
    txtLanguage: 'IT_it',
    txtAutoLogin: '',
    npassword: '',
    cpassword: '',
  }).toString()

  const options: RequestOptions = {
    hostname: ip,
    port,
    path: loginUrl,
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    rejectUnauthorized: false,
  }

  const { data, response } = await httpsRequest(options, Buffer.from(formData))

  if (response.statusCode !== 200) {
    throw new DeviceLoginError({ reason: `statusCode: ${response.statusCode}` })
  }

  const setCookieHeader = response.headers['set-cookie']
  if (!setCookieHeader || setCookieHeader.length === 0) {
    throw new DeviceLoginError({ reason: 'device responded without JSESSION' })
  }

  const regex = /^JSESSIONID=(.*?);\s*Path=(.*?);/i
  const match = setCookieHeader[0].match(regex)

  if (!match) {
    throw new JSessionParseError()
  }

  const responseBody = data.toString()
  if (responseBody.includes('txtPassword'))
    throw new DeviceLoginError({ reason: 'device responded with login page' })

  const [, value, path] = match

  return {
    name: 'JSESSIONID',
    value,
    path: path || '/',
  }
}
