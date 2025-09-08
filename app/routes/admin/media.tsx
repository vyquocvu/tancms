import AdminLayout from './layout'
import { useState, useEffect } from 'react'
import { Card, CardContent } from '~/components/ui/card'
import { Button } from '~/components/ui/button'
import { Input } from '~/components/ui/input'
import { Plus, Search, Edit, Trash2, Upload, Image as ImageIcon, Video, FileText } from 'lucide-react'
import { 
  uploadFile, 
  getMediaFiles, 
  updateMediaFile, 
  deleteMediaFile, 
  getMediaStatistics,
  type MediaFile 
} from '~/lib/local-media-service'

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

function UploadModal({ isOpen, onClose, onUploadComplete }: { 
  isOpen: boolean; 
  onClose: () => void;
  onUploadComplete: () => void;
}) {
  const [dragActive, setDragActive] = useState(false)
  const [uploading, setUploading] = useState(false)

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
    handleFiles(files)
  }

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files
    if (files) {
      handleFiles(files)
    }
  }

  const handleFiles = async (files: FileList) => {
    if (uploading) return

    setUploading(true)
    try {
      // Upload each file
      for (const file of Array.from(files)) {
        await uploadFile(file)
      }
      
      // Notify parent component to refresh the list
      onUploadComplete()
      
      // Close modal
      onClose()
    } catch (error) {
      console.error('Upload failed:', error)
      alert('Upload failed. Please try again.')
    } finally {
      setUploading(false)
    }
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-background/80 backdrop-blur-sm overflow-y-auto h-full w-full z-50">
      <div className="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-card">
        <div className="mt-3">
          <h3 className="text-lg font-medium mb-4">Upload Media</h3>
          
          <div
            className={`border-2 border-dashed rounded-lg p-8 text-center ${
              dragActive ? 'border-primary bg-primary/10' : 'border-gray-300'
            } ${uploading ? 'opacity-50 pointer-events-none' : ''}`}
            onDragEnter={handleDrag}
            onDragLeave={handleDrag}
            onDragOver={handleDrag}
            onDrop={handleDrop}
          >
            <Upload className="mx-auto h-12 w-12 text-muted-foreground" />
            <div className="mt-2">
              <p className="text-sm text-muted-foreground">
                {uploading ? 'Uploading...' : 'Drop files here or'}{' '}
                {!uploading && (
                  <label className="text-primary hover:text-primary/80 cursor-pointer">
                    browse
                    <input
                      type="file"
                      multiple
                      accept="image/*,video/*,.pdf,.doc,.docx"
                      onChange={handleFileInput}
                      className="hidden"
                      disabled={uploading}
                    />
                  </label>
                )}
              </p>
              <p className="text-xs text-muted-foreground mt-1">
                Supports images, videos, and documents up to 10MB
              </p>
            </div>
          </div>

          <div className="flex justify-end space-x-3 mt-6">
            <Button variant="outline" onClick={onClose} disabled={uploading}>
              {uploading ? 'Uploading...' : 'Cancel'}
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
  const [mediaFiles, setMediaFiles] = useState<MediaFile[]>([])
  const [stats, setStats] = useState({
    total: 0,
    images: 0,
    videos: 0,
    documents: 0,
    totalSize: 0
  })
  const [loading, setLoading] = useState(true)

  // Load media files and stats
  const loadMedia = async () => {
    try {
      setLoading(true)
      const [mediaResult, statsResult] = await Promise.all([
        getMediaFiles(1, 100, searchTerm, selectedType), // Load all for now
        getMediaStatistics()
      ])
      
      setMediaFiles(mediaResult.media)
      setStats(statsResult)
    } catch (error) {
      console.error('Failed to load media:', error)
    } finally {
      setLoading(false)
    }
  }

  // Load data on component mount and when filters change
  useEffect(() => {
    loadMedia()
  }, [searchTerm, selectedType])

  const filteredMedia = mediaFiles.filter(media => {
    const matchesType = selectedType === 'all' || media.type === selectedType
    const matchesSearch = media.name.toLowerCase().includes(searchTerm.toLowerCase())
    return matchesType && matchesSearch
  })

  const handleEditMedia = (media: MediaFile) => {
    const newAltText = prompt('Enter alt text:', media.altText || '')
    if (newAltText !== null) {
      updateMediaFile(media.id, { altText: newAltText })
        .then(() => {
          loadMedia() // Refresh the list
        })
        .catch(error => {
          console.error('Failed to update media:', error)
          alert('Failed to update media')
        })
    }
  }

  const handleDeleteMedia = (media: MediaFile) => {
    if (window.confirm(`Are you sure you want to delete "${media.name}"?`)) {
      deleteMediaFile(media.id)
        .then(() => {
          loadMedia() // Refresh the list
        })
        .catch(error => {
          console.error('Failed to delete media:', error)
          alert('Failed to delete media')
        })
    }
  }

  const handleUploadComplete = () => {
    loadMedia() // Refresh the list after upload
  }

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
                    <span className="text-blue-600 text-sm font-medium">{stats.total}</span>
                  </div>
                </div>
                <div className="ml-5 w-0 flex-1">
                  <dl>
                    <dt className="text-sm font-medium text-muted-foreground truncate">Total Files</dt>
                    <dd className="text-lg font-medium">{stats.total}</dd>
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
                    <span className="text-green-600 text-sm font-medium">{stats.images}</span>
                  </div>
                </div>
                <div className="ml-5 w-0 flex-1">
                  <dl>
                    <dt className="text-sm font-medium text-muted-foreground truncate">Images</dt>
                    <dd className="text-lg font-medium">{stats.images}</dd>
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
                    <span className="text-purple-600 text-sm font-medium">{stats.videos}</span>
                  </div>
                </div>
                <div className="ml-5 w-0 flex-1">
                  <dl>
                    <dt className="text-sm font-medium text-muted-foreground truncate">Videos</dt>
                    <dd className="text-lg font-medium">{stats.videos}</dd>
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
                      {formatFileSize(stats.totalSize)}
                    </span>
                  </div>
                </div>
                <div className="ml-5 w-0 flex-1">
                  <dl>
                    <dt className="text-sm font-medium text-muted-foreground truncate">Storage Used</dt>
                    <dd className="text-lg font-medium">{formatFileSize(stats.totalSize)}</dd>
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
        {loading ? (
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
            <p className="mt-4 text-muted-foreground">Loading media files...</p>
          </div>
        ) : (
          <>
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

            {filteredMedia.length === 0 && !loading && (
              <div className="text-center py-12">
                <ImageIcon className="mx-auto h-12 w-12 text-muted-foreground" />
                <h3 className="mt-2 text-sm font-medium">No media files found</h3>
                <p className="mt-1 text-sm text-muted-foreground">
                  {searchTerm || selectedType !== 'all' 
                    ? 'Try adjusting your search or filter criteria.' 
                    : 'Get started by uploading your first file.'}
                </p>
                {!searchTerm && selectedType === 'all' && (
                  <Button className="mt-4" onClick={() => setIsUploadModalOpen(true)}>
                    <Plus className="mr-2 h-4 w-4" />
                    Upload First File
                  </Button>
                )}
              </div>
            )}
          </>
        )}

        {/* Upload Modal */}
        <UploadModal
          isOpen={isUploadModalOpen}
          onClose={() => setIsUploadModalOpen(false)}
          onUploadComplete={handleUploadComplete}
        />
      </div>
    </AdminLayout>
  )
}