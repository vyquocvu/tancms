import AdminLayout from './layout'
import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '~/components/ui/card'
import { Button } from '~/components/ui/button'
import { Input } from '~/components/ui/input'
import { Plus, Search, Edit, Trash2, Tag as TagIcon } from 'lucide-react'
import { EmptyTags, EmptySearch } from '~/components/ui/empty-states'
import { CardListSkeleton } from '~/components/ui/loading-states'
import { DeleteConfirmation } from '~/components/ui/confirmation-dialog'
import { useToast } from '~/components/ui/toast'
import React from 'react'

interface Tag {
  id: string
  name: string
  createdAt: string
}

function TagCard({
  tag,
  onEdit,
  onDelete,
}: {
  tag: Tag
  onEdit: (tag: Tag) => void
  onDelete: (tag: Tag) => void
}) {
  return (
    <Card className='hover:shadow-md transition-shadow'>
      <CardContent className='p-4 sm:p-6'>
        <div className='flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 sm:gap-0'>
          <div className='flex items-center gap-3'>
            <div className='p-2 bg-primary/10 rounded-md'>
              <TagIcon className='h-4 w-4 text-primary' />
            </div>
            <div>
              <h3 className='text-lg font-medium'>{tag.name}</h3>
              <p className='text-xs text-muted-foreground'>Created {tag.createdAt}</p>
            </div>
          </div>
          <div className='flex space-x-2 justify-end'>
            <Button
              variant='ghost'
              size='sm'
              onClick={() => onEdit(tag)}
              aria-label={`Edit tag ${tag.name}`}
              className='hover:bg-muted min-h-[44px] sm:min-h-[auto]'
            >
              <Edit className='h-4 w-4' />
              <span className='ml-2 sm:hidden'>Edit</span>
            </Button>
            <Button
              variant='ghost'
              size='sm'
              onClick={() => onDelete(tag)}
              aria-label={`Delete tag ${tag.name}`}
              className='hover:bg-destructive/10 hover:text-destructive min-h-[44px] sm:min-h-[auto]'
            >
              <Trash2 className='h-4 w-4' />
              <span className='ml-2 sm:hidden'>Delete</span>
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

function CreateTagModal({
  isOpen,
  onClose,
  onSave,
}: {
  isOpen: boolean
  onClose: () => void
  onSave: (name: string) => Promise<void> | void
}) {
  const [tagName, setTagName] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (tagName.trim() && !isSubmitting) {
      setIsSubmitting(true)
      try {
        await onSave(tagName.trim())
        setTagName('')
        onClose()
      } catch (_error) {
        // Error handling is done in the parent component
      } finally {
        setIsSubmitting(false)
      }
    }
  }

  const handleClose = () => {
    if (!isSubmitting) {
      setTagName('')
      onClose()
    }
  }

  React.useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen && !isSubmitting) {
        handleClose()
      }
    }

    if (isOpen) {
      document.addEventListener('keydown', handleKeyDown)
      document.body.style.overflow = 'hidden'
    }

    return () => {
      document.removeEventListener('keydown', handleKeyDown)
      document.body.style.overflow = 'unset'
    }
  }, [isOpen, isSubmitting])

  if (!isOpen) return null

  const handleBackdropClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget && !isSubmitting) {
      handleClose()
    }
  }

  return (
    <div
      className='fixed inset-0 bg-black/50 backdrop-blur-sm overflow-y-auto h-full w-full z-50 flex items-center justify-center p-4'
      onClick={handleBackdropClick}
      role='dialog'
      aria-modal='true'
      aria-labelledby='modal-title'
    >
      <Card className='w-full max-w-md'>
        <CardHeader>
          <CardTitle id='modal-title' className='flex items-center gap-2'>
            <Plus className='h-5 w-5' />
            Create New Tag
          </CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className='space-y-4'>
            <div>
              <label htmlFor='tagName' className='block text-sm font-medium mb-2'>
                Tag Name
              </label>
              <Input
                type='text'
                id='tagName'
                value={tagName}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => setTagName(e.target.value)}
                placeholder='Enter tag name...'
                autoFocus
                disabled={isSubmitting}
                className='w-full'
                aria-describedby='tagName-help'
              />
              <p id='tagName-help' className='text-xs text-muted-foreground mt-1'>
                Choose a descriptive name for your tag
              </p>
            </div>
            <div className='flex gap-3 pt-4'>
              <Button
                type='button'
                variant='outline'
                onClick={handleClose}
                disabled={isSubmitting}
                className='flex-1'
              >
                Cancel
              </Button>
              <Button type='submit' disabled={!tagName.trim() || isSubmitting} className='flex-1'>
                {isSubmitting ? (
                  <div className='flex items-center gap-2'>
                    <div className='animate-spin rounded-full h-4 w-4 border-b-2 border-white'></div>
                    Creating...
                  </div>
                ) : (
                  'Create Tag'
                )}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}

