/**
 * Centralized API Manager for REST API endpoints
 * Coordinates all API operations and provides middleware support
 */

import { ApiRouter, type ApiRequest, type HttpMethod } from '~/routes/api'
import { type ApiResponse } from '~/routes/api/content-api'

export type ApiMiddleware = {
  name: string
  handler: (request: ApiRequest, next: () => Promise<ApiResponse>) => Promise<ApiResponse>
}

export type ApiConfig = {
  enableAuth?: boolean
  enableLogging?: boolean
  apiKeys?: string[]
  corsEnabled?: boolean
  rateLimit?: {
    windowMs: number
    maxRequests: number
  }
}

/**
 * Centralized API Manager that handles all REST API operations
 */
export class ApiManager {
  private middlewares: ApiMiddleware[] = []
  private config: ApiConfig

  constructor(config: ApiConfig = {}) {
    this.config = {
      enableAuth: false,
      enableLogging: true,
      corsEnabled: true,
      ...config
    }

    // Add built-in middlewares
    if (this.config.enableLogging) {
      this.addMiddleware(this.createLoggingMiddleware())
    }

    if (this.config.enableAuth && this.config.apiKeys) {
      this.addMiddleware(this.createAuthMiddleware())
    }

    if (this.config.corsEnabled) {
      this.addMiddleware(this.createCorsMiddleware())
    }
  }

  /**
   * Add a middleware to the API manager
   */
  addMiddleware(middleware: ApiMiddleware) {
    this.middlewares.push(middleware)
  }

  /**
   * Remove a middleware by name
   */
  removeMiddleware(name: string) {
    this.middlewares = this.middlewares.filter(m => m.name !== name)
  }

  /**
   * Process an API request through all middlewares and route to the appropriate handler
   */
  async handleRequest(request: ApiRequest): Promise<ApiResponse> {
    let middlewareIndex = 0

    const next = async (): Promise<ApiResponse> => {
      if (middlewareIndex < this.middlewares.length) {
        const middleware = this.middlewares[middlewareIndex++]
        return await middleware.handler(request, next)
      } else {
        // All middlewares processed, route the request
        return await ApiRouter.route(request)
      }
    }

    try {
      return await next()
    } catch (error) {
      console.error('API Manager error:', error)
      return {
        success: false,
        error: 'Internal server error',
        details: [error instanceof Error ? error.message : 'Unknown error']
      }
    }
  }

  /**
   * Convenience method for GET requests
   */
  async get(path: string, query?: Record<string, string>): Promise<ApiResponse> {
    return this.handleRequest({
      method: 'GET',
      path,
      query
    })
  }

  /**
   * Convenience method for POST requests
   */
  async post(path: string, body: unknown): Promise<ApiResponse> {
    return this.handleRequest({
      method: 'POST',
      path,
      body
    })
  }

  /**
   * Convenience method for PUT requests
   */
  async put(path: string, body: unknown): Promise<ApiResponse> {
    return this.handleRequest({
      method: 'PUT',
      path,
      body
    })
  }

  /**
   * Convenience method for DELETE requests
   */
  async delete(path: string): Promise<ApiResponse> {
    return this.handleRequest({
      method: 'DELETE',
      path
    })
  }

  /**
   * Get API status and health information
   */
  async getStatus(): Promise<ApiResponse> {
    return {
      success: true,
      data: {
        status: 'healthy',
        timestamp: new Date().toISOString(),
        version: '1.0.0',
        middlewares: this.middlewares.map(m => m.name),
        config: {
          enableAuth: this.config.enableAuth,
          enableLogging: this.config.enableLogging,
          corsEnabled: this.config.corsEnabled
        }
      }
    }
  }

  /**
   * Built-in logging middleware
   */
  private createLoggingMiddleware(): ApiMiddleware {
    return {
      name: 'logging',
      handler: async (request: ApiRequest, next: () => Promise<ApiResponse>): Promise<ApiResponse> => {
        const startTime = Date.now()
        console.log(`[API] ${request.method} ${request.path}`, {
          query: request.query,
          hasBody: !!request.body
        })

        const response = await next()
        const duration = Date.now() - startTime

        console.log(`[API] ${request.method} ${request.path} - ${response.success ? 'SUCCESS' : 'ERROR'} (${duration}ms)`, {
          success: response.success,
          error: response.error
        })

        return response
      }
    }
  }

  /**
   * Built-in authentication middleware
   */
  private createAuthMiddleware(): ApiMiddleware {
    return {
      name: 'auth',
      handler: async (request: ApiRequest, next: () => Promise<ApiResponse>): Promise<ApiResponse> => {
        // Skip auth for status endpoint
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

        if (!this.config.apiKeys?.includes(apiKey)) {
          return {
            success: false,
            error: 'Authentication failed',
            details: ['Invalid API key']
          }
        }

        return next()
      }
    }
  }

  /**
   * Built-in CORS middleware
   */
  private createCorsMiddleware(): ApiMiddleware {
    return {
      name: 'cors',
      handler: async (_request: ApiRequest, next: () => Promise<ApiResponse>): Promise<ApiResponse> => {
        const response = await next()
        
        // Add CORS headers to the response (these would be used in actual HTTP responses)
        return {
          ...response,
          headers: {
            'Access-Control-Allow-Origin': '*',
            'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
            'Access-Control-Allow-Headers': 'Content-Type, Authorization'
          }
        } as ApiResponse & { headers: Record<string, string> }
      }
    }
  }
}

/**
 * Default API manager instance
 */
export const apiManager = new ApiManager({
  enableAuth: false, // Can be enabled by setting API keys
  enableLogging: true,
  corsEnabled: true
})

/**
 * Configure API manager with authentication
 */
export function configureApiManager(config: ApiConfig) {
  return new ApiManager(config)
}

/**
 * Convenience API functions that use the default manager
 */
export const api = {
  /**
   * Handle any API request
   */
  async request(method: HttpMethod, path: string, options: {
    body?: unknown
    query?: Record<string, string>
  } = {}): Promise<ApiResponse> {
    return apiManager.handleRequest({
      method,
      path,
      body: options.body,
      query: options.query
    })
  },

  /**
   * List entries for a content type
   */
  async listEntries(contentTypeSlug: string, params?: {
    page?: number
    limit?: number
    search?: string
  }) {
    const query: Record<string, string> = {}
    if (params?.page) query.page = params.page.toString()
    if (params?.limit) query.limit = params.limit.toString()
    if (params?.search) query.search = params.search

    return apiManager.get(`/api/${contentTypeSlug}`, query)
  },

  /**
   * Get a single entry
   */
  async getEntry(contentTypeSlug: string, entryId: string) {
    return apiManager.get(`/api/${contentTypeSlug}/${entryId}`)
  },

  /**
   * Create a new entry
   */
  async createEntry(contentTypeSlug: string, data: {
    slug?: string
    fieldValues: { fieldId: string; value: string }[]
  }) {
    return apiManager.post(`/api/${contentTypeSlug}`, data)
  },

  /**
   * Update an entry
   */
  async updateEntry(contentTypeSlug: string, entryId: string, data: {
    slug?: string
    fieldValues?: { fieldId: string; value: string }[]
  }) {
    return apiManager.put(`/api/${contentTypeSlug}/${entryId}`, data)
  },

  /**
   * Delete an entry
   */
  async deleteEntry(contentTypeSlug: string, entryId: string) {
    return apiManager.delete(`/api/${contentTypeSlug}/${entryId}`)
  },

  /**
   * Get API status
   */
  async getStatus() {
    return apiManager.getStatus()
  }
}