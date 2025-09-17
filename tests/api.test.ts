/**
 * Tests for the Dynamic Content Type API
 */

import { describe, it, expect, beforeAll } from 'vitest'
import { api } from '../app/routes/api'
import { mockApi } from '../app/lib/mock-api'

describe('Dynamic Content Type API', () => {
  let testContentType: any
  let testEntryId: string

  beforeAll(async () => {
    // Create a test content type
    testContentType = await mockApi.createContentType({
      name: 'test-product',
      displayName: 'Test Product',
      description: 'Test product content type',
      fields: [
        {
          name: 'title',
          displayName: 'Title',
          fieldType: 'TEXT',
          required: true,
          unique: false,
          order: 0,
        },
        {
          name: 'price',
          displayName: 'Price',
          fieldType: 'NUMBER',
          required: true,
          unique: false,
          order: 1,
        },
        {
          name: 'description',
          displayName: 'Description',
          fieldType: 'TEXTAREA',
          required: false,
          unique: false,
          order: 2,
        },
      ],
    })
  })

  describe('POST /api/{contentType}', () => {
    it('should create a new entry', async () => {
      const response = await api.createEntry('test-product', {
        fieldValues: [
          { fieldId: testContentType.fields[0].id, value: 'Test Product' },
          { fieldId: testContentType.fields[1].id, value: '99.99' },
          { fieldId: testContentType.fields[2].id, value: 'A test product description' },
        ],
      })

      expect(response.success).toBe(true)
      expect(response.data).toBeDefined()
      expect(response.data.entry).toBeDefined()
      expect(response.data.entry.fieldValues).toHaveLength(3)

      // Store the entry ID for other tests
      testEntryId = response.data.entry.id
    })

    it('should fail to create entry with missing required fields', async () => {
      const response = await api.createEntry('test-product', {
        fieldValues: [
          {
            fieldId: testContentType.fields[2].id,
            value: 'Only description, missing title and price',
          },
        ],
      })

      expect(response.success).toBe(false)
      expect(response.error?.code).toBe('VALIDATION_ERROR')
      expect(response.error?.message).toBe('Validation failed')
      expect(response.error?.details).toContain("Field 'Title' is required")
      expect(response.error?.details).toContain("Field 'Price' is required")
    })

    it('should fail for non-existent content type', async () => {
      const response = await api.createEntry('nonexistent', {
        fieldValues: [{ fieldId: 'fake-id', value: 'test' }],
      })

      expect(response.success).toBe(false)
      expect(response.error?.code).toBe('NOT_FOUND')
      expect(response.message).toContain('Content type')
      expect(response.message).toContain('nonexistent')
    })
  })

  describe('GET /api/{contentType}', () => {
    it('should list entries for a content type', async () => {
      const response = await api.listEntries('test-product')

      expect(response.success).toBe(true)
      expect(response.data).toBeDefined()
      expect(response.data.entries).toBeDefined()
      expect(response.data.contentType).toBeDefined()
      expect(response.data.pagination).toBeDefined()
      expect(Array.isArray(response.data.entries)).toBe(true)
    })

    it('should support pagination', async () => {
      const response = await api.listEntries('test-product', { page: 1, limit: 5 })

      expect(response.success).toBe(true)
      expect(response.data.pagination.page).toBe(1)
      expect(response.data.pagination.limit).toBe(5)
    })

    it('should support search', async () => {
      const response = await api.listEntries('test-product', { search: 'Test Product' })

      expect(response.success).toBe(true)
      expect(response.data.entries.length).toBeGreaterThan(0)
    })

    it('should fail for non-existent content type', async () => {
      const response = await api.listEntries('nonexistent')

      expect(response.success).toBe(false)
      expect(response.error?.code).toBe('NOT_FOUND')
      expect(response.message).toContain('Content type')
      expect(response.message).toContain('nonexistent')
    })
  })

  describe('GET /api/{contentType}/:id', () => {
    it('should get a single entry', async () => {
      const response = await api.getEntry('test-product', testEntryId)

      expect(response.success).toBe(true)
      expect(response.data).toBeDefined()
      expect(response.data.entry).toBeDefined()
      expect(response.data.entry.id).toBe(testEntryId)
      expect(response.data.contentType).toBeDefined()
    })

    it('should fail for non-existent entry', async () => {
      const response = await api.getEntry('test-product', 'nonexistent-id')

      expect(response.success).toBe(false)
      expect(response.error?.code).toBe('NOT_FOUND')
      expect(response.message).toContain('Entry')
      expect(response.message).toContain('nonexistent-id')
    })

    it('should fail for non-existent content type', async () => {
      const response = await api.getEntry('nonexistent', testEntryId)

      expect(response.success).toBe(false)
      expect(response.error?.code).toBe('NOT_FOUND')
      expect(response.message).toContain('Content type')
      expect(response.message).toContain('nonexistent')
    })
  })

  describe('PUT /api/{contentType}/:id', () => {
    it('should update an entry', async () => {
      const response = await api.updateEntry('test-product', testEntryId, {
        fieldValues: [
          { fieldId: testContentType.fields[0].id, value: 'Updated Product Title' },
          { fieldId: testContentType.fields[1].id, value: '149.99' },
          { fieldId: testContentType.fields[2].id, value: 'Updated description' },
        ],
      })

      expect(response.success).toBe(true)
      expect(response.data).toBeDefined()
      expect(response.data.entry).toBeDefined()

      // Verify the update
      const titleField = response.data.entry.fieldValues.find(
        (fv: any) => fv.fieldId === testContentType.fields[0].id
      )
      expect(titleField.value).toBe('Updated Product Title')
    })

    it('should fail to update with missing required fields', async () => {
      const response = await api.updateEntry('test-product', testEntryId, {
        fieldValues: [{ fieldId: testContentType.fields[2].id, value: 'Only description' }],
      })

      expect(response.success).toBe(false)
      expect(response.error?.code).toBe('VALIDATION_ERROR')
      expect(response.error?.message).toBe('Validation failed')
    })

    it('should fail for non-existent entry', async () => {
      const response = await api.updateEntry('test-product', 'nonexistent-id', {
        fieldValues: [{ fieldId: testContentType.fields[0].id, value: 'Test' }],
      })

      expect(response.success).toBe(false)
      expect(response.error?.code).toBe('NOT_FOUND')
      expect(response.message).toContain('Entry')
      expect(response.message).toContain('nonexistent-id')
    })
  })

  describe('DELETE /api/{contentType}/:id', () => {
    it('should delete an entry', async () => {
      const response = await api.deleteEntry('test-product', testEntryId)

      expect(response.success).toBe(true)
      expect(response.data).toBeDefined()
      expect(response.data.message).toBe('Entry deleted successfully')
      expect(response.data.deletedEntryId).toBe(testEntryId)
    })

    it('should fail for non-existent entry', async () => {
      const response = await api.deleteEntry('test-product', 'nonexistent-id')

      expect(response.success).toBe(false)
      expect(response.error?.code).toBe('NOT_FOUND')
      expect(response.message).toContain('Entry')
      expect(response.message).toContain('nonexistent-id')
    })

    it('should fail for non-existent content type', async () => {
      const response = await api.deleteEntry('nonexistent', testEntryId)

      expect(response.success).toBe(false)
      expect(response.error?.code).toBe('NOT_FOUND')
      expect(response.message).toContain('Content type')
      expect(response.message).toContain('nonexistent')
    })
  })
})
