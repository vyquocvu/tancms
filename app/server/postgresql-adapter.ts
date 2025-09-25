/**
 * PostgreSQL Database Adapter for TanCMS
 * Provides PostgreSQL-specific database functionality
 */

import { PrismaClient } from '@prisma/client'
import { BaseAdapter, DatabaseConfig } from './database-adapter'

export class PostgreSQLAdapter extends BaseAdapter {
  readonly provider = 'postgresql'

  async initialize(): Promise<PrismaClient> {
    if (this.client) {
      return this.client
    }

    const connectionOptions = this.getConnectionOptions()

    this.client = new PrismaClient({
      log: process.env.NODE_ENV === 'development' ? ['query', 'error', 'warn'] : ['error'],
      datasources: {
        db: {
          url: this.config.url,
        },
      },
      ...connectionOptions,
    })

    // Test the connection
    await this.testConnection()

    return this.client
  }

  async testConnection(): Promise<boolean> {
    if (!this.client) {
      throw new Error('Database client not initialized')
    }

    try {
      // Use PostgreSQL-specific query to test connection
      await this.client.$queryRaw`SELECT 1 as test`
      return true
    } catch (error) {
      console.error('PostgreSQL connection test failed:', error)
      return false
    }
  }

  getConnectionOptions(): Record<string, unknown> {
    const options: Record<string, unknown> = {}

    // Configure connection pool for PostgreSQL
    if (this.config.poolSize) {
      options.pool = {
        max: this.config.poolSize,
        min: Math.max(1, Math.floor(this.config.poolSize / 4)),
        acquireTimeoutMillis: this.config.connectionTimeout || 60000,
      }
    }

    // Configure SSL if specified
    if (this.config.ssl) {
      options.ssl = this.config.ssl
    }

    return options
  }

  async getConnectionStatus() {
    if (!this.client) {
      return { isConnected: false }
    }

    try {
      // Get PostgreSQL-specific connection information
      const result = await this.client.$queryRaw<Array<{ count: bigint }>>`
        SELECT count(*) as count FROM pg_stat_activity 
        WHERE usename = current_user
      `
      
      const activeConnections = Number(result[0]?.count || 0)

      return {
        isConnected: true,
        activeConnections,
        poolSize: this.config.poolSize,
      }
    } catch (error) {
      console.error('Failed to get PostgreSQL connection status:', error)
      return { isConnected: false }
    }
  }

  /**
   * Get PostgreSQL server version
   */
  async getServerVersion(): Promise<string | null> {
    if (!this.client) {
      return null
    }

    try {
      const result = await this.client.$queryRaw<Array<{ version: string }>>`
        SELECT version() as version
      `
      return result[0]?.version || null
    } catch {
      return null
    }
  }
}