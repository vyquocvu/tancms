/**
 * Accessibility utility functions for TanCMS
 * Provides helper functions for ARIA labels, screen reader support, and keyboard navigation
 */

/**
 * Generate a unique ID for form elements to associate labels and inputs
 */
export function generateA11yId(prefix: string = 'a11y'): string {
  return `${prefix}-${Math.random().toString(36).substr(2, 9)}`
}

/**
 * Announce text to screen readers using aria-live region
 */
export function announceToScreenReader(message: string, priority: 'polite' | 'assertive' = 'polite') {
  const announcement = document.createElement('div')
  announcement.setAttribute('aria-live', priority)
  announcement.setAttribute('aria-atomic', 'true')
  announcement.className = 'sr-only'
  announcement.textContent = message
  
  document.body.appendChild(announcement)
  
  // Remove after announcement
  setTimeout(() => {
    document.body.removeChild(announcement)
  }, 1000)
}

/**
 * Check if user prefers reduced motion
 */
export function prefersReducedMotion(): boolean {
  return window.matchMedia('(prefers-reduced-motion: reduce)').matches
}

/**
 * Get appropriate ARIA label for sort button based on current sort state
 */
export function getSortAriaLabel(columnName: string, sortDirection: 'asc' | 'desc' | null): string {
  if (sortDirection === 'asc') {
    return `Sort ${columnName} descending`
  } else if (sortDirection === 'desc') {
    return `Remove sort from ${columnName}`
  } else {
    return `Sort ${columnName} ascending`
  }
}

/**
 * Get ARIA description for sort state
 */
export function getSortAriaDescription(columnName: string, sortDirection: 'asc' | 'desc' | null): string {
  if (sortDirection === 'asc') {
    return `${columnName} is currently sorted ascending`
  } else if (sortDirection === 'desc') {
    return `${columnName} is currently sorted descending`
  } else {
    return `${columnName} is not sorted`
  }
}

/**
 * Create proper ARIA attributes for interactive table cells
 */
export interface TableCellA11yProps {
  role?: string
  'aria-label'?: string
  'aria-describedby'?: string
  'aria-sort'?: 'ascending' | 'descending' | 'none'
  tabIndex?: number
}

export function getTableCellA11yProps(
  isClickable: boolean, 
  isHeader: boolean = false, 
  sortDirection?: 'asc' | 'desc' | null
): TableCellA11yProps {
  const props: TableCellA11yProps = {}
  
  if (isHeader) {
    props.role = 'columnheader'
    if (sortDirection !== undefined) {
      props['aria-sort'] = sortDirection === 'asc' ? 'ascending' : 
                          sortDirection === 'desc' ? 'descending' : 'none'
    }
  }
  
  if (isClickable) {
    props.tabIndex = 0
  }
  
  return props
}

/**
 * Enhanced keyboard navigation handler
 */
export function handleKeyboardNavigation(
  event: React.KeyboardEvent,
  onEnter?: () => void,
  onSpace?: () => void,
  onEscape?: () => void,
  onArrowKeys?: (direction: 'up' | 'down' | 'left' | 'right') => void
) {
  switch (event.key) {
    case 'Enter':
      if (onEnter) {
        event.preventDefault()
        onEnter()
      }
      break
    case ' ':
    case 'Space':
      if (onSpace) {
        event.preventDefault()
        onSpace()
      }
      break
    case 'Escape':
      if (onEscape) {
        event.preventDefault()
        onEscape()
      }
      break
    case 'ArrowUp':
      if (onArrowKeys) {
        event.preventDefault()
        onArrowKeys('up')
      }
      break
    case 'ArrowDown':
      if (onArrowKeys) {
        event.preventDefault()
        onArrowKeys('down')
      }
      break
    case 'ArrowLeft':
      if (onArrowKeys) {
        event.preventDefault()
        onArrowKeys('left')
      }
      break
    case 'ArrowRight':
      if (onArrowKeys) {
        event.preventDefault()
        onArrowKeys('right')
      }
      break
  }
}

/**
 * Focus trap utility for modals and dialogs
 */
export function createFocusTrap(container: HTMLElement) {
  const focusableElements = container.querySelectorAll(
    'a[href], button, textarea, input[type="text"], input[type="radio"], input[type="checkbox"], select, [tabindex]:not([tabindex="-1"])'
  ) as NodeListOf<HTMLElement>
  
  const firstElement = focusableElements[0]
  const lastElement = focusableElements[focusableElements.length - 1]
  
  function handleKeyDown(e: KeyboardEvent) {
    if (e.key === 'Tab') {
      if (e.shiftKey) {
        if (document.activeElement === firstElement) {
          e.preventDefault()
          lastElement.focus()
        }
      } else {
        if (document.activeElement === lastElement) {
          e.preventDefault()
          firstElement.focus()
        }
      }
    }
  }
  
  container.addEventListener('keydown', handleKeyDown)
  
  // Focus first element
  if (firstElement) {
    firstElement.focus()
  }
  
  return {
    destroy: () => {
      container.removeEventListener('keydown', handleKeyDown)
    }
  }
}

/**
 * Screen reader only text utility
 */
export function createScreenReaderText(text: string): string {
  return text
}