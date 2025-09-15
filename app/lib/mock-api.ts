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

export type ContentStatus = 'DRAFT' | 'PUBLISHED' | 'SCHEDULED' | 'ARCHIVED'

export type ContentEntry = {
  id: string
  contentTypeId: string
  slug?: string
  status: ContentStatus
  publishedAt?: Date
  scheduledAt?: Date
  authorId?: string
  fieldValues: ContentFieldValue[]
  createdAt: Date
  updatedAt: Date
}

export type ContentFieldValue = {
  id: string
  fieldId: string
  entryId: string
  field: ContentField
  value: string
}

// In-memory storage
const contentTypes: ContentType[] = [
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
  },
  {
    id: '2',
    name: 'blog-post',
    displayName: 'Blog Post',
    description: 'Blog articles and posts',
    slug: 'blog-post',
    fields: [
      {
        id: 'field4',
        name: 'title',
        displayName: 'Title',
        fieldType: 'TEXT',
        required: true,
        unique: false,
        order: 0,
        contentTypeId: '2'
      },
      {
        id: 'field5',
        name: 'content',
        displayName: 'Content',
        fieldType: 'TEXTAREA',
        required: true,
        unique: false,
        order: 1,
        contentTypeId: '2'
      },
      {
        id: 'field6',
        name: 'published',
        displayName: 'Published',
        fieldType: 'BOOLEAN',
        required: false,
        unique: false,
        order: 2,
        contentTypeId: '2'
      }
    ],
    createdAt: new Date('2024-01-10'),
    updatedAt: new Date('2024-01-12')
  },
  {
    id: '3',
    name: 'category',
    displayName: 'Category',
    description: 'Product and content categories',
    slug: 'category',
    fields: [
      {
        id: 'field7',
        name: 'name',
        displayName: 'Name',
        fieldType: 'TEXT',
        required: true,
        unique: true,
        order: 0,
        contentTypeId: '3'
      },
      {
        id: 'field8',
        name: 'description',
        displayName: 'Description',
        fieldType: 'TEXTAREA',
        required: false,
        unique: false,
        order: 1,
        contentTypeId: '3'
      }
    ],
    createdAt: new Date('2024-01-05'),
    updatedAt: new Date('2024-01-08')
  }
]

