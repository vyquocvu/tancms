/**
 * Password field component with strength meter
 */

import { useState } from 'react'
import { Input } from '../input'
import { Button } from '../button'
import { Eye, EyeOff, Shield, ShieldCheck, ShieldAlert } from 'lucide-react'
import { validatePassword } from '~/lib/validation/field-validators'

interface PasswordFieldProps {
  value: string
  onChange: (value: string) => void
  placeholder?: string
  error?: string
  className?: string
}

export function PasswordField({ 
  value, 
  onChange, 
  placeholder = "Enter password", 
  error,
  className = '' 
}: PasswordFieldProps) {
  const [showPassword, setShowPassword] = useState(false)
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
      const validation = validatePassword(value)
      if (!validation.isValid) {
        setLocalError(validation.message)
      } else {
        setLocalError(undefined)
      }
    }
  }

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword)
  }

  // Get password strength
  const strengthInfo = validatePassword(value)
  const strength = strengthInfo.strength
  const displayError = error || localError

  const getStrengthColor = () => {
    switch (strength) {
      case 'strong': return 'text-green-600'
      case 'medium': return 'text-yellow-600'
      case 'weak': return 'text-red-600'
      default: return 'text-gray-400'
    }
  }

  const getStrengthIcon = () => {
    switch (strength) {
      case 'strong': return <ShieldCheck className="h-4 w-4" />
      case 'medium': return <Shield className="h-4 w-4" />
      case 'weak': return <ShieldAlert className="h-4 w-4" />
      default: return <Shield className="h-4 w-4" />
    }
  }

  const getStrengthWidth = () => {
    switch (strength) {
      case 'strong': return 'w-full'
      case 'medium': return 'w-2/3'
      case 'weak': return 'w-1/3'
      default: return 'w-0'
    }
  }

  return (
    <div className="space-y-2">
      <div className="relative">
        <Input
          type={showPassword ? "text" : "password"}
          value={value}
          onChange={handleChange}
          onBlur={handleBlur}
          placeholder={placeholder}
          className={`${displayError ? 'border-red-500' : ''} ${className} pr-10`}
        />
        <Button
          type="button"
          variant="ghost"
          size="sm"
          className="absolute right-1 top-1/2 transform -translate-y-1/2 h-8 w-8 p-0"
          onClick={togglePasswordVisibility}
        >
          {showPassword ? (
            <EyeOff className="h-4 w-4" />
          ) : (
            <Eye className="h-4 w-4" />
          )}
        </Button>
      </div>

      {/* Password strength indicator */}
      {value && (
        <div className="space-y-1">
          <div className="flex items-center space-x-2">
            <span className={`flex items-center space-x-1 text-sm ${getStrengthColor()}`}>
              {getStrengthIcon()}
              <span className="capitalize">{strength} password</span>
            </span>
          </div>
          
          {/* Strength bar */}
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div 
              className={`h-2 rounded-full transition-all duration-300 ${getStrengthWidth()} ${
                strength === 'strong' ? 'bg-green-500' :
                strength === 'medium' ? 'bg-yellow-500' :
                'bg-red-500'
              }`}
            />
          </div>
        </div>
      )}

      {displayError && (
        <p className="text-sm text-red-500">{displayError}</p>
      )}
      
      <div className="text-xs text-muted-foreground space-y-1">
        <p>Password must include:</p>
        <ul className="list-disc list-inside space-y-0.5 ml-2">
          <li className={value.length >= 8 ? 'text-green-600' : ''}>
            At least 8 characters
          </li>
          <li className={/[a-z]/.test(value) ? 'text-green-600' : ''}>
            Lowercase letter
          </li>
          <li className={/[A-Z]/.test(value) ? 'text-green-600' : ''}>
            Uppercase letter
          </li>
          <li className={/\d/.test(value) ? 'text-green-600' : ''}>
            Number
          </li>
          <li className={/[^A-Za-z0-9]/.test(value) ? 'text-green-600' : ''}>
            Special character (optional but recommended)
          </li>
        </ul>
      </div>
    </div>
  )
}