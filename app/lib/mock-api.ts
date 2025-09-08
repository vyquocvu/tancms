/**
 * Mock API layer for content type operations
 * This simulates database operations until we can properly set up Prisma
 */

import { generateSlug } from '../lib/utils'

export type ContentType = {
  id: string
  name: string
  displayName: string
  description?: string
  slug: string
  fields: ContentField[]
  createdAt: Date
  updatedAt: Date
}

export type ContentField = {
  id: string
  name: string
  displayName: string
  fieldType: string
  required: boolean
  unique: boolean
  defaultValue?: string
  options?: Record<string, unknown>
  relatedType?: string
  order: number
  contentTypeId: string
}

// In-memory storage
let contentTypes: ContentType[] = [
  {
    id: '1',
    name: 'product',
    displayName: 'Product',
    description: 'E-commerce product catalog',
    slug: 'product',
    fields: [
      {
        id: 'field1',
        name: 'title',
        displayName: 'Title',
        fieldType: 'TEXT',
        required: true,
        unique: false,
        order: 0,
        contentTypeId: '1'
      },
      {
        id: 'field2',
        name: 'price',
        displayName: 'Price',
        fieldType: 'NUMBER',
        required: true,
        unique: false,
        order: 1,
        contentTypeId: '1'
      },
      {
        id: 'field3',
        name: 'description',
        displayName: 'Description',
        fieldType: 'TEXTAREA',
        required: false,
        unique: false,
        order: 2,
        contentTypeId: '1'
      }
    ],
    createdAt: new Date('2024-01-15'),
    updatedAt: new Date('2024-01-20')
  }
]

let nextId = 2
let nextFieldId = 4

export const mockApi = {
  // Content Type operations
  async getContentTypes(): Promise<ContentType[]> {
    return Promise.resolve(contentTypes)
  },

  async getContentType(id: string): Promise<ContentType | null> {
    const contentType = contentTypes.find(ct => ct.id === id)
    return Promise.resolve(contentType || null)
  },

  async createContentType(data: {
    name: string
    displayName: string
    description?: string
    fields: Omit<ContentField, 'id' | 'contentTypeId'>[]
  }): Promise<ContentType> {
    const id = String(nextId++)
    const slug = generateSlug(data.name)
    
    const contentType: ContentType = {
      id,
      name: data.name,
      displayName: data.displayName,
      description: data.description,
      slug,
      fields: data.fields.map((field, index) => ({
        ...field,
        id: String(nextFieldId++),
        contentTypeId: id,
        order: index
      })),
      createdAt: new Date(),
      updatedAt: new Date()
    }

    contentTypes.push(contentType)
    return Promise.resolve(contentType)
  },

  async updateContentType(id: string, data: Partial<{
    name: string
    displayName: string
    description: string
    fields: (Omit<ContentField, 'id' | 'contentTypeId'> & { id?: string })[]
  }>): Promise<ContentType | null> {
    const index = contentTypes.findIndex(ct => ct.id === id)
    if (index === -1) return Promise.resolve(null)

    const existing = contentTypes[index]
    const updated: ContentType = {
      ...existing,
      ...data,
      slug: data.name ? generateSlug(data.name) : existing.slug,
      fields: data.fields ? data.fields.map((field, fieldIndex) => ({
        ...field,
        id: field.id || String(nextFieldId++),
        contentTypeId: id,
        order: fieldIndex
      })) : existing.fields,
      updatedAt: new Date()
    }

    contentTypes[index] = updated
    return Promise.resolve(updated)
  },

  async deleteContentType(id: string): Promise<boolean> {
    const index = contentTypes.findIndex(ct => ct.id === id)
    if (index === -1) return Promise.resolve(false)

    contentTypes.splice(index, 1)
    return Promise.resolve(true)
  }
}

// Demo admin user
export const demoAdmin = {
  id: 'demo-admin',
  name: 'Demo Admin',
  email: 'admin@demo.tancms.dev',
  role: 'ADMIN' as const
}