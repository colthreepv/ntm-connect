import type { AppEnv } from '@ntm-connect/shared/web-environment'
import { readFileSync } from 'node:fs'
import { dirname, join, relative } from 'node:path'
import { fileURLToPath } from 'node:url'

import { serveStatic } from '@hono/node-server/serve-static'
import { type Context, Hono } from 'hono'
import { env } from './config.js'

const __filename = fileURLToPath(import.meta.url)
const __dirnameVal = dirname(__filename)
const pages = new Hono()

// path to your app/dist folder
const distDir = join(__dirnameVal, '../../app/dist')

// hono wants a relative path, from where package.json is located
const packageDir = join(__dirnameVal, '..')
const relativeDist = relative(packageDir, distDir)

const indexPath = join(distDir, 'index.html')
const rawHtml = readFileSync(indexPath, 'utf-8')

function renderIndex(c: Context) {
  const appEnv: AppEnv = {
    mode: env.NODE_ENV,
    firebase: {
      apiKey: env.APP_FIREBASE_API_KEY,
      authDomain: env.APP_FIREBASE_AUTH_DOMAIN,
      projectId: env.FIREBASE_PROJECT_ID,
      storageBucket: env.APP_FIREBASE_STORAGE_BUCKET,
      messagingSenderId: env.APP_FIREBASE_MESSAGING_SENDER_ID,
      appId: env.APP_FIREBASE_APP_ID,
    },
  }

  const scriptInject = `
<script>
  window.__APP_ENV = ${JSON.stringify(appEnv)};
</script>
</body>
`

  const replaced = rawHtml.replace('</body>', scriptInject)
  return c.html(replaced)
}

if (env.NODE_ENV === 'production') {
  pages.use('/assets/*', serveStatic({ root: relativeDist }))
  pages.get('/', renderIndex)
  pages.get('/index.html', renderIndex)
}

export { pages }
