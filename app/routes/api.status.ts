/**
 * API Status endpoint
 * GET /api/status - Get API health and configuration information
 */

import { createAPIFileRoute } from '@tanstack/start/api'
import { apiManager } from '~/lib/api-manager'

export const Route = createAPIFileRoute('/api/status')({
  GET: async () => {
    try {
      const response = await apiManager.getStatus()

      return new Response(JSON.stringify(response), {
        status: 200,
        headers: {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*',
          'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
          'Access-Control-Allow-Headers': 'Content-Type, Authorization'
        }
      })
    } catch (error) {
      console.error('API status error:', error)
      return new Response(JSON.stringify({
        success: false,
        error: 'Internal server error',
        details: [error instanceof Error ? error.message : 'Unknown error']
      }), {
        status: 500,
        headers: { 'Content-Type': 'application/json' }
      })
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