/**
 * Local storage-based media service for development
 * This provides a working media manager without requiring database setup
 */

import { generateId } from './utils'

export type MediaFile = {
  id: string
  url: string
  filename: string
  name: string
  type: 'image' | 'video' | 'document'
  size: number
  mimeType: string
  altText?: string
  createdAt: string
}

const STORAGE_KEY = 'tancms_media_files'

/**
 * Get media files from localStorage
 */
function getStoredMedia(): MediaFile[] {
  try {
    const stored = localStorage.getItem(STORAGE_KEY)
    return stored ? JSON.parse(stored) : []
  } catch {
    return []
  }
}

/**
 * Save media files to localStorage
 */
function saveMedia(media: MediaFile[]) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(media))
  } catch (error) {
    console.error('Failed to save media to localStorage:', error)
  }
}


/**
 * Get media type from mime type
 */
function getMediaType(mimeType: string): 'image' | 'video' | 'document' {
  if (mimeType.startsWith('image/')) return 'image'
  if (mimeType.startsWith('video/')) return 'video'
  return 'document'
}

/**
 * Upload a file and create media record
 */
export async function uploadFile(file: File, altText?: string): Promise<MediaFile> {
  return new Promise((resolve, reject) => {
    try {
      // Create blob URL for the file
      const url = URL.createObjectURL(file)
      
      // Create media record
      const mediaFile: MediaFile = {
        id: generateId(),
        url,
        filename: file.name,
        name: file.name,
        type: getMediaType(file.type),
        size: file.size,
        mimeType: file.type,
        altText,
        createdAt: new Date().toISOString().split('T')[0]
      }
      
      // Save to localStorage
      const media = getStoredMedia()
      media.unshift(mediaFile) // Add to beginning for recent-first order
      saveMedia(media)
      
      resolve(mediaFile)
    } catch (error) {
      console.error('Upload failed:', error)
      reject(new Error('Failed to upload file'))
    }
  })
}

/**
 * Get all media files with filtering and pagination
 */
export async function getMediaFiles(
  page: number = 1,
  pageSize: number = 20,
  searchTerm?: string,
  type?: string
): Promise<{ media: MediaFile[], pagination: any }> {
  return new Promise((resolve) => {
    try {
      let media = getStoredMedia()
      
      // Apply filters
      if (searchTerm) {
        media = media.filter(item => 
          item.name.toLowerCase().includes(searchTerm.toLowerCase())
        )
      }
      
      if (type && type !== 'all') {
        media = media.filter(item => item.type === type)
      }
      
      // Apply pagination
      const total = media.length
      const totalPages = Math.ceil(total / pageSize)
      const start = (page - 1) * pageSize
      const paginatedMedia = media.slice(start, start + pageSize)
      
      resolve({
        media: paginatedMedia,
        pagination: {
          page,
          pageSize,
          total,
          totalPages
        }
      })
    } catch (error) {
      console.error('Failed to get media files:', error)
      resolve({ media: [], pagination: { page: 1, pageSize, total: 0, totalPages: 0 } })
    }
  })
}

/**
 * Update media metadata
 */
export async function updateMediaFile(id: string, data: { altText?: string }): Promise<MediaFile> {
  return new Promise((resolve, reject) => {
    try {
      const media = getStoredMedia()
      const index = media.findIndex(item => item.id === id)
      
      if (index === -1) {
        reject(new Error('Media file not found'))
        return
      }
      
      // Update the media item
      media[index] = { ...media[index], ...data }
      saveMedia(media)
      
      resolve(media[index])
    } catch (error) {
      console.error('Failed to update media:', error)
      reject(new Error('Failed to update media file'))
    }
  })
}

/**
 * Delete media file
 */
export async function deleteMediaFile(id: string): Promise<boolean> {
  return new Promise((resolve, reject) => {
    try {
      const media = getStoredMedia()
      const index = media.findIndex(item => item.id === id)
      
      if (index === -1) {
        reject(new Error('Media file not found'))
        return
      }
      
      // Revoke the blob URL to free memory
      const item = media[index]
      if (item.url.startsWith('blob:')) {
        URL.revokeObjectURL(item.url)
      }
      
      // Remove from array
      media.splice(index, 1)
      saveMedia(media)
      
      resolve(true)
    } catch (error) {
      console.error('Failed to delete media:', error)
      reject(new Error('Failed to delete media file'))
    }
  })
}

/**
 * Get media statistics
 */
export async function getMediaStatistics(): Promise<{
  total: number
  images: number
  videos: number
  documents: number
  totalSize: number
}> {
  return new Promise((resolve) => {
    try {
      const media = getStoredMedia()
      
      const stats = {
        total: media.length,
        images: media.filter(item => item.type === 'image').length,
        videos: media.filter(item => item.type === 'video').length,
        documents: media.filter(item => item.type === 'document').length,
        totalSize: media.reduce((sum, item) => sum + item.size, 0)
      }
      
      resolve(stats)
    } catch (error) {
      console.error('Failed to get media stats:', error)
      resolve({ total: 0, images: 0, videos: 0, documents: 0, totalSize: 0 })
    }
  })
}