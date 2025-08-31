import { describe, it, expect } from 'vitest'
import { generateSlug, truncateText, formatDate, getRelativeTime } from '../app/lib/utils'

describe('Utility Functions', () => {
  describe('generateSlug', () => {
    it('should convert title to lowercase slug', () => {
      expect(generateSlug('Hello World')).toBe('hello-world')
    })

    it('should handle special characters', () => {
      expect(generateSlug('Hello & Goodbye!')).toBe('hello-goodbye')
    })

    it('should handle multiple spaces and underscores', () => {
      expect(generateSlug('Multiple   Spaces___And-Dashes')).toBe('multiple-spaces-and-dashes')
    })

    it('should remove leading and trailing hyphens', () => {
      expect(generateSlug('- Leading and Trailing -')).toBe('leading-and-trailing')
    })

    it('should handle empty string', () => {
      expect(generateSlug('')).toBe('')
    })
  })

  describe('truncateText', () => {
    it('should truncate text when it exceeds max length', () => {
      const text = 'This is a long text that should be truncated'
      expect(truncateText(text, 20)).toBe('This is a long text...')
    })

    it('should return original text when within max length', () => {
      const text = 'Short text'
      expect(truncateText(text, 20)).toBe('Short text')
    })

    it('should handle exact length', () => {
      const text = 'Exactly twenty chars'
      expect(truncateText(text, 20)).toBe('Exactly twenty chars')
    })
  })

  describe('formatDate', () => {
    it('should format date object correctly', () => {
      const date = new Date('2024-01-15')
      const formatted = formatDate(date)
      expect(formatted).toBe('January 15, 2024')
    })

    it('should format date string correctly', () => {
      const formatted = formatDate('2024-01-15')
      expect(formatted).toBe('January 15, 2024')
    })
  })

  describe('getRelativeTime', () => {
    it('should return minutes ago for recent times', () => {
      const fiveMinutesAgo = new Date(Date.now() - 5 * 60 * 1000)
      const result = getRelativeTime(fiveMinutesAgo)
      expect(result).toBe('5 minutes ago')
    })

    it('should return hours ago for times within 24 hours', () => {
      const twoHoursAgo = new Date(Date.now() - 2 * 60 * 60 * 1000)
      const result = getRelativeTime(twoHoursAgo)
      expect(result).toBe('2 hours ago')
    })

    it('should return days ago for times within a week', () => {
      const threeDaysAgo = new Date(Date.now() - 3 * 24 * 60 * 60 * 1000)
      const result = getRelativeTime(threeDaysAgo)
      expect(result).toBe('3 days ago')
    })
  })
})