import { dirname } from 'node:path'
import { fileURLToPath } from 'node:url'
import Bree from 'bree'
import { consola } from 'consola'
import { startBot } from './alert-bot.js'

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)

const bree = new Bree({
  root: __dirname,
  logger: consola,
  jobs: [{
    name: 'ping-devices',
    interval: 'every 10 minute',
  }, {
    name: 'cleanup-pings',
    interval: 'every 1 hour',
  }],
})

void startBot()
void bree.start()
