/**
 * Catch-all API route handler for TanStack Start
 * Handles all /api/* requests using the centralized API manager
 */

import { createAPIFileRoute } from '@tanstack/start/api'
import { apiManager, type ApiConfig } from '~/lib/api-manager'
import { ApiResponseBuilder } from '~/lib/api-response'
import { 
  applySecurityHeaders, 
  createRateLimitMiddleware,
  validateRequestSize 
} from '~/server/security-headers'
import { sanitizeApiInput } from '~/lib/security/sanitization'
import { createComprehensiveCSRFProtection } from '~/lib/security/csrf'

/**
 * Initialize API manager with configuration from environment
 */
function initializeApiManager(): void {
  const config: ApiConfig = {
    enableAuth: process.env.NODE_ENV === 'production' && !!process.env.API_KEYS,
    enableLogging: process.env.NODE_ENV !== 'test',
    corsEnabled: true,
    apiKeys: process.env.API_KEYS ? process.env.API_KEYS.split(',') : undefined,
  }

  // Configure the API manager if needed
  if (config.enableAuth || !config.enableLogging) {
    // We could create a new instance here, but for simplicity we'll modify the existing one
    if (config.apiKeys) {
      apiManager.addMiddleware({
        name: 'auth',
        handler: async (request, next) => {
          if (request.path === '/api/status') {
            return next()
          }

          const apiKey = request.query?.['api_key'] || request.query?.['apiKey']

          if (!apiKey) {
            return ApiResponseBuilder.authRequired(
              'API key is required. Provide it as ?api_key=your_key'
            )
          }

          if (!config.apiKeys?.includes(apiKey)) {
            return ApiResponseBuilder.error({
              code: 'AUTHENTICATION_FAILED',
              message: 'Invalid API key provided',
              details: ['The provided API key is not valid'],
            })
          }

          return next()
        },
      })
    }
  }
}

/**
 * Create rate limiter for API endpoints
 */
const rateLimiter = createRateLimitMiddleware({
  windowMs: 15 * 60 * 1000, // 15 minutes
  maxRequests: 100,
  message: 'Too many API requests, please try again later.',
})

/**
 * Create CSRF protection
 */
const csrfProtection = createComprehensiveCSRFProtection()

/**
 * Apply security middleware to request
 */
function applySecurityMiddleware(request: Request): Response | null {
  // Validate request size
  if (!validateRequestSize(request, 10 * 1024 * 1024)) { // 10MB limit
    return new Response(
      JSON.stringify({
        error: 'Request too large',
        message: 'Request payload exceeds maximum allowed size',
      }),
      {
        status: 413,
        headers: { 'Content-Type': 'application/json' },
      }
    )
  }

  // Apply rate limiting
  const rateLimitResponse = rateLimiter(request)
  if (rateLimitResponse) {
    return rateLimitResponse
  }

  // Apply CSRF protection
  const csrfResult = csrfProtection(request)
  if (csrfResult.response) {
    return csrfResult.response
  }

  return null
}

/**
 * Process and sanitize request body
 */
async function processRequestBody(request: Request): Promise<unknown> {
  try {
    const text = await request.text()
    if (!text) return undefined

    const body = JSON.parse(text)
    
    // Sanitize the request body
    return sanitizeApiInput(body)
  } catch {
    throw new Error('Invalid JSON in request body')
  }
}

// Initialize API manager
initializeApiManager()

