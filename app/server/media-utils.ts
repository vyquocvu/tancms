/**
 * Media utility functions for TanCMS
 */

import { PrismaClient } from '@prisma/client'
import { generateId } from '../lib/utils'

export type CreateMediaData = {
  url: string
  filename: string
  size: number
  mimeType: string
  altText?: string
}

export type UpdateMediaData = Partial<CreateMediaData> & {
  id: string
}

/**
 * Create a new media file record
 */
export async function createMedia(prisma: PrismaClient, data: CreateMediaData) {
  return await prisma.media.create({
    data: {
      url: data.url,
      filename: data.filename,
      size: data.size,
      mimeType: data.mimeType,
      altText: data.altText,
    },
  })
}

/**
 * Get all media files with pagination
 */
export async function getMedia(
  prisma: PrismaClient,
  page: number = 1,
  pageSize: number = 20,
  searchTerm?: string,
  type?: string
) {
  const skip = (page - 1) * pageSize

  // Build where clause for filtering
  const where: any = {}

  if (searchTerm) {
    where.filename = {
      contains: searchTerm,
      mode: 'insensitive',
    }
  }

  if (type && type !== 'all') {
    switch (type) {
      case 'image':
        where.mimeType = { startsWith: 'image/' }
        break
      case 'video':
        where.mimeType = { startsWith: 'video/' }
        break
      case 'document':
        where.mimeType = {
          not: {
            OR: [{ startsWith: 'image/' }, { startsWith: 'video/' }],
          },
        }
        break
    }
  }

  const [media, total] = await Promise.all([
    prisma.media.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      skip,
      take: pageSize,
    }),
    prisma.media.count({ where }),
  ])

  return {
    media,
    pagination: {
      page,
      pageSize,
      total,
      totalPages: Math.ceil(total / pageSize),
    },
  }
}

/**
 * Get a single media file by ID
 */
export async function getMediaById(prisma: PrismaClient, id: string) {
  return await prisma.media.findUnique({
    where: { id },
  })
}

/**
 * Update media metadata
 */
export async function updateMedia(prisma: PrismaClient, data: UpdateMediaData) {
  const { id, ...updateData } = data

  return await prisma.media.update({
    where: { id },
    data: updateData,
  })
}

/**
 * Delete a media file
 */
export async function deleteMedia(prisma: PrismaClient, id: string) {
  return await prisma.media.delete({
    where: { id },
  })
}

/**
 * Get media statistics
 */
export async function getMediaStats(prisma: PrismaClient) {
  const [totalCount, imageCount, videoCount, totalSize] = await Promise.all([
    prisma.media.count(),
    prisma.media.count({
      where: { mimeType: { startsWith: 'image/' } },
    }),
    prisma.media.count({
      where: { mimeType: { startsWith: 'video/' } },
    }),
    prisma.media.aggregate({
      _sum: { size: true },
    }),
  ])

  return {
    total: totalCount,
    images: imageCount,
    videos: videoCount,
    documents: totalCount - imageCount - videoCount,
    totalSize: totalSize._sum.size || 0,
  }
}

/**
 * Get media type from mime type
 */
export function getMediaType(mimeType: string): 'image' | 'video' | 'document' {
  if (mimeType.startsWith('image/')) return 'image'
  if (mimeType.startsWith('video/')) return 'video'
  return 'document'
}

/**
 * Generate unique filename to avoid conflicts
 */
export function generateUniqueFilename(originalFilename: string): string {
  const timestamp = Date.now()
  const randomId = generateId()
  const extension = originalFilename.split('.').pop()
  const baseName = originalFilename.replace(/\.[^/.]+$/, '')

  return `${baseName}-${timestamp}-${randomId}.${extension}`
}
