/**
 * Database utility functions for TanCMS
 */

import { PrismaClient } from '@prisma/client'

/**
 * Create or get tag by name
 */
export async function upsertTag(prisma: PrismaClient, name: string) {
  return await prisma.tag.upsert({
    where: { name },
    update: {},
    create: { name },
  })
}

/**
 * Clean up expired sessions
 */
export async function cleanupExpiredSessions(prisma: PrismaClient) {
  const result = await prisma.session.deleteMany({
    where: {
      expiresAt: {
        lt: new Date(),
      },
    },
  })

  return result.count
}
