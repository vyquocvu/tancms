/**
 * SQLite Database Adapter for TanCMS
 * Provides SQLite-specific database functionality
 */

import { PrismaClient } from '@prisma/client'
import { BaseAdapter, DatabaseConfig } from './database-adapter'

export class SQLiteAdapter extends BaseAdapter {
  readonly provider = 'sqlite'

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
      // Use SQLite-specific query to test connection
      await this.client.$queryRaw`SELECT 1 as test`
      return true
    } catch (error) {
      console.error('SQLite connection test failed:', error)
      return false
    }
  }

  getConnectionOptions(): Record<string, unknown> {
    const options: Record<string, unknown> = {}

    // SQLite doesn't use traditional connection pooling
    // but we can configure query settings
    options.queryTimeout = this.config.connectionTimeout || 5000

    return options
  }

  async getConnectionStatus() {
    if (!this.client) {
      return { isConnected: false }
    }

    try {
      await this.client.$queryRaw`SELECT 1`
      return {
        isConnected: true,
        activeConnections: 1, // SQLite is single connection
        poolSize: 1,
      }
    } catch {
      return { isConnected: false }
    }
  }

  /**
   * Get SQLite version
   */
  async getVersion(): Promise<string | null> {
    if (!this.client) {
      return null
    }

    try {
      const result = await this.client.$queryRaw<Array<{ version: string }>>`
        SELECT sqlite_version() as version
      `
      return result[0]?.version || null
    } catch {
      return null
    }
  }

  /**
   * Vacuum the SQLite database (cleanup and optimize)
   */
  async vacuum(): Promise<void> {
    if (!this.client) {
      throw new Error('Database client not initialized')
    }

    try {
      await this.client.$executeRaw`VACUUM`
    } catch (error) {
      console.error('Failed to vacuum SQLite database:', error)
      throw error
    }
  }

  /**
   * Analyze the SQLite database (update query planner statistics)
   */
  async analyze(): Promise<void> {
    if (!this.client) {
      throw new Error('Database client not initialized')
    }

    try {
      await this.client.$executeRaw`ANALYZE`
    } catch (error) {
      console.error('Failed to analyze SQLite database:', error)
      throw error
    }
  }

  /**
   * Get SQLite database info
   */
  async getDatabaseInfo(): Promise<{
    version: string | null
    pageSize: number | null
    pageCount: number | null
    fileSize: number | null
  }> {
    if (!this.client) {
      throw new Error('Database client not initialized')
    }

    try {
      const version = await this.getVersion()
      
      const pageInfo = await this.client.$queryRaw<Array<{ page_size: number; page_count: number }>>`
        PRAGMA page_size; PRAGMA page_count;
      `
      
      const pageSize = pageInfo[0]?.page_size || null
      const pageCount = pageInfo[0]?.page_count || null
      const fileSize = pageSize && pageCount ? pageSize * pageCount : null

      return {
        version,
        pageSize,
        pageCount,
        fileSize,
      }
    } catch (error) {
      console.error('Failed to get SQLite database info:', error)
      return {
        version: null,
        pageSize: null,
        pageCount: null,
        fileSize: null,
      }
    }
  }

  /**
   * Enable WAL mode for better concurrency (SQLite-specific)
   */
  async enableWALMode(): Promise<boolean> {
    if (!this.client) {
      throw new Error('Database client not initialized')
    }

    try {
      await this.client.$executeRaw`PRAGMA journal_mode = WAL`
      return true
    } catch (error) {
      console.error('Failed to enable WAL mode:', error)
      return false
    }
  }

  /**
   * Configure SQLite for better performance
   */
  async optimizeSettings(): Promise<void> {
    if (!this.client) {
      throw new Error('Database client not initialized')
    }

    try {
      // Enable WAL mode for better concurrency
      await this.client.$executeRaw`PRAGMA journal_mode = WAL`
      
      // Set synchronous mode to NORMAL for better performance
      await this.client.$executeRaw`PRAGMA synchronous = NORMAL`
      
      // Set cache size (negative value means KB, positive means pages)
      await this.client.$executeRaw`PRAGMA cache_size = -64000` // 64MB cache
      
      // Enable memory-mapped I/O
      await this.client.$executeRaw`PRAGMA mmap_size = 268435456` // 256MB
      
      // Set temp store to memory
      await this.client.$executeRaw`PRAGMA temp_store = MEMORY`
    } catch (error) {
      console.error('Failed to optimize SQLite settings:', error)
      throw error
    }
  }
}