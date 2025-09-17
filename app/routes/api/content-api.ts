/**
 * Dynamic Content Type REST API
 * Provides CRUD operations for content entries based on content type slug
 */

import { mockApi } from '~/lib/mock-api'
import { ApiResponseBuilder, type StandardApiResponse } from '~/lib/api-response'

// Keep legacy type for backward compatibility
export type ApiResponse<T = unknown> = StandardApiResponse<T>

export type ContentEntryRequest = {
  slug?: string
  fieldValues: { fieldId: string; value: string }[]
}

/**
 * Content API class to handle dynamic content type operations
 */
export class ContentAPI {
  /**
   * List all entries for a content type
   * GET /api/{contentType}
   */
  static async listEntries(contentTypeSlug: string, params?: {
    page?: number
    limit?: number
    search?: string
  }): Promise<ApiResponse> {
    try {
      // Get content type by slug
      const contentTypes = await mockApi.getContentTypes()
      const contentType = contentTypes.find(ct => ct.slug === contentTypeSlug)
      
      if (!contentType) {
        return ApiResponseBuilder.notFound('Content type', contentTypeSlug)
      }

      // Get entries for this content type
      const entries = await mockApi.getContentEntries(contentType.id)
      
      // Apply search filter if provided
      let filteredEntries = entries
      if (params?.search) {
        const searchTerm = params.search.toLowerCase()
        filteredEntries = entries.filter(entry => 
          entry.fieldValues.some(fv => 
            fv.value.toLowerCase().includes(searchTerm)
          ) || entry.slug?.toLowerCase().includes(searchTerm)
        )
      }

      // Apply pagination
      const page = params?.page ?? 1
      const limit = params?.limit ?? 10
      const startIndex = (page - 1) * limit
      const paginatedEntries = filteredEntries.slice(startIndex, startIndex + limit)

      return ApiResponseBuilder.success({
        message: `Retrieved ${paginatedEntries.length} entries for content type '${contentTypeSlug}'`,
        data: {
          entries: paginatedEntries,
          contentType,
          pagination: {
            page,
            limit,
            total: filteredEntries.length,
            totalPages: Math.ceil(filteredEntries.length / limit),
            hasNext: startIndex + limit < filteredEntries.length,
            hasPrev: page > 1
          }
        }
      })
    } catch (error) {
      console.error('Error listing entries:', error)
      return ApiResponseBuilder.internalError(error)
    }
  }

  /**
   * Get a single entry by ID
   * GET /api/{contentType}/:id
   */
  static async getEntry(contentTypeSlug: string, entryId: string): Promise<ApiResponse> {
    try {
      // Get content type by slug
      const contentTypes = await mockApi.getContentTypes()
      const contentType = contentTypes.find(ct => ct.slug === contentTypeSlug)
      
      if (!contentType) {
        return ApiResponseBuilder.notFound('Content type', contentTypeSlug)
      }

      // Get the specific entry
      const entry = await mockApi.getContentEntry(entryId)
      
      if (!entry || entry.contentTypeId !== contentType.id) {
        return ApiResponseBuilder.notFound('Entry', entryId)
      }

      return ApiResponseBuilder.success({
        message: `Retrieved entry '${entryId}' from content type '${contentTypeSlug}'`,
        data: {
          entry,
          contentType
        }
      })
    } catch (error) {
      console.error('Error getting entry:', error)
      return ApiResponseBuilder.internalError(error)
    }
  }

