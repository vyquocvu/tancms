/**
 * Tests for the centralized API Manager
 */

import { describe, it, expect, beforeEach, beforeAll, vi } from 'vitest'
import { ApiManager, configureApiManager, api } from '../app/lib/api-manager'
import { mockApi } from '../app/lib/mock-api'

describe('API Manager', () => {
  let apiManager: ApiManager
  let testContentType: {
    id: string
    slug: string
    fields: Array<{ id: string }>
  }
  let testEntryId: string // eslint-disable-line @typescript-eslint/no-unused-vars

  beforeAll(async () => {
    // Create a test content type
    testContentType = await mockApi.createContentType({
      name: 'test-api-manager',
      displayName: 'Test API Manager',
      description: 'Test content type for API manager testing',
      fields: [
        {
          name: 'title',
          displayName: 'Title',
          fieldType: 'TEXT',
          required: true,
          unique: false,
          order: 0
        },
        {
          name: 'price',
          displayName: 'Price',
          fieldType: 'NUMBER',
          required: true,
          unique: false,
          order: 1
        }
      ]
    })
  })

  beforeEach(() => {
    apiManager = new ApiManager({
      enableAuth: false,
      enableLogging: false,
      corsEnabled: true
    })
  })

  describe('Basic API Manager functionality', () => {
    it('should create API manager with default config', () => {
      const manager = new ApiManager()
      expect(manager).toBeDefined()
    })

    it('should handle GET requests', async () => {
      const response = await apiManager.get('/api/status')
      expect(response.success).toBe(true)
      expect(response.data).toBeDefined()
      expect(response.data.status).toBe('healthy')
    })

    it('should handle content type listing', async () => {
      const response = await apiManager.get(`/api/${testContentType.slug}`)
      expect(response.success).toBe(true)
      expect(response.data).toBeDefined()
      expect(response.data.contentType).toBeDefined()
      expect(response.data.entries).toBeDefined()
    })

    it('should handle content entry creation', async () => {
      const response = await apiManager.post(`/api/${testContentType.slug}`, {
        fieldValues: [
          { fieldId: testContentType.fields[0].id, value: 'Test Product' },
          { fieldId: testContentType.fields[1].id, value: '99.99' }
        ]
      })

      expect(response.success).toBe(true)
      expect(response.data).toBeDefined()
      expect(response.data.entry).toBeDefined()
      
      testEntryId = response.data.entry.id
    })

    it('should handle content entry updates', async () => {
      // First create an entry
      const createResponse = await apiManager.post(`/api/${testContentType.slug}`, {
        fieldValues: [
          { fieldId: testContentType.fields[0].id, value: 'Original Title' },
          { fieldId: testContentType.fields[1].id, value: '50.00' }
        ]
      })

      const entryId = createResponse.data.entry.id

      // Now update it
      const response = await apiManager.put(`/api/${testContentType.slug}/${entryId}`, {
        fieldValues: [
          { fieldId: testContentType.fields[0].id, value: 'Updated Title' },
          { fieldId: testContentType.fields[1].id, value: '75.00' }
        ]
      })

      expect(response.success).toBe(true)
      expect(response.data.entry).toBeDefined()
      
      const titleField = response.data.entry.fieldValues.find(
        (fv: { fieldId: string; value: string }) => fv.fieldId === testContentType.fields[0].id
      )
      expect(titleField.value).toBe('Updated Title')
    })

    it('should handle content entry deletion', async () => {
      // First create an entry
      const createResponse = await apiManager.post(`/api/${testContentType.slug}`, {
        fieldValues: [
          { fieldId: testContentType.fields[0].id, value: 'To Delete' },
          { fieldId: testContentType.fields[1].id, value: '25.00' }
        ]
      })

      const entryId = createResponse.data.entry.id

      // Now delete it
      const response = await apiManager.delete(`/api/${testContentType.slug}/${entryId}`)

      expect(response.success).toBe(true)
      expect(response.data.message).toBe('Entry deleted successfully')
      expect(response.data.deletedEntryId).toBe(entryId)
    })
  })

  describe('Middleware functionality', () => {
    it('should add and execute middleware', async () => {
      const mockMiddleware = vi.fn(async (request, next) => {
        const response = await next()
        return { ...response, middlewareExecuted: true }
      })

      apiManager.addMiddleware({
        name: 'test-middleware',
        handler: mockMiddleware
      })

      const response = await apiManager.get('/api/status')
      
      expect(mockMiddleware).toHaveBeenCalled()
      expect((response as { middlewareExecuted?: boolean }).middlewareExecuted).toBe(true)
    })

    it('should remove middleware by name', async () => {
      const mockMiddleware = vi.fn(async (request, next) => {
        const response = await next()
        return { ...response, middlewareExecuted: true }
      })

      apiManager.addMiddleware({
        name: 'removable-middleware',
        handler: mockMiddleware
      })

      apiManager.removeMiddleware('removable-middleware')

      const response = await apiManager.get('/api/status')
      
      expect(mockMiddleware).not.toHaveBeenCalled()
      expect((response as { middlewareExecuted?: boolean }).middlewareExecuted).toBeUndefined()
    })

    it('should handle middleware errors gracefully', async () => {
      apiManager.addMiddleware({
        name: 'error-middleware',
        handler: async () => {
          throw new Error('Middleware error')
        }
      })

      const response = await apiManager.get('/api/status')
      
      expect(response.success).toBe(false)
      expect(response.error).toBe('Internal server error')
    })
  })

  describe('Authentication middleware', () => {
    it('should require API key when auth is enabled', async () => {
      const authManager = configureApiManager({
        enableAuth: true,
        enableLogging: false,
        apiKeys: ['test-key']
      })

      // Should fail without API key
      const response1 = await authManager.get('/api/test-api-manager')
      expect(response1.success).toBe(false)
      expect(response1.error).toBe('Authentication required')

      // Should succeed with valid API key
      const response2 = await authManager.get('/api/test-api-manager', { api_key: 'test-key' })
      expect(response2.success).toBe(true)

      // Should fail with invalid API key
      const response3 = await authManager.get('/api/test-api-manager', { api_key: 'invalid-key' })
      expect(response3.success).toBe(false)
      expect(response3.error).toBe('Authentication failed')
    })

    it('should allow status endpoint without auth', async () => {
      const authManager = configureApiManager({
        enableAuth: true,
        enableLogging: false,
        apiKeys: ['test-key']
      })

      const response = await authManager.get('/api/status')
      expect(response.success).toBe(true)
    })
  })

  describe('CORS middleware', () => {
    it('should add CORS headers when enabled', async () => {
      const corsManager = configureApiManager({
        enableAuth: false,
        enableLogging: false,
        corsEnabled: true
      })

      const response = await corsManager.get('/api/status')
      expect(response.success).toBe(true)
      expect((response as { headers?: Record<string, string> }).headers).toBeDefined()
      expect((response as { headers?: Record<string, string> }).headers?.['Access-Control-Allow-Origin']).toBe('*')
    })
  })

  describe('Default API convenience functions', () => {
    it('should use the default api functions', async () => {
      const response = await api.getStatus()
      expect(response.success).toBe(true)
      expect(response.data.status).toBe('healthy')
    })

    it('should handle content operations through convenience API', async () => {
      // Create entry
      const createResponse = await api.createEntry(testContentType.slug, {
        fieldValues: [
          { fieldId: testContentType.fields[0].id, value: 'Convenience API Test' },
          { fieldId: testContentType.fields[1].id, value: '123.45' }
        ]
      })

      expect(createResponse.success).toBe(true)
      const entryId = createResponse.data.entry.id

      // Get entry
      const getResponse = await api.getEntry(testContentType.slug, entryId)
      expect(getResponse.success).toBe(true)
      expect(getResponse.data.entry.id).toBe(entryId)

      // List entries
      const listResponse = await api.listEntries(testContentType.slug)
      expect(listResponse.success).toBe(true)
      expect(listResponse.data.entries.length).toBeGreaterThan(0)

      // Update entry
      const updateResponse = await api.updateEntry(testContentType.slug, entryId, {
        fieldValues: [
          { fieldId: testContentType.fields[0].id, value: 'Updated Convenience API Test' },
          { fieldId: testContentType.fields[1].id, value: '543.21' }
        ]
      })

      expect(updateResponse.success).toBe(true)

      // Delete entry
      const deleteResponse = await api.deleteEntry(testContentType.slug, entryId)
      expect(deleteResponse.success).toBe(true)
    })

    it('should handle generic requests through convenience API', async () => {
      const response = await api.request('GET', '/api/status')
      expect(response.success).toBe(true)
      expect(response.data.status).toBe('healthy')
    })
  })

  describe('Error handling', () => {
    it('should handle invalid content type gracefully', async () => {
      const response = await apiManager.get('/api/nonexistent-type')
      expect(response.success).toBe(false)
      expect(response.error).toBe('Content type not found')
    })

    it('should handle invalid entry ID gracefully', async () => {
      const response = await apiManager.get(`/api/${testContentType.slug}/nonexistent-id`)
      expect(response.success).toBe(false)
      expect(response.error).toBe('Entry not found')
    })

    it('should handle invalid API paths gracefully', async () => {
      const response = await apiManager.get('/invalid/path')
      expect(response.success).toBe(false)
      expect(response.error).toBe('Invalid API path')
    })

    it('should handle validation errors', async () => {
      const response = await apiManager.post(`/api/${testContentType.slug}`, {
        fieldValues: [
          // Missing required fields
          { fieldId: 'nonexistent', value: 'test' }
        ]
      })

      expect(response.success).toBe(false)
      expect(response.error).toBe('Validation failed')
    })
  })
})