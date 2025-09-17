/**
 * Core security features tests (non-auth dependent)
 * Tests for input sanitization, CSRF protection, and security headers
 */

import { describe, it, expect } from 'vitest'
import { 
  encodeHtmlEntities, 
  sanitizeHtml, 
  sanitizeUrl, 
  sanitizeApiInput,
  validateMimeType,
  sanitizeFileName 
} from '../app/lib/security/sanitization'
import { 
  generateCSRFToken, 
  validateCSRFToken, 
  validateOrigin 
} from '../app/lib/security/csrf'
import { 
  generateSecurityHeaders, 
  applySecurityHeaders 
} from '../app/server/security-headers'

describe('Input Sanitization', () => {
  describe('HTML Entity Encoding', () => {
    it('should encode dangerous HTML entities', () => {
      const input = '<script>alert("xss")</script>'
      const result = encodeHtmlEntities(input)
      expect(result).toBe('&lt;script&gt;alert(&quot;xss&quot;)&lt;&#x2F;script&gt;')
    })

    it('should handle empty strings', () => {
      expect(encodeHtmlEntities('')).toBe('')
    })

    it('should encode all dangerous characters', () => {
      const input = `& < > " ' /`
      const result = encodeHtmlEntities(input)
      expect(result).toBe('&amp; &lt; &gt; &quot; &#x27; &#x2F;')
    })
  })

  describe('HTML Sanitization', () => {
    it('should remove script tags completely', () => {
      const input = '<p>Safe content</p><script>alert("xss")</script><p>More content</p>'
      const result = sanitizeHtml(input, { allowHtml: false })
      expect(result).not.toContain('<script>')
      expect(result).not.toContain('alert')
    })

    it('should allow safe HTML tags when allowHtml is true', () => {
      const input = '<p>Safe <strong>content</strong></p>'
      const result = sanitizeHtml(input, { 
        allowHtml: true, 
        allowedTags: ['p', 'strong'] 
      })
      expect(result).toContain('<p>')
      expect(result).toContain('<strong>')
    })

    it('should respect maxLength option', () => {
      const input = 'This is a very long string that should be truncated'
      const result = sanitizeHtml(input, { maxLength: 10 })
      expect(result.length).toBeLessThanOrEqual(10)
    })
  })

  describe('URL Sanitization', () => {
    it('should allow valid HTTP URLs', () => {
      const url = 'https://example.com/path'
      const result = sanitizeUrl(url)
      expect(result).toBe(url)
    })

    it('should reject javascript: URLs', () => {
      const url = 'javascript:alert("xss")'
      const result = sanitizeUrl(url)
      expect(result).toBeNull()
    })

    it('should reject data: URLs', () => {
      const url = 'data:text/html,<script>alert("xss")</script>'
      const result = sanitizeUrl(url)
      expect(result).toBeNull()
    })
  })

  describe('File Name Sanitization', () => {
    it('should remove dangerous characters', () => {
      const fileName = 'file<>:"/\\|?*.txt'
      const result = sanitizeFileName(fileName)
      expect(result).toBe('file.txt')
    })

    it('should provide fallback for empty names', () => {
      expect(sanitizeFileName('')).toBe('file')
      expect(sanitizeFileName('...')).toBe('file')
    })
  })

  describe('MIME Type Validation', () => {
    it('should validate exact MIME types', () => {
      expect(validateMimeType('image/jpeg', ['image/jpeg', 'image/png'])).toBe(true)
      expect(validateMimeType('text/plain', ['image/jpeg', 'image/png'])).toBe(false)
    })

    it('should validate wildcard MIME types', () => {
      expect(validateMimeType('image/jpeg', ['image/*'])).toBe(true)
      expect(validateMimeType('text/plain', ['image/*'])).toBe(false)
    })
  })
})

describe('CSRF Protection', () => {
  describe('Token Generation', () => {
    it('should generate tokens of correct length', () => {
      const token = generateCSRFToken(32)
      expect(token).toHaveLength(32)
    })

    it('should generate unique tokens', () => {
      const token1 = generateCSRFToken()
      const token2 = generateCSRFToken()
      expect(token1).not.toBe(token2)
    })

    it('should generate URL-safe tokens', () => {
      const token = generateCSRFToken()
      expect(token).toMatch(/^[A-Za-z0-9_-]+$/)
    })
  })

  describe('Token Validation', () => {
    it('should allow GET requests without tokens', () => {
      const request = new Request('http://localhost/test', { method: 'GET' })
      const result = validateCSRFToken(request)
      expect(result.valid).toBe(true)
    })

    it('should reject POST requests without tokens', () => {
      const request = new Request('http://localhost/test', { method: 'POST' })
      const result = validateCSRFToken(request)
      expect(result.valid).toBe(false)
      expect(result.reason).toContain('missing')
    })

    it('should accept matching tokens', () => {
      const token = 'valid-token-123'
      const headers = new Headers({
        'X-CSRF-Token': token,
        'Cookie': `csrf-token=${token}`
      })
      const request = new Request('http://localhost/test', { 
        method: 'POST', 
        headers 
      })
      const result = validateCSRFToken(request)
      expect(result.valid).toBe(true)
    })
  })

  describe('Origin Validation', () => {
    it('should accept requests from allowed origins', () => {
      const request = new Request('http://localhost/test', {
        headers: { 'Origin': 'http://localhost:3000' }
      })
      const result = validateOrigin(request, ['http://localhost:3000'])
      expect(result).toBe(true)
    })

    it('should reject requests from disallowed origins', () => {
      const request = new Request('http://localhost/test', {
        headers: { 'Origin': 'http://evil.com' }
      })
      const result = validateOrigin(request, ['http://localhost:3000'])
      expect(result).toBe(false)
    })
  })
})

describe('Security Headers', () => {
  describe('Header Generation', () => {
    it('should generate default security headers', () => {
      const headers = generateSecurityHeaders()
      
      expect(headers['Content-Security-Policy']).toBeDefined()
      expect(headers['X-Frame-Options']).toBe('DENY')
      expect(headers['X-Content-Type-Options']).toBe('nosniff')
      expect(headers['Referrer-Policy']).toBe('strict-origin-when-cross-origin')
    })

    it('should allow custom CSP', () => {
      const customCSP = "default-src 'self'"
      const headers = generateSecurityHeaders({
        contentSecurityPolicy: customCSP
      })
      expect(headers['Content-Security-Policy']).toBe(customCSP)
    })

    it('should disable headers when set to false', () => {
      const headers = generateSecurityHeaders({
        xFrameOptions: false,
        xContentTypeOptions: false
      })
      expect(headers['X-Frame-Options']).toBeUndefined()
      expect(headers['X-Content-Type-Options']).toBeUndefined()
    })
  })

  describe('Header Application', () => {
    it('should apply headers to response', () => {
      const originalResponse = new Response('test content')
      const secureResponse = applySecurityHeaders(originalResponse)
      
      expect(secureResponse.headers.get('X-Frame-Options')).toBe('DENY')
      expect(secureResponse.headers.get('X-Content-Type-Options')).toBe('nosniff')
    })

    it('should preserve original response body and status', () => {
      const originalResponse = new Response('test content', { status: 201 })
      const secureResponse = applySecurityHeaders(originalResponse)
      
      expect(secureResponse.status).toBe(201)
    })
  })
})