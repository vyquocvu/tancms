/**
 * Dynamic Content Type REST API
 * Provides CRUD operations for content entries based on content type slug
 */

import { mockApi } from '~/lib/mock-api'

export type ApiResponse<T = unknown> = {
  success: boolean
  data?: T
  error?: string
  details?: string[]
}

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
        return {
          success: false,
          error: 'Content type not found',
          details: [`Content type with slug '${contentTypeSlug}' does not exist`]
        }
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

      return {
        success: true,
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
      }
    } catch (error) {
      console.error('Error listing entries:', error)
      return {
        success: false,
        error: 'Failed to list entries',
        details: [error instanceof Error ? error.message : 'Unknown error']
      }
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
        return {
          success: false,
          error: 'Content type not found',
          details: [`Content type with slug '${contentTypeSlug}' does not exist`]
        }
      }

      // Get the specific entry
      const entry = await mockApi.getContentEntry(entryId)
      
      if (!entry || entry.contentTypeId !== contentType.id) {
        return {
          success: false,
          error: 'Entry not found',
          details: [`Entry with ID '${entryId}' not found in content type '${contentTypeSlug}'`]
        }
      }

      return {
        success: true,
        data: {
          entry,
          contentType
        }
      }
    } catch (error) {
      console.error('Error getting entry:', error)
      return {
        success: false,
        error: 'Failed to get entry',
        details: [error instanceof Error ? error.message : 'Unknown error']
      }
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
        return {
          success: false,
          error: 'Content type not found',
          details: [`Content type with slug '${contentTypeSlug}' does not exist`]
        }
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
        return {
          success: false,
          error: 'Validation failed',
          details: validationErrors
        }
      }

      // Create the entry
      const entry = await mockApi.createContentEntry({
        contentTypeId: contentType.id,
        slug: data.slug,
        fieldValues: data.fieldValues
      })

      return {
        success: true,
        data: {
          entry,
          contentType
        }
      }
    } catch (error) {
      console.error('Error creating entry:', error)
      return {
        success: false,
        error: 'Failed to create entry',
        details: [error instanceof Error ? error.message : 'Unknown error']
      }
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
        return {
          success: false,
          error: 'Content type not found',
          details: [`Content type with slug '${contentTypeSlug}' does not exist`]
        }
      }

      // Check if entry exists
      const existingEntry = await mockApi.getContentEntry(entryId)
      if (!existingEntry || existingEntry.contentTypeId !== contentType.id) {
        return {
          success: false,
          error: 'Entry not found',
          details: [`Entry with ID '${entryId}' not found in content type '${contentTypeSlug}'`]
        }
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
          return {
            success: false,
            error: 'Validation failed',
            details: validationErrors
          }
        }
      }

      // Update the entry
      const entry = await mockApi.updateContentEntry(entryId, {
        slug: data.slug,
        fieldValues: data.fieldValues
      })

      if (!entry) {
        return {
          success: false,
          error: 'Failed to update entry',
          details: ['Entry could not be updated']
        }
      }

      return {
        success: true,
        data: {
          entry,
          contentType
        }
      }
    } catch (error) {
      console.error('Error updating entry:', error)
      return {
        success: false,
        error: 'Failed to update entry',
        details: [error instanceof Error ? error.message : 'Unknown error']
      }
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
        return {
          success: false,
          error: 'Content type not found',
          details: [`Content type with slug '${contentTypeSlug}' does not exist`]
        }
      }

      // Check if entry exists
      const existingEntry = await mockApi.getContentEntry(entryId)
      if (!existingEntry || existingEntry.contentTypeId !== contentType.id) {
        return {
          success: false,
          error: 'Entry not found',
          details: [`Entry with ID '${entryId}' not found in content type '${contentTypeSlug}'`]
        }
      }

      // Delete the entry
      const success = await mockApi.deleteContentEntry(entryId)

      if (!success) {
        return {
          success: false,
          error: 'Failed to delete entry',
          details: ['Entry could not be deleted']
        }
      }

      return {
        success: true,
        data: {
          message: 'Entry deleted successfully',
          deletedEntryId: entryId
        }
      }
    } catch (error) {
      console.error('Error deleting entry:', error)
      return {
        success: false,
        error: 'Failed to delete entry',
        details: [error instanceof Error ? error.message : 'Unknown error']
      }
    }
  }
}