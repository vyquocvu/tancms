/**
 * Example usage of TanCMS database utilities
 * This file demonstrates how to use the database functions in your application
 */

import { PrismaClient } from '@prisma/client'
import { 
  upsertTag,
  cleanupExpiredSessions
} from './db-utils'

const prisma = new PrismaClient()

// Example: Create or get existing tags
async function exampleCreateTags() {
  try {
    const tags = await Promise.all([
      upsertTag(prisma, 'JavaScript'),
      upsertTag(prisma, 'TypeScript'),
      upsertTag(prisma, 'React'),
      upsertTag(prisma, 'Next.js')
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
  console.log('=== TanCMS Database Examples ===\n')
  
  // 1. Create tags
  console.log('1. Creating tags...')
  await exampleCreateTags()
  
  // 2. Cleanup sessions
  console.log('\n2. Cleaning up expired sessions...')
  await exampleCleanupSessions()
  
  console.log('\n=== Examples completed ===')
}

// Export functions for use in other parts of your application
export {
  exampleCreateTags,
  exampleCleanupSessions,
  exampleWorkflow
}

// Uncomment to run examples (ensure you have a proper environment setup)
// exampleWorkflow()
//   .then(() => process.exit(0))
//   .catch((error) => {
//     console.error('Example workflow failed:', error)
//     process.exit(1)
//   })