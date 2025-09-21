/**
 * Database Manager Tests
 */

import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest'
import { DatabaseManager } from '../app/server/database-manager'

// Mock the database adapters
const mockAdapter = {
  initialize: vi.fn(),
  testConnection: vi.fn(),
  getConnectionStatus: vi.fn(),
  close: vi.fn(),
  getConnectionOptions: vi.fn(),
  provider: 'mysql',
}

const mockPrismaClient = {
  $queryRaw: vi.fn(),
  $disconnect: vi.fn(),
}

vi.mock('../app/server/database-adapter', () => ({
  DatabaseAdapterFactory: {
    createAdapter: vi.fn(() => mockAdapter),
  },
}))

describe('DatabaseManager', () => {
  let manager: DatabaseManager
  const originalEnv = process.env

  beforeEach(() => {
    manager = new DatabaseManager()
    vi.clearAllMocks()
    
    // Reset environment
    process.env = { ...originalEnv }
    delete process.env.DATABASE_URL
    delete process.env.DATABASE_PROVIDER
  })

  afterEach(async () => {
    await manager.close()
    process.env = originalEnv
  })

  describe('provider detection', () => {
    it('should detect SQLite from file URL', async () => {
      mockAdapter.initialize.mockResolvedValue(mockPrismaClient)
      mockAdapter.testConnection.mockResolvedValue(true)
      
      await manager.initialize('file:./test.db')
      
      const config = manager.getConfig()
      expect(config?.provider).toBe('sqlite')
    })

    it('should detect MySQL from mysql URL', async () => {
      mockAdapter.initialize.mockResolvedValue(mockPrismaClient)
      mockAdapter.testConnection.mockResolvedValue(true)
      
      await manager.initialize('mysql://user:pass@localhost:3306/db')
      
      const config = manager.getConfig()
      expect(config?.provider).toBe('mysql')
    })

    it('should detect PostgreSQL from postgresql URL', async () => {
      mockAdapter.initialize.mockResolvedValue(mockPrismaClient)
      mockAdapter.testConnection.mockResolvedValue(true)
      
      await manager.initialize('postgresql://user:pass@localhost:5432/db')
      
      const config = manager.getConfig()
      expect(config?.provider).toBe('postgresql')
    })

    it('should use DATABASE_PROVIDER environment variable', async () => {
      process.env.DATABASE_PROVIDER = 'mysql'
      mockAdapter.initialize.mockResolvedValue(mockPrismaClient)
      mockAdapter.testConnection.mockResolvedValue(true)
      
      await manager.initialize('some-ambiguous-url')
      
      const config = manager.getConfig()
      expect(config?.provider).toBe('mysql')
    })

    it('should default to SQLite for unknown URLs', async () => {
      mockAdapter.initialize.mockResolvedValue(mockPrismaClient)
      mockAdapter.testConnection.mockResolvedValue(true)
      
      await manager.initialize('unknown://protocol')
      
      const config = manager.getConfig()
      expect(config?.provider).toBe('sqlite')
    })
  })

  describe('initialization', () => {
    it('should initialize successfully', async () => {
      mockAdapter.initialize.mockResolvedValue(mockPrismaClient)
      mockAdapter.testConnection.mockResolvedValue(true)
      
      const client = await manager.initialize('mysql://user:pass@localhost:3306/db')
      
      expect(client).toBe(mockPrismaClient)
      expect(mockAdapter.initialize).toHaveBeenCalledOnce()
    })

    it('should throw error without DATABASE_URL', async () => {
      await expect(manager.initialize()).rejects.toThrow('DATABASE_URL is required')
    })

    it('should use DATABASE_URL from environment', async () => {
      process.env.DATABASE_URL = 'mysql://user:pass@localhost:3306/db'
      mockAdapter.initialize.mockResolvedValue(mockPrismaClient)
      mockAdapter.testConnection.mockResolvedValue(true)
      
      await manager.initialize()
      
      expect(mockAdapter.initialize).toHaveBeenCalledOnce()
    })

    it('should parse environment variables for database config', async () => {
      process.env.DATABASE_POOL_SIZE = '15'
      process.env.DATABASE_CONNECTION_TIMEOUT = '45000'
      process.env.DATABASE_MAX_RETRIES = '5'
      process.env.DATABASE_SSL = 'true'
      
      mockAdapter.initialize.mockResolvedValue(mockPrismaClient)
      mockAdapter.testConnection.mockResolvedValue(true)
      
      await manager.initialize('mysql://user:pass@localhost:3306/db')
      
      const config = manager.getConfig()
      expect(config?.poolSize).toBe(15)
      expect(config?.connectionTimeout).toBe(45000)
      expect(config?.maxRetries).toBe(5)
      expect(config?.ssl).toBe(true)
    })
  })

  describe('client access', () => {
    it('should return client after initialization', async () => {
      mockAdapter.initialize.mockResolvedValue(mockPrismaClient)
      mockAdapter.testConnection.mockResolvedValue(true)
      
      await manager.initialize('file:./test.db')
      const client = manager.getClient()
      
      expect(client).toBe(mockPrismaClient)
    })

    it('should throw error when accessing client before initialization', () => {
      expect(() => manager.getClient()).toThrow('Database not initialized')
    })

    it('should return adapter after initialization', async () => {
      mockAdapter.initialize.mockResolvedValue(mockPrismaClient)
      mockAdapter.testConnection.mockResolvedValue(true)
      
      await manager.initialize('file:./test.db')
      const adapter = manager.getAdapter()
      
      expect(adapter).toBe(mockAdapter)
    })

    it('should throw error when accessing adapter before initialization', () => {
      expect(() => manager.getAdapter()).toThrow('Database not initialized')
    })
  })

  describe('connection testing', () => {
    beforeEach(async () => {
      mockAdapter.initialize.mockResolvedValue(mockPrismaClient)
      mockAdapter.testConnection.mockResolvedValue(true)
      await manager.initialize('file:./test.db')
    })

    it('should test connection', async () => {
      mockAdapter.testConnection.mockResolvedValue(true)
      
      const result = await manager.testConnection()
      
      expect(result).toBe(true)
      expect(mockAdapter.testConnection).toHaveBeenCalledOnce()
    })

    it('should return false for connection test when not initialized', async () => {
      const uninitializedManager = new DatabaseManager()
      
      const result = await uninitializedManager.testConnection()
      
      expect(result).toBe(false)
    })

    it('should get connection status', async () => {
      const status = { isConnected: true, activeConnections: 5 }
      mockAdapter.getConnectionStatus.mockResolvedValue(status)
      
      const result = await manager.getConnectionStatus()
      
      expect(result).toEqual(status)
      expect(mockAdapter.getConnectionStatus).toHaveBeenCalledOnce()
    })
  })

  describe('health check', () => {
    it('should return healthy status', async () => {
      mockAdapter.initialize.mockResolvedValue(mockPrismaClient)
      mockAdapter.testConnection.mockResolvedValue(true)
      mockAdapter.getConnectionStatus.mockResolvedValue({ isConnected: true })
      
      await manager.initialize('mysql://user:pass@localhost:3306/db')
      
      const health = await manager.healthCheck()
      
      expect(health.status).toBe('healthy')
      expect(health.provider).toBe('mysql')
      expect(health.connected).toBe(true)
    })

    it('should return unhealthy status when not connected', async () => {
      mockAdapter.initialize.mockResolvedValue(mockPrismaClient)
      mockAdapter.testConnection.mockResolvedValue(false)
      
      await manager.initialize('mysql://user:pass@localhost:3306/db')
      
      const health = await manager.healthCheck()
      
      expect(health.status).toBe('unhealthy')
      expect(health.connected).toBe(false)
    })

    it('should return unhealthy status when not initialized', async () => {
      const health = await manager.healthCheck()
      
      expect(health.status).toBe('unhealthy')
      expect(health.connected).toBe(false)
      expect(health.error).toBe('Database not initialized')
    })

    it('should handle health check errors', async () => {
      mockAdapter.initialize.mockResolvedValue(mockPrismaClient)
      mockAdapter.testConnection.mockRejectedValue(new Error('Connection failed'))
      
      await manager.initialize('mysql://user:pass@localhost:3306/db')
      
      const health = await manager.healthCheck()
      
      expect(health.status).toBe('unhealthy')
      expect(health.error).toBe('Connection failed')
    })
  })

  describe('statistics', () => {
    it('should get basic statistics', async () => {
      mockAdapter.initialize.mockResolvedValue(mockPrismaClient)
      mockAdapter.testConnection.mockResolvedValue(true)
      mockAdapter.getConnectionStatus.mockResolvedValue({ isConnected: true })
      
      await manager.initialize('file:./test.db')
      
      const stats = await manager.getStatistics()
      
      expect(stats.provider).toBe('sqlite')
      expect(stats.connectionStatus).toEqual({ isConnected: true })
    })

    it('should return empty stats when not initialized', async () => {
      const stats = await manager.getStatistics()
      
      expect(stats).toEqual({})
    })
  })

  describe('cleanup', () => {
    it('should close connection', async () => {
      mockAdapter.initialize.mockResolvedValue(mockPrismaClient)
      mockAdapter.testConnection.mockResolvedValue(true)
      
      await manager.initialize('file:./test.db')
      await manager.close()
      
      expect(mockAdapter.close).toHaveBeenCalledOnce()
      expect(() => manager.getClient()).toThrow('Database not initialized')
    })

    it('should handle close when not initialized', async () => {
      await manager.close() // Should not throw
      expect(mockAdapter.close).not.toHaveBeenCalled()
    })
  })
})