// In-memory storage for entries
const contentEntries: ContentEntry[] = [
  {
    id: '1',
    contentTypeId: '1',
    slug: 'laptop-pro-15',
    status: 'PUBLISHED',
    publishedAt: new Date('2024-01-22'),
    authorId: 'user1',
    fieldValues: [
      {
        id: 'fv1',
        fieldId: 'field1',
        entryId: '1',
        field: contentTypes[0].fields[0],
        value: 'Laptop Pro 15"'
      },
      {
        id: 'fv2',
        fieldId: 'field2',
        entryId: '1',
        field: contentTypes[0].fields[1],
        value: '1299.99'
      },
      {
        id: 'fv3',
        fieldId: 'field3',
        entryId: '1',
        field: contentTypes[0].fields[2],
        value: 'High-performance laptop with 15-inch display'
      }
    ],
    createdAt: new Date('2024-01-20'),
    updatedAt: new Date('2024-01-22')
  },
  {
    id: '2',
    contentTypeId: '1',
    slug: 'wireless-mouse',
    status: 'PUBLISHED',
    publishedAt: new Date('2024-01-19'),
    authorId: 'user1',
    fieldValues: [
      {
        id: 'fv4',
        fieldId: 'field1',
        entryId: '2',
        field: contentTypes[0].fields[0],
        value: 'Wireless Mouse'
      },
      {
        id: 'fv5',
        fieldId: 'field2',
        entryId: '2',
        field: contentTypes[0].fields[1],
        value: '29.99'
      },
      {
        id: 'fv6',
        fieldId: 'field3',
        entryId: '2',
        field: contentTypes[0].fields[2],
        value: 'Ergonomic wireless mouse with USB receiver'
      }
    ],
    createdAt: new Date('2024-01-18'),
    updatedAt: new Date('2024-01-19')
  },
  {
    id: '3',
    contentTypeId: '1',
    slug: 'mechanical-keyboard',
    status: 'DRAFT',
    authorId: 'user1',
    fieldValues: [
      {
        id: 'fv7',
        fieldId: 'field1',
        entryId: '3',
        field: contentTypes[0].fields[0],
        value: 'Mechanical Keyboard'
      },
      {
        id: 'fv8',
        fieldId: 'field2',
        entryId: '3',
        field: contentTypes[0].fields[1],
        value: '89.99'
      },
      {
        id: 'fv9',
        fieldId: 'field3',
        entryId: '3',
        field: contentTypes[0].fields[2],
        value: 'RGB backlit mechanical keyboard with blue switches'
      }
    ],
    createdAt: new Date('2024-01-15'),
    updatedAt: new Date('2024-01-16')
  },
  // Blog Post entries
  {
    id: '4',
    contentTypeId: '2',
    slug: 'getting-started-with-cms',
    status: 'PUBLISHED',
    publishedAt: new Date('2024-01-26'),
    authorId: 'user1',
    fieldValues: [
      {
        id: 'fv10',
        fieldId: 'field4',
        entryId: '4',
        field: contentTypes[1].fields[0],
        value: 'Getting Started with CMS'
      },
      {
        id: 'fv11',
        fieldId: 'field5',
        entryId: '4',
        field: contentTypes[1].fields[1],
        value: 'Learn how to get started with our content management system...'
      },
      {
        id: 'fv12',
        fieldId: 'field6',
        entryId: '4',
        field: contentTypes[1].fields[2],
        value: 'true'
      }
    ],
    createdAt: new Date('2024-01-25'),
    updatedAt: new Date('2024-01-26')
  },
  {
    id: '5',
    contentTypeId: '2',
    slug: 'advanced-features',
    status: 'SCHEDULED',
    scheduledAt: new Date('2024-02-01'),
    authorId: 'user1',
    fieldValues: [
      {
        id: 'fv13',
        fieldId: 'field4',
        entryId: '5',
        field: contentTypes[1].fields[0],
        value: 'Advanced Features Overview'
      },
      {
        id: 'fv14',
        fieldId: 'field5',
        entryId: '5',
        field: contentTypes[1].fields[1],
        value: 'Explore the advanced features available in our CMS platform...'
      },
      {
        id: 'fv15',
        fieldId: 'field6',
        entryId: '5',
        field: contentTypes[1].fields[2],
        value: 'false'
      }
    ],
    createdAt: new Date('2024-01-23'),
    updatedAt: new Date('2024-01-24')
  },
  // Category entries
  {
    id: '6',
    contentTypeId: '3',
    slug: 'electronics',
    status: 'PUBLISHED',
    publishedAt: new Date('2024-01-12'),
    authorId: 'user1',
    fieldValues: [
      {
        id: 'fv16',
        fieldId: 'field7',
        entryId: '6',
        field: contentTypes[2].fields[0],
        value: 'Electronics'
      },
      {
        id: 'fv17',
        fieldId: 'field8',
        entryId: '6',
        field: contentTypes[2].fields[1],
        value: 'Electronic devices and accessories'
      }
    ],
    createdAt: new Date('2024-01-10'),
    updatedAt: new Date('2024-01-12')
  },
  {
    id: '7',
    contentTypeId: '3',
    slug: 'tutorials',
    status: 'DRAFT',
    authorId: 'user1',
    fieldValues: [
      {
        id: 'fv18',
        fieldId: 'field7',
        entryId: '7',
        field: contentTypes[2].fields[0],
        value: 'Tutorials'
      },
      {
        id: 'fv19',
        fieldId: 'field8',
        entryId: '7',
        field: contentTypes[2].fields[1],
        value: 'How-to guides and tutorials'
      }
    ],
    createdAt: new Date('2024-01-08'),
    updatedAt: new Date('2024-01-09')
  }
]

