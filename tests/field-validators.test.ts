import { describe, it, expect } from 'vitest'
import {
  validateEmail,
  validateURL,
  validatePhone,
  validateNumber,
  validateText,
  validateColor,
  validateSlug,
  validatePassword,
  validateField,
} from '../app/lib/validation/field-validators'

describe('Field Validators', () => {
  describe('validateEmail', () => {
    it('should validate correct email addresses', () => {
      expect(validateEmail('test@example.com')).toEqual({ isValid: true })
      expect(validateEmail('user.name+tag@domain.co.uk')).toEqual({ isValid: true })
    })

    it('should reject invalid email addresses', () => {
      expect(validateEmail('invalid-email')).toEqual({
        isValid: false,
        message: 'Please enter a valid email address',
      })
      expect(validateEmail('test@')).toEqual({
        isValid: false,
        message: 'Please enter a valid email address',
      })
    })

    it('should allow empty values', () => {
      expect(validateEmail('')).toEqual({ isValid: true })
    })
  })

  describe('validateURL', () => {
    it('should validate correct URLs', () => {
      expect(validateURL('https://example.com')).toEqual({ isValid: true })
      expect(validateURL('http://localhost:3000')).toEqual({ isValid: true })
      expect(validateURL('ftp://files.example.com')).toEqual({ isValid: true })
    })

    it('should reject invalid URLs', () => {
      expect(validateURL('not-a-url')).toEqual({
        isValid: false,
        message: 'Please enter a valid URL',
      })
      expect(validateURL('://invalid')).toEqual({
        isValid: false,
        message: 'Please enter a valid URL',
      })
    })

    it('should allow empty values', () => {
      expect(validateURL('')).toEqual({ isValid: true })
    })
  })

  describe('validatePhone', () => {
    it('should validate correct phone numbers', () => {
      expect(validatePhone('+1234567890')).toEqual({ isValid: true })
      expect(validatePhone('(555) 123-4567')).toEqual({ isValid: true })
      expect(validatePhone('555-123-4567')).toEqual({ isValid: true })
    })

    it('should reject invalid phone numbers', () => {
      expect(validatePhone('123')).toEqual({
        isValid: false,
        message: 'Please enter a valid phone number',
      })
      expect(validatePhone('abc-def-ghij')).toEqual({
        isValid: false,
        message: 'Please enter a valid phone number',
      })
    })

    it('should allow empty values', () => {
      expect(validatePhone('')).toEqual({ isValid: true })
    })
  })

  describe('validateNumber', () => {
    it('should validate numbers within range', () => {
      expect(validateNumber('42')).toEqual({ isValid: true })
      expect(validateNumber('3.14', { min: 0, max: 10 })).toEqual({ isValid: true })
    })

    it('should reject numbers outside range', () => {
      expect(validateNumber('150', { min: 0, max: 100 })).toEqual({
        isValid: false,
        message: 'Value must be at most 100',
      })
      expect(validateNumber('-5', { min: 0 })).toEqual({
        isValid: false,
        message: 'Value must be at least 0',
      })
    })

    it('should reject non-numeric values', () => {
      expect(validateNumber('not-a-number')).toEqual({
        isValid: false,
        message: 'Please enter a valid number',
      })
    })

    it('should allow empty values', () => {
      expect(validateNumber('')).toEqual({ isValid: true })
    })
  })

  describe('validateText', () => {
    it('should validate text within length constraints', () => {
      expect(validateText('Hello', { minLength: 2, maxLength: 10 })).toEqual({ isValid: true })
    })

    it('should reject text outside length constraints', () => {
      expect(validateText('Hi', { minLength: 5 })).toEqual({
        isValid: false,
        message: 'Text must be at least 5 characters long',
      })
      expect(validateText('This is too long', { maxLength: 10 })).toEqual({
        isValid: false,
        message: 'Text must be at most 10 characters long',
      })
    })

    it('should validate pattern matching', () => {
      expect(validateText('abc123', { pattern: '^[a-z0-9]+$' })).toEqual({ isValid: true })
      expect(validateText('ABC123', { pattern: '^[a-z0-9]+$' })).toEqual({
        isValid: false,
        message: 'Text does not match the required pattern',
      })
    })

    it('should handle required validation', () => {
      expect(validateText('', { required: true })).toEqual({
        isValid: false,
        message: 'This field is required',
      })
      expect(validateText('   ', { required: true })).toEqual({
        isValid: false,
        message: 'This field is required',
      })
    })
  })

  describe('validateColor', () => {
    it('should validate hex colors', () => {
      expect(validateColor('#FF0000')).toEqual({ isValid: true })
      expect(validateColor('#fff')).toEqual({ isValid: true })
      expect(validateColor('#123ABC')).toEqual({ isValid: true })
    })

    it('should reject invalid color formats', () => {
      expect(validateColor('red')).toEqual({
        isValid: false,
        message: 'Please enter a valid hex color (e.g., #FF0000)',
      })
      expect(validateColor('FF0000')).toEqual({
        isValid: false,
        message: 'Please enter a valid hex color (e.g., #FF0000)',
      })
    })

    it('should allow empty values', () => {
      expect(validateColor('')).toEqual({ isValid: true })
    })
  })

  describe('validateSlug', () => {
    it('should validate proper slugs', () => {
      expect(validateSlug('hello-world')).toEqual({ isValid: true })
      expect(validateSlug('my-blog-post-123')).toEqual({ isValid: true })
    })

    it('should reject invalid slug formats', () => {
      expect(validateSlug('Hello World')).toEqual({
        isValid: false,
        message: 'Slug must contain only lowercase letters, numbers, and hyphens',
      })
      expect(validateSlug('hello_world')).toEqual({
        isValid: false,
        message: 'Slug must contain only lowercase letters, numbers, and hyphens',
      })
    })

    it('should allow empty values', () => {
      expect(validateSlug('')).toEqual({ isValid: true })
    })
  })

  describe('validatePassword', () => {
    it('should validate strong passwords', () => {
      const result = validatePassword('StrongPass123!')
      expect(result.isValid).toBe(true)
      expect(result.strength).toBe('strong')
    })

    it('should handle medium strength passwords', () => {
      const result = validatePassword('GoodPass123')
      expect(result.isValid).toBe(true)
      expect(result.strength).toBe('medium')
    })

    it('should reject weak passwords', () => {
      const result = validatePassword('weak')
      expect(result.isValid).toBe(false)
      expect(result.strength).toBe('weak')
      expect(result.message).toBeDefined()
    })

    it('should allow empty values', () => {
      const result = validatePassword('')
      expect(result.isValid).toBe(true)
      expect(result.strength).toBe('weak')
    })
  })

  describe('validateField', () => {
    it('should route to correct validator based on field type', () => {
      expect(validateField('EMAIL', 'test@example.com')).toEqual({ isValid: true })
      expect(validateField('URL', 'https://example.com')).toEqual({ isValid: true })
      expect(validateField('PHONE', '+1234567890')).toEqual({ isValid: true })
      expect(validateField('COLOR', '#FF0000')).toEqual({ isValid: true })
      expect(validateField('SLUG', 'hello-world')).toEqual({ isValid: true })
    })

    it('should handle required validation for all types', () => {
      expect(validateField('TEXT', '', { required: true })).toEqual({
        isValid: false,
        message: 'This field is required',
      })
      expect(validateField('EMAIL', '', { required: true })).toEqual({
        isValid: false,
        message: 'This field is required',
      })
    })

    it('should allow empty values when not required', () => {
      expect(validateField('EMAIL', '', { required: false })).toEqual({ isValid: true })
      expect(validateField('URL', '')).toEqual({ isValid: true })
    })

    it('should handle unknown field types gracefully', () => {
      expect(validateField('UNKNOWN_TYPE', 'some value')).toEqual({ isValid: true })
    })
  })
})
