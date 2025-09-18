/**
 * Example usage of TanCMS database utilities
 * This file demonstrates how to use the database functions in your application
 */

import { PrismaClient } from '@prisma/client'
import { upsertTag, cleanupExpiredSessions } from './db-utils'

const prisma = new PrismaClient()

// Example: Create or get existing tags
async function exampleCreateTags() {
  try {
    const tags = await Promise.all([
      upsertTag(prisma, 'JavaScript'),
      upsertTag(prisma, 'TypeScript'),
      upsertTag(prisma, 'React'),
      upsertTag(prisma, 'Next.js'),
    ])

    console.log('Created/found tags:')
    tags.forEach(tag => console.log(`- ${tag.name} (${tag.id})`))

    return tags
  } catch (error) {
    console.error('Error creating tags:', error)
  }
}

// Example: Clean up expired sessions (recommended to run periodically)
async function exampleCleanupSessions() {
  try {
    const deletedCount = await cleanupExpiredSessions(prisma)
    console.log(`Cleaned up ${deletedCount} expired sessions`)
    return deletedCount
  } catch (error) {
    console.error('Error cleaning up sessions:', error)
  }
}

// Example: Complete workflow
async function exampleWorkflow() {
  console.log('=== TanCMS Demo Workflow ===\n')

  try {
    // 1. Create tags
    console.log('1. Creating demo tags...')
    const tags = await exampleCreateTags()

    // 2. Cleanup sessions
    console.log('\n2. Cleaning up expired sessions...')
    const cleanedSessions = await exampleCleanupSessions()

    // 3. Demo content workflow
    console.log('\n3. Running demo content workflow...')
    await demoContentWorkflow(tags)

    // 4. Demo user workflow
    console.log('\n4. Running demo user workflow...')
    await demoUserWorkflow()

    // 5. System health check
    console.log('\n5. Running system health check...')
    await systemHealthCheck()

    console.log('\n=== Demo Workflow Completed Successfully ===')
    console.log('📊 Demo Statistics:')
    console.log(`  - Tags created: ${tags?.length || 0}`)
    console.log(`  - Sessions cleaned: ${cleanedSessions || 0}`)
    console.log('  - Content workflow: ✅')
    console.log('  - User workflow: ✅')
    console.log('  - System health: ✅')
    
    return {
      success: true,
      stats: {
        tagsCreated: tags?.length || 0,
        sessionsCleaned: cleanedSessions || 0,
        timestamp: new Date().toISOString()
      }
    }
  } catch (error) {
    console.error('\n❌ Demo Workflow Failed:', error)
    throw error
  }
}

// Export functions for use in other parts of your application
export { exampleCreateTags, exampleCleanupSessions, exampleWorkflow }

// Demo: Content workflow demonstration
async function demoContentWorkflow(tags: any[]) {
  try {
    // Check for existing content types
    const contentTypes = await prisma.contentType.findMany()
    console.log(`  Found ${contentTypes.length} content types`)

    // Check for content entries
    const entries = await prisma.contentEntry.findMany({
      include: {
        tags: true,
        contentType: true
      }
    })
    console.log(`  Found ${entries.length} content entries`)

    // Demo: Create a sample content entry if none exist
    if (entries.length === 0 && contentTypes.length > 0 && tags && tags.length > 0) {
      const sampleContent = await prisma.contentEntry.create({
        data: {
          contentTypeId: contentTypes[0].id,
          data: {
            title: 'Demo Content Entry',
            content: 'This is a sample content entry created during the demo workflow.',
            published: true
          },
          tags: {
            connect: [{ id: tags[0].id }]
          }
        }
      })
      console.log(`  ✅ Created demo content entry: ${sampleContent.id}`)
    }

    return { success: true, contentTypes: contentTypes.length, entries: entries.length }
  } catch (error) {
    console.error('  ❌ Content workflow error:', error)
    return { success: false, error: error.message }
  }
}

// Demo: User workflow demonstration  
async function demoUserWorkflow() {
  try {
    // Check existing users
    const users = await prisma.user.findMany()
    console.log(`  Found ${users.length} users`)

    // Check user sessions
    const sessions = await prisma.session.findMany()
    console.log(`  Found ${sessions.length} active sessions`)

    return { success: true, users: users.length, sessions: sessions.length }
  } catch (error) {
    console.error('  ❌ User workflow error:', error)
    return { success: false, error: error.message }
  }
}

// Demo: System health check
async function systemHealthCheck() {
  try {
    // Database connectivity check
    await prisma.$queryRaw`SELECT 1`
    console.log('  ✅ Database connectivity: OK')

    // Check table counts
    const stats = {
      users: await prisma.user.count(),
      contentTypes: await prisma.contentType.count(),
      contentEntries: await prisma.contentEntry.count(),
      tags: await prisma.tag.count(),
      sessions: await prisma.session.count()
    }

    console.log('  📊 Database statistics:')
    Object.entries(stats).forEach(([table, count]) => {
      console.log(`    - ${table}: ${count}`)
    })

    return { success: true, stats }
  } catch (error) {
    console.error('  ❌ System health check failed:', error)
    return { success: false, error: error.message }
  }
}

// Uncomment to run examples (ensure you have a proper environment setup)
// exampleWorkflow()
//   .then(() => process.exit(0))
//   .catch((error) => {
//     console.error('Example workflow failed:', error)
//     process.exit(1)
//   })
