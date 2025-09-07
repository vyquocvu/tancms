import AdminLayout from './layout'
import { useState } from 'react'

interface Tag {
  id: string
  name: string
  postCount: number
  createdAt: string
}

function TagCard({ tag, onEdit, onDelete }: { tag: Tag; onEdit: (tag: Tag) => void; onDelete: (tag: Tag) => void }) {
  return (
    <div className="bg-white overflow-hidden shadow rounded-lg">
      <div className="px-4 py-5 sm:p-6">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-lg font-medium text-gray-900">{tag.name}</h3>
            <p className="mt-1 text-sm text-gray-500">
              {tag.postCount} {tag.postCount === 1 ? 'post' : 'posts'}
            </p>
            <p className="text-xs text-gray-400">
              Created {tag.createdAt}
            </p>
          </div>
          <div className="flex space-x-2">
            <button
              onClick={() => onEdit(tag)}
              className="text-indigo-600 hover:text-indigo-900 text-sm font-medium"
            >
              Edit
            </button>
            <button
              onClick={() => onDelete(tag)}
              className="text-red-600 hover:text-red-900 text-sm font-medium"
            >
              Delete
            </button>
          </div>
        </div>
      </div>
    </div>
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
    <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
      <div className="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white">
        <div className="mt-3">
          <h3 className="text-lg font-medium text-gray-900 mb-4">Create New Tag</h3>
          <form onSubmit={handleSubmit}>
            <div className="mb-4">
              <label htmlFor="tagName" className="block text-sm font-medium text-gray-700 mb-2">
                Tag Name
              </label>
              <input
                type="text"
                id="tagName"
                value={tagName}
                onChange={(e) => setTagName(e.target.value)}
                className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm px-3 py-2 border"
                placeholder="Enter tag name..."
                autoFocus
              />
            </div>
            <div className="flex justify-end space-x-3">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-200 rounded-md hover:bg-gray-300"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-4 py-2 text-sm font-medium text-white bg-indigo-600 rounded-md hover:bg-indigo-700"
                disabled={!tagName.trim()}
              >
                Create Tag
              </button>
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
      postCount: 5,
      createdAt: '2024-01-15'
    },
    {
      id: '2',
      name: 'Web Development',
      postCount: 8,
      createdAt: '2024-01-14'
    },
    {
      id: '3',
      name: 'React',
      postCount: 3,
      createdAt: '2024-01-13'
    },
    {
      id: '4',
      name: 'TypeScript',
      postCount: 4,
      createdAt: '2024-01-12'
    },
    {
      id: '5',
      name: 'Design',
      postCount: 2,
      createdAt: '2024-01-11'
    },
    {
      id: '6',
      name: 'Performance',
      postCount: 1,
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
      postCount: 0,
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

  const totalPosts = tags.reduce((sum, tag) => sum + tag.postCount, 0)

  return (
    <AdminLayout>
      <div className="space-y-6">
        {/* Page Header */}
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Tags</h1>
            <p className="mt-1 text-sm text-gray-500">
              Organize your content with tags
            </p>
          </div>
          <button
            onClick={() => setIsModalOpen(true)}
            className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700"
          >
            <svg className="mr-2 h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
            </svg>
            New Tag
          </button>
        </div>

        {/* Stats Summary */}
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-3">
          <div className="bg-white overflow-hidden shadow rounded-lg">
            <div className="p-5">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                    <span className="text-blue-600 text-sm font-medium">{tags.length}</span>
                  </div>
                </div>
                <div className="ml-5 w-0 flex-1">
                  <dl>
                    <dt className="text-sm font-medium text-gray-500 truncate">Total Tags</dt>
                    <dd className="text-lg font-medium text-gray-900">{tags.length}</dd>
                  </dl>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white overflow-hidden shadow rounded-lg">
            <div className="p-5">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                    <span className="text-green-600 text-sm font-medium">{totalPosts}</span>
                  </div>
                </div>
                <div className="ml-5 w-0 flex-1">
                  <dl>
                    <dt className="text-sm font-medium text-gray-500 truncate">Tagged Posts</dt>
                    <dd className="text-lg font-medium text-gray-900">{totalPosts}</dd>
                  </dl>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white overflow-hidden shadow rounded-lg">
            <div className="p-5">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <div className="w-8 h-8 bg-yellow-100 rounded-full flex items-center justify-center">
                    <span className="text-yellow-600 text-sm font-medium">
                      {tags.filter(t => t.postCount === 0).length}
                    </span>
                  </div>
                </div>
                <div className="ml-5 w-0 flex-1">
                  <dl>
                    <dt className="text-sm font-medium text-gray-500 truncate">Unused Tags</dt>
                    <dd className="text-lg font-medium text-gray-900">
                      {tags.filter(t => t.postCount === 0).length}
                    </dd>
                  </dl>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Search Bar */}
        <div className="bg-white shadow rounded-lg p-6">
          <div className="max-w-md">
            <label htmlFor="search" className="block text-sm font-medium text-gray-700 mb-2">
              Search Tags
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <svg className="h-5 w-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </div>
              <input
                type="text"
                id="search"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md leading-5 bg-white placeholder-gray-500 focus:outline-none focus:placeholder-gray-400 focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                placeholder="Search tags..."
              />
            </div>
          </div>
        </div>

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
            <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
            </svg>
            <h3 className="mt-2 text-sm font-medium text-gray-900">No tags found</h3>
            <p className="mt-1 text-sm text-gray-500">
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