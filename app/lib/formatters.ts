/**
 * Field value formatters for content preview
 * Handles formatting of different field types for display
 */

import type { ContentField } from './mock-api'

export interface FormattedValue {
  displayValue: string
  isHtml: boolean
  isLink: boolean
  linkUrl?: string
}

/**
 * Format a field value for preview display
 */
export function formatFieldValue(field: ContentField, value: string): FormattedValue {
  if (!value || value.trim() === '') {
    return {
      displayValue: '(empty)',
      isHtml: false,
      isLink: false
    }
  }

  switch (field.fieldType) {
    case 'RICH_TEXT':
    case 'WYSIWYG':
      return {
        displayValue: value,
        isHtml: true,
        isLink: false
      }

    case 'EMAIL':
      return {
        displayValue: value,
        isHtml: false,
        isLink: true,
        linkUrl: `mailto:${value}`
      }

    case 'URL':
      const url = value.startsWith('http') ? value : `https://${value}`
      return {
        displayValue: value,
        isHtml: false,
        isLink: true,
        linkUrl: url
      }

    case 'PHONE':
      return {
        displayValue: value,
        isHtml: false,
        isLink: true,
        linkUrl: `tel:${value.replace(/\D/g, '')}`
      }

    case 'DATE':
      try {
        const date = new Date(value)
        return {
          displayValue: date.toLocaleDateString(),
          isHtml: false,
          isLink: false
        }
      } catch {
        return {
          displayValue: value,
          isHtml: false,
          isLink: false
        }
      }

    case 'DATETIME':
      try {
        const date = new Date(value)
        return {
          displayValue: date.toLocaleString(),
          isHtml: false,
          isLink: false
        }
      } catch {
        return {
          displayValue: value,
          isHtml: false,
          isLink: false
        }
      }

    case 'BOOLEAN':
      return {
        displayValue: value === 'true' ? 'Yes ✅' : 'No ❌',
        isHtml: false,
        isLink: false
      }

    case 'NUMBER':
    case 'DECIMAL':
      return {
        displayValue: parseFloat(value).toLocaleString(),
        isHtml: false,
        isLink: false
      }

    case 'COLOR':
      return {
        displayValue: `
          <div class="flex items-center gap-2">
            <div class="w-4 h-4 rounded border" style="background-color: ${value}"></div>
            <span>${value}</span>
          </div>
        `,
        isHtml: true,
        isLink: false
      }

    case 'JSON':
      try {
        const parsed = JSON.parse(value)
        return {
          displayValue: `<pre class="bg-gray-100 p-2 rounded text-sm overflow-auto">${JSON.stringify(parsed, null, 2)}</pre>`,
          isHtml: true,
          isLink: false
        }
      } catch {
        return {
          displayValue: value,
          isHtml: false,
          isLink: false
        }
      }

    case 'SLUG':
      return {
        displayValue: `/${value}`,
        isHtml: false,
        isLink: false
      }

    case 'TEXT':
    case 'TEXTAREA':
    default:
      // Basic text with line breaks preserved
      const formattedText = value.replace(/\n/g, '<br>')
      return {
        displayValue: formattedText,
        isHtml: true,
        isLink: false
      }
  }
}

/**
 * Get display label for field type
 */
export function getFieldTypeLabel(fieldType: string): string {
  const labels: Record<string, string> = {
    TEXT: 'Text',
    TEXTAREA: 'Long Text',
    RICH_TEXT: 'Rich Text',
    WYSIWYG: 'Rich Text',
    EMAIL: 'Email',
    URL: 'URL',
    PHONE: 'Phone',
    DATE: 'Date',
    DATETIME: 'Date & Time',
    NUMBER: 'Number',
    DECIMAL: 'Decimal',
    BOOLEAN: 'Yes/No',
    COLOR: 'Color',
    JSON: 'JSON',
    SLUG: 'URL Slug',
    PASSWORD: 'Password'
  }
  
  return labels[fieldType] || fieldType
}