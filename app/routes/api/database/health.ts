/**
 * Database Health API Endpoint
 * Provides database health check and statistics
 */

import { createAPIHandler } from '~/lib/api-factory'
import { databaseManager } from '~/server/database-manager'

export const { POST, GET } = createAPIHandler({
  async GET() {
    try {
      // Get database health information
      const healthCheck = await databaseManager.healthCheck()
      const statistics = await databaseManager.getStatistics()

      return {
        success: true,
        data: {
          health: healthCheck,
          statistics,
          timestamp: new Date().toISOString(),
        },
      }
    } catch (error) {
      console.error('Database health check failed:', error)
      return {
        success: false,
        error: 'Database health check failed',
        message: error instanceof Error ? error.message : 'Unknown error',
      }
    }
  },

  async POST() {
    try {
      // Force a connection test
      const connected = await databaseManager.testConnection()
      const status = await databaseManager.getConnectionStatus()

      return {
        success: true,
        data: {
          connected,
          status,
          timestamp: new Date().toISOString(),
        },
      }
    } catch (error) {
      console.error('Database connection test failed:', error)
      return {
        success: false,
        error: 'Database connection test failed',
        message: error instanceof Error ? error.message : 'Unknown error',
      }
    }
  },
})