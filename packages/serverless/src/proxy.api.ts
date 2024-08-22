import type { HttpFunction } from '@google-cloud/functions-framework'

export const deviceRoute: HttpFunction = async (req, res) => {
  const deviceId = req.params.id // This might need adjustment based on how you're passing the device ID

  // Hardcoded endpoint for demonstration
  const deviceEndpoint = 'https://example-device.com/api'

  try {
    // Simple forward of the request to the device endpoint
    const response = await fetch(`${deviceEndpoint}/${deviceId}`, {
      method: req.method,
      headers: {
        'Content-Type': 'application/json',
        // You might want to forward other headers as needed
      },
      body: req.method !== 'GET' && req.method !== 'HEAD' ? JSON.stringify(req.body) : undefined,
    })

    const data = await response.json()

    // Forward the response back to the client
    res.status(response.status).json(data)
  }
  catch (error) {
    console.error('Error proxying request to device:', error)
    res.status(500).json({ error: 'Internal Server Error' })
  }
}
