/**
 * Tests for the Standardized API Response Builder
 */

import { describe, it, expect, beforeEach, vi } from 'vitest'
import { ApiResponseBuilder, type ApiErrorCode, type StandardApiResponse } from '../app/lib/api-response'

describe('ApiResponseBuilder', () => {
  beforeEach(() => {
    // Mock crypto.randomUUID
    vi.stubGlobal('crypto', {
      randomUUID: () => 'test-uuid-123'
    })
  })

  describe('success responses', () => {
    it('should create a basic success response', () => {
      const response = ApiResponseBuilder.success()

      expect(response.success).toBe(true)
      expect(response.message).toBe('Request completed successfully')
      expect(response.data).toBeUndefined()
      expect(response.error).toBeUndefined()
      expect(response.meta).toBeDefined()
      expect(response.meta.requestId).toBe('test-uuid-123')
      expect(response.meta.timestamp).toBeDefined()
      expect(response.meta.version).toBe('1.0.0')
    })

    it('should create a success response with data', () => {
      const testData = { id: 1, name: 'Test Item' }
      const response = ApiResponseBuilder.success({ data: testData })

      expect(response.success).toBe(true)
      expect(response.data).toEqual(testData)
    })

    it('should create a success response with custom message', () => {
      const customMessage = 'Item created successfully'
      const response = ApiResponseBuilder.success({ message: customMessage })

      expect(response.success).toBe(true)
      expect(response.message).toBe(customMessage)
    })

    it('should create a success response with custom meta', () => {
      const customMeta = { requestId: 'custom-id', processingTime: 150 }
      const response = ApiResponseBuilder.success({ meta: customMeta })

      expect(response.meta.requestId).toBe('custom-id')
      expect(response.meta.processingTime).toBe(150)
      expect(response.meta.version).toBe('1.0.0') // Default should still be set
    })
  })

  describe('error responses', () => {
    it('should create a basic error response', () => {
      const response = ApiResponseBuilder.error({
        code: 'NOT_FOUND',
      })

      expect(response.success).toBe(false)
      expect(response.message).toBe('Resource not found')
      expect(response.data).toBeUndefined()
      expect(response.error).toBeDefined()
      expect(response.error!.code).toBe('NOT_FOUND')
      expect(response.error!.message).toBe('Resource not found')
    })

    it('should create an error response with custom message', () => {
      const customMessage = 'User not found'
      const response = ApiResponseBuilder.error({
        code: 'NOT_FOUND',
        message: customMessage,
      })

      expect(response.message).toBe(customMessage)
      expect(response.error!.message).toBe(customMessage)
    })

    it('should create an error response with details', () => {
      const details = ['Field name is required', 'Field email must be valid']
      const response = ApiResponseBuilder.error({
        code: 'VALIDATION_ERROR',
        details,
      })

      expect(response.error!.details).toEqual(details)
    })

    it('should include debug info in non-production', () => {
      // Mock non-production environment
      const originalEnv = process.env.NODE_ENV
      process.env.NODE_ENV = 'development'

      const debugInfo = { stack: 'Error stack trace' }
      const response = ApiResponseBuilder.error({
        code: 'INTERNAL_SERVER_ERROR',
        debug: debugInfo,
      })

      expect(response.error!.debug).toEqual(debugInfo)

      // Restore environment
      process.env.NODE_ENV = originalEnv
    })

    it('should exclude debug info in production', () => {
      // Mock production environment
      const originalEnv = process.env.NODE_ENV
      process.env.NODE_ENV = 'production'

      const debugInfo = { stack: 'Error stack trace' }
      const response = ApiResponseBuilder.error({
        code: 'INTERNAL_SERVER_ERROR',
        debug: debugInfo,
      })

      expect(response.error!.debug).toBeUndefined()

      // Restore environment
      process.env.NODE_ENV = originalEnv
    })
  })

  describe('status code mapping', () => {
    it('should return correct status codes for error codes', () => {
      expect(ApiResponseBuilder.getStatusCode('VALIDATION_ERROR')).toBe(400)
      expect(ApiResponseBuilder.getStatusCode('BAD_REQUEST')).toBe(400)
      expect(ApiResponseBuilder.getStatusCode('AUTHENTICATION_REQUIRED')).toBe(401)
      expect(ApiResponseBuilder.getStatusCode('AUTHENTICATION_FAILED')).toBe(401)
      expect(ApiResponseBuilder.getStatusCode('AUTHORIZATION_FAILED')).toBe(403)
      expect(ApiResponseBuilder.getStatusCode('NOT_FOUND')).toBe(404)
      expect(ApiResponseBuilder.getStatusCode('METHOD_NOT_ALLOWED')).toBe(405)
      expect(ApiResponseBuilder.getStatusCode('CONFLICT')).toBe(409)
      expect(ApiResponseBuilder.getStatusCode('RATE_LIMITED')).toBe(429)
      expect(ApiResponseBuilder.getStatusCode('INTERNAL_SERVER_ERROR')).toBe(500)
    })
  })

  describe('legacy compatibility', () => {
    it('should convert legacy success response', () => {
      const legacyResponse = {
        success: true,
        data: { id: 1, name: 'Test' },
      }

      const standardResponse = ApiResponseBuilder.fromLegacy(legacyResponse)

      expect(standardResponse.success).toBe(true)
      expect(standardResponse.data).toEqual(legacyResponse.data)
      expect(standardResponse.message).toBe('Request completed successfully')
      expect(standardResponse.meta).toBeDefined()
    })

    it('should convert legacy error response', () => {
      const legacyResponse = {
        success: false,
        error: 'Something went wrong',
        details: ['Detail 1', 'Detail 2'],
      }

      const standardResponse = ApiResponseBuilder.fromLegacy(legacyResponse)

      expect(standardResponse.success).toBe(false)
      expect(standardResponse.message).toBe('Something went wrong')
      expect(standardResponse.error!.code).toBe('INTERNAL_SERVER_ERROR')
      expect(standardResponse.error!.details).toEqual(legacyResponse.details)
    })
  })

  describe('HTTP response creation', () => {
    it('should create HTTP response for success', () => {
      const response = ApiResponseBuilder.success({ data: { test: true } })
      const httpResponse = ApiResponseBuilder.createHttpResponse(response)

      expect(httpResponse.status).toBe(200)
      expect(httpResponse.headers.get('Content-Type')).toBe('application/json')
      expect(httpResponse.headers.get('X-Request-ID')).toBe('test-uuid-123')
      expect(httpResponse.headers.get('X-API-Version')).toBe('1.0.0')
    })

    it('should create HTTP response for error with correct status', () => {
      const response = ApiResponseBuilder.error({ code: 'NOT_FOUND' })
      const httpResponse = ApiResponseBuilder.createHttpResponse(response)

      expect(httpResponse.status).toBe(404)
      expect(httpResponse.headers.get('Content-Type')).toBe('application/json')
    })

    it('should include custom headers', () => {
      const response = ApiResponseBuilder.success()
      const customHeaders = { 'X-Custom-Header': 'custom-value' }
      const httpResponse = ApiResponseBuilder.createHttpResponse(response, customHeaders)

      expect(httpResponse.headers.get('X-Custom-Header')).toBe('custom-value')
      expect(httpResponse.headers.get('Content-Type')).toBe('application/json') // Should still have defaults
    })
  })

  describe('convenience methods', () => {
    it('should create validation error response', () => {
      const details = ['Field is required']
      const response = ApiResponseBuilder.validationError(details)

      expect(response.success).toBe(false)
      expect(response.error!.code).toBe('VALIDATION_ERROR')
      expect(response.error!.details).toEqual(details)
    })

    it('should create not found response', () => {
      const response = ApiResponseBuilder.notFound('User', 'user-123')

      expect(response.success).toBe(false)
      expect(response.error!.code).toBe('NOT_FOUND')
      expect(response.message).toBe("User with identifier 'user-123' not found")
    })

    it('should create not found response without identifier', () => {
      const response = ApiResponseBuilder.notFound('User')

      expect(response.success).toBe(false)
      expect(response.error!.code).toBe('NOT_FOUND')
      expect(response.message).toBe('User not found')
    })

    it('should create auth required response', () => {
      const response = ApiResponseBuilder.authRequired()

      expect(response.success).toBe(false)
      expect(response.error!.code).toBe('AUTHENTICATION_REQUIRED')
      expect(response.message).toBe('Authentication required')
    })

    it('should create method not allowed response', () => {
      const response = ApiResponseBuilder.methodNotAllowed('POST', '/api/status')

      expect(response.success).toBe(false)
      expect(response.error!.code).toBe('METHOD_NOT_ALLOWED')
      expect(response.message).toContain('POST')
      expect(response.message).toContain('/api/status')
    })

    it('should create internal error response', () => {
      const error = new Error('Test error')
      const response = ApiResponseBuilder.internalError(error)

      expect(response.success).toBe(false)
      expect(response.error!.code).toBe('INTERNAL_SERVER_ERROR')
      expect(response.error!.details).toContain('Test error')
    })

    it('should create internal error response with unknown error', () => {
      const response = ApiResponseBuilder.internalError('Unknown error type')

      expect(response.success).toBe(false)
      expect(response.error!.code).toBe('INTERNAL_SERVER_ERROR')
      expect(response.error!.details).toContain('Unknown error type')
    })
  })

  describe('metadata generation', () => {
    it('should generate unique request IDs', () => {
      // Create multiple UUIDs to test uniqueness
      let callCount = 0
      vi.stubGlobal('crypto', {
        randomUUID: () => `uuid-${++callCount}`
      })

      const response1 = ApiResponseBuilder.success()
      const response2 = ApiResponseBuilder.success()

      expect(response1.meta.requestId).toBe('uuid-1')
      expect(response2.meta.requestId).toBe('uuid-2')
      expect(response1.meta.requestId).not.toBe(response2.meta.requestId)
    })

    it('should include processing time when provided', () => {
      const startTime = Date.now()
      const processingTime = 150
      
      const response = ApiResponseBuilder.success({
        meta: { processingTime }
      })

      expect(response.meta.processingTime).toBe(processingTime)
    })

    it('should use current timestamp', () => {
      const beforeTime = new Date().toISOString()
      const response = ApiResponseBuilder.success()
      const afterTime = new Date().toISOString()

      expect(response.meta.timestamp).toBeDefined()
      expect(response.meta.timestamp >= beforeTime).toBe(true)
      expect(response.meta.timestamp <= afterTime).toBe(true)
    })
  })
})