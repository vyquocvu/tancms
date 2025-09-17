import { createFileRoute } from '@tanstack/react-router'
import { useState } from 'react'
import { DataTable, type DataTableColumn } from '~/components/ui/data-table'
import { ContentFilters, type ContentFilter } from '~/components/ui/content-filters'
import { BulkActions, type BulkAction } from '~/components/ui/bulk-actions'
import { Card, CardContent, CardHeader, CardTitle } from '~/components/ui/card'
import { Badge } from '~/components/ui/badge'
import { Button } from '~/components/ui/button'
import { Edit, Trash2, Plus, ChevronUp } from 'lucide-react'
import ContentEntryForm from '~/components/content-entry-form'
import type { ContentType } from '~/lib/mock-api'

export const Route = createFileRoute('/')({
  component: HomePage,
})

// Mock data for demonstration
interface DemoEntry {
  id: string
  slug: string
  title: string
  status: 'DRAFT' | 'PUBLISHED' | 'SCHEDULED' | 'ARCHIVED'
  price: number
  description: string
  createdAt: Date
  updatedAt: Date
}

const mockEntries: DemoEntry[] = [
  {
    id: '1',
    slug: 'awesome-product',
    title: 'Awesome Product',
    status: 'PUBLISHED',
    price: 99.99,
    description: 'This is an awesome product that everyone loves.',
    createdAt: new Date('2024-01-15'),
    updatedAt: new Date('2024-01-20'),
  },
  {
    id: '2',
    slug: 'draft-item',
    title: 'Draft Item',
    status: 'DRAFT',
    price: 149.99,
    description: 'Still working on this one.',
    createdAt: new Date('2024-01-10'),
    updatedAt: new Date('2024-01-18'),
  },
  {
    id: '3',
    slug: 'scheduled-launch',
    title: 'Scheduled Launch',
    status: 'SCHEDULED',
    price: 199.99,
    description: 'Coming soon to our store.',
    createdAt: new Date('2024-01-12'),
    updatedAt: new Date('2024-01-19'),
  },
  {
    id: '4',
    slug: 'archived-product',
    title: 'Archived Product',
    status: 'ARCHIVED',
    price: 79.99,
    description: 'No longer available.',
    createdAt: new Date('2024-01-08'),
    updatedAt: new Date('2024-01-16'),
  },
  {
    id: '5',
    slug: 'premium-service',
    title: 'Premium Service',
    status: 'PUBLISHED',
    price: 299.99,
    description: 'Our top-tier service offering.',
    createdAt: new Date('2024-01-14'),
    updatedAt: new Date('2024-01-21'),
  },
]

