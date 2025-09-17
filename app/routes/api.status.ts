/**
 * API Status endpoint
 * GET /api/status - Get API health and configuration information
 */

import { createAPIFileRoute } from '@tanstack/start/api'
import { apiManager } from '~/lib/api-manager'
import { ApiResponseBuilder } from '~/lib/api-response'

export const Route = createAPIFileRoute('/api/status')({
  GET: async () => {
    try {
      const response = await apiManager.getStatus()

      return ApiResponseBuilder.createHttpResponse(response, {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type, Authorization'
      })
    } catch (error) {
      console.error('API status error:', error)
      const errorResponse = ApiResponseBuilder.internalError(error)
      return ApiResponseBuilder.createHttpResponse(errorResponse)
    }
  },

  OPTIONS: async () => {
    // Handle CORS preflight requests
    return new Response(null, {
      status: 204,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'GET, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type, Authorization',
        'Access-Control-Max-Age': '86400'
      }
    })
  }
})