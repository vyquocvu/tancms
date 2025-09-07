/**
 * Database utility functions for TanCMS
 */

import { PrismaClient, PostStatus } from '@prisma/client'
import { generateSlug } from '../lib/utils'

export type CreatePostData = {
  title: string
  content: string
  excerpt?: string
  authorId: string
  tagIds?: string[]
  mediaId?: string
  status?: PostStatus
}

export type UpdatePostData = Partial<CreatePostData> & {
  id: string
  slug?: string
}

/**
 * Create a new post with auto-generated slug
 */
export async function createPost(prisma: PrismaClient, data: CreatePostData) {
  const baseSlug = generateSlug(data.title)
  let slug = baseSlug
  let counter = 1

  // Ensure slug is unique
  while (await prisma.post.findUnique({ where: { slug } })) {
    slug = `${baseSlug}-${counter}`
    counter++
  }

  return await prisma.post.create({
    data: {
      title: data.title,
      slug,
      content: data.content,
      excerpt: data.excerpt,
      status: data.status || PostStatus.DRAFT,
      authorId: data.authorId,
      mediaId: data.mediaId,
      ...(data.tagIds && {
        tags: {
          connect: data.tagIds.map(id => ({ id }))
        }
      })
    },
    include: {
      author: {
        select: { id: true, name: true, email: true, role: true }
      },
      tags: true,
      media: true
    }
  })
}

/**
 * Update an existing post
 */
export async function updatePost(prisma: PrismaClient, data: UpdatePostData) {
  const { id, tagIds, ...updateData } = data

  // Generate new slug if title changed
  if (updateData.title) {
    const baseSlug = generateSlug(updateData.title)
    let slug = baseSlug
    let counter = 1

    // Ensure slug is unique (excluding current post)
    while (await prisma.post.findFirst({ 
      where: { slug, NOT: { id } } 
    })) {
      slug = `${baseSlug}-${counter}`
      counter++
    }
    updateData.slug = slug
  }

  return await prisma.post.update({
    where: { id },
    data: {
      ...updateData,
      ...(tagIds && {
        tags: {
          set: tagIds.map(id => ({ id }))
        }
      })
    },
    include: {
      author: {
        select: { id: true, name: true, email: true, role: true }
      },
      tags: true,
      media: true
    }
  })
}

/**
 * Get published posts with pagination
 */
export async function getPublishedPosts(
  prisma: PrismaClient, 
  page: number = 1, 
  pageSize: number = 10
) {
  const skip = (page - 1) * pageSize

  const [posts, total] = await Promise.all([
    prisma.post.findMany({
      where: { status: PostStatus.PUBLISHED },
      include: {
        author: {
          select: { id: true, name: true, email: true }
        },
        tags: true,
        media: true
      },
      orderBy: { createdAt: 'desc' },
      skip,
      take: pageSize
    }),
    prisma.post.count({
      where: { status: PostStatus.PUBLISHED }
    })
  ])

  return {
    posts,
    pagination: {
      page,
      pageSize,
      total,
      totalPages: Math.ceil(total / pageSize)
    }
  }
}

/**
 * Get a post by slug
 */
export async function getPostBySlug(prisma: PrismaClient, slug: string) {
  return await prisma.post.findUnique({
    where: { slug },
    include: {
      author: {
        select: { id: true, name: true, email: true, role: true }
      },
      tags: true,
      media: true
    }
  })
}

/**
 * Create or get tag by name
 */
export async function upsertTag(prisma: PrismaClient, name: string) {
  return await prisma.tag.upsert({
    where: { name },
    update: {},
    create: { name }
  })
}

/**
 * Clean up expired sessions
 */
export async function cleanupExpiredSessions(prisma: PrismaClient) {
  const result = await prisma.session.deleteMany({
    where: {
      expiresAt: {
        lt: new Date()
      }
    }
  })
  
  return result.count
}