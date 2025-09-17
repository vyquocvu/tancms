// Graceful fallback for environments where Prisma client cannot be generated
// (e.g., sandboxed environments with network restrictions)

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

const globalForPrisma = globalThis as unknown as { prisma?: PrismaClientType }

export const prisma =
  globalForPrisma.prisma ??
  new PrismaClient({
    log: process.env.NODE_ENV === 'development' ? ['query', 'error', 'warn'] : ['error'],
  })

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma

export { prismaAvailable }
export default prisma
