import { useState, useEffect } from 'react'
import AdminLayout from '../layout'
import { Card, CardContent, CardHeader, CardTitle } from '~/components/ui/card'
import { Button } from '~/components/ui/button'
import { Input } from '~/components/ui/input'
import { Badge } from '~/components/ui/badge'
import { 
  Plus, 
  Trash2, 
  GripVertical, 
  Type, 
  Hash, 
  Calendar, 
  ToggleLeft, 
  AtSign, 
  Link, 
  FileText, 
  Image,
  Database,
  Save,
  ArrowLeft,
  Settings
} from 'lucide-react'
import { mockApi } from '~/lib/mock-api'

const FIELD_TYPES = [
  { value: 'TEXT', label: 'Text', icon: Type, description: 'Short text input' },
  { value: 'TEXTAREA', label: 'Long Text', icon: FileText, description: 'Multi-line text area' },
  { value: 'NUMBER', label: 'Number', icon: Hash, description: 'Numeric input' },
  { value: 'BOOLEAN', label: 'Boolean', icon: ToggleLeft, description: 'True/false toggle' },
  { value: 'DATE', label: 'Date', icon: Calendar, description: 'Date picker' },
  { value: 'EMAIL', label: 'Email', icon: AtSign, description: 'Email address input' },
  { value: 'URL', label: 'URL', icon: Link, description: 'Web URL input' },
  { value: 'PHONE', label: 'Phone', icon: AtSign, description: 'Phone number with validation' },
  { value: 'COLOR', label: 'Color', icon: AtSign, description: 'Color picker with hex input' },
  { value: 'SLUG', label: 'Slug', icon: Link, description: 'URL-friendly identifier' },
  { value: 'PASSWORD', label: 'Password', icon: AtSign, description: 'Password with strength meter' },
  { value: 'JSON', label: 'JSON', icon: Database, description: 'JSON data object' },
  { value: 'MEDIA', label: 'Media', icon: Image, description: 'File/image upload' },
  { value: 'RELATION', label: 'Relation', icon: Database, description: 'Link to other content' }
]

interface ContentField {
  id: string
  name: string
  displayName: string
  fieldType: string
  required: boolean
  unique: boolean
  defaultValue?: string
  placeholder?: string
  helpText?: string
  validation?: {
    minLength?: number
    maxLength?: number
    min?: number
    max?: number
    pattern?: string
  }
  options?: Record<string, unknown>
  relatedType?: string
  order: number
}

interface ContentType {
  id?: string
  name: string
  displayName: string
  description?: string
  slug?: string
  fields: ContentField[]
}

function FieldTypeSelector({ value, onChange }: {
  value: string
  onChange: (value: string) => void
}) {
  const [isOpen, setIsOpen] = useState(false)
  const selectedType = FIELD_TYPES.find(type => type.value === value)

  return (
    <div className="relative">
      <Button
        variant="outline"
        onClick={() => setIsOpen(!isOpen)}
        className="w-full justify-between"
      >
        <div className="flex items-center">
          {selectedType && <selectedType.icon className="h-4 w-4 mr-2" />}
          {selectedType?.label || 'Select field type'}
        </div>
      </Button>
      
      {isOpen && (
        <div className="absolute top-full left-0 right-0 mt-1 bg-background border rounded-lg shadow-lg z-50 max-h-64 overflow-y-auto">
          {FIELD_TYPES.map((type) => (
            <button
              key={type.value}
              className="w-full px-3 py-2 text-left hover:bg-accent hover:text-accent-foreground flex items-start"
              onClick={() => {
                onChange(type.value)
                setIsOpen(false)
              }}
            >
              <type.icon className="h-4 w-4 mt-0.5 mr-3 flex-shrink-0" />
              <div>
                <div className="font-medium">{type.label}</div>
                <div className="text-xs text-muted-foreground">{type.description}</div>
              </div>
            </button>
          ))}
        </div>
      )}
    </div>
  )
}

