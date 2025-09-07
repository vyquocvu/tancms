import AdminLayout from './layout'
import { useState } from 'react'
import { Card, CardContent } from '~/components/ui/card'
import { Button } from '~/components/ui/button'
import { Input } from '~/components/ui/input'
import { Plus, Search, Edit, Trash2, Upload, Image as ImageIcon, Video, FileText } from 'lucide-react'

interface MediaFile {
  id: string
  url: string
  name: string
  type: 'image' | 'video' | 'document'
  size: number
  altText?: string
  createdAt: string
}

function MediaCard({ media, onEdit, onDelete }: { 
  media: MediaFile; 
  onEdit: (media: MediaFile) => void; 
  onDelete: (media: MediaFile) => void 
}) {
  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes'
    const k = 1024
    const sizes = ['Bytes', 'KB', 'MB', 'GB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
  }

  const getFileIcon = (type: string) => {
    switch (type) {
      case 'image':
        return <ImageIcon className="h-6 w-6 text-green-500" />
      case 'video':
        return <Video className="h-6 w-6 text-blue-500" />
      default:
        return <FileText className="h-6 w-6 text-gray-500" />
    }
  }

  return (
    <Card>
      <CardContent className="p-0">
        <div className="aspect-w-16 aspect-h-9 bg-muted">
          {media.type === 'image' ? (
            <img
              src={media.url}
              alt={media.altText || media.name}
              className="w-full h-48 object-cover rounded-t-lg"
            />
          ) : (
            <div className="flex items-center justify-center h-48 rounded-t-lg">
              {getFileIcon(media.type)}
            </div>
          )}
        </div>
        <div className="p-4">
          <div className="flex items-start justify-between">
            <div className="min-w-0 flex-1">
              <h3 className="text-sm font-medium truncate">
                {media.name}
              </h3>
              <p className="text-xs text-muted-foreground mt-1">
                {formatFileSize(media.size)} • {media.createdAt}
              </p>
              {media.altText && (
                <p className="text-xs text-muted-foreground mt-1 truncate">
                  Alt: {media.altText}
                </p>
              )}
            </div>
            <div className="flex space-x-1 ml-2">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => onEdit(media)}
              >
                <Edit className="h-3 w-3" />
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => onDelete(media)}
              >
                <Trash2 className="h-3 w-3" />
              </Button>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

function UploadModal({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) {
  const [dragActive, setDragActive] = useState(false)

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true)
    } else if (e.type === 'dragleave') {
      setDragActive(false)
    }
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setDragActive(false)
    
    const files = e.dataTransfer.files
    console.log('Files dropped:', files)
    // Handle file upload here
  }

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files
    console.log('Files selected:', files)
    // Handle file upload here
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-background/80 backdrop-blur-sm overflow-y-auto h-full w-full z-50">
      <div className="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-card">
        <div className="mt-3">
          <h3 className="text-lg font-medium mb-4">Upload Media</h3>
          
          <div
            className={`border-2 border-dashed rounded-lg p-8 text-center ${
              dragActive ? 'border-primary bg-primary/10' : 'border-border'
            }`}
            onDragEnter={handleDrag}
            onDragLeave={handleDrag}
            onDragOver={handleDrag}
            onDrop={handleDrop}
          >
            <Upload className="mx-auto h-12 w-12 text-muted-foreground" />
            <div className="mt-2">
              <p className="text-sm text-muted-foreground">
                Drop files here or{' '}
                <label className="text-primary hover:text-primary/80 cursor-pointer">
                  browse
                  <input
                    type="file"
                    multiple
                    accept="image/*,video/*,.pdf,.doc,.docx"
                    onChange={handleFileInput}
                    className="hidden"
                  />
                </label>
              </p>
              <p className="text-xs text-muted-foreground mt-1">
                Supports images, videos, and documents up to 10MB
              </p>
            </div>
          </div>

          <div className="flex justify-end space-x-3 mt-6">
            <Button variant="outline" onClick={onClose}>
              Cancel
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}