export const Route = createAPIFileRoute('/api/$')({
  GET: async ({ request, params }) => {
    // Apply security middleware
    const securityResponse = applySecurityMiddleware(request)
    if (securityResponse) {
      return applySecurityHeaders(securityResponse)
    }

    const url = new URL(request.url)
    const path = `/api/${params._splat || ''}`
    const query: Record<string, string> = {}

    // Convert URLSearchParams to plain object
    url.searchParams.forEach((value, key) => {
      query[key] = value
    })

    try {
      const response = await apiManager.handleRequest({
        method: 'GET',
        path,
        query,
      })

      const httpResponse = ApiResponseBuilder.createHttpResponse(response, {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type, Authorization',
      })

      // Apply security headers
      return applySecurityHeaders(httpResponse)
    } catch (apiError) {
      console.error('API GET error:', apiError)
      const errorResponse = ApiResponseBuilder.internalError(apiError)
      const httpResponse = ApiResponseBuilder.createHttpResponse(errorResponse)
      return applySecurityHeaders(httpResponse)
    }
  },

  POST: async ({ request, params }) => {
    // Apply security middleware
    const securityResponse = applySecurityMiddleware(request)
    if (securityResponse) {
      return applySecurityHeaders(securityResponse)
    }

    const url = new URL(request.url)
    const path = `/api/${params._splat || ''}`
    const query: Record<string, string> = {}

    // Convert URLSearchParams to plain object
    url.searchParams.forEach((value, key) => {
      query[key] = value
    })

    let body: unknown
    try {
      body = await processRequestBody(request)
    } catch (error) {
      const errorResponse = ApiResponseBuilder.error({
        code: 'BAD_REQUEST',
        message: error instanceof Error ? error.message : 'Invalid JSON in request body',
        details: ['Request body must contain valid JSON'],
      })
      const httpResponse = ApiResponseBuilder.createHttpResponse(errorResponse)
      return applySecurityHeaders(httpResponse)
    }

    try {
      const response = await apiManager.handleRequest({
        method: 'POST',
        path,
        body,
        query,
      })

      const httpResponse = ApiResponseBuilder.createHttpResponse(response, {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type, Authorization',
      })

      // Apply security headers
      return applySecurityHeaders(httpResponse)
    } catch (apiError) {
      console.error('API POST error:', apiError)
      const errorResponse = ApiResponseBuilder.internalError(apiError)
      const httpResponse = ApiResponseBuilder.createHttpResponse(errorResponse)
      return applySecurityHeaders(httpResponse)
    }
  },

  PUT: async ({ request, params }) => {
    const url = new URL(request.url)
    const path = `/api/${params._splat || ''}`
    const query: Record<string, string> = {}

    // Convert URLSearchParams to plain object
    url.searchParams.forEach((value, key) => {
      query[key] = value
    })

    let body: unknown
    try {
      const text = await request.text()
      body = text ? JSON.parse(text) : undefined
    } catch {
      const errorResponse = ApiResponseBuilder.error({
        code: 'BAD_REQUEST',
        message: 'Invalid JSON in request body',
        details: ['Request body must contain valid JSON'],
      })
      return ApiResponseBuilder.createHttpResponse(errorResponse)
    }

    try {
      const response = await apiManager.handleRequest({
        method: 'PUT',
        path,
        body,
        query,
      })

      return ApiResponseBuilder.createHttpResponse(response, {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type, Authorization',
      })
    } catch (apiError) {
      console.error('API PUT error:', apiError)
      const errorResponse = ApiResponseBuilder.internalError(apiError)
      return ApiResponseBuilder.createHttpResponse(errorResponse)
    }
  },

  DELETE: async ({ request, params }) => {
    const url = new URL(request.url)
    const path = `/api/${params._splat || ''}`
    const query: Record<string, string> = {}

    // Convert URLSearchParams to plain object
    url.searchParams.forEach((value, key) => {
      query[key] = value
    })

    try {
      const response = await apiManager.handleRequest({
        method: 'DELETE',
        path,
        query,
      })

      return ApiResponseBuilder.createHttpResponse(response, {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type, Authorization',
      })
    } catch (apiError) {
      console.error('API DELETE error:', apiError)
      const errorResponse = ApiResponseBuilder.internalError(apiError)
      return ApiResponseBuilder.createHttpResponse(errorResponse)
    }
  },

  OPTIONS: async () => {
    // Handle CORS preflight requests
    return new Response(null, {
      status: 204,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type, Authorization',
        'Access-Control-Max-Age': '86400',
      },
    })
  },
})