export default function TagsPage() {
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false)
  const [tagToDelete, setTagToDelete] = useState<Tag | null>(null)
  const [searchTerm, setSearchTerm] = useState('')
  const [isLoading, setIsLoading] = useState(true)
  const [isDeleting, setIsDeleting] = useState(false)
  const toast = useToast()

  // Mock data - in real implementation this would come from the database
  const [tags, setTags] = useState<Tag[]>([])

  useEffect(() => {
    // Simulate loading
    const loadTags = () => {
      setTimeout(() => {
        setTags([
          {
            id: '1',
            name: 'Technology',
            createdAt: '2024-01-15',
          },
          {
            id: '2',
            name: 'Web Development',
            createdAt: '2024-01-14',
          },
          {
            id: '3',
            name: 'React',
            createdAt: '2024-01-13',
          },
          {
            id: '4',
            name: 'TypeScript',
            createdAt: '2024-01-12',
          },
          {
            id: '5',
            name: 'Design',
            createdAt: '2024-01-11',
          },
          {
            id: '6',
            name: 'Performance',
            createdAt: '2024-01-10',
          },
        ])
        setIsLoading(false)
      }, 1000)
    }

    loadTags()
  }, [])

  const filteredTags = tags.filter(tag => tag.name.toLowerCase().includes(searchTerm.toLowerCase()))

  const handleCreateTag = async (name: string) => {
    try {
      const newTag: Tag = {
        id: (tags.length + 1).toString(),
        name,
        createdAt: new Date().toISOString().split('T')[0],
      }
      setTags([...tags, newTag])
      toast.showSuccess('Tag created', `"${name}" has been created successfully.`)
    } catch (_error) {
      toast.showError('Failed to create tag', 'Please try again.')
    }
  }

  const handleEditTag = (_tag: Tag) => {
    // In a real implementation, this would open an edit modal
    toast.showInfo('Edit feature', 'Edit functionality will be implemented soon.')
  }

  const handleDeleteTag = (tag: Tag) => {
    setTagToDelete(tag)
    setIsDeleteDialogOpen(true)
  }

  const confirmDelete = async () => {
    if (!tagToDelete) return

    setIsDeleting(true)
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000))
      setTags(tags.filter(t => t.id !== tagToDelete.id))
      toast.showSuccess('Tag deleted', `"${tagToDelete.name}" has been deleted.`)
    } catch (_error) {
      toast.showError('Failed to delete tag', 'Please try again.')
    } finally {
      setIsDeleting(false)
      setIsDeleteDialogOpen(false)
      setTagToDelete(null)
    }
  }

  const handleCloseDeleteDialog = () => {
    setIsDeleteDialogOpen(false)
    setTagToDelete(null)
  }

  if (isLoading) {
    return (
      <AdminLayout>
        <div className='space-y-6'>
          <div className='flex justify-between items-center'>
            <div>
              <h1 className='text-3xl font-bold tracking-tight'>Tags</h1>
              <p className='text-muted-foreground'>Organize your content with tags</p>
            </div>
            <Button disabled>
              <Plus className='mr-2 h-4 w-4' />
              New Tag
            </Button>
          </div>
          <CardListSkeleton count={6} />
        </div>
      </AdminLayout>
    )
  }

  if (tags.length === 0 && !isLoading) {
    return (
      <AdminLayout>
        <div className='space-y-6'>
          <div className='flex justify-between items-center'>
            <div>
              <h1 className='text-3xl font-bold tracking-tight'>Tags</h1>
              <p className='text-muted-foreground'>Organize your content with tags</p>
            </div>
            <Button onClick={() => setIsModalOpen(true)}>
              <Plus className='mr-2 h-4 w-4' />
              New Tag
            </Button>
          </div>
          <EmptyTags />
          <CreateTagModal
            isOpen={isModalOpen}
            onClose={() => setIsModalOpen(false)}
            onSave={handleCreateTag}
          />
        </div>
      </AdminLayout>
    )
  }

  return (
    <AdminLayout>
      <div className='space-y-6'>
        {/* Page Header */}
        <div className='flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4'>
          <div>
            <h1 className='text-3xl font-bold tracking-tight'>Tags</h1>
            <p className='text-muted-foreground'>Organize your content with tags</p>
          </div>
          <Button onClick={() => setIsModalOpen(true)} className='w-full sm:w-auto'>
            <Plus className='mr-2 h-4 w-4' />
            New Tag
          </Button>
        </div>

        {/* Stats Summary */}
        <div className='grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4'>
          <Card>
            <CardContent className='p-6'>
              <div className='flex items-center'>
                <div className='flex-shrink-0'>
                  <div className='w-8 h-8 bg-primary/10 rounded-full flex items-center justify-center'>
                    <TagIcon className='w-4 h-4 text-primary' />
                  </div>
                </div>
                <div className='ml-5 w-0 flex-1'>
                  <dl>
                    <dt className='text-sm font-medium text-muted-foreground truncate'>
                      Total Tags
                    </dt>
                    <dd className='text-lg font-medium'>{tags.length}</dd>
                  </dl>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className='p-6'>
              <div className='flex items-center'>
                <div className='flex-shrink-0'>
                  <div className='w-8 h-8 bg-green-500/10 rounded-full flex items-center justify-center'>
                    <Search className='w-4 h-4 text-green-600' />
                  </div>
                </div>
                <div className='ml-5 w-0 flex-1'>
                  <dl>
                    <dt className='text-sm font-medium text-muted-foreground truncate'>Found</dt>
                    <dd className='text-lg font-medium'>{filteredTags.length}</dd>
                  </dl>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Search Bar */}
        <Card>
          <CardHeader>
            <CardTitle className='text-lg'>Search Tags</CardTitle>
          </CardHeader>
          <CardContent>
            <div className='max-w-md'>
              <div className='relative'>
                <Search className='absolute left-3 top-3 h-4 w-4 text-muted-foreground' />
                <Input
                  type='text'
                  value={searchTerm}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                    setSearchTerm(e.target.value)
                  }
                  className='pl-10'
                  placeholder='Search tags...'
                  aria-label='Search tags'
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Tags Grid */}
        {filteredTags.length > 0 ? (
          <div className='grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3'>
            {filteredTags.map(tag => (
              <TagCard key={tag.id} tag={tag} onEdit={handleEditTag} onDelete={handleDeleteTag} />
            ))}
          </div>
        ) : (
          searchTerm && <EmptySearch searchTerm={searchTerm} />
        )}

        {/* Modals */}
        <CreateTagModal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          onSave={handleCreateTag}
        />

        <DeleteConfirmation
          isOpen={isDeleteDialogOpen}
          onClose={handleCloseDeleteDialog}
          onConfirm={confirmDelete}
          itemName={tagToDelete?.name || ''}
          itemType='tag'
          isLoading={isDeleting}
          additionalInfo='This action cannot be undone. The tag will be removed from all associated content.'
        />
      </div>
    </AdminLayout>
  )
}
