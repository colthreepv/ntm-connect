import type { AppEnv, VITE_ENV } from '@ntm-connect/shared/web-environment'

declare global {
  interface Window {
    __APP_ENV: AppEnv
  }
}

function getEnv(): AppEnv {
  const mode = import.meta.env.MODE as VITE_ENV
  if (mode === 'production') {
    return window.__APP_ENV
  }

  // fallback to import.meta for dev
  return {
    mode: import.meta.env.MODE as VITE_ENV,
    firebase: {
      apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
      authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
      projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
      storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
      messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
      appId: import.meta.env.VITE_FIREBASE_APP_ID,
    },
  } satisfies AppEnv
}

export const env = getEnv()

function getDomain(): string {
  if (env.mode === 'development') {
    return 'ntm-connect.local'
  }
  return window.location.hostname
}

export const browserProtocol = env.mode === 'production' ? 'https' : 'http'

export function serverDomain(): string {
  const domain = getDomain()
  return env.mode === 'production' ? domain : `${domain}:3000`
}

export function cookieDomain(): string {
  return getDomain()
}

export function proxyDomain(): string {
  const domain = getDomain()
  return env.mode === 'production' ? domain : `${domain}:3004`
}

export const sessionExpiry = 60 * 60 * 24 * 2 // 2 days
