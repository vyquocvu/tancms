/**
 * Catch-all API route handler for TanStack Start
 * Handles all /api/* requests using the centralized API manager
 */

import { createAPIFileRoute } from '@tanstack/start/api'
import { apiManager, type ApiConfig } from '~/lib/api-manager'

/**
 * Initialize API manager with configuration from environment
 */
function initializeApiManager(): void {
  const config: ApiConfig = {
    enableAuth: process.env.NODE_ENV === 'production' && !!process.env.API_KEYS,
    enableLogging: process.env.NODE_ENV !== 'test',
    corsEnabled: true,
    apiKeys: process.env.API_KEYS ? process.env.API_KEYS.split(',') : undefined
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
            return {
              success: false,
              error: 'Authentication required',
              details: ['API key is required. Provide it as ?api_key=your_key']
            }
          }

          if (!config.apiKeys?.includes(apiKey)) {
            return {
              success: false,
              error: 'Authentication failed',
              details: ['Invalid API key']
            }
          }

          return next()
        }
      })
    }
  }
}

// Initialize API manager
initializeApiManager()

function getResponseHeaders(response: { headers?: Record<string, string> }): Record<string, string> {
  return {
    'Content-Type': 'application/json',
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    ...(response.headers || {})
  }
}

export const Route = createAPIFileRoute('/api/$')({
  GET: async ({ request, params }) => {
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
        query
      })

      return new Response(JSON.stringify(response), {
        status: response.success ? 200 : 400,
        headers: getResponseHeaders(response as { headers?: Record<string, string> })
      })
    } catch (apiError) {
      console.error('API GET error:', apiError)
      return new Response(JSON.stringify({
        success: false,
        error: 'Internal server error',
        details: [apiError instanceof Error ? apiError.message : 'Unknown error']
      }), {
        status: 500,
        headers: { 'Content-Type': 'application/json' }
      })
    }
  },

  POST: async ({ request, params }) => {
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
      return new Response(JSON.stringify({
        success: false,
        error: 'Invalid JSON body',
        details: ['Request body must be valid JSON']
      }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      })
    }

    try {
      const response = await apiManager.handleRequest({
        method: 'POST',
        path,
        body,
        query
      })

      return new Response(JSON.stringify(response), {
        status: response.success ? 201 : 400,
        headers: getResponseHeaders(response as { headers?: Record<string, string> })
      })
    } catch (apiError) {
      console.error('API POST error:', apiError)
      return new Response(JSON.stringify({
        success: false,
        error: 'Internal server error',
        details: [apiError instanceof Error ? apiError.message : 'Unknown error']
      }), {
        status: 500,
        headers: { 'Content-Type': 'application/json' }
      })
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
      return new Response(JSON.stringify({
        success: false,
        error: 'Invalid JSON body',
        details: ['Request body must be valid JSON']
      }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      })
    }

    try {
      const response = await apiManager.handleRequest({
        method: 'PUT',
        path,
        body,
        query
      })

      return new Response(JSON.stringify(response), {
        status: response.success ? 200 : 400,
        headers: getResponseHeaders(response as { headers?: Record<string, string> })
      })
    } catch (apiError) {
      console.error('API PUT error:', apiError)
      return new Response(JSON.stringify({
        success: false,
        error: 'Internal server error',
        details: [apiError instanceof Error ? apiError.message : 'Unknown error']
      }), {
        status: 500,
        headers: { 'Content-Type': 'application/json' }
      })
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
        query
      })

      return new Response(JSON.stringify(response), {
        status: response.success ? 200 : 400,
        headers: getResponseHeaders(response as { headers?: Record<string, string> })
      })
    } catch (apiError) {
      console.error('API DELETE error:', apiError)
      return new Response(JSON.stringify({
        success: false,
        error: 'Internal server error',
        details: [apiError instanceof Error ? apiError.message : 'Unknown error']
      }), {
        status: 500,
        headers: { 'Content-Type': 'application/json' }
      })
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
        'Access-Control-Max-Age': '86400'
      }
    })
  }
})