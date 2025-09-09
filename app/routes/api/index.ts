/**
 * API Router for dynamic content types
 * Handles REST endpoints for content entries
 */

import { ContentAPI, type ApiResponse } from './content-api'

export type HttpMethod = 'GET' | 'POST' | 'PUT' | 'DELETE'

export type ApiRequest = {
  method: HttpMethod
  path: string
  body?: unknown
  query?: Record<string, string>
}

/**
 * Simple API router that handles dynamic content type endpoints
 */
export class ApiRouter {
  /**
   * Route an API request to the appropriate handler
   */
  static async route(request: ApiRequest): Promise<ApiResponse> {
    const { method, path, body, query } = request
    
    // Handle special status endpoint
    if (path === '/api/status') {
      if (method === 'GET') {
        return {
          success: true,
          data: {
            status: 'healthy',
            timestamp: new Date().toISOString(),
            version: '1.0.0'
          }
        }
      } else {
        return {
          success: false,
          error: 'Method not allowed',
          details: [`HTTP method '${method}' is not supported for status endpoint`]
        }
      }
    }
    
    // Parse the path to extract content type and entry ID
    const pathParts = path.split('/').filter(Boolean) // Remove empty parts
    
    // Expected format: ['api', contentTypeSlug] or ['api', contentTypeSlug, entryId]
    if (pathParts.length < 2 || pathParts[0] !== 'api') {
      return {
        success: false,
        error: 'Invalid API path',
        details: ['API path must start with /api/']
      }
    }

    const contentTypeSlug = pathParts[1]
    const entryId = pathParts[2]

    try {
      switch (method) {
        case 'GET':
          if (entryId) {
            // GET /api/{contentType}/:id - Get single entry
            return await ContentAPI.getEntry(contentTypeSlug, entryId)
          } else {
            // GET /api/{contentType} - List entries
            const params = {
              page: query?.page ? parseInt(query.page, 10) : undefined,
              limit: query?.limit ? parseInt(query.limit, 10) : undefined,
              search: query?.search
            }
            return await ContentAPI.listEntries(contentTypeSlug, params)
          }

        case 'POST':
          if (entryId) {
            return {
              success: false,
              error: 'Method not allowed',
              details: ['POST requests should not include an entry ID']
            }
          }
          // POST /api/{contentType} - Create new entry
          if (!body || typeof body !== 'object') {
            return {
              success: false,
              error: 'Invalid request body',
              details: ['Request body is required for POST requests']
            }
          }
          return await ContentAPI.createEntry(contentTypeSlug, body as {
          slug?: string
          fieldValues: { fieldId: string; value: string }[]
        })

        case 'PUT':
          if (!entryId) {
            return {
              success: false,
              error: 'Entry ID required',
              details: ['PUT requests must include an entry ID']
            }
          }
          // PUT /api/{contentType}/:id - Update entry
          if (!body || typeof body !== 'object') {
            return {
              success: false,
              error: 'Invalid request body',
              details: ['Request body is required for PUT requests']
            }
          }
          return await ContentAPI.updateEntry(contentTypeSlug, entryId, body as {
          slug?: string
          fieldValues?: { fieldId: string; value: string }[]
        })

        case 'DELETE':
          if (!entryId) {
            return {
              success: false,
              error: 'Entry ID required',
              details: ['DELETE requests must include an entry ID']
            }
          }
          // DELETE /api/{contentType}/:id - Delete entry
          return await ContentAPI.deleteEntry(contentTypeSlug, entryId)

        default:
          return {
            success: false,
            error: 'Method not allowed',
            details: [`HTTP method '${method}' is not supported`]
          }
      }
    } catch (error) {
      console.error('API Router error:', error)
      return {
        success: false,
        error: 'Internal server error',
        details: [error instanceof Error ? error.message : 'Unknown error']
      }
    }
  }

  /**
   * Helper method to create a fetch-like API client
   */
  static async fetch(path: string, options: {
    method?: HttpMethod
    body?: unknown
    query?: Record<string, string>
  } = {}): Promise<ApiResponse> {
    const { method = 'GET', body, query } = options
    
    return await this.route({
      method,
      path,
      body,
      query
    })
  }
}

/**
 * Convenience functions for common API operations
 * @deprecated Use the new api from ~/lib/api-manager instead
 */
export const api = {
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

    return await ApiRouter.fetch(`/api/${contentTypeSlug}`, { query })
  },

  /**
   * Get a single entry
   */
  async getEntry(contentTypeSlug: string, entryId: string) {
    return await ApiRouter.fetch(`/api/${contentTypeSlug}/${entryId}`)
  },

  /**
   * Create a new entry
   */
  async createEntry(contentTypeSlug: string, data: {
    slug?: string
    fieldValues: { fieldId: string; value: string }[]
  }) {
    return await ApiRouter.fetch(`/api/${contentTypeSlug}`, {
      method: 'POST',
      body: data
    })
  },

  /**
   * Update an entry
   */
  async updateEntry(contentTypeSlug: string, entryId: string, data: {
    slug?: string
    fieldValues?: { fieldId: string; value: string }[]
  }) {
    return await ApiRouter.fetch(`/api/${contentTypeSlug}/${entryId}`, {
      method: 'PUT',
      body: data
    })
  },

  /**
   * Delete an entry
   */
  async deleteEntry(contentTypeSlug: string, entryId: string) {
    return await ApiRouter.fetch(`/api/${contentTypeSlug}/${entryId}`, {
      method: 'DELETE'
    })
  }
}