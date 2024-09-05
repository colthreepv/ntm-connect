import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export function middleware() {
  const response = NextResponse.next()

  // Check if it's a development environment
  if (process.env.NODE_ENV === 'development') {
    // Set CORS headers
    response.headers.set('Access-Control-Allow-Origin', '*')
    response.headers.set('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS')
    response.headers.set('Access-Control-Allow-Headers', 'Content-Type, Authorization')
  }

  return response
}

export const config = {
  matcher: '/:path*',
}
