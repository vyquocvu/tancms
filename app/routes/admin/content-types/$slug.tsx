import { useState, useEffect } from 'react'
import AdminLayout from '../layout'
import { Card, CardContent, CardHeader, CardTitle } from '~/components/ui/card'
import { Button } from '~/components/ui/button'
import { Input } from '~/components/ui/input'
import { Badge } from '~/components/ui/badge'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '~/components/ui/table'
import { Plus, Edit, Trash2, ArrowLeft, Search, Filter } from 'lucide-react'
import ContentEntryForm from '~/components/content-entry-form'
import { mockApi, type ContentType, type ContentEntry, type ContentStatus } from '~/lib/mock-api'

export default function ContentEntries() {
  const [contentType, setContentType] = useState<ContentType | null>(null)
  const [entries, setEntries] = useState<ContentEntry[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [currentPage, setCurrentPage] = useState(1)
  const [showForm, setShowForm] = useState(false)
  const [editingEntry, setEditingEntry] = useState<ContentEntry | null>(null)
  const [formLoading, setFormLoading] = useState(false)
  const entriesPerPage = 10

  // Get content type slug from URL (this would come from router params in real app)
  const getContentTypeSlug = () => {
    const hash = window.location.hash
    const parts = hash.split('/')
    return parts[parts.length - 1] || 'product'
  }

  // Load content type and entries
  useEffect(() => {
    loadData()
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const loadData = async () => {
    setLoading(true)
    try {
      const slug = getContentTypeSlug()
      
      // Get content types and find the one with matching slug
      const contentTypes = await mockApi.getContentTypes()
      const foundContentType = contentTypes.find(ct => ct.slug === slug)
      
      if (!foundContentType) {
        console.error('Content type not found:', slug)
        return
      }

      setContentType(foundContentType)
      
      // Load entries for this content type
      const entries = await mockApi.getContentEntries(foundContentType.id)
      setEntries(entries)
    } catch (error) {
      console.error('Failed to load data:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleEdit = (entryId: string) => {
    const entry = entries.find(e => e.id === entryId)
    if (entry) {
      setEditingEntry(entry)
      setShowForm(true)
    }
  }

  const handleDelete = async (entryId: string) => {
    if (confirm('Are you sure you want to delete this entry?')) {
      try {
        await mockApi.deleteContentEntry(entryId)
        await loadData() // Reload entries
      } catch (error) {
        console.error('Failed to delete entry:', error)
        alert('Failed to delete entry')
      }
    }
  }

  const handleCreateNew = () => {
    setEditingEntry(null)
    setShowForm(true)
  }

  const handleFormSave = async (data: {
    slug?: string
    status?: ContentStatus
    publishedAt?: Date
    scheduledAt?: Date
    fieldValues: { fieldId: string; value: string }[]
  }) => {
    if (!contentType) return

    setFormLoading(true)
    try {
      if (editingEntry) {
        // Update existing entry
        await mockApi.updateContentEntry(editingEntry.id, data)
      } else {
        // Create new entry
        await mockApi.createContentEntry({
          contentTypeId: contentType.id,
          authorId: 'user1', // In real app, get from auth context
          ...data
        })
      }
      
      setShowForm(false)
      setEditingEntry(null)
      await loadData() // Reload entries
    } catch (error) {
      console.error('Failed to save entry:', error)
      alert('Failed to save entry')
    } finally {
      setFormLoading(false)
    }
  }

  const handleFormCancel = () => {
    setShowForm(false)
    setEditingEntry(null)
  }

  const handleBackToContentTypes = () => {
    window.location.hash = '#/admin/content-types'
  }

  const getFieldValue = (entry: ContentEntry, fieldName: string) => {
    const fieldValue = entry.fieldValues.find(fv => fv.field.name === fieldName)
    return fieldValue?.value || '—'
  }

  const getStatusBadge = (entry: ContentEntry) => {
    const statusConfig = {
      DRAFT: { color: 'bg-yellow-100 text-yellow-800', emoji: '📝', label: 'Draft' },
      PUBLISHED: { color: 'bg-green-100 text-green-800', emoji: '✅', label: 'Published' },
      SCHEDULED: { color: 'bg-blue-100 text-blue-800', emoji: '⏰', label: 'Scheduled' },
      ARCHIVED: { color: 'bg-gray-100 text-gray-800', emoji: '📦', label: 'Archived' },
    }
    
    const config = statusConfig[entry.status]
    return (
      <div className="flex flex-col gap-1">
        <Badge className={config.color}>
          {config.emoji} {config.label}
        </Badge>
        {entry.status === 'SCHEDULED' && entry.scheduledAt && (
          <div className="text-xs text-muted-foreground">
            {new Date(entry.scheduledAt).toLocaleDateString()} at{' '}
            {new Date(entry.scheduledAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
          </div>
        )}
        {entry.status === 'PUBLISHED' && entry.publishedAt && (
          <div className="text-xs text-muted-foreground">
            {new Date(entry.publishedAt).toLocaleDateString()}
          </div>
        )}
      </div>
    )
  }

  const filteredEntries = entries.filter(entry =>
    entry.fieldValues.some(fv =>
      fv.value.toLowerCase().includes(searchTerm.toLowerCase())
    ) || (entry.slug && entry.slug.toLowerCase().includes(searchTerm.toLowerCase()))
  )

  const totalPages = Math.ceil(filteredEntries.length / entriesPerPage)
  const startIndex = (currentPage - 1) * entriesPerPage
  const paginatedEntries = filteredEntries.slice(startIndex, startIndex + entriesPerPage)

  if (loading) {
    return (
      <AdminLayout>
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900 mx-auto mb-4"></div>
            <p>Loading...</p>
          </div>
        </div>
      </AdminLayout>
    )
  }

  if (!contentType) {
    return (
      <AdminLayout>
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <h3 className="text-lg font-semibold mb-2">Content Type Not Found</h3>
            <p className="text-muted-foreground mb-4">
              The requested content type could not be found.
            </p>
            <Button onClick={handleBackToContentTypes}>
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Content Types
            </Button>
          </div>
        </div>
      </AdminLayout>
    )
  }

  if (showForm) {
    return (
      <AdminLayout>
        <div className="p-6">
          <ContentEntryForm
            contentType={contentType}
            entry={editingEntry}
            onSave={handleFormSave}
            onCancel={handleFormCancel}
            isLoading={formLoading}
          />
        </div>
      </AdminLayout>
    )
  }

  return (
    <AdminLayout>
      <div className="space-y-6">
        {/* Page Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <Button variant="outline" size="sm" onClick={handleBackToContentTypes}>
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Content Types
            </Button>
            <div>
              <h1 className="text-3xl font-bold">{contentType.displayName} Entries</h1>
              <p className="text-muted-foreground">
                Manage content entries for {contentType.displayName.toLowerCase()}
              </p>
            </div>
          </div>
          <Button onClick={handleCreateNew}>
            <Plus className="h-4 w-4 mr-2" />
            Create {contentType.displayName}
          </Button>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <div className="ml-0">
                  <p className="text-sm font-medium text-muted-foreground">Total Entries</p>
                  <p className="text-2xl font-bold">{entries.length}</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <div className="ml-0">
                  <p className="text-sm font-medium text-muted-foreground">Published</p>
                  <p className="text-2xl font-bold">{entries.filter(e => e.status === 'PUBLISHED').length}</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <div className="ml-0">
                  <p className="text-sm font-medium text-muted-foreground">Drafts</p>
                  <p className="text-2xl font-bold">{entries.filter(e => e.status === 'DRAFT').length}</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <div className="ml-0">
                  <p className="text-sm font-medium text-muted-foreground">Scheduled</p>
                  <p className="text-2xl font-bold">{entries.filter(e => e.status === 'SCHEDULED').length}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Filters and Search */}
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center space-x-4">
              <div className="flex-1">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
                  <Input
                    placeholder="Search entries..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>
              <Button variant="outline">
                <Filter className="h-4 w-4 mr-2" />
                Filters
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Entries Table */}
        <Card>
          <CardHeader>
            <CardTitle>
              {contentType.displayName} Entries ({filteredEntries.length})
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Slug</TableHead>
                  <TableHead>Status</TableHead>
                  {contentType.fields
                    .sort((a, b) => a.order - b.order)
                    .map((field) => (
                      <TableHead key={field.id}>
                        {field.displayName}
                        {field.required && <span className="text-red-500 ml-1">*</span>}
                      </TableHead>
                    ))}
                  <TableHead>Created</TableHead>
                  <TableHead>Updated</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {paginatedEntries.map((entry) => (
                  <TableRow key={entry.id}>
                    <TableCell className="font-medium">
                      <div>
                        <div className="font-mono text-sm">{entry.slug}</div>
                        <div className="text-xs text-muted-foreground">ID: {entry.id}</div>
                      </div>
                    </TableCell>
                    <TableCell>
                      {getStatusBadge(entry)}
                    </TableCell>
                    {contentType.fields
                      .sort((a, b) => a.order - b.order)
                      .map((field) => (
                        <TableCell key={field.id}>
                          <div className="max-w-48 truncate">
                            {field.fieldType === 'NUMBER' ? (
                              <Badge variant="secondary">
                                ${getFieldValue(entry, field.name)}
                              </Badge>
                            ) : field.fieldType === 'BOOLEAN' ? (
                              <Badge variant={getFieldValue(entry, field.name) === 'true' ? 'default' : 'secondary'}>
                                {getFieldValue(entry, field.name) === 'true' ? 'Yes' : 'No'}
                              </Badge>
                            ) : (
                              getFieldValue(entry, field.name)
                            )}
                          </div>
                        </TableCell>
                      ))}
                    <TableCell className="text-muted-foreground">
                      {entry.createdAt.toLocaleDateString()}
                    </TableCell>
                    <TableCell className="text-muted-foreground">
                      {entry.updatedAt.toLocaleDateString()}
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end space-x-2">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleEdit(entry.id)}
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button
                          size="sm"
                          variant="destructive"
                          onClick={() => handleDelete(entry.id)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>

            {paginatedEntries.length === 0 && (
              <div className="text-center py-12">
                <h3 className="text-lg font-semibold mb-2">No entries found</h3>
                <p className="text-muted-foreground mb-4">
                  {searchTerm
                    ? 'No entries match your search criteria'
                    : `No ${contentType.displayName.toLowerCase()} entries have been created yet`
                  }
                </p>
                {!searchTerm && (
                  <Button onClick={handleCreateNew}>
                    <Plus className="h-4 w-4 mr-2" />
                    Create Your First {contentType.displayName}
                  </Button>
                )}
              </div>
            )}

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex items-center justify-between mt-6">
                <p className="text-sm text-muted-foreground">
                  Showing {startIndex + 1} to {Math.min(startIndex + entriesPerPage, filteredEntries.length)} of {filteredEntries.length} entries
                </p>
                <div className="flex space-x-2">
                  <Button
                    variant="outline"
                    size="sm"
                    disabled={currentPage === 1}
                    onClick={() => setCurrentPage(currentPage - 1)}
                  >
                    Previous
                  </Button>
                  <span className="flex items-center px-4 text-sm">
                    Page {currentPage} of {totalPages}
                  </span>
                  <Button
                    variant="outline"
                    size="sm"
                    disabled={currentPage === totalPages}
                    onClick={() => setCurrentPage(currentPage + 1)}
                  >
                    Next
                  </Button>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </AdminLayout>
  )
}