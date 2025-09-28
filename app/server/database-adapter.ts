/**
 * Database adapter interface for TanCMS
 * Provides a common interface for different database providers
 */

import { PrismaClient } from '@prisma/client'

export interface DatabaseAdapter {
  /**
   * Initialize the database connection
   */
  initialize(): Promise<PrismaClient>

  /**
   * Test the database connection
   */
  testConnection(): Promise<boolean>

  /**
   * Get connection pool status
   */
  getConnectionStatus(): Promise<{
    isConnected: boolean
    activeConnections?: number
    poolSize?: number
  }>

  /**
   * Close all connections
   */
  close(): Promise<void>

  /**
   * Provider-specific connection options
   */
  getConnectionOptions(): Record<string, unknown>

  /**
   * Provider name
   */
  readonly provider: string
}

export interface DatabaseConfig {
  provider: 'sqlite' | 'mysql' | 'postgresql'
  url: string
  poolSize?: number
  connectionTimeout?: number
  maxRetries?: number
  ssl?: boolean
}

/**
 * Base adapter class with common functionality
 */
export abstract class BaseAdapter implements DatabaseAdapter {
  protected config: DatabaseConfig
  protected client?: PrismaClient

  constructor(config: DatabaseConfig) {
    this.config = config
  }

  abstract initialize(): Promise<PrismaClient>
  abstract testConnection(): Promise<boolean>
  abstract getConnectionOptions(): Record<string, unknown>
  abstract readonly provider: string

  async getConnectionStatus() {
    if (!this.client) {
      return { isConnected: false }
    }

    try {
      await this.client.$queryRaw`SELECT 1`
      return { isConnected: true }
    } catch {
      return { isConnected: false }
    }
  }

  async close() {
    if (this.client) {
      await this.client.$disconnect()
      this.client = undefined
    }
  }
}

/**
 * Database adapter factory
 */
export class DatabaseAdapterFactory {
  static createAdapter(config: DatabaseConfig): DatabaseAdapter {
    switch (config.provider) {
      case 'sqlite': {
        // Dynamic import to avoid circular dependency
        const { SQLiteAdapter } = require('./sqlite-adapter')
        return new SQLiteAdapter(config)
      }
      case 'mysql': {
        // Dynamic import to avoid circular dependency
        const { MySQLAdapter } = require('./mysql-adapter')
        return new MySQLAdapter(config)
      }
      case 'postgresql': {
        // Dynamic import to avoid circular dependency
        const { PostgreSQLAdapter } = require('./postgresql-adapter')
        return new PostgreSQLAdapter(config)
      }
      default:
        throw new Error(`Unsupported database provider: ${config.provider}`)
    }
  }
}