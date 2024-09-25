import { handle } from 'hono/vercel'

function createHandler() {
  return async (req: Request, context: any) => {
    const { app } = await import('@/server')
    const honoHandler = handle(app)
    return honoHandler(req, context)
  }
}

export const OPTIONS = createHandler()
export const GET = createHandler()
export const POST = createHandler()
export const PUT = createHandler()
export const PATCH = createHandler()
export const DELETE = createHandler()
