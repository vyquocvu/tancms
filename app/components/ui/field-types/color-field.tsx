/**
 * Color field component with color picker
 */

import { useState } from 'react'
import { Input } from '../input'
import { Button } from '../button'
import { Palette } from 'lucide-react'
import { validateColor } from '~/lib/validation/field-validators'

interface ColorFieldProps {
  value: string
  onChange: (value: string) => void
  error?: string
  className?: string
}

export function ColorField({ 
  value, 
  onChange, 
  error,
  className = '' 
}: ColorFieldProps) {
  const [localError, setLocalError] = useState<string>()
  const [showPicker, setShowPicker] = useState(false)

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value
    onChange(newValue)
    
    // Clear local error when user starts typing
    if (localError) {
      setLocalError(undefined)
    }
  }

  const handleColorPickerChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    onChange(e.target.value)
    setLocalError(undefined)
  }

  const handleBlur = () => {
    if (value) {
      const validation = validateColor(value)
      if (!validation.isValid) {
        setLocalError(validation.message)
      } else {
        setLocalError(undefined)
      }
    }
  }

  const displayError = error || localError
  const colorValue = value || '#000000'

  return (
    <div className="space-y-2">
      <div className="flex items-center space-x-2">
        <div className="flex-1 relative">
          <Input
            type="text"
            value={value}
            onChange={handleInputChange}
            onBlur={handleBlur}
            placeholder="#FF0000"
            className={`${displayError ? 'border-red-500' : ''} ${className} pr-12`}
          />
          <div 
            className="absolute right-2 top-1/2 transform -translate-y-1/2 w-6 h-6 rounded border border-gray-300 cursor-pointer"
            style={{ backgroundColor: value || '#ffffff' }}
            onClick={() => setShowPicker(!showPicker)}
          />
        </div>
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={() => setShowPicker(!showPicker)}
        >
          <Palette className="h-4 w-4" />
        </Button>
      </div>

      {showPicker && (
        <div className="relative">
          <input
            type="color"
            value={colorValue}
            onChange={handleColorPickerChange}
            className="w-full h-10 rounded border border-gray-300 cursor-pointer"
          />
        </div>
      )}

      {displayError && (
        <p className="text-sm text-red-500">{displayError}</p>
      )}
      
      <p className="text-xs text-muted-foreground">
        Enter a hex color code (e.g., #FF0000) or use the color picker
      </p>
    </div>
  )
}