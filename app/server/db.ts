// Dynamic database client with adapter support
// Graceful fallback for environments where Prisma client cannot be generated

import { databaseManager } from './database-manager'

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type PrismaClientType = any

// eslint-disable-next-line @typescript-eslint/no-explicit-any
let PrismaClient: new (options?: any) => PrismaClientType
let prismaAvailable = false

try {
  // Try to import Prisma client
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  const prismaImport = require('@prisma/client')
  PrismaClient = prismaImport.PrismaClient
  prismaAvailable = true
} catch {
  // Fallback for when Prisma client is not available
  console.warn('Prisma client not available - using mock implementation')
  PrismaClient = class MockPrismaClient {
    constructor() {
      console.warn('Using mock Prisma client - database operations will not work')
    }
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
  } as new (options?: any) => PrismaClientType
  prismaAvailable = false
}

const globalForPrisma = globalThis as unknown as { 
  prisma?: PrismaClientType
  databaseInitialized?: boolean
}

// Initialize database dynamically
let initPromise: Promise<PrismaClientType> | null = null

async function initializeDatabase(): Promise<PrismaClientType> {
  if (globalForPrisma.prisma && globalForPrisma.databaseInitialized) {
    return globalForPrisma.prisma
  }

  if (!prismaAvailable) {
    // Return mock client
    globalForPrisma.prisma = new PrismaClient()
    globalForPrisma.databaseInitialized = true
    return globalForPrisma.prisma
  }

  try {
    // Use database manager for dynamic initialization
    const client = await databaseManager.initialize()
    globalForPrisma.prisma = client
    globalForPrisma.databaseInitialized = true
    return client
  } catch (error) {
    console.error('Failed to initialize database:', error)
    // Fallback to basic Prisma client
    const fallbackClient = new PrismaClient({
      log: process.env.NODE_ENV === 'development' ? ['query', 'error', 'warn'] : ['error'],
    })
    globalForPrisma.prisma = fallbackClient
    globalForPrisma.databaseInitialized = true
    return fallbackClient
  }
}

// Create lazy-loaded prisma client
export const prisma = new Proxy({} as PrismaClientType, {
  get(target, prop) {
    if (!initPromise) {
      initPromise = initializeDatabase()
    }
    
    return initPromise.then(client => {
      if (typeof client[prop] === 'function') {
        return client[prop].bind(client)
      }
      return client[prop]
    })
  }
})

// For synchronous access after initialization
export function getPrismaClient(): PrismaClientType {
  if (!globalForPrisma.prisma || !globalForPrisma.databaseInitialized) {
    throw new Error('Database not initialized. Use prisma proxy or call initializeDatabase() first.')
  }
  return globalForPrisma.prisma
}

// Export database manager for direct access
export { databaseManager, initializeDatabase }
export { prismaAvailable }
export default prisma
