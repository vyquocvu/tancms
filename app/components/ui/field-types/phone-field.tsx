/**
 * Phone field component with format validation
 */

import { useState } from 'react'
import { Input } from '../input'
import { validatePhone } from '~/lib/validation/field-validators'

interface PhoneFieldProps {
  value: string
  onChange: (value: string) => void
  placeholder?: string
  error?: string
  className?: string
}

export function PhoneField({
  value,
  onChange,
  placeholder = 'Enter phone number',
  error,
  className = '',
}: PhoneFieldProps) {
  const [localError, setLocalError] = useState<string>()

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value
    onChange(newValue)

    // Clear local error when user starts typing
    if (localError) {
      setLocalError(undefined)
    }
  }

  const handleBlur = () => {
    if (value) {
      const validation = validatePhone(value)
      if (!validation.isValid) {
        setLocalError(validation.message)
      } else {
        setLocalError(undefined)
      }
    }
  }

  const displayError = error || localError

  return (
    <div className='space-y-1'>
      <Input
        type='tel'
        value={value}
        onChange={handleChange}
        onBlur={handleBlur}
        placeholder={placeholder}
        className={`${displayError ? 'border-red-500' : ''} ${className}`}
      />
      {displayError && <p className='text-sm text-red-500'>{displayError}</p>}
      <p className='text-xs text-muted-foreground'>
        Examples: +1 (555) 123-4567, 555-123-4567, +33 1 42 86 83 26
      </p>
    </div>
  )
}
