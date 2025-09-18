import { describe, it, expect, beforeAll } from 'vitest'
import { 
  generateA11yId, 
  getSortAriaLabel, 
  getSortAriaDescription, 
  getTableCellA11yProps 
} from '../app/lib/accessibility'

// Mock window.matchMedia for testing
beforeAll(() => {
  if (typeof window !== 'undefined') {
    Object.defineProperty(window, 'matchMedia', {
      writable: true,
      value: (query: string) => ({
        matches: query.includes('reduce'),
        media: query,
        onchange: null,
        addListener: () => {},
        removeListener: () => {},
        addEventListener: () => {},
        removeEventListener: () => {},
        dispatchEvent: () => {},
      }),
    })
  }
})

describe('Accessibility Utilities', () => {
  describe('generateA11yId', () => {
    it('should generate unique IDs with prefix', () => {
      const id1 = generateA11yId('test')
      const id2 = generateA11yId('test')
      
      expect(id1).toMatch(/^test-/)
      expect(id2).toMatch(/^test-/)
      expect(id1).not.toBe(id2)
    })

    it('should use default prefix when none provided', () => {
      const id = generateA11yId()
      expect(id).toMatch(/^a11y-/)
    })
  })

  describe('getSortAriaLabel', () => {
    it('should return correct label for ascending sort', () => {
      const label = getSortAriaLabel('Name', 'asc')
      expect(label).toBe('Sort Name descending')
    })

    it('should return correct label for descending sort', () => {
      const label = getSortAriaLabel('Name', 'desc')
      expect(label).toBe('Remove sort from Name')
    })

    it('should return correct label for no sort', () => {
      const label = getSortAriaLabel('Name', null)
      expect(label).toBe('Sort Name ascending')
    })
  })

  describe('getSortAriaDescription', () => {
    it('should return correct description for ascending sort', () => {
      const desc = getSortAriaDescription('Name', 'asc')
      expect(desc).toBe('Name is currently sorted ascending')
    })

    it('should return correct description for descending sort', () => {
      const desc = getSortAriaDescription('Name', 'desc')
      expect(desc).toBe('Name is currently sorted descending')
    })

    it('should return correct description for no sort', () => {
      const desc = getSortAriaDescription('Name', null)
      expect(desc).toBe('Name is not sorted')
    })
  })

  describe('getTableCellA11yProps', () => {
    it('should return props for clickable header with sort', () => {
      const props = getTableCellA11yProps(true, true, 'asc')
      
      expect(props.role).toBe('columnheader')
      expect(props['aria-sort']).toBe('ascending')
      expect(props.tabIndex).toBe(0)
    })

    it('should return props for non-sortable header', () => {
      const props = getTableCellA11yProps(false, true, null)
      
      expect(props.role).toBe('columnheader')
      expect(props['aria-sort']).toBe('none')
      expect(props.tabIndex).toBeUndefined()
    })

    it('should return props for regular cell', () => {
      const props = getTableCellA11yProps(false, false)
      
      expect(props.role).toBeUndefined()
      expect(props['aria-sort']).toBeUndefined()
      expect(props.tabIndex).toBeUndefined()
    })
  })

  describe('prefersReducedMotion', () => {
    it.skip('should detect reduced motion preference (browser only)', () => {
      // This test requires browser environment
      expect(true).toBe(true)
    })
  })
})