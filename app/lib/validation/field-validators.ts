/**
 * Field validation utilities and patterns
 * Provides comprehensive validation for all field types
 */

export interface ValidationOptions {
  minLength?: number
  maxLength?: number
  min?: number
  max?: number
  pattern?: string
  required?: boolean
  unique?: boolean
}

export interface ValidationResult {
  isValid: boolean
  message?: string
}

/**
 * Validates email format
 */
export function validateEmail(value: string): ValidationResult {
  if (!value) return { isValid: true }

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  const isValid = emailRegex.test(value)

  return {
    isValid,
    message: isValid ? undefined : 'Please enter a valid email address',
  }
}

/**
 * Validates URL format
 */
export function validateURL(value: string): ValidationResult {
  if (!value) return { isValid: true }

  try {
    const url = new URL(value)
    // Check for valid protocol
    const validProtocols = ['http:', 'https:', 'ftp:', 'ftps:']
    if (!validProtocols.includes(url.protocol)) {
      return {
        isValid: false,
        message: 'Please enter a valid URL',
      }
    }
    return { isValid: true }
  } catch {
    return {
      isValid: false,
      message: 'Please enter a valid URL',
    }
  }
}

/**
 * Validates phone number format
 */
export function validatePhone(value: string): ValidationResult {
  if (!value) return { isValid: true }

  // Allow various phone formats: +1234567890, (123) 456-7890, 123-456-7890, etc.
  const phoneRegex = /^[+]?[1-9][\d]{0,15}$|^[+]?[(]?[\d\s\-()]{10,}$/
  const cleanPhone = value.replace(/[\s\-()]/g, '')
  const isValid = phoneRegex.test(cleanPhone) && cleanPhone.length >= 10

  return {
    isValid,
    message: isValid ? undefined : 'Please enter a valid phone number',
  }
}

/**
 * Validates number with min/max constraints
 */
export function validateNumber(value: string, options: ValidationOptions = {}): ValidationResult {
  if (!value) return { isValid: true }

  const numValue = Number(value)

  if (isNaN(numValue)) {
    return {
      isValid: false,
      message: 'Please enter a valid number',
    }
  }

  if (options.min !== undefined && numValue < options.min) {
    return {
      isValid: false,
      message: `Value must be at least ${options.min}`,
    }
  }

  if (options.max !== undefined && numValue > options.max) {
    return {
      isValid: false,
      message: `Value must be at most ${options.max}`,
    }
  }

  return { isValid: true }
}

/**
 * Validates text length constraints
 */
export function validateText(value: string, options: ValidationOptions = {}): ValidationResult {
  if (!value && !options.required) return { isValid: true }

  if (options.required && !value.trim()) {
    return {
      isValid: false,
      message: 'This field is required',
    }
  }

  if (options.minLength !== undefined && value.length < options.minLength) {
    return {
      isValid: false,
      message: `Text must be at least ${options.minLength} characters long`,
    }
  }

  if (options.maxLength !== undefined && value.length > options.maxLength) {
    return {
      isValid: false,
      message: `Text must be at most ${options.maxLength} characters long`,
    }
  }

  if (options.pattern) {
    const regex = new RegExp(options.pattern)
    const isValid = regex.test(value)

    if (!isValid) {
      return {
        isValid: false,
        message: 'Text does not match the required pattern',
      }
    }
  }

  return { isValid: true }
}

/**
 * Validates color hex format
 */
export function validateColor(value: string): ValidationResult {
  if (!value) return { isValid: true }

  const colorRegex = /^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/
  const isValid = colorRegex.test(value)

  return {
    isValid,
    message: isValid ? undefined : 'Please enter a valid hex color (e.g., #FF0000)',
  }
}

/**
 * Validates slug format
 */
export function validateSlug(value: string): ValidationResult {
  if (!value) return { isValid: true }

  const slugRegex = /^[a-z0-9]+(?:-[a-z0-9]+)*$/
  const isValid = slugRegex.test(value)

  return {
    isValid,
    message: isValid ? undefined : 'Slug must contain only lowercase letters, numbers, and hyphens',
  }
}

/**
 * Validates password strength
 */
export function validatePassword(
  value: string
): ValidationResult & { strength: 'weak' | 'medium' | 'strong' } {
  if (!value) return { isValid: true, strength: 'weak' }

  let score = 0
  const checks = {
    length: value.length >= 8,
    lowercase: /[a-z]/.test(value),
    uppercase: /[A-Z]/.test(value),
    numbers: /\d/.test(value),
    symbols: /[^A-Za-z0-9]/.test(value),
  }

  Object.values(checks).forEach(check => {
    if (check) score++
  })

  let strength: 'weak' | 'medium' | 'strong' = 'weak'
  if (score >= 5) strength = 'strong'
  else if (score >= 3) strength = 'medium'

  const isValid = score >= 3

  return {
    isValid,
    strength,
    message: isValid
      ? undefined
      : 'Password must be at least 8 characters with uppercase, lowercase, and numbers',
  }
}

/**
 * Main validation function that routes to appropriate validator
 */
export function validateField(
  fieldType: string,
  value: string,
  options: ValidationOptions = {}
): ValidationResult {
  // Check required validation first
  if (options.required && !value.trim()) {
    return {
      isValid: false,
      message: 'This field is required',
    }
  }

  // Skip type validation if empty and not required
  if (!value && !options.required) {
    return { isValid: true }
  }

  switch (fieldType) {
    case 'EMAIL':
      return validateEmail(value)
    case 'URL':
      return validateURL(value)
    case 'PHONE':
      return validatePhone(value)
    case 'NUMBER':
      return validateNumber(value, options)
    case 'TEXT':
    case 'TEXTAREA':
      return validateText(value, options)
    case 'COLOR':
      return validateColor(value)
    case 'SLUG':
      return validateSlug(value)
    case 'PASSWORD':
      return validatePassword(value)
    default:
      return { isValid: true }
  }
}
