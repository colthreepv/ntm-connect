export type ExceptionCode = string | number
const exceptionCodes = new Set<ExceptionCode>()

export class Exception extends Error {
  constructor(
    message: string,
    public readonly code: ExceptionCode,
    public readonly details?: Record<string, unknown>,
  ) {
    super(message)
    this.name = this.constructor.name

    // Maintains proper stack trace for where our error was thrown (only available on V8)
    if (Error.captureStackTrace) {
      Error.captureStackTrace(this, this.constructor)
    }
  }
}

export function createException(message: string, code: ExceptionCode) {
  if (exceptionCodes.has(code)) {
    throw new Error(`Exception code '${code}' is already in use. Each exception must have a unique code.`)
  }
  exceptionCodes.add(code)

  return class extends Exception {
    constructor(details?: Record<string, unknown>) {
      super(message, code, details)
    }
  }
}
