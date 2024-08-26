export type ExceptionCode = string | number
const exceptionCodes = new Set<ExceptionCode>()

type NonEmptyObject<T> = T & { [K in keyof T]: T[K] }

interface ExceptionDetails {
  cause?: Error | unknown
  reason?: string
}

type ValidExceptionDetails = NonEmptyObject<Partial<ExceptionDetails>>

export class Exception<T extends ValidExceptionDetails | undefined = undefined> extends Error {
  constructor(
    message: string,
    public readonly code: ExceptionCode,
    public readonly details?: T,
  ) {
    super(message)
    this.name = this.constructor.name

    if (Error.captureStackTrace) {
      Error.captureStackTrace(this, this.constructor)
    }
  }
}

export function createException<T extends ValidExceptionDetails>(
  message: string,
  code: ExceptionCode,
) {
  if (exceptionCodes.has(code)) {
    throw new Error(`Exception code '${code}' is already in use. Each exception must have a unique code.`)
  }
  exceptionCodes.add(code)

  return class extends Exception<T> {
    constructor(details?: T) {
      super(message, code, details)
    }
  }
}
