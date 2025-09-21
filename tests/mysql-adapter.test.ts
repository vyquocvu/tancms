/**
 * MySQL Database Adapter Tests
 */

import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest'
import { MySQLAdapter } from '../app/server/mysql-adapter'
import { DatabaseConfig } from '../app/server/database-adapter'

// Mock Prisma client
const mockPrismaClient = {
  $queryRaw: vi.fn(),
  $executeRaw: vi.fn(),
  $executeRawUnsafe: vi.fn(),
  $disconnect: vi.fn(),
}

// Mock the @prisma/client module
vi.mock('@prisma/client', () => ({
  PrismaClient: vi.fn(() => mockPrismaClient),
}))

describe('MySQLAdapter', () => {
  let adapter: MySQLAdapter
  let config: DatabaseConfig

  beforeEach(() => {
    config = {
      provider: 'mysql',
      url: 'mysql://user:password@localhost:3306/testdb',
      poolSize: 10,
      connectionTimeout: 5000,
    }
    adapter = new MySQLAdapter(config)
    vi.clearAllMocks()
  })

  afterEach(async () => {
    await adapter.close()
  })

  describe('initialization', () => {
    it('should initialize with correct provider', () => {
      expect(adapter.provider).toBe('mysql')
    })

    it('should get connection options', () => {
      const options = adapter.getConnectionOptions()
      expect(options).toHaveProperty('pool')
      expect(options.pool).toHaveProperty('max', 10)
    })

    it('should initialize Prisma client', async () => {
      mockPrismaClient.$queryRaw.mockResolvedValue([{ test: 1 }])
      
      const client = await adapter.initialize()
      expect(client).toBeDefined()
      expect(mockPrismaClient.$queryRaw).toHaveBeenCalledWith(['SELECT 1 as test'])
    })
  })

  describe('connection testing', () => {
    it('should test connection successfully', async () => {
      mockPrismaClient.$queryRaw.mockResolvedValue([{ test: 1 }])
      await adapter.initialize()
      
      const result = await adapter.testConnection()
      expect(result).toBe(true)
    })

    it('should handle connection failure', async () => {
      mockPrismaClient.$queryRaw.mockRejectedValue(new Error('Connection failed'))
      await adapter.initialize().catch(() => {}) // Ignore initialization error
      
      const result = await adapter.testConnection()
      expect(result).toBe(false)
    })
  })

  describe('connection status', () => {
    it('should get connection status', async () => {
      mockPrismaClient.$queryRaw
        .mockResolvedValueOnce([{ test: 1 }]) // For initialization
        .mockResolvedValueOnce([{ count: BigInt(5) }]) // For status check
      
      await adapter.initialize()
      const status = await adapter.getConnectionStatus()
      
      expect(status.isConnected).toBe(true)
      expect(status.activeConnections).toBe(5)
      expect(status.poolSize).toBe(10)
    })

    it('should handle status check failure', async () => {
      mockPrismaClient.$queryRaw
        .mockResolvedValueOnce([{ test: 1 }]) // For initialization
        .mockRejectedValueOnce(new Error('Status check failed'))
      
      await adapter.initialize()
      const status = await adapter.getConnectionStatus()
      
      expect(status.isConnected).toBe(false)
    })
  })

  describe('MySQL-specific features', () => {
    beforeEach(async () => {
      mockPrismaClient.$queryRaw.mockResolvedValue([{ test: 1 }])
      await adapter.initialize()
    })

    it('should get server version', async () => {
      mockPrismaClient.$queryRaw.mockResolvedValue([{ version: '8.0.25' }])
      
      const version = await adapter.getServerVersion()
      expect(version).toBe('8.0.25')
    })

    it('should get server status', async () => {
      mockPrismaClient.$queryRaw.mockResolvedValue([
        { Variable_name: 'Connections', Value: '100' },
        { Variable_name: 'Threads_connected', Value: '5' },
      ])
      
      const status = await adapter.getServerStatus()
      expect(status).toEqual({
        Connections: '100',
        Threads_connected: '5',
      })
    })

    it('should optimize tables', async () => {
      mockPrismaClient.$queryRaw.mockResolvedValue([
        { table_name: 'users' },
        { table_name: 'posts' },
      ])
      mockPrismaClient.$executeRawUnsafe.mockResolvedValue(undefined)
      
      await adapter.optimizeTables()
      
      expect(mockPrismaClient.$executeRawUnsafe).toHaveBeenCalledTimes(2)
      expect(mockPrismaClient.$executeRawUnsafe).toHaveBeenCalledWith('OPTIMIZE TABLE `users`')
      expect(mockPrismaClient.$executeRawUnsafe).toHaveBeenCalledWith('OPTIMIZE TABLE `posts`')
    })

    it('should check feature support', async () => {
      mockPrismaClient.$queryRaw
        .mockResolvedValueOnce([{ version: '8.0.25' }]) // Version check
        .mockResolvedValueOnce([{ test: 1 }]) // JSON support check
        .mockResolvedValueOnce([{ count: BigInt(1) }]) // InnoDB support check
      
      const features = await adapter.checkFeatureSupport()
      
      expect(features.isMariaDB).toBe(false)
      expect(features.version).toBe('8.0.25')
      expect(features.supportsJSON).toBe(true)
      expect(features.supportsFulltext).toBe(true)
    })

    it('should detect MariaDB', async () => {
      mockPrismaClient.$queryRaw
        .mockResolvedValueOnce([{ version: '10.5.8-MariaDB' }])
        .mockResolvedValueOnce([{ test: 1 }])
        .mockResolvedValueOnce([{ count: BigInt(1) }])
      
      const features = await adapter.checkFeatureSupport()
      
      expect(features.isMariaDB).toBe(true)
      expect(features.version).toBe('10.5.8-MariaDB')
    })
  })

  describe('error handling', () => {
    it('should handle initialization without client', async () => {
      const adapter = new MySQLAdapter(config)
      
      await expect(adapter.testConnection()).rejects.toThrow('Database client not initialized')
    })

    it('should handle feature check errors gracefully', async () => {
      // Setup the sequence of calls
      mockPrismaClient.$queryRaw
        .mockResolvedValueOnce([{ test: 1 }]) // For initialization  
        .mockRejectedValueOnce(new Error('Version check failed')) // getServerVersion fails
        .mockResolvedValueOnce([{ test: 1 }]) // JSON support check succeeds
        .mockResolvedValueOnce([{ count: BigInt(1) }]) // Fulltext support check succeeds
      
      await adapter.initialize()
      const features = await adapter.checkFeatureSupport()
      
      expect(features.version).toBeNull()
      expect(features.supportsJSON).toBe(true) // This should succeed
      expect(features.supportsFulltext).toBe(true) // This should succeed
    })
  })

  describe('connection pooling', () => {
    it('should configure connection pool options', () => {
      const options = adapter.getConnectionOptions()
      
      expect(options.pool).toHaveProperty('max', 10)
      expect(options.pool).toHaveProperty('min', 2)
      expect(options.pool).toHaveProperty('acquireTimeoutMillis', 5000)
    })

    it('should handle SSL configuration', () => {
      const sslConfig = { ...config, ssl: true }
      const sslAdapter = new MySQLAdapter(sslConfig)
      
      const options = sslAdapter.getConnectionOptions()
      expect(options.ssl).toBe(true)
    })
  })
})