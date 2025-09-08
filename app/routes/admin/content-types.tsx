import { useState } from 'react'
import AdminLayout from './layout'
import { Card, CardContent, CardHeader, CardTitle } from '~/components/ui/card'
import { Button } from '~/components/ui/button'
import { Badge } from '~/components/ui/badge'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '~/components/ui/table'
import { Plus, Edit, Trash2, Database, Settings } from 'lucide-react'

// Mock data - in real implementation, this would come from server
const mockContentTypes = [
  {
    id: '1',
    name: 'product',
    displayName: 'Product',
    description: 'E-commerce product catalog',
    slug: 'product',
    fields: [
      { name: 'title', displayName: 'Title', fieldType: 'TEXT' },
      { name: 'price', displayName: 'Price', fieldType: 'NUMBER' },
      { name: 'description', displayName: 'Description', fieldType: 'TEXTAREA' }
    ],
    _count: { entries: 25 },
    createdAt: new Date('2024-01-15'),
    updatedAt: new Date('2024-01-20')
  },
  {
    id: '2',
    name: 'author',
    displayName: 'Author',
    description: 'Author profiles and information',
    slug: 'author',
    fields: [
      { name: 'name', displayName: 'Name', fieldType: 'TEXT' },
      { name: 'bio', displayName: 'Biography', fieldType: 'TEXTAREA' },
      { name: 'email', displayName: 'Email', fieldType: 'EMAIL' }
    ],
    _count: { entries: 8 },
    createdAt: new Date('2024-01-10'),
    updatedAt: new Date('2024-01-18')
  }
]

interface ContentTypeCardProps {
  contentType: {
    id: string
    displayName: string
    description?: string
    fields: { name: string; displayName: string; fieldType: string }[]
    _count: { entries: number }
    createdAt: Date
  }
  onEdit: (id: string) => void
  onDelete: (id: string) => void
  onManageEntries: (id: string) => void
}

