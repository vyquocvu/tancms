import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from './ui/card'
import { Button } from './ui/button'
import { Input } from './ui/input'
import { Textarea } from './ui/textarea'
import { WysiwygEditor } from './ui/wysiwyg-editor'
import { Label } from './ui/label'
import { Switch } from './ui/switch'
import { X, Save, Calendar, Clock } from 'lucide-react'
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
  isLoading = false
}: ContentEntryFormProps) {
  const [formData, setFormData] = useState<Record<string, string>>({})
  const [slug, setSlug] = useState('')
  const [status, setStatus] = useState<ContentStatus>('DRAFT')
  const [scheduledAt, setScheduledAt] = useState('')
  const [errors, setErrors] = useState<Record<string, string>>({})

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
      [fieldId]: value
    }))
    
    // Clear error when user starts typing
    if (errors[fieldId]) {
      setErrors(prev => ({
        ...prev,
        [fieldId]: ''
      }))
    }
  }

  const handleWysiwygChange = (fieldId: string) => (value: string) => {
    handleFieldChange(fieldId, value)
  }

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {}
    
    contentType.fields.forEach(field => {
      const value = formData[field.id] || ''
      
      if (field.required && !value.trim()) {
        newErrors[field.id] = `${field.displayName} is required`
      }
      
      // Type-specific validation
      if (value && field.fieldType === 'EMAIL') {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
        if (!emailRegex.test(value)) {
          newErrors[field.id] = 'Please enter a valid email address'
        }
      }
      
      if (value && field.fieldType === 'URL') {
        try {
          new URL(value)
        } catch {
          newErrors[field.id] = 'Please enter a valid URL'
        }
      }
      
      if (value && field.fieldType === 'NUMBER') {
        if (isNaN(Number(value))) {
          newErrors[field.id] = 'Please enter a valid number'
        }
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
      value: formData[field.id] || ''
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
      fieldValues
    })
  }

  const renderField = (field: ContentField) => {
    const value = formData[field.id] || ''
    const error = errors[field.id]
    
    const commonProps = {
      id: field.id,
      value,
      onChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => 
        handleFieldChange(field.id, e.target.value),
      className: error ? 'border-red-500' : ''
    }

    switch (field.fieldType) {
      case 'TEXT':
        return (
          <Input
            type="text"
            placeholder={`Enter ${field.displayName.toLowerCase()}`}
            {...commonProps}
          />
        )
      
      case 'TEXTAREA':
        return (
          <WysiwygEditor
            value={value}
            onChange={handleWysiwygChange(field.id)}
            placeholder={`Enter ${field.displayName.toLowerCase()}`}
            className={error ? 'border-red-500' : ''}
            rows={4}
          />
        )
      
      case 'NUMBER':
        return (
          <Input
            type="number"
            step="any"
            placeholder={`Enter ${field.displayName.toLowerCase()}`}
            {...commonProps}
          />
        )
      
      case 'EMAIL':
        return (
          <Input
            type="email"
            placeholder={`Enter ${field.displayName.toLowerCase()}`}
            {...commonProps}
          />
        )
      
      case 'URL':
        return (
          <Input
            type="url"
            placeholder={`Enter ${field.displayName.toLowerCase()}`}
            {...commonProps}
          />
        )
      
      case 'DATE':
        return (
          <Input
            type="date"
            {...commonProps}
          />
        )
      
      case 'BOOLEAN':
        return (
          <div className="flex items-center space-x-2">
            <Switch
              id={field.id}
              checked={value === 'true'}
              onCheckedChange={(checked) => 
                handleFieldChange(field.id, checked ? 'true' : 'false')
              }
            />
            <Label htmlFor={field.id}>
              {value === 'true' ? 'Yes' : 'No'}
            </Label>
          </div>
        )
      
      case 'JSON':
        return (
          <Textarea
            rows={6}
            placeholder="Enter valid JSON"
            className={`font-mono ${error ? 'border-red-500' : ''}`}
            value={value}
            onChange={(e) => {
              handleFieldChange(field.id, e.target.value)
              // Validate JSON
              if (e.target.value) {
                try {
                  JSON.parse(e.target.value)
                  if (errors[field.id]) {
                    setErrors(prev => ({ ...prev, [field.id]: '' }))
                  }
                } catch {
                  setErrors(prev => ({ 
                    ...prev, 
                    [field.id]: 'Invalid JSON format' 
                  }))
                }
              }
            }}
          />
        )
      
      default:
        return (
          <Input
            type="text"
            placeholder={`Enter ${field.displayName.toLowerCase()}`}
            {...commonProps}
          />
        )
    }
  }

  return (
    <Card className="w-full max-w-2xl mx-auto">
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle>
          {entry ? `Edit ${contentType.displayName}` : `Create ${contentType.displayName}`}
        </CardTitle>
        <Button variant="ghost" size="sm" onClick={onCancel}>
          <X className="h-4 w-4" />
        </Button>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Slug field */}
          <div className="space-y-2">
            <Label htmlFor="slug">
              Slug
              <span className="text-xs text-muted-foreground ml-2">
                (optional, will be generated if empty)
              </span>
            </Label>
            <Input
              id="slug"
              type="text"
              placeholder="url-friendly-slug"
              value={slug}
              onChange={(e) => setSlug(e.target.value)}
            />
          </div>

          {/* Content Status and Workflow */}
          <div className="space-y-4 p-4 border rounded-lg bg-muted/20">
            <h3 className="text-sm font-medium">Publishing Options</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="status">Status</Label>
                <select
                  id="status"
                  value={status}
                  onChange={(e) => setStatus(e.target.value as ContentStatus)}
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  <option value="DRAFT">📝 Draft</option>
                  <option value="PUBLISHED">✅ Published</option>
                  <option value="SCHEDULED">⏰ Scheduled</option>
                  <option value="ARCHIVED">📦 Archived</option>
                </select>
              </div>

              {status === 'SCHEDULED' && (
                <div className="space-y-2">
                  <Label htmlFor="scheduledAt">
                    <Calendar className="w-4 h-4 inline mr-1" />
                    Scheduled Date & Time
                  </Label>
                  <Input
                    id="scheduledAt"
                    type="datetime-local"
                    value={scheduledAt}
                    onChange={(e) => setScheduledAt(e.target.value)}
                    min={new Date().toISOString().slice(0, 16)}
                  />
                  <p className="text-xs text-muted-foreground">
                    Content will be automatically published at the scheduled time
                  </p>
                </div>
              )}
              
              {status === 'PUBLISHED' && entry?.publishedAt && (
                <div className="space-y-2">
                  <Label>
                    <Clock className="w-4 h-4 inline mr-1" />
                    Published
                  </Label>
                  <p className="text-sm text-muted-foreground">
                    {entry.publishedAt.toLocaleString()}
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* Dynamic fields */}
          {contentType.fields
            .sort((a, b) => a.order - b.order)
            .map((field) => (
              <div key={field.id} className="space-y-2">
                <Label htmlFor={field.id}>
                  {field.displayName}
                  {field.required && <span className="text-red-500 ml-1">*</span>}
                </Label>
                {renderField(field)}
                {errors[field.id] && (
                  <p className="text-sm text-red-500">{errors[field.id]}</p>
                )}
                {field.fieldType === 'JSON' && !errors[field.id] && (
                  <p className="text-xs text-muted-foreground">
                    Enter valid JSON format, e.g., {`{"key": "value"}`}
                  </p>
                )}
              </div>
            ))}

          {/* Form actions */}
          <div className="flex justify-end space-x-4 pt-4">
            <Button type="button" variant="outline" onClick={onCancel}>
              Cancel
            </Button>
            <Button type="submit" disabled={isLoading}>
              <Save className="h-4 w-4 mr-2" />
              {isLoading ? 'Saving...' : 'Save Entry'}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  )
}