function FieldEditor({ field, onChange, onDelete }: {
  field: ContentField
  onChange: (updates: Partial<ContentField>) => void
  onDelete: () => void
}) {
  const fieldType = FIELD_TYPES.find(type => type.value === field.fieldType)

  return (
    <Card className="mb-4">
      <CardHeader className="pb-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center">
            <GripVertical className="h-5 w-5 text-muted-foreground mr-2 cursor-move" />
            <div className="flex items-center">
              {fieldType && <fieldType.icon className="h-4 w-4 mr-2 text-blue-600" />}
              <div>
                <h4 className="font-medium">{field.displayName || field.name}</h4>
                <p className="text-xs text-muted-foreground">{fieldType?.label}</p>
              </div>
            </div>
          </div>
          <div className="flex items-center space-x-2">
            {field.required && <Badge variant="secondary" className="text-xs">Required</Badge>}
            {field.unique && <Badge variant="outline" className="text-xs">Unique</Badge>}
            <Button
              size="sm"
              variant="destructive"
              onClick={onDelete}
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent className="pt-0">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="text-sm font-medium mb-1 block">Field Name</label>
            <Input
              value={field.name}
              onChange={(e) => onChange({ name: e.target.value })}
              placeholder="field_name"
            />
          </div>
          <div>
            <label className="text-sm font-medium mb-1 block">Display Name</label>
            <Input
              value={field.displayName}
              onChange={(e) => onChange({ displayName: e.target.value })}
              placeholder="Field Display Name"
            />
          </div>
        </div>
        
        <div className="mt-4">
          <label className="text-sm font-medium mb-1 block">Field Type</label>
          <FieldTypeSelector
            value={field.fieldType}
            onChange={(fieldType) => onChange({ fieldType })}
          />
        </div>

        <div className="mt-4 grid grid-cols-2 gap-4">
          <div>
            <label className="flex items-center space-x-2">
              <input
                type="checkbox"
                checked={field.required}
                onChange={(e) => onChange({ required: e.target.checked })}
                className="rounded"
              />
              <span className="text-sm">Required</span>
            </label>
          </div>
          <div>
            <label className="flex items-center space-x-2">
              <input
                type="checkbox"
                checked={field.unique}
                onChange={(e) => onChange({ unique: e.target.checked })}
                className="rounded"
              />
              <span className="text-sm">Unique</span>
            </label>
          </div>
        </div>

        {(field.fieldType === 'TEXT' || field.fieldType === 'TEXTAREA' || field.fieldType === 'NUMBER' || 
          field.fieldType === 'EMAIL' || field.fieldType === 'URL' || field.fieldType === 'PHONE' || 
          field.fieldType === 'COLOR' || field.fieldType === 'SLUG' || field.fieldType === 'PASSWORD') && (
          <div className="mt-4">
            <label className="text-sm font-medium mb-1 block">Default Value</label>
            <Input
              value={field.defaultValue || ''}
              onChange={(e) => onChange({ defaultValue: e.target.value })}
              placeholder="Default value"
            />
          </div>
        )}

        {/* Enhanced field options */}
        <div className="mt-4 space-y-4">
          <div>
            <label className="text-sm font-medium mb-1 block">Placeholder Text</label>
            <Input
              value={field.placeholder || ''}
              onChange={(e) => onChange({ placeholder: e.target.value })}
              placeholder="Enter placeholder text..."
            />
          </div>
          
          <div>
            <label className="text-sm font-medium mb-1 block">Help Text</label>
            <Input
              value={field.helpText || ''}
              onChange={(e) => onChange({ helpText: e.target.value })}
              placeholder="Helpful description for users..."
            />
          </div>
        </div>

        {/* Validation options */}
        {(field.fieldType === 'TEXT' || field.fieldType === 'TEXTAREA') && (
          <div className="mt-4 space-y-4 p-4 border rounded-lg bg-muted/20">
            <h4 className="text-sm font-medium">Text Validation</h4>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium mb-1 block">Min Length</label>
                <Input
                  type="number"
                  min="0"
                  value={field.validation?.minLength || ''}
                  onChange={(e) => onChange({ 
                    validation: { ...field.validation, minLength: e.target.value ? parseInt(e.target.value) : undefined }
                  })}
                  placeholder="0"
                />
              </div>
              <div>
                <label className="text-sm font-medium mb-1 block">Max Length</label>
                <Input
                  type="number"
                  min="1"
                  value={field.validation?.maxLength || ''}
                  onChange={(e) => onChange({ 
                    validation: { ...field.validation, maxLength: e.target.value ? parseInt(e.target.value) : undefined }
                  })}
                  placeholder="255"
                />
              </div>
            </div>
          </div>
        )}

        {field.fieldType === 'NUMBER' && (
          <div className="mt-4 space-y-4 p-4 border rounded-lg bg-muted/20">
            <h4 className="text-sm font-medium">Number Validation</h4>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium mb-1 block">Minimum Value</label>
                <Input
                  type="number"
                  value={field.validation?.min || ''}
                  onChange={(e) => onChange({ 
                    validation: { ...field.validation, min: e.target.value ? parseFloat(e.target.value) : undefined }
                  })}
                  placeholder="0"
                />
              </div>
              <div>
                <label className="text-sm font-medium mb-1 block">Maximum Value</label>
                <Input
                  type="number"
                  value={field.validation?.max || ''}
                  onChange={(e) => onChange({ 
                    validation: { ...field.validation, max: e.target.value ? parseFloat(e.target.value) : undefined }
                  })}
                  placeholder="100"
                />
              </div>
            </div>
          </div>
        )}

        {field.fieldType === 'RELATION' && (
          <div className="mt-4">
            <label className="text-sm font-medium mb-1 block">Related Content Type</label>
            <Input
              value={field.relatedType || ''}
              onChange={(e) => onChange({ relatedType: e.target.value })}
              placeholder="content-type-slug"
            />
          </div>
        )}
      </CardContent>
    </Card>
  )
}