function ContentTypeCard({ contentType, onEdit, onDelete, onManageEntries }: ContentTypeCardProps) {
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <div>
          <CardTitle className="text-xl">{contentType.displayName}</CardTitle>
          <p className="text-sm text-muted-foreground mt-1">
            {contentType.description || 'No description'}
          </p>
        </div>
        <div className="flex items-center space-x-2">
          <Badge variant="secondary">
            {contentType._count.entries} entries
          </Badge>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {/* Field Summary */}
          <div>
            <p className="text-sm font-medium mb-2">Fields ({contentType.fields.length})</p>
            <div className="flex flex-wrap gap-1">
              {contentType.fields.slice(0, 3).map((field: { name: string; displayName: string }) => (
                <Badge key={field.name} variant="outline" className="text-xs">
                  {field.displayName}
                </Badge>
              ))}
              {contentType.fields.length > 3 && (
                <Badge variant="outline" className="text-xs">
                  +{contentType.fields.length - 3} more
                </Badge>
              )}
            </div>
          </div>

          {/* Actions */}
          <div className="flex justify-between items-center pt-2 border-t">
            <div className="text-xs text-muted-foreground">
              Created {contentType.createdAt.toLocaleDateString()}
            </div>
            <div className="flex space-x-2">
              <Button
                size="sm"
                variant="outline"
                onClick={() => onManageEntries(contentType.id)}
              >
                <Database className="h-4 w-4 mr-1" />
                Entries
              </Button>
              <Button
                size="sm"
                variant="outline"
                onClick={() => onEdit(contentType.id)}
              >
                <Edit className="h-4 w-4 mr-1" />
                Edit
              </Button>
              <Button
                size="sm"
                variant="destructive"
                onClick={() => onDelete(contentType.id)}
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

export default function ContentTypes() {
  const [contentTypes] = useState(mockContentTypes)
  const [viewMode, setViewMode] = useState<'grid' | 'table'>('grid')

  const handleEdit = (id: string) => {
    // Navigate to edit content type
    console.log('Edit content type:', id)
  }

  const handleDelete = (id: string) => {
    // Handle delete with confirmation
    console.log('Delete content type:', id)
  }

  const handleManageEntries = (id: string) => {
    // Navigate to content entries for this type
    console.log('Manage entries for:', id)
  }

  const handleCreateNew = () => {
    // Navigate to create new content type
    console.log('Create new content type')
  }

  return (
    <AdminLayout>
      <div className="space-y-6">
        {/* Page Header */}
        <div className="flex justify-between items-start">
          <div>
            <h1 className="text-3xl font-bold">Content Types</h1>
            <p className="text-muted-foreground">
              Create and manage custom content types for your application
            </p>
          </div>
          <div className="flex items-center space-x-4">
            <div className="flex border rounded-lg">
              <Button
                variant={viewMode === 'grid' ? 'default' : 'ghost'}
                size="sm"
                onClick={() => setViewMode('grid')}
                className="rounded-r-none"
              >
                Grid
              </Button>
              <Button
                variant={viewMode === 'table' ? 'default' : 'ghost'}
                size="sm"
                onClick={() => setViewMode('table')}
                className="rounded-l-none"
              >
                Table
              </Button>
            </div>
            <Button onClick={handleCreateNew}>
              <Plus className="h-4 w-4 mr-2" />
              Create Content Type
            </Button>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <Settings className="h-8 w-8 text-blue-600" />
                <div className="ml-4">
                  <p className="text-sm font-medium text-muted-foreground">Total Types</p>
                  <p className="text-2xl font-bold">{contentTypes.length}</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <Database className="h-8 w-8 text-green-600" />
                <div className="ml-4">
                  <p className="text-sm font-medium text-muted-foreground">Total Entries</p>
                  <p className="text-2xl font-bold">
                    {contentTypes.reduce((sum, ct) => sum + ct._count.entries, 0)}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <Plus className="h-8 w-8 text-purple-600" />
                <div className="ml-4">
                  <p className="text-sm font-medium text-muted-foreground">Fields Created</p>
                  <p className="text-2xl font-bold">
                    {contentTypes.reduce((sum, ct) => sum + ct.fields.length, 0)}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Content Types List */}
        {viewMode === 'grid' ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {contentTypes.map((contentType) => (
              <ContentTypeCard
                key={contentType.id}
                contentType={contentType}
                onEdit={handleEdit}
                onDelete={handleDelete}
                onManageEntries={handleManageEntries}
              />
            ))}
          </div>
        ) : (
          <Card>
            <CardHeader>
              <CardTitle>All Content Types</CardTitle>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Name</TableHead>
                    <TableHead>Description</TableHead>
                    <TableHead>Fields</TableHead>
                    <TableHead>Entries</TableHead>
                    <TableHead>Created</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {contentTypes.map((contentType) => (
                    <TableRow key={contentType.id}>
                      <TableCell className="font-medium">
                        {contentType.displayName}
                        <div className="text-xs text-muted-foreground">
                          {contentType.slug}
                        </div>
                      </TableCell>
                      <TableCell>{contentType.description || '—'}</TableCell>
                      <TableCell>
                        <Badge variant="secondary">
                          {contentType.fields.length} fields
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline">
                          {contentType._count.entries}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-muted-foreground">
                        {contentType.createdAt.toLocaleDateString()}
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end space-x-2">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => onManageEntries(contentType.id)}
                          >
                            <Database className="h-4 w-4" />
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleEdit(contentType.id)}
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button
                            size="sm"
                            variant="destructive"
                            onClick={() => handleDelete(contentType.id)}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        )}

        {/* Empty State */}
        {contentTypes.length === 0 && (
          <Card>
            <CardContent className="p-12 text-center">
              <Settings className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2">No Content Types</h3>
              <p className="text-muted-foreground mb-4">
                Get started by creating your first custom content type
              </p>
              <Button onClick={handleCreateNew}>
                <Plus className="h-4 w-4 mr-2" />
                Create Content Type
              </Button>
            </CardContent>
          </Card>
        )}
      </div>
    </AdminLayout>
  )
}