import AdminLayout from './layout'
import { useState } from 'react'
import { Card, CardContent } from '~/components/ui/card'
import { Button } from '~/components/ui/button'
import { Input } from '~/components/ui/input'
import { Plus, Search, Edit, Trash2, Tag as TagIcon } from 'lucide-react'

interface Tag {
  id: string
  name: string
  createdAt: string
}

function TagCard({ tag, onEdit, onDelete }: { tag: Tag; onEdit: (tag: Tag) => void; onDelete: (tag: Tag) => void }) {
  return (
    <Card>
      <CardContent className="p-6">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-lg font-medium">{tag.name}</h3>
            <p className="text-xs text-muted-foreground">
              Created {tag.createdAt}
            </p>
          </div>
          <div className="flex space-x-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => onEdit(tag)}
            >
              <Edit className="h-4 w-4" />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => onDelete(tag)}
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

function CreateTagModal({ isOpen, onClose, onSave }: { 
  isOpen: boolean; 
  onClose: () => void; 
  onSave: (name: string) => void 
}) {
  const [tagName, setTagName] = useState('')

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (tagName.trim()) {
      onSave(tagName.trim())
      setTagName('')
      onClose()
    }
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-background/80 backdrop-blur-sm overflow-y-auto h-full w-full z-50">
      <div className="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-card">
        <div className="mt-3">
          <h3 className="text-lg font-medium mb-4">Create New Tag</h3>
          <form onSubmit={handleSubmit}>
            <div className="mb-4">
              <label htmlFor="tagName" className="block text-sm font-medium mb-2">
                Tag Name
              </label>
              <Input
                type="text"
                id="tagName"
                value={tagName}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => setTagName(e.target.value)}
                placeholder="Enter tag name..."
                autoFocus
              />
            </div>
            <div className="flex justify-end space-x-3">
              <Button
                type="button"
                variant="outline"
                onClick={onClose}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={!tagName.trim()}
              >
                Create Tag
              </Button>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}

export default function TagsPage() {
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [searchTerm, setSearchTerm] = useState('')

  // Mock data - in real implementation this would come from the database
  const [tags, setTags] = useState<Tag[]>([
    {
      id: '1',
      name: 'Technology',
      createdAt: '2024-01-15'
    },
    {
      id: '2',
      name: 'Web Development',
      createdAt: '2024-01-14'
    },
    {
      id: '3',
      name: 'React',
      createdAt: '2024-01-13'
    },
    {
      id: '4',
      name: 'TypeScript',
      createdAt: '2024-01-12'
    },
    {
      id: '5',
      name: 'Design',
      createdAt: '2024-01-11'
    },
    {
      id: '6',
      name: 'Performance',
      createdAt: '2024-01-10'
    }
  ])

  const filteredTags = tags.filter(tag =>
    tag.name.toLowerCase().includes(searchTerm.toLowerCase())
  )

  const handleCreateTag = (name: string) => {
    const newTag: Tag = {
      id: (tags.length + 1).toString(),
      name,
      createdAt: new Date().toISOString().split('T')[0]
    }
    setTags([...tags, newTag])
  }

  const handleEditTag = (tag: Tag) => {
    // In a real implementation, this would open an edit modal
    console.log('Edit tag:', tag)
  }

  const handleDeleteTag = (tag: Tag) => {
    // In a real implementation, this would show a confirmation dialog
    if (window.confirm(`Are you sure you want to delete the tag "${tag.name}"?`)) {
      setTags(tags.filter(t => t.id !== tag.id))
    }
  }

  return (
    <AdminLayout>
      <div className="space-y-6">
        {/* Page Header */}
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold">Tags</h1>
            <p className="text-muted-foreground">
              Organize your content with tags
            </p>
          </div>
          <Button onClick={() => setIsModalOpen(true)}>
            <Plus className="mr-2 h-4 w-4" />
            New Tag
          </Button>
        </div>

        {/* Stats Summary */}
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                    <span className="text-blue-600 text-sm font-medium">{tags.length}</span>
                  </div>
                </div>
                <div className="ml-5 w-0 flex-1">
                  <dl>
                    <dt className="text-sm font-medium text-muted-foreground truncate">Total Tags</dt>
                    <dd className="text-lg font-medium">{tags.length}</dd>
                  </dl>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                    <TagIcon className="w-4 h-4 text-green-600" />
                  </div>
                </div>
                <div className="ml-5 w-0 flex-1">
                  <dl>
                    <dt className="text-sm font-medium text-muted-foreground truncate">Active Tags</dt>
                    <dd className="text-lg font-medium">{filteredTags.length}</dd>
                  </dl>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Search Bar */}
        <Card>
          <CardContent className="p-6">
            <div className="max-w-md">
              <label htmlFor="search" className="block text-sm font-medium mb-2">
                Search Tags
              </label>
              <div className="relative">
                <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  type="text"
                  id="search"
                  value={searchTerm}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) => setSearchTerm(e.target.value)}
                  className="pl-10"
                  placeholder="Search tags..."
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Tags Grid */}
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {filteredTags.map((tag) => (
            <TagCard
              key={tag.id}
              tag={tag}
              onEdit={handleEditTag}
              onDelete={handleDeleteTag}
            />
          ))}
        </div>

        {filteredTags.length === 0 && (
          <div className="text-center py-12">
            <TagIcon className="mx-auto h-12 w-12 text-muted-foreground" />
            <h3 className="mt-2 text-sm font-medium">No tags found</h3>
            <p className="mt-1 text-sm text-muted-foreground">
              {searchTerm ? 'Try adjusting your search terms.' : 'Get started by creating a new tag.'}
            </p>
          </div>
        )}

        {/* Create Tag Modal */}
        <CreateTagModal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          onSave={handleCreateTag}
        />
      </div>
    </AdminLayout>
  )
}