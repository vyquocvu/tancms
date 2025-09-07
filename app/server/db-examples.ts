/**
 * Example usage of TanCMS database utilities
 * This file demonstrates how to use the database functions in your application
 */

import { PrismaClient, PostStatus } from '@prisma/client'
import { 
  createPost, 
  updatePost, 
  getPublishedPosts, 
  getPostBySlug,
  upsertTag,
  cleanupExpiredSessions
} from './db-utils'

const prisma = new PrismaClient()

// Example: Create a new blog post
async function exampleCreatePost() {
  try {
    const post = await createPost(prisma, {
      title: 'My First Blog Post',
      content: `# Welcome to my blog!

This is my first post using TanCMS. It's **awesome**!

## Features I love:
- Auto-generated slugs
- Rich content support
- Tag management
- Media attachments`,
      excerpt: 'This is my first post using TanCMS with all its amazing features.',
      authorId: 'user-id-here', // Replace with actual user ID
      status: PostStatus.PUBLISHED,
      tagIds: ['tag-1', 'tag-2'] // Optional tag IDs
    })

    console.log('Created post:', post.title)
    console.log('SEO-friendly URL:', `/blog/${post.slug}`)
    return post
  } catch (error) {
    console.error('Error creating post:', error)
  }
}

// Example: Update an existing post
async function exampleUpdatePost(postId: string) {
  try {
    const updatedPost = await updatePost(prisma, {
      id: postId,
      title: 'My Updated Blog Post', // This will regenerate the slug
      excerpt: 'Updated excerpt with new information.',
      status: PostStatus.PUBLISHED
    })

    console.log('Updated post:', updatedPost.title)
    console.log('New slug:', updatedPost.slug)
    return updatedPost
  } catch (error) {
    console.error('Error updating post:', error)
  }
}

// Example: Get published posts with pagination
async function exampleGetPosts() {
  try {
    const result = await getPublishedPosts(prisma, 1, 5) // Page 1, 5 posts per page
    
    console.log(`Found ${result.posts.length} posts (${result.pagination.total} total)`)
    console.log(`Page ${result.pagination.page} of ${result.pagination.totalPages}`)
    
    result.posts.forEach(post => {
      console.log(`- ${post.title} (${post.slug})`)
      console.log(`  By: ${post.author?.name || 'Unknown'}`)
      console.log(`  Tags: ${post.tags.map(tag => tag.name).join(', ')}`)
    })
    
    return result
  } catch (error) {
    console.error('Error fetching posts:', error)
  }
}

// Example: Get a specific post by its slug
async function exampleGetPostBySlug(slug: string) {
  try {
    const post = await getPostBySlug(prisma, slug)
    
    if (post) {
      console.log('Found post:', post.title)
      console.log('Author:', post.author?.name)
      console.log('Tags:', post.tags.map(tag => tag.name).join(', '))
      console.log('Status:', post.status)
      console.log('Created:', post.createdAt)
    } else {
      console.log('Post not found')
    }
    
    return post
  } catch (error) {
    console.error('Error fetching post:', error)
  }
}

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
  
  // 1. Create tags first
  console.log('1. Creating tags...')
  await exampleCreateTags()
  
  // 2. Create a post
  console.log('\n2. Creating a post...')
  const post = await exampleCreatePost()
  
  if (post) {
    // 3. Update the post
    console.log('\n3. Updating the post...')
    await exampleUpdatePost(post.id)
    
    // 4. Get the post by slug
    console.log('\n4. Fetching post by slug...')
    await exampleGetPostBySlug(post.slug)
  }
  
  // 5. Get published posts
  console.log('\n5. Fetching published posts...')
  await exampleGetPosts()
  
  // 6. Cleanup sessions
  console.log('\n6. Cleaning up expired sessions...')
  await exampleCleanupSessions()
  
  console.log('\n=== Examples completed ===')
}

// Export functions for use in other parts of your application
export {
  exampleCreatePost,
  exampleUpdatePost,
  exampleGetPosts,
  exampleGetPostBySlug,
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