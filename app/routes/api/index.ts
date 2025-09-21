/**
 * API Router for dynamic content types
 * Handles REST endpoints for content entries
 */

import { ContentAPI, type ApiResponse } from './content-api'
import { ApiResponseBuilder } from '~/lib/api-response'

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
        return ApiResponseBuilder.success({
          message: 'API is healthy and operational',
          data: {
            status: 'healthy',
            timestamp: new Date().toISOString(),
            version: '1.0.0',
          },
        })
      } else {
        return ApiResponseBuilder.methodNotAllowed(method, path)
      }
    }

    // Parse the path to extract content type and entry ID
    const pathParts = path.split('/').filter(Boolean) // Remove empty parts

    // Expected format: ['api', contentTypeSlug] or ['api', contentTypeSlug, entryId]
    if (pathParts.length < 2 || pathParts[0] !== 'api') {
      return ApiResponseBuilder.error({
        code: 'BAD_REQUEST',
        message: 'Invalid API path format',
        details: ['API path must start with /api/ and include a content type slug'],
      })
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
              search: query?.search,
            }
            return await ContentAPI.listEntries(contentTypeSlug, params)
          }

        case 'POST':
          if (entryId) {
            return ApiResponseBuilder.methodNotAllowed(method, path)
          }
          // POST /api/{contentType} - Create new entry
          if (!body || typeof body !== 'object') {
            return ApiResponseBuilder.error({
              code: 'BAD_REQUEST',
              message: 'Request body is required',
              details: ['POST requests must include a valid JSON body'],
            })
          }
          return await ContentAPI.createEntry(
            contentTypeSlug,
            body as {
              slug?: string
              fieldValues: { fieldId: string; value: string }[]
            }
          )

        case 'PUT':
          if (!entryId) {
            return ApiResponseBuilder.error({
              code: 'BAD_REQUEST',
              message: 'Entry ID is required for PUT requests',
              details: ['PUT requests must include an entry ID in the path'],
            })
          }
          // PUT /api/{contentType}/:id - Update entry
          if (!body || typeof body !== 'object') {
            return ApiResponseBuilder.error({
              code: 'BAD_REQUEST',
              message: 'Request body is required',
              details: ['PUT requests must include a valid JSON body'],
            })
          }
          return await ContentAPI.updateEntry(
            contentTypeSlug,
            entryId,
            body as {
              slug?: string
              fieldValues?: { fieldId: string; value: string }[]
            }
          )

        case 'DELETE':
          if (!entryId) {
            return ApiResponseBuilder.error({
              code: 'BAD_REQUEST',
              message: 'Entry ID is required for DELETE requests',
              details: ['DELETE requests must include an entry ID in the path'],
            })
          }
          // DELETE /api/{contentType}/:id - Delete entry
          return await ContentAPI.deleteEntry(contentTypeSlug, entryId)

        default:
          return ApiResponseBuilder.methodNotAllowed(method, path)
      }
    } catch (error) {
      console.error('API Router error:', error)
      return ApiResponseBuilder.internalError(error)
    }
  }

  /**
   * Helper method to create a fetch-like API client
   */
  static async fetch(
    path: string,
    options: {
      method?: HttpMethod
      body?: unknown
      query?: Record<string, string>
    } = {}
  ): Promise<ApiResponse> {
    const { method = 'GET', body, query } = options

    return await this.route({
      method,
      path,
      body,
      query,
    })
  }
}


