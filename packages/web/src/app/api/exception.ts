import type { Exception, ExceptionCode } from '@ntm-connect/shared/exception'
import { NextResponse } from 'next/server'

export interface JsonException {
  code: ExceptionCode
  message: string
  cause?: Error | unknown
}

export function returnError(e: Exception, statusCode: number = 500) {
  const withCause = process.env.NODE_ENV === 'development'
  const payload: JsonException = {
    code: e.code,
    message: e.message,
  }

  if (withCause && e.cause != null)
    payload.cause = e.cause

  return NextResponse.json(payload, { status: statusCode })
}
