/**
 * Slug field component with auto-generation
 */

import { useState, useEffect } from 'react'
import { Input } from '../input'
import { Button } from '../button'
import { RefreshCw } from 'lucide-react'
import { validateSlug } from '~/lib/validation/field-validators'
import { generateSlug } from '~/lib/utils'

interface SlugFieldProps {
  value: string
  onChange: (value: string) => void
  placeholder?: string
  error?: string
  sourceText?: string
  className?: string
}

export function SlugField({
  value,
  onChange,
  placeholder = 'url-friendly-slug',
  error,
  sourceText,
  className = '',
}: SlugFieldProps) {
  const [localError, setLocalError] = useState<string>()
  const [isAutoGenerating, setIsAutoGenerating] = useState(!value)

  // Auto-generate slug from source text (like title)
  useEffect(() => {
    if (isAutoGenerating && sourceText) {
      const generated = generateSlug(sourceText)
      if (generated !== value) {
        onChange(generated)
      }
    }
  }, [sourceText, isAutoGenerating, value, onChange])

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value
    onChange(newValue)

    // Disable auto-generation when user manually edits
    if (newValue !== '' && isAutoGenerating) {
      setIsAutoGenerating(false)
    }

    // Clear local error when user starts typing
    if (localError) {
      setLocalError(undefined)
    }
  }

  const handleBlur = () => {
    if (value) {
      const validation = validateSlug(value)
      if (!validation.isValid) {
        setLocalError(validation.message)
      } else {
        setLocalError(undefined)
      }
    }
  }

  const handleAutoGenerate = () => {
    if (sourceText) {
      const generated = generateSlug(sourceText)
      onChange(generated)
      setIsAutoGenerating(false)
    }
  }

  const displayError = error || localError

  return (
    <div className='space-y-2'>
      <div className='flex items-center space-x-2'>
        <div className='flex-1'>
          <Input
            type='text'
            value={value}
            onChange={handleChange}
            onBlur={handleBlur}
            placeholder={placeholder}
            className={`${displayError ? 'border-red-500' : ''} ${className}`}
          />
        </div>

        {sourceText && (
          <Button
            type='button'
            variant='outline'
            size='sm'
            onClick={handleAutoGenerate}
            title='Generate slug from title'
          >
            <RefreshCw className='h-4 w-4' />
          </Button>
        )}
      </div>

      {isAutoGenerating && sourceText && (
        <p className='text-xs text-blue-600'>Auto-generating from source text</p>
      )}

      {displayError && <p className='text-sm text-red-500'>{displayError}</p>}

      <p className='text-xs text-muted-foreground'>
        URL-friendly identifier using lowercase letters, numbers, and hyphens
      </p>
    </div>
  )
}
