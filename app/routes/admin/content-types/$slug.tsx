import { useState } from 'react'
import AdminLayout from '../layout'
import { Card, CardContent, CardHeader, CardTitle } from '~/components/ui/card'
import { Button } from '~/components/ui/button'
import { Input } from '~/components/ui/input'
import { Badge } from '~/components/ui/badge'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '~/components/ui/table'
import { Plus, Edit, Trash2, ArrowLeft, Search, Filter } from 'lucide-react'

// Mock data for demo - would come from server in real implementation
const mockContentType = {
  id: '1',
  name: 'product',
  displayName: 'Product',
  description: 'E-commerce product catalog',
  slug: 'product',
  fields: [
    { id: '1', name: 'title', displayName: 'Title', fieldType: 'TEXT', required: true },
    { id: '2', name: 'price', displayName: 'Price', fieldType: 'NUMBER', required: true },
    { id: '3', name: 'description', displayName: 'Description', fieldType: 'TEXTAREA', required: false }
  ]
}

const mockEntries = [
  {
    id: '1',
    slug: 'laptop-pro-15',
    fieldValues: [
      { fieldId: '1', field: mockContentType.fields[0], value: 'Laptop Pro 15"' },
      { fieldId: '2', field: mockContentType.fields[1], value: '1299.99' },
      { fieldId: '3', field: mockContentType.fields[2], value: 'High-performance laptop with 15-inch display' }
    ],
    createdAt: new Date('2024-01-20'),
    updatedAt: new Date('2024-01-22')
  },
  {
    id: '2',
    slug: 'wireless-mouse',
    fieldValues: [
      { fieldId: '1', field: mockContentType.fields[0], value: 'Wireless Mouse' },
      { fieldId: '2', field: mockContentType.fields[1], value: '29.99' },
      { fieldId: '3', field: mockContentType.fields[2], value: 'Ergonomic wireless mouse with USB receiver' }
    ],
    createdAt: new Date('2024-01-18'),
    updatedAt: new Date('2024-01-19')
  },
  {
    id: '3',
    slug: 'mechanical-keyboard',
    fieldValues: [
      { fieldId: '1', field: mockContentType.fields[0], value: 'Mechanical Keyboard' },
      { fieldId: '2', field: mockContentType.fields[1], value: '89.99' },
      { fieldId: '3', field: mockContentType.fields[2], value: 'RGB backlit mechanical keyboard with blue switches' }
    ],
    createdAt: new Date('2024-01-15'),
    updatedAt: new Date('2024-01-16')
  }
]

export default function ContentEntries() {
  const [entries] = useState(mockEntries)
  const [searchTerm, setSearchTerm] = useState('')
  const [currentPage, setCurrentPage] = useState(1)
  const entriesPerPage = 10

  const handleEdit = (entryId: string) => {
    console.log('Edit entry:', entryId)
  }

  const handleDelete = (entryId: string) => {
    console.log('Delete entry:', entryId)
  }

  const handleCreateNew = () => {
    console.log('Create new entry')
  }

  const getFieldValue = (entry: typeof mockEntries[0], fieldName: string) => {
    const fieldValue = entry.fieldValues.find(fv => fv.field.name === fieldName)
    return fieldValue?.value || '—'
  }

  const filteredEntries = entries.filter(entry =>
    entry.fieldValues.some(fv =>
      fv.value.toLowerCase().includes(searchTerm.toLowerCase())
    ) || entry.slug.toLowerCase().includes(searchTerm.toLowerCase())
  )

  const totalPages = Math.ceil(filteredEntries.length / entriesPerPage)
  const startIndex = (currentPage - 1) * entriesPerPage
  const paginatedEntries = filteredEntries.slice(startIndex, startIndex + entriesPerPage)

  return (
    <AdminLayout>
      <div className="space-y-6">
        {/* Page Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <Button variant="outline" size="sm">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Content Types
            </Button>
            <div>
              <h1 className="text-3xl font-bold">{mockContentType.displayName} Entries</h1>
              <p className="text-muted-foreground">
                Manage content entries for {mockContentType.displayName.toLowerCase()}
              </p>
            </div>
          </div>
          <Button onClick={handleCreateNew}>
            <Plus className="h-4 w-4 mr-2" />
            Create {mockContentType.displayName}
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
                  <p className="text-2xl font-bold">{entries.length}</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <div className="ml-0">
                  <p className="text-sm font-medium text-muted-foreground">Last Updated</p>
                  <p className="text-2xl font-bold">2d ago</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <div className="ml-0">
                  <p className="text-sm font-medium text-muted-foreground">Fields</p>
                  <p className="text-2xl font-bold">{mockContentType.fields.length}</p>
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
              {mockContentType.displayName} Entries ({filteredEntries.length})
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Slug</TableHead>
                  {mockContentType.fields.map((field) => (
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
                    {mockContentType.fields.map((field) => (
                      <TableCell key={field.id}>
                        <div className="max-w-48 truncate">
                          {field.fieldType === 'NUMBER' ? (
                            <Badge variant="secondary">
                              ${getFieldValue(entry, field.name)}
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
                    : `No ${mockContentType.displayName.toLowerCase()} entries have been created yet`
                  }
                </p>
                {!searchTerm && (
                  <Button onClick={handleCreateNew}>
                    <Plus className="h-4 w-4 mr-2" />
                    Create Your First {mockContentType.displayName}
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