  /**
   * Create a new entry
   * POST /api/{contentType}
   */
  static async createEntry(contentTypeSlug: string, data: ContentEntryRequest): Promise<ApiResponse> {
    try {
      // Get content type by slug
      const contentTypes = await mockApi.getContentTypes()
      const contentType = contentTypes.find(ct => ct.slug === contentTypeSlug)
      
      if (!contentType) {
        return ApiResponseBuilder.notFound('Content type', contentTypeSlug)
      }

      // Validate required fields
      const validationErrors: string[] = []
      const requiredFields = contentType.fields.filter(field => field.required)
      
      for (const requiredField of requiredFields) {
        const fieldValue = data.fieldValues.find(fv => fv.fieldId === requiredField.id)
        if (!fieldValue || !fieldValue.value?.trim()) {
          validationErrors.push(`Field '${requiredField.displayName}' is required`)
        }
      }

      if (validationErrors.length > 0) {
        return ApiResponseBuilder.validationError(validationErrors)
      }

      // Create the entry
      const entry = await mockApi.createContentEntry({
        contentTypeId: contentType.id,
        slug: data.slug,
        fieldValues: data.fieldValues
      })

      return ApiResponseBuilder.success({
        message: `Entry created successfully in content type '${contentTypeSlug}'`,
        data: {
          entry,
          contentType
        }
      })
    } catch (error) {
      console.error('Error creating entry:', error)
      return ApiResponseBuilder.internalError(error)
    }
  }

  /**
   * Update an existing entry
   * PUT /api/{contentType}/:id
   */
  static async updateEntry(contentTypeSlug: string, entryId: string, data: Partial<ContentEntryRequest>): Promise<ApiResponse> {
    try {
      // Get content type by slug
      const contentTypes = await mockApi.getContentTypes()
      const contentType = contentTypes.find(ct => ct.slug === contentTypeSlug)
      
      if (!contentType) {
        return ApiResponseBuilder.notFound('Content type', contentTypeSlug)
      }

      // Check if entry exists
      const existingEntry = await mockApi.getContentEntry(entryId)
      if (!existingEntry || existingEntry.contentTypeId !== contentType.id) {
        return ApiResponseBuilder.notFound('Entry', entryId)
      }

      // Validate required fields if fieldValues are being updated
      if (data.fieldValues) {
        const validationErrors: string[] = []
        const requiredFields = contentType.fields.filter(field => field.required)
        
        for (const requiredField of requiredFields) {
          const fieldValue = data.fieldValues.find(fv => fv.fieldId === requiredField.id)
          if (!fieldValue || !fieldValue.value?.trim()) {
            validationErrors.push(`Field '${requiredField.displayName}' is required`)
          }
        }

        if (validationErrors.length > 0) {
          return ApiResponseBuilder.validationError(validationErrors)
        }
      }

      // Update the entry
      const entry = await mockApi.updateContentEntry(entryId, {
        slug: data.slug,
        fieldValues: data.fieldValues
      })

      if (!entry) {
        return ApiResponseBuilder.error({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Failed to update entry',
          details: ['Entry could not be updated']
        })
      }

      return ApiResponseBuilder.success({
        message: `Entry '${entryId}' updated successfully`,
        data: {
          entry,
          contentType
        }
      })
    } catch (error) {
      console.error('Error updating entry:', error)
      return ApiResponseBuilder.internalError(error)
    }
  }

  /**
   * Delete an entry
   * DELETE /api/{contentType}/:id
   */
  static async deleteEntry(contentTypeSlug: string, entryId: string): Promise<ApiResponse> {
    try {
      // Get content type by slug
      const contentTypes = await mockApi.getContentTypes()
      const contentType = contentTypes.find(ct => ct.slug === contentTypeSlug)
      
      if (!contentType) {
        return ApiResponseBuilder.notFound('Content type', contentTypeSlug)
      }

      // Check if entry exists
      const existingEntry = await mockApi.getContentEntry(entryId)
      if (!existingEntry || existingEntry.contentTypeId !== contentType.id) {
        return ApiResponseBuilder.notFound('Entry', entryId)
      }

      // Delete the entry
      const success = await mockApi.deleteContentEntry(entryId)

      if (!success) {
        return ApiResponseBuilder.error({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Failed to delete entry',
          details: ['Entry could not be deleted']
        })
      }

      return ApiResponseBuilder.success({
        message: `Entry '${entryId}' deleted successfully`,
        data: {
          message: 'Entry deleted successfully',
          deletedEntryId: entryId
        }
      })
    } catch (error) {
      console.error('Error deleting entry:', error)
      return ApiResponseBuilder.internalError(error)
    }
  }
}