/**
 * Centralized API Manager for REST API endpoints
 * Coordinates all API operations and provides middleware support
 */

import { ApiResponseBuilder, type StandardApiResponse } from '~/lib/api-response'
import {
  mockApi,
  type ContentType,
  type ContentEntry,
  type ContentField,
  type ContentStatus,
} from '~/lib/mock-api'

// Use the correct ApiResponse type
export type ApiResponse<T = unknown> = StandardApiResponse<T>

export type HttpMethod = 'GET' | 'POST' | 'PUT' | 'DELETE'

export type ApiRequest = {
  method: HttpMethod
  path: string
  body?: unknown
  query?: Record<string, string>
}

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
      ...config,
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
        return await this.routeRequest(request)
      }
    }

    try {
      return await next()
    } catch (error) {
      console.error('API Manager error:', error)
      return ApiResponseBuilder.internalError(error)
    }
  }

  /**
   * Route API requests to appropriate handlers
   * This is a simplified router since we're using TanStack Start's file-based routing
   */
  private async routeRequest(request: ApiRequest): Promise<ApiResponse> {
    const { method, path, body, query } = request

    // Handle API status endpoint
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
        return ApiResponseBuilder.error({
          code: 'METHOD_NOT_ALLOWED',
          message: `Method ${method} not allowed for ${path}`,
          details: ['Only GET method is supported for this endpoint'],
        })
      }
    }

    if (!path.startsWith('/api/')) {
      return ApiResponseBuilder.error({
        code: 'BAD_REQUEST',
        message: `Invalid API path: ${path}`,
        details: ['API paths must start with /api/'],
      })
    }

    const normalizedPath = path.replace(/\/+$/, '')
    const relativePath = normalizedPath.slice('/api/'.length)
    const pathSegments = relativePath.split('/').filter(Boolean)

    if (pathSegments.length === 0) {
      return ApiResponseBuilder.error({
        code: 'BAD_REQUEST',
        message: `Invalid API path: ${path}`,
        details: ['Content type segment is required after /api/.'],
      })
    }

    const [contentTypeIdentifier, entryId, ...extraSegments] = pathSegments

    if (extraSegments.length > 0) {
      return ApiResponseBuilder.error({
        code: 'NOT_FOUND',
        message: 'API endpoint not found',
        details: [`Requested: ${method} ${path}`],
      })
    }

    const contentType = await this.findContentType(contentTypeIdentifier)
    if (!contentType) {
      return this.createContentTypeNotFoundResponse(contentTypeIdentifier)
    }

    switch (method) {
      case 'GET':
        if (entryId) {
          return this.getEntry(contentType, entryId)
        }
        return this.listEntries(contentType, query)
      case 'POST':
        if (entryId) {
          return ApiResponseBuilder.error({
            code: 'METHOD_NOT_ALLOWED',
            message: `Method ${method} not allowed for ${path}`,
            details: ['Use PUT to update entries or DELETE to remove them.'],
          })
        }
        return this.createEntry(contentType, body)
      case 'PUT':
        if (!entryId) {
          return ApiResponseBuilder.error({
            code: 'BAD_REQUEST',
            message: 'Entry ID is required for update operations',
            details: ['Provide the entry ID in the URL, e.g., /api/{contentType}/{entryId}.'],
          })
        }
        return this.updateEntry(contentType, entryId, body)
      case 'DELETE':
        if (!entryId) {
          return ApiResponseBuilder.error({
            code: 'BAD_REQUEST',
            message: 'Entry ID is required for delete operations',
            details: ['Provide the entry ID in the URL, e.g., /api/{contentType}/{entryId}.'],
          })
        }
        return this.deleteEntry(contentType, entryId)
      default:
        return ApiResponseBuilder.error({
          code: 'METHOD_NOT_ALLOWED',
          message: `Method ${method} not allowed for ${path}`,
          details: ['Only GET, POST, PUT, and DELETE are supported.'],
        })
    }
  }

  private async findContentType(identifier: string): Promise<ContentType | undefined> {
    const contentTypes = await mockApi.getContentTypes()
    return contentTypes.find(
      contentType => contentType.slug === identifier || contentType.id === identifier
    )
  }

  private createContentTypeNotFoundResponse(identifier: string): ApiResponse {
    return ApiResponseBuilder.error({
      code: 'NOT_FOUND',
      message: `Content type '${identifier}' not found`,
      details: [
        `No content type with slug or id '${identifier}' exists.`,
        'Create the content type before attempting to access it via the API.',
      ],
    })
  }

  private createEntryNotFoundResponse(
    contentType: ContentType,
    entryId: string
  ): ApiResponse {
    return ApiResponseBuilder.error({
      code: 'NOT_FOUND',
      message: `Entry '${entryId}' not found for content type '${contentType.slug}'`,
      details: [
        `No entry with ID '${entryId}' exists for content type '${contentType.slug}'.`,
        'Verify the entry ID and try again.',
      ],
    })
  }

  private async listEntries(
    contentType: ContentType,
    query?: Record<string, string>
  ): Promise<ApiResponse> {
    let entries = await mockApi.getContentEntries(contentType.id)

    const searchTerm = query?.search?.trim()
    if (searchTerm) {
      entries = this.filterEntriesBySearch(entries, searchTerm)
    }

    const pagination = this.parsePagination(query)
    if ('error' in pagination) {
      return pagination.error
    }

    const { page, limit } = pagination
    const totalEntries = entries.length
    const totalPages = totalEntries === 0 ? 0 : Math.ceil(totalEntries / limit)
    const startIndex = (page - 1) * limit

    if (totalEntries > 0 && startIndex >= totalEntries) {
      return ApiResponseBuilder.error({
        code: 'BAD_REQUEST',
        message: 'Invalid pagination parameters',
        details: [`Page ${page} is out of range for the available data.`],
      })
    }

    const paginatedEntries = entries.slice(startIndex, startIndex + limit)

    return ApiResponseBuilder.success({
      message: 'Entries retrieved successfully',
      data: {
        contentType,
        entries: paginatedEntries,
        pagination: {
          page,
          limit,
          total: totalEntries,
          totalPages,
          hasNextPage: page < totalPages,
          hasPreviousPage: page > 1,
        },
        filters: searchTerm ? { search: searchTerm } : undefined,
      },
    })
  }

  private filterEntriesBySearch(entries: ContentEntry[], term: string): ContentEntry[] {
    const normalizedTerm = term.toLowerCase()

    return entries.filter(entry => {
      if (entry.slug && entry.slug.toLowerCase().includes(normalizedTerm)) {
        return true
      }

      return entry.fieldValues.some(fieldValue => {
        const valueMatches = fieldValue.value
          .toString()
          .toLowerCase()
          .includes(normalizedTerm)
        const fieldMatches = fieldValue.field.displayName
          .toString()
          .toLowerCase()
          .includes(normalizedTerm)

        return valueMatches || fieldMatches
      })
    })
  }

  private parsePagination(
    query?: Record<string, string>
  ): { page: number; limit: number } | { error: ApiResponse } {
    let page = 1
    let limit = 20

    if (query?.page !== undefined) {
      const parsedPage = Number(query.page)
      if (!Number.isInteger(parsedPage) || parsedPage < 1) {
        return {
          error: ApiResponseBuilder.error({
            code: 'BAD_REQUEST',
            message: 'Invalid pagination parameters',
            details: ['Query parameter "page" must be a positive integer.'],
          }),
        }
      }
      page = parsedPage
    }

    if (query?.limit !== undefined) {
      const parsedLimit = Number(query.limit)
      if (!Number.isInteger(parsedLimit) || parsedLimit < 1) {
        return {
          error: ApiResponseBuilder.error({
            code: 'BAD_REQUEST',
            message: 'Invalid pagination parameters',
            details: ['Query parameter "limit" must be a positive integer.'],
          }),
        }
      }
      limit = parsedLimit
    }

    return { page, limit }
  }

  private async getEntry(
    contentType: ContentType,
    entryId: string
  ): Promise<ApiResponse> {
    const entry = await mockApi.getContentEntry(entryId)

    if (!entry || entry.contentTypeId !== contentType.id) {
      return this.createEntryNotFoundResponse(contentType, entryId)
    }

    return ApiResponseBuilder.success({
      message: 'Entry retrieved successfully',
      data: {
        contentType,
        entry,
      },
    })
  }

  private async createEntry(
    contentType: ContentType,
    rawBody: unknown
  ): Promise<ApiResponse> {
    if (!rawBody || typeof rawBody !== 'object') {
      return ApiResponseBuilder.error({
        code: 'BAD_REQUEST',
        message: 'Invalid request body',
        details: ['Request body must be a JSON object.'],
      })
    }

    const payload = rawBody as Record<string, unknown>
    const validation = this.validateAndNormalizeFieldValues(contentType, payload.fieldValues, {
      requireAllFields: true,
    })

    const errors = this.uniqueErrors(validation.errors)
    if (errors.length > 0 || !validation.values) {
      return ApiResponseBuilder.validationError(errors.length > 0 ? errors : [
        'Field values are required to create an entry.',
      ])
    }

    const status = this.parseContentStatus(payload.status)
    if (payload.status !== undefined && !status) {
      return ApiResponseBuilder.error({
        code: 'BAD_REQUEST',
        message: 'Invalid status value',
        details: ['Status must be one of DRAFT, PUBLISHED, SCHEDULED, or ARCHIVED.'],
      })
    }

    const slug = typeof payload.slug === 'string' ? payload.slug : undefined

    try {
      const entry = await mockApi.createContentEntry({
        contentTypeId: contentType.id,
        slug,
        status,
        fieldValues: validation.values,
      })

      return ApiResponseBuilder.success({
        message: 'Entry created successfully',
        data: {
          contentType,
          entry,
        },
      })
    } catch (error) {
      return this.handleMockApiError(error, 'Failed to create entry')
    }
  }

  private async updateEntry(
    contentType: ContentType,
    entryId: string,
    rawBody: unknown
  ): Promise<ApiResponse> {
    const existingEntry = await mockApi.getContentEntry(entryId)
    if (!existingEntry || existingEntry.contentTypeId !== contentType.id) {
      return this.createEntryNotFoundResponse(contentType, entryId)
    }

    if (!rawBody || typeof rawBody !== 'object') {
      return ApiResponseBuilder.error({
        code: 'BAD_REQUEST',
        message: 'Invalid request body',
        details: ['Request body must be a JSON object.'],
      })
    }

    const payload = rawBody as Record<string, unknown>

    let normalizedFieldValues: { fieldId: string; value: string }[] | undefined
    if ('fieldValues' in payload) {
      const validation = this.validateAndNormalizeFieldValues(contentType, payload.fieldValues, {
        requireAllFields: true,
      })

      const errors = this.uniqueErrors(validation.errors)
      if (errors.length > 0 || !validation.values) {
        return ApiResponseBuilder.validationError(errors)
      }

      normalizedFieldValues = validation.values
    }

    let slug: string | undefined
    if ('slug' in payload) {
      if (payload.slug === undefined || typeof payload.slug === 'string') {
        slug = payload.slug as string | undefined
      } else {
        return ApiResponseBuilder.error({
          code: 'BAD_REQUEST',
          message: 'Invalid request body',
          details: ['Slug must be provided as a string value.'],
        })
      }
    }

    let status: ContentStatus | undefined
    if ('status' in payload) {
      const parsedStatus = this.parseContentStatus(payload.status)
      if (payload.status !== undefined && !parsedStatus) {
        return ApiResponseBuilder.error({
          code: 'BAD_REQUEST',
          message: 'Invalid status value',
          details: ['Status must be one of DRAFT, PUBLISHED, SCHEDULED, or ARCHIVED.'],
        })
      }
      status = parsedStatus
    }

    try {
      const updatedEntry = await mockApi.updateContentEntry(entryId, {
        slug,
        status,
        fieldValues: normalizedFieldValues,
      })

      if (!updatedEntry) {
        return this.createEntryNotFoundResponse(contentType, entryId)
      }

      return ApiResponseBuilder.success({
        message: 'Entry updated successfully',
        data: {
          contentType,
          entry: updatedEntry,
        },
      })
    } catch (error) {
      return this.handleMockApiError(error, 'Failed to update entry')
    }
  }

  private async deleteEntry(
    contentType: ContentType,
    entryId: string
  ): Promise<ApiResponse> {
    const existingEntry = await mockApi.getContentEntry(entryId)
    if (!existingEntry || existingEntry.contentTypeId !== contentType.id) {
      return this.createEntryNotFoundResponse(contentType, entryId)
    }

    const deleted = await mockApi.deleteContentEntry(entryId)
    if (!deleted) {
      return this.createEntryNotFoundResponse(contentType, entryId)
    }

    return ApiResponseBuilder.success({
      message: 'Entry deleted successfully',
      data: {
        contentType,
        deletedEntryId: entryId,
        message: 'Entry deleted successfully',
      },
    })
  }

  private validateAndNormalizeFieldValues(
    contentType: ContentType,
    fieldValuesInput: unknown,
    options: { requireAllFields: boolean }
  ): {
    errors: string[]
    values?: { fieldId: string; value: string }[]
  } {
    const errors: string[] = []

    if (!fieldValuesInput) {
      if (options.requireAllFields) {
        contentType.fields
          .filter(field => field.required)
          .forEach(field => {
            errors.push(`Field '${field.displayName}' is required`)
          })
      }
      return { errors: this.uniqueErrors(errors) }
    }

    if (!Array.isArray(fieldValuesInput)) {
      errors.push('fieldValues must be an array of field value objects.')
      if (options.requireAllFields) {
        contentType.fields
          .filter(field => field.required)
          .forEach(field => {
            errors.push(`Field '${field.displayName}' is required`)
          })
      }
      return { errors: this.uniqueErrors(errors) }
    }

    const fieldMap = new Map<string, ContentField>(
      contentType.fields.map(field => [field.id, field])
    )
    const providedFieldIds = new Set<string>()
    const normalizedValues: { fieldId: string; value: string }[] = []

    for (const rawValue of fieldValuesInput) {
      if (!rawValue || typeof rawValue !== 'object') {
        errors.push('Each item in fieldValues must be an object with fieldId and value.')
        continue
      }

      const { fieldId, value } = rawValue as {
        fieldId?: string
        value?: unknown
      }

      if (!fieldId) {
        errors.push('Each field value must include a fieldId.')
        continue
      }

      const field = fieldMap.get(fieldId)
      if (!field) {
        errors.push(`Field '${fieldId}' does not exist on content type '${contentType.slug}'.`)
        continue
      }

      providedFieldIds.add(fieldId)

      const normalizedValue =
        typeof value === 'string'
          ? value
          : value === undefined || value === null
            ? ''
            : String(value)

      if (field.required && normalizedValue.trim().length === 0) {
        errors.push(`Field '${field.displayName}' is required`)
      }

      normalizedValues.push({ fieldId, value: normalizedValue })
    }

    if (options.requireAllFields) {
      for (const field of contentType.fields.filter(f => f.required)) {
        if (!providedFieldIds.has(field.id)) {
          errors.push(`Field '${field.displayName}' is required`)
        }
      }
    }

    return {
      errors: this.uniqueErrors(errors),
      values: errors.length > 0 ? undefined : normalizedValues,
    }
  }

  private parseContentStatus(value: unknown): ContentStatus | undefined {
    if (value === undefined || value === null) {
      return undefined
    }

    if (typeof value !== 'string') {
      return undefined
    }

    const normalized = value.toUpperCase() as ContentStatus
    const allowed: ContentStatus[] = ['DRAFT', 'PUBLISHED', 'SCHEDULED', 'ARCHIVED']

    return allowed.includes(normalized) ? normalized : undefined
  }

  private handleMockApiError(error: unknown, fallbackMessage: string): ApiResponse {
    if (error instanceof Error) {
      return ApiResponseBuilder.error({
        code: 'BAD_REQUEST',
        message: fallbackMessage,
        details: [error.message],
        debug: error,
      })
    }

    return ApiResponseBuilder.error({
      code: 'INTERNAL_SERVER_ERROR',
      message: fallbackMessage,
      details: ['An unexpected error occurred while processing the request.'],
      debug: error,
    })
  }

  private uniqueErrors(errors: string[]): string[] {
    return Array.from(new Set(errors))
  }

  /**
   * Convenience method for GET requests
   */
  async get(path: string, query?: Record<string, string>): Promise<ApiResponse> {
    return this.handleRequest({
      method: 'GET',
      path,
      query,
    })
  }

  /**
   * Convenience method for POST requests
   */
  async post(path: string, body: unknown): Promise<ApiResponse> {
    return this.handleRequest({
      method: 'POST',
      path,
      body,
    })
  }

  /**
   * Convenience method for PUT requests
   */
  async put(path: string, body: unknown): Promise<ApiResponse> {
    return this.handleRequest({
      method: 'PUT',
      path,
      body,
    })
  }

  /**
   * Convenience method for DELETE requests
   */
  async delete(path: string): Promise<ApiResponse> {
    return this.handleRequest({
      method: 'DELETE',
      path,
    })
  }

  /**
   * Get API status and health information
   */
  async getStatus(): Promise<ApiResponse> {
    return ApiResponseBuilder.success({
      message: 'API is healthy and operational',
      data: {
        status: 'healthy',
        timestamp: new Date().toISOString(),
        version: '1.0.0',
        middlewares: this.middlewares.map(m => m.name),
        config: {
          enableAuth: this.config.enableAuth,
          enableLogging: this.config.enableLogging,
          corsEnabled: this.config.corsEnabled,
        },
      },
    })
  }

  /**
   * Built-in logging middleware
   */
  private createLoggingMiddleware(): ApiMiddleware {
    return {
      name: 'logging',
      handler: async (
        request: ApiRequest,
        next: () => Promise<ApiResponse>
      ): Promise<ApiResponse> => {
        const startTime = Date.now()
        console.log(`[API] ${request.method} ${request.path}`, {
          query: request.query,
          hasBody: !!request.body,
        })

        const response = await next()
        const duration = Date.now() - startTime

        console.log(
          `[API] ${request.method} ${request.path} - ${response.success ? 'SUCCESS' : 'ERROR'} (${duration}ms)`,
          {
            success: response.success,
            error: response.error,
          }
        )

        return response
      },
    }
  }

  /**
   * Built-in authentication middleware
   */
  private createAuthMiddleware(): ApiMiddleware {
    return {
      name: 'auth',
      handler: async (
        request: ApiRequest,
        next: () => Promise<ApiResponse>
      ): Promise<ApiResponse> => {
        // Skip auth for status endpoint
        if (request.path === '/api/status') {
          return next()
        }

        const apiKey = request.query?.['api_key'] || request.query?.['apiKey']

        if (!apiKey) {
          return ApiResponseBuilder.authRequired(
            'API key is required. Provide it as ?api_key=your_key'
          )
        }

        if (!this.config.apiKeys?.includes(apiKey)) {
          return ApiResponseBuilder.error({
            code: 'AUTHENTICATION_FAILED',
            message: 'Invalid API key provided',
            details: ['The provided API key is not valid'],
          })
        }

        return next()
      },
    }
  }

  /**
   * Built-in CORS middleware
   */
  private createCorsMiddleware(): ApiMiddleware {
    return {
      name: 'cors',
      handler: async (
        _request: ApiRequest,
        next: () => Promise<ApiResponse>
      ): Promise<ApiResponse> => {
        const response = await next()

        // Add CORS headers to the response (these would be used in actual HTTP responses)
        return {
          ...response,
          headers: {
            'Access-Control-Allow-Origin': '*',
            'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
            'Access-Control-Allow-Headers': 'Content-Type, Authorization',
          },
        } as ApiResponse & { headers: Record<string, string> }
      },
    }
  }
}

/**
 * Default API manager instance
 */
export const apiManager = new ApiManager({
  enableAuth: false, // Can be enabled by setting API keys
  enableLogging: true,
  corsEnabled: true,
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
  async request(
    method: HttpMethod,
    path: string,
    options: {
      body?: unknown
      query?: Record<string, string>
    } = {}
  ): Promise<ApiResponse> {
    return apiManager.handleRequest({
      method,
      path,
      body: options.body,
      query: options.query,
    })
  },

  /**
   * List entries for a content type
   */
  async listEntries(
    contentTypeSlug: string,
    params?: {
      page?: number
      limit?: number
      search?: string
    }
  ) {
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
  async createEntry(
    contentTypeSlug: string,
    data: {
      slug?: string
      fieldValues: { fieldId: string; value: string }[]
    }
  ) {
    return apiManager.post(`/api/${contentTypeSlug}`, data)
  },

  /**
   * Update an entry
   */
  async updateEntry(
    contentTypeSlug: string,
    entryId: string,
    data: {
      slug?: string
      fieldValues?: { fieldId: string; value: string }[]
    }
  ) {
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
  },
}
