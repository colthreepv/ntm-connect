import express from 'express'
import bodyParser from 'body-parser'
import cookieParser from 'cookie-parser'
import { sessionPrefix } from './config.js'
import { clearSession, createSession, deviceRoute, hello } from './index.js'

const app = express()
const port = 8080

// Middleware
app.use(bodyParser.json())
app.use(bodyParser.urlencoded({ extended: true }))
app.use(cookieParser())

// Routes
app.get('/hello', hello)
app.all(`${sessionPrefix}/*`, deviceRoute)
app.post('/session', createSession)
app.post('/session/clear', clearSession)

// Start server
app.listen(port, () => {
  console.log(`Dev server running at http://localhost:${port}`)
})
