/**
 * Enhanced field renderer with validation, placeholders, and help text
 */

import { Input } from '../ui/input'
import { Textarea } from '../ui/textarea'
import { WysiwygEditor } from '../ui/wysiwyg-editor'
import { Label } from '../ui/label'
import { Switch } from '../ui/switch'
import { PhoneField } from '../ui/field-types/phone-field'
import { ColorField } from '../ui/field-types/color-field'
import { SlugField } from '../ui/field-types/slug-field'
import { PasswordField } from '../ui/field-types/password-field'
import { validateField, type ValidationOptions } from '~/lib/validation/field-validators'

export interface ContentField {
  id: string
  name: string
  displayName: string
  fieldType: string
  required: boolean
  unique: boolean
  defaultValue?: string
  placeholder?: string
  helpText?: string
  validation?: ValidationOptions
  options?: Record<string, unknown>
  relatedType?: string
  order: number
}

interface FieldRendererProps {
  field: ContentField
  value: string
  onChange: (value: string) => void
  error?: string
  className?: string
}

export function FieldRenderer({ 
  field, 
  value, 
  onChange, 
  error, 
  className = '' 
}: FieldRendererProps) {
  const commonProps = {
    id: field.id,
    value,
    onChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => 
      onChange(e.target.value),
    className: `${error ? 'border-red-500' : ''} ${className}`,
    placeholder: field.placeholder || `Enter ${field.displayName.toLowerCase()}`
  }

  const renderFieldInput = () => {
    switch (field.fieldType) {
      case 'TEXT':
        return (
          <Input
            type="text"
            {...commonProps}
          />
        )
      
      case 'TEXTAREA':
        return (
          <WysiwygEditor
            value={value}
            onChange={onChange}
            placeholder={field.placeholder || `Enter ${field.displayName.toLowerCase()}`}
            className={error ? 'border-red-500' : ''}
            rows={4}
          />
        )
      
      case 'NUMBER':
        return (
          <Input
            type="number"
            step="any"
            {...commonProps}
            min={field.validation?.min}
            max={field.validation?.max}
          />
        )
      
      case 'EMAIL':
        return (
          <Input
            type="email"
            {...commonProps}
          />
        )
      
      case 'URL':
        return (
          <Input
            type="url"
            {...commonProps}
          />
        )
      
      case 'DATE':
        return (
          <Input
            type="date"
            id={field.id}
            value={value}
            onChange={(e) => onChange(e.target.value)}
            className={error ? 'border-red-500' : ''}
          />
        )
      
      case 'BOOLEAN':
        return (
          <div className="flex items-center space-x-2">
            <Switch
              id={field.id}
              checked={value === 'true'}
              onCheckedChange={(checked) => onChange(checked ? 'true' : 'false')}
            />
            <Label htmlFor={field.id}>
              {value === 'true' ? 'Yes' : 'No'}
            </Label>
          </div>
        )
      
      case 'PHONE':
        return (
          <PhoneField
            value={value}
            onChange={onChange}
            placeholder={field.placeholder}
            error={error}
          />
        )
      
      case 'COLOR':
        return (
          <ColorField
            value={value}
            onChange={onChange}
            error={error}
          />
        )
      
      case 'SLUG':
        return (
          <SlugField
            value={value}
            onChange={onChange}
            placeholder={field.placeholder}
            error={error}
            sourceText={field.options?.sourceField ? '' : undefined}
          />
        )
      
      case 'PASSWORD':
        return (
          <PasswordField
            value={value}
            onChange={onChange}
            placeholder={field.placeholder}
            error={error}
          />
        )
      
      case 'JSON':
        return (
          <Textarea
            rows={6}
            placeholder={field.placeholder || "Enter valid JSON"}
            className={`font-mono ${error ? 'border-red-500' : ''}`}
            value={value}
            onChange={(e) => {
              onChange(e.target.value)
            }}
          />
        )
      
      default:
        return (
          <Input
            type="text"
            {...commonProps}
          />
        )
    }
  }

  return (
    <div className="space-y-2">
      <Label htmlFor={field.id}>
        {field.displayName}
        {field.required && <span className="text-red-500 ml-1">*</span>}
      </Label>
      
      {renderFieldInput()}
      
      {/* Help text */}
      {field.helpText && (
        <p className="text-xs text-muted-foreground">
          {field.helpText}
        </p>
      )}
      
      {/* Error message */}
      {error && (
        <p className="text-sm text-red-500">{error}</p>
      )}
      
      {/* Special help text for certain field types */}
      {field.fieldType === 'JSON' && !error && (
        <p className="text-xs text-muted-foreground">
          Enter valid JSON format, e.g., {`{"key": "value"}`}
        </p>
      )}
      
      {field.fieldType === 'SLUG' && !error && (
        <p className="text-xs text-muted-foreground">
          Use lowercase letters, numbers, and hyphens only
        </p>
      )}
    </div>
  )
}

/**
 * Validates a field value using the enhanced validation system
 */
export function validateFieldValue(field: ContentField, value: string) {
  const validationOptions = {
    required: field.required,
    unique: field.unique,
    ...field.validation
  }
  
  return validateField(field.fieldType, value, validationOptions)
}