export default function ContentTypeBuilder() {
  // Get ID from URL params if editing
  const urlParams = new URLSearchParams(window.location.hash.split('?')[1] || '')
  const editingId = urlParams.get('id')
  const isEditing = !!editingId
  
  const [contentType, setContentType] = useState<ContentType>({
    name: '',
    displayName: '',
    description: '',
    fields: []
  })
  
  const [isSaving, setIsSaving] = useState(false)
  const [loading, setLoading] = useState(isEditing)

  // Load existing content type if editing
  useEffect(() => {
    if (isEditing && editingId) {
      loadContentType(editingId)
    }
  }, [isEditing, editingId])

  const loadContentType = async (id: string) => {
    setLoading(true)
    try {
      const existing = await mockApi.getContentType(id)
      if (existing) {
        setContentType({
          id: existing.id,
          name: existing.name,
          displayName: existing.displayName,
          description: existing.description,
          fields: existing.fields.map(field => ({
            id: field.id,
            name: field.name,
            displayName: field.displayName,
            fieldType: field.fieldType,
            required: field.required,
            unique: field.unique,
            defaultValue: field.defaultValue,
            options: field.options,
            relatedType: field.relatedType,
            order: field.order
          }))
        })
      }
    } catch (error) {
      console.error('Failed to load content type:', error)
      alert('Failed to load content type')
    } finally {
      setLoading(false)
    }
  }

  const handleContentTypeChange = (updates: Partial<ContentType>) => {
    setContentType(prev => ({ ...prev, ...updates }))
  }

  const addField = () => {
    const newField: ContentField = {
      id: `field_${Date.now()}`,
      name: '',
      displayName: '',
      fieldType: 'TEXT',
      required: false,
      unique: false,
      order: contentType.fields.length
    }
    
    setContentType(prev => ({
      ...prev,
      fields: [...prev.fields, newField]
    }))
  }

  const updateField = (fieldId: string, updates: Partial<ContentField>) => {
    setContentType(prev => ({
      ...prev,
      fields: prev.fields.map(field =>
        field.id === fieldId ? { ...field, ...updates } : field
      )
    }))
  }

  const deleteField = (fieldId: string) => {
    setContentType(prev => ({
      ...prev,
      fields: prev.fields.filter(field => field.id !== fieldId)
    }))
  }

  const handleSave = async () => {
    setIsSaving(true)
    try {
      if (isEditing && contentType.id) {
        // Update existing content type
        await mockApi.updateContentType(contentType.id, {
          name: contentType.name,
          displayName: contentType.displayName,
          description: contentType.description,
          fields: contentType.fields.map(field => ({
            id: field.id,
            name: field.name,
            displayName: field.displayName,
            fieldType: field.fieldType,
            required: field.required,
            unique: field.unique,
            defaultValue: field.defaultValue,
            options: field.options,
            relatedType: field.relatedType,
            order: field.order
          }))
        })
        alert('Content type updated successfully!')
      } else {
        // Create new content type
        await mockApi.createContentType({
          name: contentType.name,
          displayName: contentType.displayName,
          description: contentType.description,
          fields: contentType.fields.map(field => ({
            name: field.name,
            displayName: field.displayName,
            fieldType: field.fieldType,
            required: field.required,
            unique: field.unique,
            defaultValue: field.defaultValue,
            options: field.options,
            relatedType: field.relatedType,
            order: field.order
          }))
        })
        alert('Content type created successfully!')
      }
      
      // Navigate back to content types list
      window.location.hash = '#/admin/content-types'
    } catch (error) {
      console.error('Error saving content type:', error)
      alert('Failed to save content type')
    } finally {
      setIsSaving(false)
    }
  }

  const canSave = contentType.name && contentType.displayName && contentType.fields.length > 0

  const handleBack = () => {
    window.location.hash = '#/admin/content-types'
  }

  if (loading) {
    return (
      <AdminLayout>
        <div className="flex items-center justify-center h-64">
          <div className="text-lg">Loading content type...</div>
        </div>
      </AdminLayout>
    )
  }

  return (
    <AdminLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <Button variant="outline" size="sm" onClick={handleBack}>
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Content Types
            </Button>
            <div>
              <h1 className="text-3xl font-bold">
                {isEditing ? 'Edit Content Type' : 'Create Content Type'}
              </h1>
              <p className="text-muted-foreground">
                {isEditing ? 'Modify your content type structure' : 'Design your custom content structure'}
              </p>
            </div>
          </div>
          <Button 
            onClick={handleSave} 
            disabled={!canSave || isSaving}
          >
            <Save className="h-4 w-4 mr-2" />
            {isSaving ? 'Saving...' : 'Save Content Type'}
          </Button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Content Type Settings */}
          <div className="lg:col-span-1">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Settings className="h-5 w-5 mr-2" />
                  Content Type Settings
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <label className="text-sm font-medium mb-1 block">Name</label>
                  <Input
                    value={contentType.name}
                    onChange={(e) => handleContentTypeChange({ name: e.target.value })}
                    placeholder="product"
                  />
                  <p className="text-xs text-muted-foreground mt-1">
                    Used for API endpoints and database tables
                  </p>
                </div>
                
                <div>
                  <label className="text-sm font-medium mb-1 block">Display Name</label>
                  <Input
                    value={contentType.displayName}
                    onChange={(e) => handleContentTypeChange({ displayName: e.target.value })}
                    placeholder="Product"
                  />
                  <p className="text-xs text-muted-foreground mt-1">
                    Human-readable name shown in the admin interface
                  </p>
                </div>

                <div>
                  <label className="text-sm font-medium mb-1 block">Description</label>
                  <textarea
                    className="w-full px-3 py-2 border rounded-md resize-none"
                    rows={3}
                    value={contentType.description || ''}
                    onChange={(e) => handleContentTypeChange({ description: e.target.value })}
                    placeholder="Describe what this content type is for..."
                  />
                </div>

                {contentType.name && (
                  <div className="p-3 bg-muted rounded-lg">
                    <p className="text-sm font-medium mb-1">Generated API Endpoints</p>
                    <div className="space-y-1 text-xs text-muted-foreground font-mono">
                      <div>GET /api/{contentType.name}</div>
                      <div>POST /api/{contentType.name}</div>
                      <div>PUT /api/{contentType.name}/:id</div>
                      <div>DELETE /api/{contentType.name}/:id</div>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Fields Editor */}
          <div className="lg:col-span-2">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="flex items-center">
                    <Database className="h-5 w-5 mr-2" />
                    Fields ({contentType.fields.length})
                  </CardTitle>
                  <Button onClick={addField}>
                    <Plus className="h-4 w-4 mr-2" />
                    Add Field
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                {contentType.fields.length === 0 ? (
                  <div className="text-center py-12">
                    <Database className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                    <h3 className="text-lg font-semibold mb-2">No fields defined</h3>
                    <p className="text-muted-foreground mb-4">
                      Add fields to define the structure of your content type
                    </p>
                    <Button onClick={addField}>
                      <Plus className="h-4 w-4 mr-2" />
                      Add Your First Field
                    </Button>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {contentType.fields.map((field) => (
                      <FieldEditor
                        key={field.id}
                        field={field}
                        onChange={(updates) => updateField(field.id, updates)}
                        onDelete={() => deleteField(field.id)}
                      />
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </AdminLayout>
  )
}