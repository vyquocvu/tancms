/**
 * Content Type Builder utility functions for TanCMS
 */

import { PrismaClient, FieldType } from '@prisma/client'
import { generateSlug } from '../lib/utils'

export type CreateContentTypeData = {
  name: string
  displayName: string
  description?: string
  fields: CreateContentFieldData[]
}

export type CreateContentFieldData = {
  name: string
  displayName: string
  fieldType: FieldType
  required?: boolean
  unique?: boolean
  defaultValue?: string
  options?: Record<string, unknown>
  relatedType?: string
  order?: number
}

export type CreateContentEntryData = {
  contentTypeId: string
  slug?: string
  fieldValues: {
    fieldId: string
    value: unknown
  }[]
}

/**
 * Create a new content type with fields
 */
export async function createContentType(prisma: PrismaClient, data: CreateContentTypeData) {
  const baseSlug = generateSlug(data.name)
  let slug = baseSlug
  let counter = 1

  // Ensure slug is unique
  while (await prisma.contentType.findUnique({ where: { slug } })) {
    slug = `${baseSlug}-${counter}`
    counter++
  }

  return await prisma.contentType.create({
    data: {
      name: data.name,
      displayName: data.displayName,
      description: data.description,
      slug,
      fields: {
        create: data.fields.map((field, index) => ({
          name: field.name,
          displayName: field.displayName,
          fieldType: field.fieldType,
          required: field.required || false,
          unique: field.unique || false,
          defaultValue: field.defaultValue,
          options: field.options ? JSON.stringify(field.options) : null,
          relatedType: field.relatedType,
          order: field.order ?? index
        }))
      }
    },
    include: {
      fields: {
        orderBy: { order: 'asc' }
      }
    }
  })
}

/**
 * Update an existing content type
 */
export async function updateContentType(
  prisma: PrismaClient, 
  id: string, 
  data: Partial<CreateContentTypeData>
) {
  const updateData: any = {}
  
  if (data.name) updateData.name = data.name
  if (data.displayName) updateData.displayName = data.displayName
  if (data.description !== undefined) updateData.description = data.description
  
  // If name changed, update slug
  if (data.name) {
    const baseSlug = generateSlug(data.name)
    let slug = baseSlug
    let counter = 1

    while (await prisma.contentType.findFirst({ 
      where: { slug, id: { not: id } } 
    })) {
      slug = `${baseSlug}-${counter}`
      counter++
    }
    updateData.slug = slug
  }

  return await prisma.contentType.update({
    where: { id },
    data: updateData,
    include: {
      fields: {
        orderBy: { order: 'asc' }
      }
    }
  })
}

/**
 * Get all content types
 */
export async function getContentTypes(prisma: PrismaClient) {
  return await prisma.contentType.findMany({
    include: {
      fields: {
        orderBy: { order: 'asc' }
      },
      _count: {
        select: { entries: true }
      }
    },
    orderBy: { createdAt: 'desc' }
  })
}

/**
 * Get a content type by ID
 */
export async function getContentTypeById(prisma: PrismaClient, id: string) {
  return await prisma.contentType.findUnique({
    where: { id },
    include: {
      fields: {
        orderBy: { order: 'asc' }
      }
    }
  })
}

/**
 * Get a content type by slug
 */
export async function getContentTypeBySlug(prisma: PrismaClient, slug: string) {
  return await prisma.contentType.findUnique({
    where: { slug },
    include: {
      fields: {
        orderBy: { order: 'asc' }
      }
    }
  })
}

/**
 * Delete a content type
 */
export async function deleteContentType(prisma: PrismaClient, id: string) {
  return await prisma.contentType.delete({
    where: { id }
  })
}

/**
 * Add field to content type
 */
export async function addFieldToContentType(
  prisma: PrismaClient,
  contentTypeId: string,
  fieldData: CreateContentFieldData
) {
  const existingFields = await prisma.contentField.count({
    where: { contentTypeId }
  })

  return await prisma.contentField.create({
    data: {
      name: fieldData.name,
      displayName: fieldData.displayName,
      fieldType: fieldData.fieldType,
      required: fieldData.required || false,
      unique: fieldData.unique || false,
      defaultValue: fieldData.defaultValue,
      options: fieldData.options ? JSON.stringify(fieldData.options) : null,
      relatedType: fieldData.relatedType,
      order: fieldData.order ?? existingFields,
      contentTypeId
    }
  })
}

/**
 * Update a field
 */
