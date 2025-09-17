/**
 * Standardized API Response Builder
 * Provides consistent response format and error handling for all API endpoints
 */

export type ApiErrorCode =
  | 'VALIDATION_ERROR'
  | 'NOT_FOUND'
  | 'AUTHENTICATION_REQUIRED'
  | 'AUTHENTICATION_FAILED'
  | 'AUTHORIZATION_FAILED'
  | 'METHOD_NOT_ALLOWED'
  | 'INTERNAL_SERVER_ERROR'
  | 'BAD_REQUEST'
  | 'CONFLICT'
  | 'RATE_LIMITED'

export type ApiResponseMeta = {
  requestId?: string
  timestamp: string
  version: string
  processingTime?: number
}

export type StandardApiResponse<T = unknown> = {
  success: boolean
  message: string
  data?: T
  error?: {
    code: ApiErrorCode
    message: string
    details?: string[]
    debug?: unknown
  }
  meta: ApiResponseMeta
}

export type ApiSuccessOptions<T = unknown> = {
  data?: T
  message?: string
  meta?: Partial<ApiResponseMeta>
}

export type ApiErrorOptions = {
  code: ApiErrorCode
  message?: string
  details?: string[]
  debug?: unknown
  meta?: Partial<ApiResponseMeta>
}

/**
 * HTTP status code mapping for error codes
 */
const ERROR_STATUS_MAP: Record<ApiErrorCode, number> = {
  VALIDATION_ERROR: 400,
  BAD_REQUEST: 400,
  AUTHENTICATION_REQUIRED: 401,
  AUTHENTICATION_FAILED: 401,
  AUTHORIZATION_FAILED: 403,
  NOT_FOUND: 404,
  METHOD_NOT_ALLOWED: 405,
  CONFLICT: 409,
  RATE_LIMITED: 429,
  INTERNAL_SERVER_ERROR: 500,
}

/**
 * Default error messages for error codes
 */
const DEFAULT_ERROR_MESSAGES: Record<ApiErrorCode, string> = {
  VALIDATION_ERROR: 'Validation failed',
  BAD_REQUEST: 'Bad request',
  AUTHENTICATION_REQUIRED: 'Authentication required',
  AUTHENTICATION_FAILED: 'Authentication failed',
  AUTHORIZATION_FAILED: 'Insufficient permissions',
  NOT_FOUND: 'Resource not found',
  METHOD_NOT_ALLOWED: 'Method not allowed',
  CONFLICT: 'Resource conflict',
  RATE_LIMITED: 'Rate limit exceeded',
  INTERNAL_SERVER_ERROR: 'Internal server error',
}

/**
 * API Response Builder Class
 */
export class ApiResponseBuilder {
  private static version = '1.0.0'

  private static get isProduction(): boolean {
    return process.env.NODE_ENV === 'production'
  }

  /**
   * Generate request metadata
   */
  private static generateMeta(options?: Partial<ApiResponseMeta>): ApiResponseMeta {
    return {
      requestId: options?.requestId || crypto.randomUUID(),
      timestamp: new Date().toISOString(),
      version: options?.version || this.version,
      processingTime: options?.processingTime,
    }
  }

  /**
   * Create a successful response
   */
  static success<T = unknown>(options: ApiSuccessOptions<T> = {}): StandardApiResponse<T> {
    return {
      success: true,
      message: options.message || 'Request completed successfully',
      data: options.data,
      meta: this.generateMeta(options.meta),
    }
  }

  /**
   * Create an error response
   */
  static error(options: ApiErrorOptions): StandardApiResponse {
    const errorMessage = options.message || DEFAULT_ERROR_MESSAGES[options.code]

    return {
      success: false,
      message: errorMessage,
      error: {
        code: options.code,
        message: errorMessage,
        details: options.details,
        // Only include debug info in non-production environments
        debug: !this.isProduction ? options.debug : undefined,
      },
      meta: this.generateMeta(options.meta),
    }
  }

  /**
   * Get HTTP status code for error code
   */
  static getStatusCode(errorCode: ApiErrorCode): number {
    return ERROR_STATUS_MAP[errorCode] || 500
  }

  /**
   * Convert legacy response format to standardized format
   */
  static fromLegacy(legacyResponse: {
    success: boolean
    data?: unknown
    error?: string
    details?: string[]
  }): StandardApiResponse {
    if (legacyResponse.success) {
      return this.success({
        data: legacyResponse.data,
        message: 'Request completed successfully',
      })
    } else {
      return this.error({
        code: 'INTERNAL_SERVER_ERROR',
        message: legacyResponse.error || 'Unknown error',
        details: legacyResponse.details,
      })
    }
  }

  /**
   * Create HTTP Response object with standardized format
   */
  static createHttpResponse<T = unknown>(
    response: StandardApiResponse<T>,
    headers: Record<string, string> = {}
  ): Response {
    const statusCode = response.success ? 200 : this.getStatusCode(response.error!.code)

    const defaultHeaders = {
      'Content-Type': 'application/json',
      'X-Request-ID': response.meta.requestId || crypto.randomUUID(),
      'X-API-Version': response.meta.version,
    }

    return new Response(JSON.stringify(response), {
      status: statusCode,
      headers: { ...defaultHeaders, ...headers },
    })
  }

  /**
   * Convenience method for validation errors
   */
  static validationError(details: string[], message?: string): StandardApiResponse {
    return this.error({
      code: 'VALIDATION_ERROR',
      message: message || 'Validation failed',
      details,
    })
  }

  /**
   * Convenience method for not found errors
   */
  static notFound(resource: string, identifier?: string): StandardApiResponse {
    const message = identifier
      ? `${resource} with identifier '${identifier}' not found`
      : `${resource} not found`

    return this.error({
      code: 'NOT_FOUND',
      message,
      details: [message],
    })
  }

  /**
   * Convenience method for authentication errors
   */
  static authRequired(message?: string): StandardApiResponse {
    return this.error({
      code: 'AUTHENTICATION_REQUIRED',
      message: message || 'Authentication required',
      details: message ? [message] : undefined,
    })
  }

  /**
   * Convenience method for method not allowed errors
   */
  static methodNotAllowed(method: string, path: string): StandardApiResponse {
    return this.error({
      code: 'METHOD_NOT_ALLOWED',
      message: `HTTP method '${method}' is not allowed for '${path}'`,
      details: [`HTTP method '${method}' is not supported for this endpoint`],
    })
  }

  /**
   * Convenience method for internal server errors
   */
  static internalError(error: unknown, details?: string[]): StandardApiResponse {
    const errorMessage = error instanceof Error ? error.message : String(error)
    return this.error({
      code: 'INTERNAL_SERVER_ERROR',
      message: 'Internal server error',
      details: details || [errorMessage],
      debug: !this.isProduction ? error : undefined,
    })
  }
}

/**
 * Legacy compatibility - export the type as ApiResponse for backward compatibility
 */
export type ApiResponse<T = unknown> = StandardApiResponse<T>
