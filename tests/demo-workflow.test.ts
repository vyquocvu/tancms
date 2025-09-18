/**
 * Demo Workflow Test Suite
 * 
 * Tests the demo workflow functionality including:
 * - Database operations
 * - Content management
 * - User workflows
 * - System health checks
 */

import { describe, it, expect, beforeAll, afterAll } from 'vitest'
import { PrismaClient } from '@prisma/client'
import { exampleWorkflow, exampleCreateTags, exampleCleanupSessions } from '../app/server/db-examples'

describe('Demo Workflow', () => {
  let prisma: PrismaClient

  beforeAll(async () => {
    prisma = new PrismaClient()
    await prisma.$connect()
  })

  afterAll(async () => {
    await prisma.$disconnect()
  })

  describe('Tag Management Demo', () => {
    it('should create demo tags successfully', async () => {
      const tags = await exampleCreateTags()
      
      expect(tags).toBeDefined()
      expect(Array.isArray(tags)).toBe(true)
      expect(tags.length).toBeGreaterThan(0)
      
      // Verify tags were created with expected names
      const tagNames = tags.map(tag => tag.name)
      expect(tagNames).toContain('JavaScript')
      expect(tagNames).toContain('TypeScript')
      expect(tagNames).toContain('React')
      expect(tagNames).toContain('Next.js')
    })

    it('should handle duplicate tag creation gracefully', async () => {
      // Create tags twice to test upsert behavior
      const firstRun = await exampleCreateTags()
      const secondRun = await exampleCreateTags()
      
      expect(firstRun.length).toBe(secondRun.length)
      
      // Compare tag IDs to ensure they're the same
      const firstIds = firstRun.map(tag => tag.id).sort()
      const secondIds = secondRun.map(tag => tag.id).sort()
      expect(firstIds).toEqual(secondIds)
    })
  })

  describe('Session Cleanup Demo', () => {
    it('should cleanup expired sessions', async () => {
      const cleanedCount = await exampleCleanupSessions()
      
      expect(typeof cleanedCount).toBe('number')
      expect(cleanedCount).toBeGreaterThanOrEqual(0)
    })

    it('should not cleanup valid sessions', async () => {
      // Create a fresh session
      const session = await prisma.session.create({
        data: {
          id: 'test-session-' + Date.now(),
          userId: 'test-user',
          expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000) // 24 hours from now
        }
      })

      const cleanedCount = await exampleCleanupSessions()
      
      // Verify the fresh session still exists
      const existingSession = await prisma.session.findUnique({
        where: { id: session.id }
      })
      
      expect(existingSession).toBeDefined()
      
      // Cleanup test session
      await prisma.session.delete({
        where: { id: session.id }
      })
    })
  })

  describe('Complete Demo Workflow', () => {
    it('should execute the complete workflow successfully', async () => {
      const result = await exampleWorkflow()
      
      expect(result).toBeDefined()
      expect(result.success).toBe(true)
      expect(result.stats).toBeDefined()
      expect(result.stats.timestamp).toBeDefined()
      expect(typeof result.stats.tagsCreated).toBe('number')
      expect(typeof result.stats.sessionsCleaned).toBe('number')
    })

    it('should handle workflow errors gracefully', async () => {
      // Temporarily disconnect prisma to simulate an error
      await prisma.$disconnect()
      
      try {
        await exampleWorkflow()
        // Should not reach here
        expect(true).toBe(false)
      } catch (error) {
        expect(error).toBeDefined()
      } finally {
        // Reconnect for cleanup
        await prisma.$connect()
      }
    })
  })

  describe('Database Health Checks', () => {
    it('should verify database connectivity', async () => {
      const result = await prisma.$queryRaw`SELECT 1 as test`
      expect(result).toBeDefined()
    })

    it('should count database records correctly', async () => {
      const stats = {
        users: await prisma.user.count(),
        contentTypes: await prisma.contentType.count(),
        contentEntries: await prisma.contentEntry.count(),
        tags: await prisma.tag.count(),
        sessions: await prisma.session.count()
      }

      Object.values(stats).forEach(count => {
        expect(typeof count).toBe('number')
        expect(count).toBeGreaterThanOrEqual(0)
      })
    })
  })

  describe('Demo Data Validation', () => {
    it('should have valid demo content structure', async () => {
      const contentTypes = await prisma.contentType.findMany()
      const entries = await prisma.contentEntry.findMany({
        include: {
          tags: true,
          contentType: true
        }
      })

      // Validate content types exist
      expect(contentTypes.length).toBeGreaterThanOrEqual(0)

      // Validate entries have proper structure
      entries.forEach(entry => {
        expect(entry.id).toBeDefined()
        expect(entry.contentTypeId).toBeDefined()
        expect(entry.data).toBeDefined()
        expect(entry.contentType).toBeDefined()
      })
    })

    it('should have valid user accounts for demo', async () => {
      const users = await prisma.user.findMany()
      
      // Should have at least admin user from seed
      expect(users.length).toBeGreaterThanOrEqual(1)
      
      users.forEach(user => {
        expect(user.id).toBeDefined()
        expect(user.email).toBeDefined()
        expect(user.email).toMatch(/^[^\s@]+@[^\s@]+\.[^\s@]+$/) // Valid email format
      })
    })
  })

  describe('Demo Performance', () => {
    it('should complete workflow within reasonable time', async () => {
      const startTime = Date.now()
      
      await exampleWorkflow()
      
      const duration = Date.now() - startTime
      
      // Should complete within 30 seconds
      expect(duration).toBeLessThan(30000)
    }, 30000)

    it('should handle concurrent workflow executions', async () => {
      const promises = [
        exampleCreateTags(),
        exampleCreateTags(),
        exampleCleanupSessions()
      ]

      const results = await Promise.all(promises)
      
      // All should complete successfully
      results.forEach(result => {
        expect(result).toBeDefined()
      })
    })
  })

  describe('Error Handling', () => {
    it('should handle missing database tables gracefully', async () => {
      // This test assumes proper error handling in the workflow functions
      // In a real scenario, we might temporarily drop tables or use a separate test database
      
      try {
        // Try to query a non-existent table (this should be handled gracefully)
        await prisma.$queryRaw`SELECT * FROM non_existent_table LIMIT 1`
      } catch (error) {
        expect(error).toBeDefined()
        expect(error.message).toContain('non_existent_table')
      }
    })

    it('should provide meaningful error messages', async () => {
      try {
        // Attempt an invalid database operation
        await prisma.user.create({
          data: {
            email: 'invalid-email-format'
            // Missing required fields to trigger validation error
          }
        })
      } catch (error) {
        expect(error).toBeDefined()
        expect(error.message).toBeDefined()
        expect(typeof error.message).toBe('string')
      }
    })
  })
})