let nextId = 4
let nextFieldId = 9
let nextEntryId = 8
let nextFieldValueId = 20

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
  },

  // Content Entry operations
  async getContentEntries(contentTypeId: string): Promise<ContentEntry[]> {
    const entries = contentEntries.filter(entry => entry.contentTypeId === contentTypeId)
    return Promise.resolve(entries)
  },

  async getContentEntry(id: string): Promise<ContentEntry | null> {
    const entry = contentEntries.find(entry => entry.id === id)
    return Promise.resolve(entry || null)
  },

  async createContentEntry(data: {
    contentTypeId: string
    slug?: string
    status?: ContentStatus
    publishedAt?: Date
    scheduledAt?: Date
    authorId?: string
    fieldValues: { fieldId: string; value: string }[]
  }): Promise<ContentEntry> {
    const id = String(nextEntryId++)
    const contentType = contentTypes.find(ct => ct.id === data.contentTypeId)
    
    if (!contentType) {
      throw new Error('Content type not found')
    }

    // Generate slug if not provided
    let slug = data.slug
    if (!slug) {
      // Generate slug from the first text field value
      const firstTextField = data.fieldValues.find(fv => {
        const field = contentType.fields.find(f => f.id === fv.fieldId)
        return field?.fieldType === 'TEXT'
      })
      if (firstTextField) {
        slug = generateSlug(firstTextField.value)
      } else {
        slug = `entry-${id}`
      }
    }

    // Ensure slug is unique within content type
    let uniqueSlug = slug
    let counter = 1
    while (contentEntries.some(entry => 
      entry.contentTypeId === data.contentTypeId && entry.slug === uniqueSlug
    )) {
      uniqueSlug = `${slug}-${counter}`
      counter++
    }

    const entry: ContentEntry = {
      id,
      contentTypeId: data.contentTypeId,
      slug: uniqueSlug,
      status: data.status || 'DRAFT',
      publishedAt: data.publishedAt,
      scheduledAt: data.scheduledAt,
      authorId: data.authorId,
      fieldValues: data.fieldValues.map(fv => {
        const field = contentType.fields.find(f => f.id === fv.fieldId)
        if (!field) throw new Error(`Field ${fv.fieldId} not found`)
        
        return {
          id: String(nextFieldValueId++),
          fieldId: fv.fieldId,
          entryId: id,
          field,
          value: fv.value
        }
      }),
      createdAt: new Date(),
      updatedAt: new Date()
    }

    contentEntries.push(entry)
    return Promise.resolve(entry)
  },

  async updateContentEntry(id: string, data: {
    slug?: string
    status?: ContentStatus
    publishedAt?: Date
    scheduledAt?: Date
    authorId?: string
    fieldValues?: { fieldId: string; value: string }[]
  }): Promise<ContentEntry | null> {
    const index = contentEntries.findIndex(entry => entry.id === id)
    if (index === -1) return Promise.resolve(null)

    const existing = contentEntries[index]
    const contentType = contentTypes.find(ct => ct.id === existing.contentTypeId)
    if (!contentType) throw new Error('Content type not found')

    let updatedSlug = existing.slug
    if (data.slug !== undefined) {
      // Ensure slug is unique within content type
      let slug = data.slug
      let counter = 1
      while (contentEntries.some(entry => 
        entry.contentTypeId === existing.contentTypeId && 
        entry.slug === slug && 
        entry.id !== id
      )) {
        slug = `${data.slug}-${counter}`
        counter++
      }
      updatedSlug = slug
    }

    let updatedFieldValues = existing.fieldValues
    if (data.fieldValues) {
      updatedFieldValues = data.fieldValues.map(fv => {
        const field = contentType.fields.find(f => f.id === fv.fieldId)
        if (!field) throw new Error(`Field ${fv.fieldId} not found`)
        
        return {
          id: String(nextFieldValueId++),
          fieldId: fv.fieldId,
          entryId: id,
          field,
          value: fv.value
        }
      })
    }

    const updated: ContentEntry = {
      ...existing,
      slug: updatedSlug,
      status: data.status !== undefined ? data.status : existing.status,
      publishedAt: data.publishedAt !== undefined ? data.publishedAt : existing.publishedAt,
      scheduledAt: data.scheduledAt !== undefined ? data.scheduledAt : existing.scheduledAt,
      authorId: data.authorId !== undefined ? data.authorId : existing.authorId,
      fieldValues: updatedFieldValues,
      updatedAt: new Date()
    }

    contentEntries[index] = updated
    return Promise.resolve(updated)
  },

  async deleteContentEntry(id: string): Promise<boolean> {
    const index = contentEntries.findIndex(entry => entry.id === id)
    if (index === -1) return Promise.resolve(false)

    contentEntries.splice(index, 1)
    return Promise.resolve(true)
  },

  // Workflow-specific operations
  async publishContentEntry(id: string): Promise<ContentEntry | null> {
    return this.updateContentEntry(id, {
      status: 'PUBLISHED',
      publishedAt: new Date()
    })
  },

  async unpublishContentEntry(id: string): Promise<ContentEntry | null> {
    return this.updateContentEntry(id, {
      status: 'DRAFT',
      publishedAt: undefined
    })
  },

  async scheduleContentEntry(id: string, scheduledAt: Date): Promise<ContentEntry | null> {
    return this.updateContentEntry(id, {
      status: 'SCHEDULED',
      scheduledAt
    })
  },

  async unscheduleContentEntry(id: string): Promise<ContentEntry | null> {
    return this.updateContentEntry(id, {
      status: 'DRAFT',
      scheduledAt: undefined
    })
  },

  async archiveContentEntry(id: string): Promise<ContentEntry | null> {
    return this.updateContentEntry(id, {
      status: 'ARCHIVED'
    })
  },

  // Filter entries by status
  async getContentEntriesByStatus(contentTypeId: string, status: ContentStatus): Promise<ContentEntry[]> {
    const entries = contentEntries.filter(entry => 
      entry.contentTypeId === contentTypeId && entry.status === status
    )
    return Promise.resolve(entries)
  },

  // Get scheduled entries that should be published
  async getScheduledEntriesToPublish(): Promise<ContentEntry[]> {
    const now = new Date()
    const entries = contentEntries.filter(entry => 
      entry.status === 'SCHEDULED' && 
      entry.scheduledAt && 
      entry.scheduledAt <= now
    )
    return Promise.resolve(entries)
  }
}

// Demo admin user
export const demoAdmin = {
  id: 'demo-admin',
  name: 'Demo Admin',
  email: 'admin@demo.tancms.dev',
  role: 'ADMIN' as const
}