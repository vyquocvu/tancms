import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from './ui/card'
import { Button } from './ui/button'
import { Input } from './ui/input'
import { Label } from './ui/label'
import { X, Save, Calendar, Clock, Eye, EyeOff } from 'lucide-react'
import { FieldRenderer, validateFieldValue } from './forms/field-renderer'
import { ContentPreview } from './ui/content-preview'
import type { ContentType, ContentField, ContentEntry, ContentStatus } from '~/lib/mock-api'

interface ContentEntryFormProps {
  contentType: ContentType
  entry?: ContentEntry | null
  onSave: (data: {
    slug?: string
    status?: ContentStatus
    publishedAt?: Date
    scheduledAt?: Date
    fieldValues: { fieldId: string; value: string }[]
  }) => Promise<void>
  onCancel: () => void
  isLoading?: boolean
}

export default function ContentEntryForm({
  contentType,
  entry,
  onSave,
  onCancel,
  isLoading = false,
}: ContentEntryFormProps) {
  const [formData, setFormData] = useState<Record<string, string>>({})
  const [slug, setSlug] = useState('')
  const [status, setStatus] = useState<ContentStatus>('DRAFT')
  const [scheduledAt, setScheduledAt] = useState('')
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [showPreview, setShowPreview] = useState(false)
  const [previewMode, setPreviewMode] = useState<'modal' | 'side-by-side'>('modal')

  // Initialize form data
  useEffect(() => {
    const initialData: Record<string, string> = {}

    if (entry) {
      // Editing existing entry
      setSlug(entry.slug || '')
      setStatus(entry.status)
      setScheduledAt(entry.scheduledAt ? entry.scheduledAt.toISOString().slice(0, 16) : '')
      entry.fieldValues.forEach(fv => {
        initialData[fv.fieldId] = fv.value
      })
    } else {
      // Creating new entry - use default values
      setStatus('DRAFT')
      setScheduledAt('')
      contentType.fields.forEach(field => {
        initialData[field.id] = field.defaultValue || ''
      })
    }

    setFormData(initialData)
  }, [contentType, entry])

  const handleFieldChange = (fieldId: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      [fieldId]: value,
    }))

    // Clear error when user starts typing
    if (errors[fieldId]) {
      setErrors(prev => ({
        ...prev,
        [fieldId]: '',
      }))
    }
  }

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {}

    contentType.fields.forEach(field => {
      const value = formData[field.id] || ''
      const validation = validateFieldValue(field, value)

      if (!validation.isValid && validation.message) {
        newErrors[field.id] = validation.message
      }
    })

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!validateForm()) {
      return
    }

    const fieldValues = contentType.fields.map(field => ({
      fieldId: field.id,
      value: formData[field.id] || '',
    }))

    let publishedAt: Date | undefined
    let finalScheduledAt: Date | undefined

    if (status === 'PUBLISHED') {
      publishedAt = new Date()
    } else if (status === 'SCHEDULED' && scheduledAt) {
      finalScheduledAt = new Date(scheduledAt)
    }

    await onSave({
      slug: slug || undefined,
      status,
      publishedAt,
      scheduledAt: finalScheduledAt,
      fieldValues,
    })
  }

  const renderField = (field: ContentField) => {
    const value = formData[field.id] || ''
    const error = errors[field.id]

    return (
      <FieldRenderer
        field={field}
        value={value}
        onChange={newValue => handleFieldChange(field.id, newValue)}
        error={error}
      />
    )
  }

  const renderFormFields = () => (
    <>
      {/* Slug field */}
      <div className='space-y-2'>
        <Label htmlFor='slug'>
          Slug
          <span className='text-xs text-muted-foreground ml-2'>
            (optional, will be generated if empty)
          </span>
        </Label>
        <Input
          id='slug'
          type='text'
          placeholder='url-friendly-slug'
          value={slug}
          onChange={e => setSlug(e.target.value)}
        />
      </div>

      {/* Content Status and Workflow */}
      <div className='space-y-4 p-4 border rounded-lg bg-muted/20'>
        <h3 className='text-sm font-medium'>Publishing Options</h3>

        <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
          <div className='space-y-2'>
            <Label htmlFor='status'>Status</Label>
            <select
              id='status'
              value={status}
              onChange={e => setStatus(e.target.value as ContentStatus)}
              className='flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50'
            >
              <option value='DRAFT'>📝 Draft</option>
              <option value='PUBLISHED'>✅ Published</option>
              <option value='SCHEDULED'>⏰ Scheduled</option>
              <option value='ARCHIVED'>📦 Archived</option>
            </select>
          </div>

          {status === 'SCHEDULED' && (
            <div className='space-y-2'>
              <Label htmlFor='scheduledAt'>
                <Calendar className='w-4 h-4 inline mr-1' />
                Scheduled Date & Time
              </Label>
              <Input
                id='scheduledAt'
                type='datetime-local'
                value={scheduledAt}
                onChange={e => setScheduledAt(e.target.value)}
                min={new Date().toISOString().slice(0, 16)}
              />
              <p className='text-xs text-muted-foreground'>
                Content will be automatically published at the scheduled time
              </p>
            </div>
          )}

          {status === 'PUBLISHED' && entry?.publishedAt && (
            <div className='space-y-2'>
              <Label>
                <Clock className='w-4 h-4 inline mr-1' />
                Published
              </Label>
              <p className='text-sm text-muted-foreground'>{entry.publishedAt.toLocaleString()}</p>
            </div>
          )}
        </div>
      </div>

      {/* Dynamic fields */}
      {contentType.fields
        .sort((a, b) => a.order - b.order)
        .map(field => (
          <div key={field.id}>{renderField(field)}</div>
        ))}
    </>
  )

  return (
    <div className='w-full max-w-6xl mx-auto'>
      {previewMode === 'side-by-side' ? (
        <div className='grid grid-cols-1 lg:grid-cols-2 gap-6'>
          {/* Edit Form */}
          <Card className='h-fit'>
            <CardHeader className='flex flex-row items-center justify-between'>
              <CardTitle>
                {entry ? `Edit ${contentType.displayName}` : `Create ${contentType.displayName}`}
              </CardTitle>
              <div className='flex gap-2'>
                <Button
                  variant='outline'
                  size='sm'
                  onClick={() => setPreviewMode('modal')}
                  title='Switch to modal preview'
                >
                  <EyeOff className='h-4 w-4' />
                </Button>
                <Button variant='ghost' size='sm' onClick={onCancel}>
                  <X className='h-4 w-4' />
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className='space-y-6'>
                {renderFormFields()}

                {/* Form actions */}
                <div className='flex justify-end space-x-4 pt-4'>
                  <Button type='button' variant='outline' onClick={onCancel}>
                    Cancel
                  </Button>
                  <Button type='button' variant='outline' onClick={() => setShowPreview(true)}>
                    <Eye className='h-4 w-4 mr-2' />
                    Preview
                  </Button>
                  <Button type='submit' disabled={isLoading}>
                    <Save className='h-4 w-4 mr-2' />
                    {isLoading ? 'Saving...' : 'Save Entry'}
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>

          {/* Preview Panel */}
          <div className='h-fit'>
            <ContentPreview
              isOpen={true}
              onClose={() => {}}
              contentType={contentType}
              formData={formData}
              slug={slug}
              status={status}
              scheduledAt={scheduledAt}
              mode='side-by-side'
            />
          </div>
        </div>
      ) : (
        <Card className='w-full max-w-2xl mx-auto'>
          <CardHeader className='flex flex-row items-center justify-between'>
            <CardTitle>
              {entry ? `Edit ${contentType.displayName}` : `Create ${contentType.displayName}`}
            </CardTitle>
            <Button variant='ghost' size='sm' onClick={onCancel}>
              <X className='h-4 w-4' />
            </Button>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className='space-y-6'>
              {renderFormFields()}

              {/* Form actions */}
              <div className='flex justify-end space-x-4 pt-4'>
                <Button type='button' variant='outline' onClick={onCancel}>
                  Cancel
                </Button>
                <Button type='button' variant='outline' onClick={() => setShowPreview(true)}>
                  <Eye className='h-4 w-4 mr-2' />
                  Preview
                </Button>
                <Button
                  type='button'
                  variant='outline'
                  onClick={() => setPreviewMode('side-by-side')}
                  title='Side-by-side edit and preview'
                >
                  <Eye className='h-4 w-4 mr-2' />
                  Side by Side
                </Button>
                <Button type='submit' disabled={isLoading}>
                  <Save className='h-4 w-4 mr-2' />
                  {isLoading ? 'Saving...' : 'Save Entry'}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}

      {/* Preview Modal */}
      <ContentPreview
        isOpen={showPreview && previewMode === 'modal'}
        onClose={() => setShowPreview(false)}
        contentType={contentType}
        formData={formData}
        slug={slug}
        status={status}
        scheduledAt={scheduledAt}
        mode='modal'
      />
    </div>
  )
}
