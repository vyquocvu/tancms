/**
 * Dynamic Database Manager for TanCMS
 * Handles database provider selection and initialization
 */

import { PrismaClient } from '@prisma/client'
import { DatabaseAdapter, DatabaseAdapterFactory, DatabaseConfig } from './database-adapter'

class DatabaseManager {
  private adapter?: DatabaseAdapter
  private client?: PrismaClient
  private config?: DatabaseConfig

  /**
   * Initialize the database with dynamic provider selection
   */
  async initialize(connectionUrl?: string): Promise<PrismaClient> {
    const url = connectionUrl || process.env.DATABASE_URL
    if (!url) {
      throw new Error('DATABASE_URL is required')
    }

    // Detect provider from URL or environment variable
    const provider = this.detectProvider(url)
    
    this.config = {
      provider,
      url,
      poolSize: this.getEnvNumber('DATABASE_POOL_SIZE', 10),
      connectionTimeout: this.getEnvNumber('DATABASE_CONNECTION_TIMEOUT', 30000),
      maxRetries: this.getEnvNumber('DATABASE_MAX_RETRIES', 3),
      ssl: process.env.DATABASE_SSL === 'true',
    }

    // Create the appropriate adapter
    this.adapter = DatabaseAdapterFactory.createAdapter(this.config)

    // Initialize the client
    this.client = await this.adapter.initialize()

    console.log(`✅ Database initialized with ${provider} provider`)
    
    return this.client
  }

  /**
   * Get the current database client
   */
  getClient(): PrismaClient {
    if (!this.client) {
      throw new Error('Database not initialized. Call initialize() first.')
    }
    return this.client
  }

  /**
   * Get the current database adapter
   */
  getAdapter(): DatabaseAdapter {
    if (!this.adapter) {
      throw new Error('Database not initialized. Call initialize() first.')
    }
    return this.adapter
  }

  /**
   * Get current database configuration
   */
  getConfig(): DatabaseConfig | undefined {
    return this.config
  }

  /**
   * Test the database connection
   */
  async testConnection(): Promise<boolean> {
    if (!this.adapter) {
      return false
    }
    return await this.adapter.testConnection()
  }

  /**
   * Get connection status
   */
  async getConnectionStatus() {
    if (!this.adapter) {
      return { isConnected: false }
    }
    return await this.adapter.getConnectionStatus()
  }

  /**
   * Close the database connection
   */
  async close(): Promise<void> {
    if (this.adapter) {
      await this.adapter.close()
    }
    this.adapter = undefined
    this.client = undefined
    this.config = undefined
  }

  /**
   * Detect database provider from connection URL
   */
  private detectProvider(url: string): 'sqlite' | 'mysql' | 'postgresql' {
    // Check environment variable first
    const envProvider = process.env.DATABASE_PROVIDER?.toLowerCase()
    if (envProvider === 'mysql' || envProvider === 'postgresql' || envProvider === 'sqlite') {
      return envProvider
    }

    // Detect from URL protocol
    if (url.startsWith('file:') || url.includes('.db')) {
      return 'sqlite'
    }
    if (url.startsWith('mysql://') || url.startsWith('mysql2://')) {
      return 'mysql'
    }
    if (url.startsWith('postgresql://') || url.startsWith('postgres://')) {
      return 'postgresql'
    }

    // Default to SQLite for development
    console.warn('Could not detect database provider from URL, defaulting to SQLite')
    return 'sqlite'
  }

  /**
   * Get numeric environment variable with default
   */
  private getEnvNumber(key: string, defaultValue: number): number {
    const value = process.env[key]
    if (!value) return defaultValue
    const parsed = parseInt(value, 10)
    return isNaN(parsed) ? defaultValue : parsed
  }

  /**
   * Health check for the database
   */
  async healthCheck(): Promise<{
    status: 'healthy' | 'unhealthy'
    provider?: string
    connected: boolean
    connectionInfo?: Record<string, unknown>
    error?: string
  }> {
    try {
      if (!this.adapter || !this.config) {
        return {
          status: 'unhealthy',
          connected: false,
          error: 'Database not initialized',
        }
      }

      const connected = await this.testConnection()
      const connectionInfo = await this.getConnectionStatus()

      return {
        status: connected ? 'healthy' : 'unhealthy',
        provider: this.config.provider,
        connected,
        connectionInfo,
      }
    } catch (error) {
      return {
        status: 'unhealthy',
        connected: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      }
    }
  }

  /**
   * Get database statistics
   */
  async getStatistics(): Promise<Record<string, unknown>> {
    if (!this.adapter || !this.client) {
      return {}
    }

    try {
      const stats: Record<string, unknown> = {
        provider: this.config?.provider,
        connectionStatus: await this.getConnectionStatus(),
      }

      // Add provider-specific statistics
      switch (this.config?.provider) {
        case 'mysql':
          if ('getServerVersion' in this.adapter) {
            stats.serverVersion = await (this.adapter as any).getServerVersion()
            stats.serverStatus = await (this.adapter as any).getServerStatus()
            stats.featureSupport = await (this.adapter as any).checkFeatureSupport()
          }
          break
        case 'sqlite':
          if ('getDatabaseInfo' in this.adapter) {
            stats.databaseInfo = await (this.adapter as any).getDatabaseInfo()
          }
          break
        case 'postgresql':
          if ('getServerVersion' in this.adapter) {
            stats.serverVersion = await (this.adapter as any).getServerVersion()
          }
          break
      }

      return stats
    } catch (error) {
      console.error('Failed to get database statistics:', error)
      return { error: error instanceof Error ? error.message : 'Unknown error' }
    }
  }
}

// Create a singleton instance
export const databaseManager = new DatabaseManager()

// Export the manager class for testing
export { DatabaseManager }