/**
 * Security enhancement tests
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
import { 
  validatePasswordStrength, 
  getClientIp 
} from '../app/server/security-auth'

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

    it('should remove disallowed tags', () => {
      const input = '<p>Safe</p><div>Unsafe</div><script>Evil</script>'
      const result = sanitizeHtml(input, { 
        allowHtml: true, 
        allowedTags: ['p'] 
      })
      expect(result).toContain('<p>')
      expect(result).not.toContain('<div>')
      expect(result).not.toContain('<script>')
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

    it('should allow mailto and tel URLs', () => {
      expect(sanitizeUrl('mailto:test@example.com')).toBe('mailto:test@example.com')
      expect(sanitizeUrl('tel:+1234567890')).toBe('tel:+1234567890')
    })

    it('should handle relative URLs safely', () => {
      const url = '/safe/path'
      const result = sanitizeUrl(url)
      expect(result).toBe(url)
    })

    it('should reject malicious relative URLs', () => {
      const url = 'javascript:alert(1)'
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

    it('should remove leading dots', () => {
      const fileName = '...hidden-file.txt'
      const result = sanitizeFileName(fileName)
      expect(result).toBe('hidden-file.txt')
    })

    it('should handle long filenames', () => {
      const longName = 'a'.repeat(300) + '.txt'
      const result = sanitizeFileName(longName)
      expect(result.length).toBeLessThanOrEqual(255)
      expect(result.endsWith('.txt')).toBe(true)
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

    it('should handle MIME types with parameters', () => {
      expect(validateMimeType('text/html; charset=utf-8', ['text/html'])).toBe(true)
    })

    it('should be case-insensitive', () => {
      expect(validateMimeType('IMAGE/JPEG', ['image/jpeg'])).toBe(true)
    })
  })

  describe('API Input Sanitization', () => {
    it('should sanitize different field types appropriately', () => {
      expect(sanitizeApiInput('test@EXAMPLE.COM', 'EMAIL')).toBe('test@example.com')
      expect(sanitizeApiInput('<script>alert(1)</script>', 'TEXT')).not.toContain('<script>')
      expect(sanitizeApiInput('javascript:alert(1)', 'URL')).toBeNull()
    })

    it('should handle arrays', () => {
      const input = ['<script>evil</script>', 'safe text']
      const result = sanitizeApiInput(input, 'TEXT') as string[]
      expect(result[0]).not.toContain('<script>')
      expect(result[1]).toContain('safe text')
    })

    it('should handle objects', () => {
      const input = { '<script>': 'evil', safe: 'good' }
      const result = sanitizeApiInput(input) as Record<string, unknown>
      expect(Object.keys(result)).not.toContain('<script>')
      expect(Object.keys(result)).toContain('&lt;script&gt;')
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

    it('should reject mismatched tokens', () => {
      const headers = new Headers({
        'X-CSRF-Token': 'token1',
        'Cookie': 'csrf-token=token2'
      })
      const request = new Request('http://localhost/test', { 
        method: 'POST', 
        headers 
      })
      const result = validateCSRFToken(request)
      expect(result.valid).toBe(false)
      expect(result.reason).toContain('mismatch')
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

    it('should handle missing origin gracefully', () => {
      const request = new Request('http://localhost/test')
      const result = validateOrigin(request)
      expect(result).toBe(true) // Allow same-origin requests
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

    it('should include HSTS in production', () => {
      const originalEnv = process.env.NODE_ENV
      process.env.NODE_ENV = 'production'
      
      const headers = generateSecurityHeaders()
      expect(headers['Strict-Transport-Security']).toBeDefined()
      
      process.env.NODE_ENV = originalEnv
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

describe('Enhanced Authentication', () => {
  describe('Password Validation', () => {
    it('should accept strong passwords', () => {
      const result = validatePasswordStrength('MySecure123!')
      expect(result.isValid).toBe(true)
      expect(result.score).toBeGreaterThan(3)
    })

    it('should reject weak passwords', () => {
      const result = validatePasswordStrength('123456')
      expect(result.isValid).toBe(false)
      expect(result.feedback.length).toBeGreaterThan(0)
    })

    it('should reject common passwords', () => {
      const result = validatePasswordStrength('password123')
      expect(result.isValid).toBe(false)
      expect(result.feedback.some(f => f.includes('common'))).toBe(true)
    })

    it('should reject sequential characters', () => {
      const result = validatePasswordStrength('abcdef123')
      expect(result.score).toBeLessThan(5) // Penalty for sequential chars
    })

    it('should provide helpful feedback', () => {
      const result = validatePasswordStrength('weak')
      expect(result.feedback).toContain('Password must be at least 8 characters long')
      expect(result.feedback).toContain('Password must contain uppercase letters')
      expect(result.feedback).toContain('Password must contain numbers')
    })
  })

  describe('IP Extraction', () => {
    it('should extract IP from X-Forwarded-For header', () => {
      const request = new Request('http://localhost', {
        headers: { 'X-Forwarded-For': '192.168.1.1, 10.0.0.1' }
      })
      const ip = getClientIp(request)
      expect(ip).toBe('192.168.1.1')
    })

    it('should extract IP from X-Real-IP header', () => {
      const request = new Request('http://localhost', {
        headers: { 'X-Real-IP': '192.168.1.1' }
      })
      const ip = getClientIp(request)
      expect(ip).toBe('192.168.1.1')
    })

    it('should handle missing headers gracefully', () => {
      const request = new Request('http://localhost')
      const ip = getClientIp(request)
      expect(ip).toBe('unknown')
    })
  })
})