export default function MediaPage() {
  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false)
  const [selectedType, setSelectedType] = useState<'all' | 'image' | 'video' | 'document'>('all')
  const [searchTerm, setSearchTerm] = useState('')

  // Mock data - in real implementation this would come from the database
  const [mediaFiles, setMediaFiles] = useState<MediaFile[]>([
    {
      id: '1',
      url: 'https://images.unsplash.com/photo-1555099962-4199c345e5dd?ixlib=rb-4.0.3&auto=format&fit=crop&w=1000&q=80',
      name: 'hero-banner.jpg',
      type: 'image',
      size: 245760,
      altText: 'Hero banner image',
      createdAt: '2024-01-15'
    },
    {
      id: '2',
      url: 'https://images.unsplash.com/photo-1551434678-e076c223a692?ixlib=rb-4.0.3&auto=format&fit=crop&w=1000&q=80',
      name: 'tech-conference.jpg',
      type: 'image',
      size: 384512,
      altText: 'Technology conference',
      createdAt: '2024-01-14'
    },
    {
      id: '3',
      url: '/placeholder-video.mp4',
      name: 'product-demo.mp4',
      type: 'video',
      size: 15728640,
      createdAt: '2024-01-13'
    },
    {
      id: '4',
      url: 'https://images.unsplash.com/photo-1498050108023-c5249f4df085?ixlib=rb-4.0.3&auto=format&fit=crop&w=1000&q=80',
      name: 'code-screen.jpg',
      type: 'image',
      size: 198273,
      altText: 'Code on computer screen',
      createdAt: '2024-01-12'
    },
    {
      id: '5',
      url: '/placeholder-doc.pdf',
      name: 'user-manual.pdf',
      type: 'document',
      size: 2097152,
      createdAt: '2024-01-11'
    },
    {
      id: '6',
      url: 'https://images.unsplash.com/photo-1460925895917-afdab827c52f?ixlib=rb-4.0.3&auto=format&fit=crop&w=1000&q=80',
      name: 'analytics-chart.jpg',
      type: 'image',
      size: 167234,
      altText: 'Analytics dashboard',
      createdAt: '2024-01-10'
    }
  ])

  const filteredMedia = mediaFiles.filter(media => {
    const matchesType = selectedType === 'all' || media.type === selectedType
    const matchesSearch = media.name.toLowerCase().includes(searchTerm.toLowerCase())
    return matchesType && matchesSearch
  })

  const handleEditMedia = (media: MediaFile) => {
    console.log('Edit media:', media)
    // In a real implementation, this would open an edit modal
  }

  const handleDeleteMedia = (media: MediaFile) => {
    if (window.confirm(`Are you sure you want to delete "${media.name}"?`)) {
      setMediaFiles(mediaFiles.filter(m => m.id !== media.id))
    }
  }

  const totalSize = mediaFiles.reduce((sum, file) => sum + file.size, 0)
  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes'
    const k = 1024
    const sizes = ['Bytes', 'KB', 'MB', 'GB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
  }

  return (
    <AdminLayout>
      <div className="space-y-6">
        {/* Page Header */}
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold">Media Library</h1>
            <p className="text-muted-foreground">
              Manage your images, videos, and documents
            </p>
          </div>
          <Button onClick={() => setIsUploadModalOpen(true)}>
            <Plus className="mr-2 h-4 w-4" />
            Upload Media
          </Button>
        </div>

        {/* Stats Summary */}
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                    <span className="text-blue-600 text-sm font-medium">{mediaFiles.length}</span>
                  </div>
                </div>
                <div className="ml-5 w-0 flex-1">
                  <dl>
                    <dt className="text-sm font-medium text-muted-foreground truncate">Total Files</dt>
                    <dd className="text-lg font-medium">{mediaFiles.length}</dd>
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
                    <span className="text-green-600 text-sm font-medium">
                      {mediaFiles.filter(f => f.type === 'image').length}
                    </span>
                  </div>
                </div>
                <div className="ml-5 w-0 flex-1">
                  <dl>
                    <dt className="text-sm font-medium text-muted-foreground truncate">Images</dt>
                    <dd className="text-lg font-medium">
                      {mediaFiles.filter(f => f.type === 'image').length}
                    </dd>
                  </dl>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <div className="w-8 h-8 bg-purple-100 rounded-full flex items-center justify-center">
                    <span className="text-purple-600 text-sm font-medium">
                      {mediaFiles.filter(f => f.type === 'video').length}
                    </span>
                  </div>
                </div>
                <div className="ml-5 w-0 flex-1">
                  <dl>
                    <dt className="text-sm font-medium text-muted-foreground truncate">Videos</dt>
                    <dd className="text-lg font-medium">
                      {mediaFiles.filter(f => f.type === 'video').length}
                    </dd>
                  </dl>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <div className="w-8 h-8 bg-orange-100 rounded-full flex items-center justify-center">
                    <span className="text-orange-600 text-sm font-medium">
                      {formatFileSize(totalSize)}
                    </span>
                  </div>
                </div>
                <div className="ml-5 w-0 flex-1">
                  <dl>
                    <dt className="text-sm font-medium text-muted-foreground truncate">Storage Used</dt>
                    <dd className="text-lg font-medium">{formatFileSize(totalSize)}</dd>
                  </dl>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Filters and Search */}
        <Card>
          <CardContent className="p-6">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-4 sm:space-y-0">
              <div className="flex space-x-4">
                <div>
                  <label htmlFor="type-filter" className="block text-sm font-medium mb-1">
                    Filter by Type
                  </label>
                  <select
                    id="type-filter"
                    value={selectedType}
                    onChange={(e: React.ChangeEvent<HTMLSelectElement>) => setSelectedType(e.target.value as 'all' | 'image' | 'video' | 'document')}
                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                  >
                    <option value="all">All Files</option>
                    <option value="image">Images</option>
                    <option value="video">Videos</option>
                    <option value="document">Documents</option>
                  </select>
                </div>
              </div>
              <div className="max-w-xs w-full">
                <label htmlFor="search" className="block text-sm font-medium mb-1">
                  Search Files
                </label>
                <div className="relative">
                  <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                  <Input
                    type="text"
                    id="search"
                    value={searchTerm}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => setSearchTerm(e.target.value)}
                    className="pl-10"
                    placeholder="Search files..."
                  />
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Media Grid */}
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {filteredMedia.map((media) => (
            <MediaCard
              key={media.id}
              media={media}
              onEdit={handleEditMedia}
              onDelete={handleDeleteMedia}
            />
          ))}
        </div>

        {filteredMedia.length === 0 && (
          <div className="text-center py-12">
            <ImageIcon className="mx-auto h-12 w-12 text-muted-foreground" />
            <h3 className="mt-2 text-sm font-medium">No media files found</h3>
            <p className="mt-1 text-sm text-muted-foreground">
              {searchTerm || selectedType !== 'all' 
                ? 'Try adjusting your search or filter criteria.' 
                : 'Get started by uploading your first file.'}
            </p>
          </div>
        )}

        {/* Upload Modal */}
        <UploadModal
          isOpen={isUploadModalOpen}
          onClose={() => setIsUploadModalOpen(false)}
        />
      </div>
    </AdminLayout>
  )
}