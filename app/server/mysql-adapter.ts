/**
 * MySQL Database Adapter for TanCMS
 * Provides MySQL/MariaDB-specific database functionality
 */

import { PrismaClient } from '@prisma/client'
import { BaseAdapter, DatabaseConfig } from './database-adapter'

export class MySQLAdapter extends BaseAdapter {
  readonly provider = 'mysql'

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
      // Use MySQL-specific query to test connection
      await this.client.$queryRaw`SELECT 1 as test`
      return true
    } catch (error) {
      console.error('MySQL connection test failed:', error)
      return false
    }
  }

  getConnectionOptions(): Record<string, unknown> {
    const options: Record<string, unknown> = {}

    // Configure connection pool for MySQL
    if (this.config.poolSize) {
      // Note: Prisma handles connection pooling internally for MySQL
      // These options would be passed to the underlying MySQL driver
      options.pool = {
        max: this.config.poolSize,
        min: Math.max(1, Math.floor(this.config.poolSize / 4)),
        acquireTimeoutMillis: this.config.connectionTimeout || 60000,
        createTimeoutMillis: 30000,
        destroyTimeoutMillis: 5000,
        idleTimeoutMillis: 600000,
        reapIntervalMillis: 1000,
        createRetryIntervalMillis: 200,
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
      // Get MySQL-specific connection information
      const result = await this.client.$queryRaw<Array<{ count: bigint }>>`
        SELECT COUNT(*) as count FROM INFORMATION_SCHEMA.PROCESSLIST 
        WHERE USER = USER()
      `
      
      const activeConnections = Number(result[0]?.count || 0)

      return {
        isConnected: true,
        activeConnections,
        poolSize: this.config.poolSize,
      }
    } catch (error) {
      console.error('Failed to get MySQL connection status:', error)
      return { isConnected: false }
    }
  }

  /**
   * Get MySQL server version
   */
  async getServerVersion(): Promise<string | null> {
    if (!this.client) {
      return null
    }

    try {
      const result = await this.client.$queryRaw<Array<{ version: string }>>`
        SELECT VERSION() as version
      `
      return result[0]?.version || null
    } catch {
      return null
    }
  }

  /**
   * Get MySQL server status
   */
  async getServerStatus(): Promise<Record<string, unknown> | null> {
    if (!this.client) {
      return null
    }

    try {
      const result = await this.client.$queryRaw<Array<{ Variable_name: string; Value: string }>>`
        SHOW STATUS WHERE Variable_name IN ('Connections', 'Threads_connected', 'Uptime')
      `
      
      const status: Record<string, unknown> = {}
      result.forEach(row => {
        status[row.Variable_name] = row.Value
      })
      
      return status
    } catch {
      return null
    }
  }

  /**
   * Optimize tables (MySQL-specific maintenance)
   */
  async optimizeTables(): Promise<void> {
    if (!this.client) {
      throw new Error('Database client not initialized')
    }

    try {
      // Get all tables in the current database
      const tables = await this.client.$queryRaw<Array<{ table_name: string }>>`
        SELECT table_name 
        FROM information_schema.tables 
        WHERE table_schema = DATABASE()
        AND table_type = 'BASE TABLE'
      `

      // Optimize each table
      for (const table of tables) {
        await this.client.$executeRawUnsafe(`OPTIMIZE TABLE \`${table.table_name}\``)
      }
    } catch (error) {
      console.error('Failed to optimize MySQL tables:', error)
      throw error
    }
  }

  /**
   * Check if MySQL/MariaDB specific features are available
   */
  async checkFeatureSupport(): Promise<{
    isMariaDB: boolean
    version: string | null
    supportsJSON: boolean
    supportsFulltext: boolean
  }> {
    if (!this.client) {
      throw new Error('Database client not initialized')
    }

    try {
      const version = await this.getServerVersion()
      const isMariaDB = version?.toLowerCase().includes('mariadb') || false
      
      // Check JSON support (MySQL 5.7+ or MariaDB 10.2+)
      let supportsJSON = false
      try {
        await this.client.$queryRaw`SELECT JSON_VALID('{}') as test`
        supportsJSON = true
      } catch {
        supportsJSON = false
      }

      // Check fulltext search support
      let supportsFulltext = false
      try {
        const result = await this.client.$queryRaw<Array<{ count: bigint }>>`
          SELECT COUNT(*) as count 
          FROM information_schema.ENGINES 
          WHERE ENGINE = 'InnoDB' AND SUPPORT = 'YES'
        `
        supportsFulltext = Number(result[0]?.count || 0) > 0
      } catch {
        supportsFulltext = false
      }

      return {
        isMariaDB,
        version,
        supportsJSON,
        supportsFulltext,
      }
    } catch (error) {
      console.error('Failed to check MySQL feature support:', error)
      return {
        isMariaDB: false,
        version: null,
        supportsJSON: false,
        supportsFulltext: false,
      }
    }
  }
}