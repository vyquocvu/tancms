/**
 * Input sanitization utilities for XSS prevention and data cleaning
 * Provides comprehensive sanitization for user inputs
 */

export interface SanitizationOptions {
  allowHtml?: boolean
  allowedTags?: string[]
  allowedAttributes?: string[]
  maxLength?: number
  removeScripts?: boolean
}

/**
 * HTML entity encoding map
 */
const HTML_ENTITIES: Record<string, string> = {
  '&': '&amp;',
  '<': '&lt;',
  '>': '&gt;',
  '"': '&quot;',
  "'": '&#x27;',
  '/': '&#x2F;',
}

/**
 * Encode HTML entities to prevent XSS
 */
export function encodeHtmlEntities(input: string): string {
  return input.replace(/[&<>"'/]/g, char => HTML_ENTITIES[char] || char)
}

/**
 * Decode HTML entities
 */
export function decodeHtmlEntities(input: string): string {
  return input
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#x27;/g, "'")
    .replace(/&#x2F;/g, '/')
}

/**
 * Remove or escape potentially dangerous script tags and attributes
 */
export function removeScriptTags(input: string): string {
  // Remove script tags and their content
  let sanitized = input.replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
  
  // Remove javascript: URLs
  sanitized = sanitized.replace(/javascript:/gi, '')
  
  // Remove on* event handlers
  sanitized = sanitized.replace(/\s*on\w+\s*=\s*[^>]*/gi, '')
  
  // Remove data: URLs that could contain scripts
  sanitized = sanitized.replace(/data:\s*text\/html/gi, '')
  
  return sanitized
}

/**
 * Validate and sanitize URL to prevent malicious redirects
 */
export function sanitizeUrl(url: string): string | null {
  if (!url || typeof url !== 'string') return null
  
  try {
    const urlObj = new URL(url)
    
    // Allow only http, https, and relative URLs
    const allowedProtocols = ['http:', 'https:', 'mailto:', 'tel:']
    
    if (urlObj.protocol && !allowedProtocols.includes(urlObj.protocol)) {
      return null
    }
    
    // Block javascript: and data: URLs
    if (urlObj.protocol === 'javascript:' || urlObj.protocol === 'data:') {
      return null
    }
    
    return urlObj.toString()
  } catch {
    // If URL parsing fails, treat as relative URL and basic sanitization
    const sanitized = url.replace(/[<>'"]/g, '')
    
    // Block javascript: and data: schemes
    if (/^(javascript|data):/i.test(sanitized)) {
      return null
    }
    
    return sanitized
  }
}

/**
 * Basic HTML sanitization - allows safe tags only
 */
export function sanitizeHtml(input: string, options: SanitizationOptions = {}): string {
  const {
    allowHtml = false,
    allowedTags = ['p', 'br', 'strong', 'em', 'ul', 'ol', 'li', 'a'],
    allowedAttributes = ['href', 'title', 'alt'],
    maxLength,
    removeScripts = true
  } = options
  
  let sanitized = input
  
  // Apply length limit first
  if (maxLength && sanitized.length > maxLength) {
    sanitized = sanitized.substring(0, maxLength)
  }
  
  // Remove scripts if requested
  if (removeScripts) {
    sanitized = removeScriptTags(sanitized)
  }
  
  if (!allowHtml) {
    // Simply encode all HTML
    return encodeHtmlEntities(sanitized)
  }
  
  // Allow only specific tags
  const allowedTagsRegex = new RegExp(`<(?!\/?(?:${allowedTags.join('|')})\\b)[^>]*>`, 'gi')
  sanitized = sanitized.replace(allowedTagsRegex, '')
  
  // Remove disallowed attributes
  const attributeRegex = /(\w+)=["']([^"']+)["']/g
  sanitized = sanitized.replace(attributeRegex, (match, attrName, attrValue) => {
    if (allowedAttributes.includes(attrName.toLowerCase())) {
      // Sanitize attribute values
      if (attrName.toLowerCase() === 'href') {
        const sanitizedUrl = sanitizeUrl(attrValue)
        return sanitizedUrl ? `${attrName}="${sanitizedUrl}"` : ''
      }
      return `${attrName}="${encodeHtmlEntities(attrValue)}"`
    }
    return ''
  })
  
  return sanitized
}

/**
 * Sanitize JSON input to prevent injection
 */
export function sanitizeJson(input: unknown): unknown {
  if (typeof input === 'string') {
    return encodeHtmlEntities(input)
  }
  
  if (Array.isArray(input)) {
    return input.map(item => sanitizeJson(item))
  }
  
  if (input && typeof input === 'object') {
    const sanitized: Record<string, unknown> = {}
    
    for (const [key, value] of Object.entries(input)) {
      // Sanitize object keys
      const sanitizedKey = encodeHtmlEntities(key)
      sanitized[sanitizedKey] = sanitizeJson(value)
    }
    
    return sanitized
  }
  
  return input
}

/**
 * Sanitize file upload names and paths
 */
export function sanitizeFileName(fileName: string): string {
  // Remove path separators and dangerous characters
  let sanitized = fileName.replace(/[/\\:*?"<>|]/g, '')
  
  // Remove leading dots (hidden files)
  sanitized = sanitized.replace(/^\.+/, '')
  
  // Limit length
  if (sanitized.length > 255) {
    const extension = sanitized.split('.').pop()
    const baseName = sanitized.substring(0, 255 - (extension?.length || 0) - 1)
    sanitized = extension ? `${baseName}.${extension}` : baseName
  }
  
  return sanitized || 'file'
}

/**
 * Validate MIME type for file uploads
 */
export function validateMimeType(mimeType: string, allowedTypes: string[]): boolean {
  if (!mimeType || typeof mimeType !== 'string') return false
  
  const normalizedMime = mimeType.toLowerCase().split(';')[0].trim()
  
  return allowedTypes.some(allowed => {
    if (allowed.endsWith('/*')) {
      return normalizedMime.startsWith(allowed.slice(0, -1))
    }
    return normalizedMime === allowed
  })
}

/**
 * Comprehensive input sanitization for API requests
 */
export function sanitizeApiInput(
  input: unknown,
  fieldType?: string,
  options?: SanitizationOptions
): unknown {
  if (typeof input === 'string') {
    switch (fieldType) {
      case 'EMAIL':
        return input.toLowerCase().trim()
      case 'URL':
        return sanitizeUrl(input)
      case 'HTML':
        return sanitizeHtml(input, { ...options, allowHtml: true })
      case 'TEXT':
      case 'TEXTAREA':
        return sanitizeHtml(input, { ...options, allowHtml: false })
      case 'FILENAME':
        return sanitizeFileName(input)
      default:
        return encodeHtmlEntities(input.trim())
    }
  }
  
  if (Array.isArray(input)) {
    return input.map(item => sanitizeApiInput(item, fieldType, options))
  }
  
  if (input && typeof input === 'object') {
    return sanitizeJson(input)
  }
  
  return input
}

/**
 * Sanitize content field values based on field type
 */
export function sanitizeContentFieldValue(
  value: unknown,
  fieldType: string,
  options?: SanitizationOptions
): unknown {
  switch (fieldType) {
    case 'TEXT':
    case 'TEXTAREA':
      return typeof value === 'string' 
        ? sanitizeHtml(value, { allowHtml: false, ...options })
        : value
    
    case 'EMAIL':
      return typeof value === 'string' 
        ? value.toLowerCase().trim()
        : value
    
    case 'URL':
      return typeof value === 'string' 
        ? sanitizeUrl(value)
        : value
    
    case 'JSON':
      return sanitizeJson(value)
    
    default:
      return sanitizeApiInput(value, fieldType, options)
  }
}