function HomePage() {
  const [showDemo, setShowDemo] = useState(false)
  const [showPreviewDemo, setShowPreviewDemo] = useState(false)
  const [entries] = useState<DemoEntry[]>(mockEntries)
  const [filters, setFilters] = useState<ContentFilter>({})
  const [selectedEntries, setSelectedEntries] = useState<DemoEntry[]>([])

  // Mock content type for preview demonstration
  const mockContentType: ContentType = {
    id: 'demo-blog',
    name: 'demo_blog',
    displayName: 'Demo Blog Post',
    description: 'A demo blog post content type to showcase the preview system',
    slug: 'demo-blog',
    createdAt: new Date(),
    updatedAt: new Date(),
    fields: [
      {
        id: 'title',
        name: 'title',
        displayName: 'Title',
        fieldType: 'TEXT',
        required: true,
        unique: false,
        placeholder: 'Enter the blog post title',
        helpText: 'The main title of your blog post',
        order: 1,
        contentTypeId: 'demo-blog',
      },
      {
        id: 'content',
        name: 'content',
        displayName: 'Content',
        fieldType: 'RICH_TEXT',
        required: true,
        unique: false,
        placeholder: 'Write your blog post content here...',
        helpText: 'The main content of your blog post with rich text formatting',
        order: 2,
        contentTypeId: 'demo-blog',
      },
      {
        id: 'author_email',
        name: 'author_email',
        displayName: 'Author Email',
        fieldType: 'EMAIL',
        required: false,
        unique: false,
        placeholder: 'author@example.com',
        helpText: 'Contact email for the author',
        order: 3,
        contentTypeId: 'demo-blog',
      },
      {
        id: 'website',
        name: 'website',
        displayName: 'Website URL',
        fieldType: 'URL',
        required: false,
        unique: false,
        placeholder: 'https://example.com',
        helpText: 'Related website or source',
        order: 4,
        contentTypeId: 'demo-blog',
      },
      {
        id: 'published_date',
        name: 'published_date',
        displayName: 'Published Date',
        fieldType: 'DATE',
        required: false,
        unique: false,
        helpText: 'When this post was originally published',
        order: 5,
        contentTypeId: 'demo-blog',
      },
      {
        id: 'featured',
        name: 'featured',
        displayName: 'Featured Post',
        fieldType: 'BOOLEAN',
        required: false,
        unique: false,
        helpText: 'Mark this post as featured',
        order: 6,
        contentTypeId: 'demo-blog',
      },
    ],
  }

  const handlePreviewSave = async (data: any) => {
    alert('Preview Demo - Form data submitted!\n\n' + JSON.stringify(data, null, 2))
  }

  const handlePreviewCancel = () => {
    setShowPreviewDemo(false)
  }

  // Show preview demo
  if (showPreviewDemo) {
    return (
      <div className='min-h-screen bg-gray-50 py-8'>
        <div className='max-w-7xl mx-auto px-4 sm:px-6 lg:px-8'>
          <div className='mb-8 text-center'>
            <h1 className='text-3xl font-bold text-gray-900 mb-2'>Content Preview System Demo</h1>
            <p className='text-gray-600 mb-4'>
              Test the preview functionality by filling out the form below. Try the "Preview" button
              and "Side by Side" mode!
            </p>
            <Button variant='outline' onClick={() => setShowPreviewDemo(false)} className='mb-4'>
              ← Back to Homepage
            </Button>
          </div>

          <ContentEntryForm
            contentType={mockContentType}
            onSave={handlePreviewSave}
            onCancel={handlePreviewCancel}
          />
        </div>
      </div>
    )
  }

  // Status badge component
  const getStatusBadge = (status: string) => {
    const statusConfig = {
      DRAFT: { color: 'bg-yellow-100 text-yellow-800', emoji: '📝', label: 'Draft' },
      PUBLISHED: { color: 'bg-green-100 text-green-800', emoji: '✅', label: 'Published' },
      SCHEDULED: { color: 'bg-blue-100 text-blue-800', emoji: '⏰', label: 'Scheduled' },
      ARCHIVED: { color: 'bg-gray-100 text-gray-800', emoji: '📦', label: 'Archived' },
    }

    const config = statusConfig[status as keyof typeof statusConfig]
    return (
      <Badge className={config.color}>
        {config.emoji} {config.label}
      </Badge>
    )
  }

  // Enhanced filtering logic
  const filteredEntries = entries.filter(entry => {
    // Status filter
    if (filters.status && filters.status.length > 0) {
      if (!filters.status.includes(entry.status)) return false
    }

    // Search filter
    if (filters.search && filters.search.length > 0) {
      const searchLower = filters.search.toLowerCase()
      const matchesSlug = entry.slug?.toLowerCase().includes(searchLower)
      const matchesTitle = entry.title?.toLowerCase().includes(searchLower)
      const matchesDescription = entry.description?.toLowerCase().includes(searchLower)
      if (!matchesSlug && !matchesTitle && !matchesDescription) return false
    }

    // Created date range filter
    if (filters.createdRange) {
      if (filters.createdRange.from && entry.createdAt < filters.createdRange.from) return false
      if (filters.createdRange.to && entry.createdAt > filters.createdRange.to) return false
    }

    // Updated date range filter
    if (filters.updatedRange) {
      if (filters.updatedRange.from && entry.updatedAt < filters.updatedRange.from) return false
      if (filters.updatedRange.to && entry.updatedAt > filters.updatedRange.to) return false
    }

    return true
  })

  // Define table columns
  const columns: DataTableColumn<DemoEntry>[] = [
    {
      id: 'slug',
      header: 'Slug',
      accessorKey: 'slug',
      sortable: true,
      cell: entry => (
        <div>
          <div className='font-mono text-sm'>{entry.slug}</div>
          <div className='text-xs text-muted-foreground'>ID: {entry.id}</div>
        </div>
      ),
    },
    {
      id: 'status',
      header: 'Status',
      accessorKey: 'status',
      sortable: true,
      cell: entry => getStatusBadge(entry.status),
    },
    {
      id: 'title',
      header: 'Title *',
      accessorKey: 'title',
      sortable: true,
    },
    {
      id: 'price',
      header: 'Price',
      accessorKey: 'price',
      sortable: true,
      cell: entry => <Badge variant='secondary'>${entry.price}</Badge>,
    },
    {
      id: 'description',
      header: 'Description',
      accessorKey: 'description',
      sortable: true,
      cell: entry => <div className='max-w-48 truncate'>{entry.description}</div>,
    },
    {
      id: 'createdAt',
      header: 'Created',
      accessorKey: 'createdAt',
      sortable: true,
      cell: entry => (
        <span className='text-muted-foreground'>{entry.createdAt.toLocaleDateString()}</span>
      ),
    },
    {
      id: 'updatedAt',
      header: 'Updated',
      accessorKey: 'updatedAt',
      sortable: true,
      cell: entry => (
        <span className='text-muted-foreground'>{entry.updatedAt.toLocaleDateString()}</span>
      ),
    },
    {
      id: 'actions',
      header: 'Actions',
      sortable: false,
      cell: entry => (
        <div className='flex justify-end space-x-2'>
          <Button
            size='sm'
            variant='outline'
            onClick={e => {
              e.stopPropagation()
              alert(`Edit ${entry.title}`)
            }}
          >
            <Edit className='h-4 w-4' />
          </Button>
          <Button
            size='sm'
            variant='destructive'
            onClick={e => {
              e.stopPropagation()
              if (confirm(`Delete ${entry.title}?`)) {
                alert(`Deleted ${entry.title}`)
              }
            }}
          >
            <Trash2 className='h-4 w-4' />
          </Button>
        </div>
      ),
    },
  ]

  // Bulk actions configuration
  const bulkActions: BulkAction[] = [
    {
      id: 'publish',
      label: 'Publish',
      icon: () => <span>✅</span>,
      variant: 'default',
    },
    {
      id: 'draft',
      label: 'Set to Draft',
      icon: () => <span>📝</span>,
      variant: 'outline',
    },
    {
      id: 'archive',
      label: 'Archive',
      icon: () => <span>📦</span>,
      variant: 'secondary',
      requiresConfirmation: true,
      confirmationMessage: 'Are you sure you want to archive these entries?',
    },
    {
      id: 'delete',
      label: 'Delete',
      icon: () => <span>🗑️</span>,
      variant: 'destructive',
      requiresConfirmation: true,
      confirmationMessage:
        'Are you sure you want to delete these entries? This action cannot be undone.',
    },
  ]

  // Handle bulk actions
  const handleBulkAction = async (actionId: string, items: DemoEntry[]) => {
    alert(
      `Bulk action "${actionId}" performed on ${items.length} items:\n${items.map(i => i.title).join(', ')}`
    )
    setSelectedEntries([])
  }

  // Selection handlers
  const handleSelectAll = () => {
    setSelectedEntries(filteredEntries)
  }

  const handleDeselectAll = () => {
    setSelectedEntries([])
  }

  const handleClearSelection = () => {
    setSelectedEntries([])
  }

  if (showDemo) {
    return (
      <div className='min-h-screen bg-background p-8'>
        <div className='max-w-7xl mx-auto space-y-6'>
          {/* Demo Header */}
          <div className='flex items-center justify-between'>
            <div>
              <h1 className='text-3xl font-bold'>Enhanced Content List Interface</h1>
              <p className='text-muted-foreground'>
                Live demonstration of improved sorting, filtering, and bulk actions
              </p>
            </div>
            <div className='flex gap-2'>
              <Button variant='outline' onClick={() => setShowDemo(false)}>
                <ChevronUp className='h-4 w-4 mr-2' />
                Back to Homepage
              </Button>
              <Button>
                <Plus className='h-4 w-4 mr-2' />
                Create Product
              </Button>
            </div>
          </div>

          {/* Stats */}
          <div className='grid grid-cols-1 md:grid-cols-4 gap-4'>
            <Card>
              <CardContent className='p-6'>
                <div className='flex items-center'>
                  <div className='ml-0'>
                    <p className='text-sm font-medium text-muted-foreground'>Total Entries</p>
                    <p className='text-2xl font-bold'>{entries.length}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className='p-6'>
                <div className='flex items-center'>
                  <div className='ml-0'>
                    <p className='text-sm font-medium text-muted-foreground'>Published</p>
                    <p className='text-2xl font-bold'>
                      {entries.filter(e => e.status === 'PUBLISHED').length}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className='p-6'>
                <div className='flex items-center'>
                  <div className='ml-0'>
                    <p className='text-sm font-medium text-muted-foreground'>Drafts</p>
                    <p className='text-2xl font-bold'>
                      {entries.filter(e => e.status === 'DRAFT').length}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className='p-6'>
                <div className='flex items-center'>
                  <div className='ml-0'>
                    <p className='text-sm font-medium text-muted-foreground'>Scheduled</p>
                    <p className='text-2xl font-bold'>
                      {entries.filter(e => e.status === 'SCHEDULED').length}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Enhanced Filters */}
          <ContentFilters filters={filters} onFiltersChange={setFilters} />

          {/* Bulk Actions */}
          <BulkActions
            selectedItems={selectedEntries}
            onClearSelection={handleClearSelection}
            onSelectAll={handleSelectAll}
            onDeselectAll={handleDeselectAll}
            totalItems={filteredEntries.length}
            actions={bulkActions}
            onAction={handleBulkAction}
          />

          {/* Enhanced Data Table */}
          <Card>
            <CardHeader>
              <CardTitle>Product Entries ({filteredEntries.length})</CardTitle>
            </CardHeader>
            <CardContent>
              <DataTable
                data={filteredEntries}
                columns={columns}
                searchValue={filters.search || ''}
                onSearchChange={value =>
                  setFilters(prev => ({ ...prev, search: value || undefined }))
                }
                searchPlaceholder='Search entries...'
                enableColumnToggle={true}
                enableSorting={true}
                enableSearch={false} // We handle search through filters
                enableSelection={true}
                selectedRows={selectedEntries}
                onSelectionChange={setSelectedEntries}
                getRowId={row => row.id}
              />

              {filteredEntries.length === 0 && (
                <div className='text-center py-12'>
                  <h3 className='text-lg font-semibold mb-2'>No entries found</h3>
                  <p className='text-muted-foreground mb-4'>
                    {Object.keys(filters).length > 0
                      ? 'No entries match your search criteria'
                      : 'No product entries have been created yet'}
                  </p>
                  {Object.keys(filters).length === 0 && (
                    <Button>
                      <Plus className='h-4 w-4 mr-2' />
                      Create Your First Product
                    </Button>
                  )}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    )
  }

  return (
    <div className='min-h-screen bg-gray-50 flex items-center justify-center'>
      <div className='bg-white p-8 rounded-lg shadow-md max-w-md w-full'>
        <h1 className='text-3xl font-bold text-gray-900 mb-4'>TanCMS</h1>
        <p className='text-gray-600 mb-6'>Welcome to your modern Content Management System!</p>
        <p className='text-gray-500 mb-8'>
          Built with TanStack Start, React, TypeScript, Prisma, and SQLite.
        </p>

        <div className='space-y-3'>
          <button
            onClick={() => setShowDemo(true)}
            className='block w-full bg-green-600 text-white text-center py-3 px-4 rounded-md hover:bg-green-700 transition-colors font-medium'
          >
            🚀 View Enhanced Content List Demo
          </button>
          <button
            onClick={() => setShowPreviewDemo(true)}
            className='block w-full bg-purple-600 text-white text-center py-3 px-4 rounded-md hover:bg-purple-700 transition-colors font-medium'
          >
            👁️ Try Content Preview System
          </button>
          <a
            href='/admin'
            className='block w-full bg-indigo-600 text-white text-center py-3 px-4 rounded-md hover:bg-indigo-700 transition-colors font-medium'
          >
            Go to Admin Dashboard
          </a>
          <a
            href='/login'
            className='block w-full bg-gray-600 text-white text-center py-3 px-4 rounded-md hover:bg-gray-700 transition-colors font-medium'
          >
            Admin Login
          </a>
          <div className='text-center'>
            <a href='/blog' className='text-indigo-600 hover:text-indigo-700 text-sm'>
              View Blog →
            </a>
          </div>
        </div>
      </div>
    </div>
  )
}