export async function updateContentField(
  prisma: PrismaClient,
  fieldId: string,
  data: Partial<CreateContentFieldData>
) {
  const updateData: Record<string, unknown> = {}
  
  if (data.name) updateData.name = data.name
  if (data.displayName) updateData.displayName = data.displayName
  if (data.fieldType) updateData.fieldType = data.fieldType
  if (data.required !== undefined) updateData.required = data.required
  if (data.unique !== undefined) updateData.unique = data.unique
  if (data.defaultValue !== undefined) updateData.defaultValue = data.defaultValue
  if (data.relatedType !== undefined) updateData.relatedType = data.relatedType
  if (data.order !== undefined) updateData.order = data.order
  if (data.options !== undefined) {
    updateData.options = data.options ? JSON.stringify(data.options) : null
  }

  return await prisma.contentField.update({
    where: { id: fieldId },
    data: updateData
  })
}

/**
 * Delete a field
 */
export async function deleteContentField(prisma: PrismaClient, fieldId: string) {
  return await prisma.contentField.delete({
    where: { id: fieldId }
  })
}

/**
 * Create content entry
 */
export async function createContentEntry(prisma: PrismaClient, data: CreateContentEntryData) {
  let slug = data.slug
  
  if (slug) {
    let counter = 1
    const baseSlug = slug
    
    // Ensure slug is unique within content type
    while (await prisma.contentEntry.findFirst({ 
      where: { contentTypeId: data.contentTypeId, slug } 
    })) {
      slug = `${baseSlug}-${counter}`
      counter++
    }
  }

  return await prisma.contentEntry.create({
    data: {
      contentTypeId: data.contentTypeId,
      slug,
      fieldValues: {
        create: data.fieldValues.map(fv => ({
          fieldId: fv.fieldId,
          value: typeof fv.value === 'string' ? fv.value : JSON.stringify(fv.value)
        }))
      }
    },
    include: {
      contentType: true,
      fieldValues: {
        include: {
          field: true
        }
      }
    }
  })
}

/**
 * Get content entries for a content type
 */
export async function getContentEntries(
  prisma: PrismaClient,
  contentTypeId: string,
  page: number = 1,
  pageSize: number = 10
) {
  const skip = (page - 1) * pageSize

  const [entries, total] = await Promise.all([
    prisma.contentEntry.findMany({
      where: { contentTypeId },
      include: {
        fieldValues: {
          include: {
            field: true
          }
        }
      },
      orderBy: { createdAt: 'desc' },
      skip,
      take: pageSize
    }),
    prisma.contentEntry.count({
      where: { contentTypeId }
    })
  ])

  return {
    entries,
    total,
    pages: Math.ceil(total / pageSize),
    currentPage: page
  }
}

/**
 * Get content entry by ID
 */
export async function getContentEntryById(prisma: PrismaClient, id: string) {
  return await prisma.contentEntry.findUnique({
    where: { id },
    include: {
      contentType: {
        include: {
          fields: {
            orderBy: { order: 'asc' }
          }
        }
      },
      fieldValues: {
        include: {
          field: true
        }
      }
    }
  })
}

/**
 * Update content entry
 */
export async function updateContentEntry(
  prisma: PrismaClient,
  entryId: string,
  data: Partial<CreateContentEntryData>
) {
  const updateData: Record<string, unknown> = {}
  
  if (data.slug !== undefined) {
    const entry = await prisma.contentEntry.findUnique({
      where: { id: entryId }
    })
    
    if (entry && data.slug) {
      let slug = data.slug
      let counter = 1
      const baseSlug = slug
      
      while (await prisma.contentEntry.findFirst({ 
        where: { 
          contentTypeId: entry.contentTypeId, 
          slug, 
          id: { not: entryId } 
        } 
      })) {
        slug = `${baseSlug}-${counter}`
        counter++
      }
      updateData.slug = slug
    } else {
      updateData.slug = data.slug
    }
  }

  if (data.fieldValues) {
    // Delete existing field values and create new ones
    await prisma.contentFieldValue.deleteMany({
      where: { entryId }
    })
    
    updateData.fieldValues = {
      create: data.fieldValues.map(fv => ({
        fieldId: fv.fieldId,
        value: typeof fv.value === 'string' ? fv.value : JSON.stringify(fv.value)
      }))
    }
  }

  return await prisma.contentEntry.update({
    where: { id: entryId },
    data: updateData,
    include: {
      contentType: true,
      fieldValues: {
        include: {
          field: true
        }
      }
    }
  })
}

/**
 * Delete content entry
 */
export async function deleteContentEntry(prisma: PrismaClient, entryId: string) {
  return await prisma.contentEntry.delete({
    where: { id: entryId }
  })
}