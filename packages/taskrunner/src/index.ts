import { dirname } from 'node:path'
import { fileURLToPath } from 'node:url'
import { consola } from 'consola'
import Bree from 'bree'

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)

const bree = new Bree({
  root: __dirname,
  logger: consola,
  jobs: [{
    name: 'ping-devices',
    interval: 'every 10 minute',
  }],
})

await bree.start()
