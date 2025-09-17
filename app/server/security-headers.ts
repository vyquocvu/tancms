/**
 * Security headers utility for TanCMS
 * Implements security best practices through HTTP headers
 */

export interface SecurityHeadersConfig {
  contentSecurityPolicy?: string | boolean
  xFrameOptions?: string | boolean
  xContentTypeOptions?: boolean
  referrerPolicy?: string | boolean
  permissionsPolicy?: string | boolean
  strictTransportSecurity?: string | boolean
  xXssProtection?: boolean
}

/**
 * Default Content Security Policy for TanCMS
 */
const DEFAULT_CSP = [
  "default-src 'self'",
  "script-src 'self' 'unsafe-inline' 'unsafe-eval' *.tinymce.com",
  "style-src 'self' 'unsafe-inline' fonts.googleapis.com",
  "img-src 'self' data: https: blob:",
  "font-src 'self' fonts.gstatic.com",
  "connect-src 'self' *.vercel-analytics.com",
  "media-src 'self' blob:",
  "object-src 'none'",
  "base-uri 'self'",
  "form-action 'self'",
  "frame-ancestors 'none'",
  "upgrade-insecure-requests"
].join('; ')

/**
 * Generate security headers object
 */
export function generateSecurityHeaders(config: SecurityHeadersConfig = {}): Record<string, string> {
  const headers: Record<string, string> = {}
  
  // Content Security Policy
  if (config.contentSecurityPolicy !== false) {
    const csp = typeof config.contentSecurityPolicy === 'string' 
      ? config.contentSecurityPolicy 
      : DEFAULT_CSP
    headers['Content-Security-Policy'] = csp
  }
  
  // X-Frame-Options
  if (config.xFrameOptions !== false) {
    headers['X-Frame-Options'] = typeof config.xFrameOptions === 'string' 
      ? config.xFrameOptions 
      : 'DENY'
  }
  
  // X-Content-Type-Options
  if (config.xContentTypeOptions !== false) {
    headers['X-Content-Type-Options'] = 'nosniff'
  }
  
  // Referrer Policy
  if (config.referrerPolicy !== false) {
    headers['Referrer-Policy'] = typeof config.referrerPolicy === 'string'
      ? config.referrerPolicy
      : 'strict-origin-when-cross-origin'
  }
  
  // Permissions Policy
  if (config.permissionsPolicy !== false) {
    const defaultPermissions = [
      'camera=()',
      'microphone=()',
      'geolocation=()',
      'payment=()',
      'usb=()',
      'magnetometer=()',
      'gyroscope=()',
      'accelerometer=()'
    ].join(', ')
    
    headers['Permissions-Policy'] = typeof config.permissionsPolicy === 'string'
      ? config.permissionsPolicy
      : defaultPermissions
  }
  
  // Strict Transport Security (HTTPS only)
  if (config.strictTransportSecurity !== false && process.env.NODE_ENV === 'production') {
    headers['Strict-Transport-Security'] = typeof config.strictTransportSecurity === 'string'
      ? config.strictTransportSecurity
      : 'max-age=31536000; includeSubDomains; preload'
  }
  
  // X-XSS-Protection (legacy support)
  if (config.xXssProtection !== false) {
    headers['X-XSS-Protection'] = '1; mode=block'
  }
  
  // Additional security headers
  headers['X-DNS-Prefetch-Control'] = 'off'
  headers['X-Download-Options'] = 'noopen'
  headers['X-Permitted-Cross-Domain-Policies'] = 'none'
  
  return headers
}

/**
 * Apply security headers to a Response object
 */
export function applySecurityHeaders(
  response: Response, 
  config?: SecurityHeadersConfig
): Response {
  const headers = generateSecurityHeaders(config)
  
  // Create new response with security headers
  const newHeaders = new Headers(response.headers)
  
  for (const [key, value] of Object.entries(headers)) {
    newHeaders.set(key, value)
  }
  
  return new Response(response.body, {
    status: response.status,
    statusText: response.statusText,
    headers: newHeaders,
  })
}

/**
 * Generate CORS headers with security considerations
 */
export function generateCorsHeaders(origin?: string): Record<string, string> {
  const headers: Record<string, string> = {
    'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization, X-Requested-With',
    'Access-Control-Max-Age': '86400', // 24 hours
  }
  
  // In development, allow all origins
  if (process.env.NODE_ENV === 'development') {
    headers['Access-Control-Allow-Origin'] = '*'
    headers['Access-Control-Allow-Credentials'] = 'true'
  } else {
    // In production, be more restrictive
    const allowedOrigins = [
      process.env.APP_URL,
      process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : undefined,
    ].filter(Boolean)
    
    if (origin && allowedOrigins.includes(origin)) {
      headers['Access-Control-Allow-Origin'] = origin
      headers['Access-Control-Allow-Credentials'] = 'true'
    }
  }
  
  return headers
}

/**
 * Create security middleware for API routes
 */
export function createSecurityMiddleware(config?: SecurityHeadersConfig) {
  return (request: Request, response: Response): Response => {
    // Apply security headers
    let secureResponse = applySecurityHeaders(response, config)
    
    // Add CORS headers for cross-origin requests
    const origin = request.headers.get('Origin')
    if (origin) {
      const corsHeaders = generateCorsHeaders(origin)
      const newHeaders = new Headers(secureResponse.headers)
      
      for (const [key, value] of Object.entries(corsHeaders)) {
        newHeaders.set(key, value)
      }
      
      secureResponse = new Response(secureResponse.body, {
        status: secureResponse.status,
        statusText: secureResponse.statusText,
        headers: newHeaders,
      })
    }
    
    return secureResponse
  }
}

/**
 * Rate limiting configuration
 */
export interface RateLimitConfig {
  windowMs: number
  maxRequests: number
  message?: string
  skipSuccessfulRequests?: boolean
  skipFailedRequests?: boolean
}

/**
 * Simple in-memory rate limiter
 */
class RateLimiter {
  private requests = new Map<string, { count: number; resetTime: number }>()
  private config: RateLimitConfig
  
  constructor(config: RateLimitConfig) {
    this.config = config
    
    // Clean up expired entries every minute
    setInterval(() => this.cleanup(), 60000)
  }
  
  private cleanup(): void {
    const now = Date.now()
    for (const [key, data] of this.requests.entries()) {
      if (data.resetTime < now) {
        this.requests.delete(key)
      }
    }
  }
  
  private getClientKey(request: Request): string {
    // Use IP address or session ID as key
    const forwarded = request.headers.get('x-forwarded-for')
    const ip = forwarded?.split(',')[0]?.trim() || 
               request.headers.get('x-real-ip') ||
               'unknown'
    
    return ip
  }
  
  check(request: Request): { allowed: boolean; remaining: number; resetTime: number } {
    const key = this.getClientKey(request)
    const now = Date.now()
    const resetTime = now + this.config.windowMs
    
    let entry = this.requests.get(key)
    
    if (!entry || entry.resetTime < now) {
      entry = { count: 0, resetTime }
      this.requests.set(key, entry)
    }
    
    entry.count++
    
    const allowed = entry.count <= this.config.maxRequests
    const remaining = Math.max(0, this.config.maxRequests - entry.count)
    
    return { allowed, remaining, resetTime: entry.resetTime }
  }
}

/**
 * Create rate limiting middleware
 */
export function createRateLimitMiddleware(config: RateLimitConfig) {
  const limiter = new RateLimiter(config)
  
  return (request: Request): Response | null => {
    const result = limiter.check(request)
    
    if (!result.allowed) {
      return new Response(
        JSON.stringify({
          error: 'Too Many Requests',
          message: config.message || 'Rate limit exceeded. Please try again later.',
          retryAfter: Math.ceil((result.resetTime - Date.now()) / 1000),
        }),
        {
          status: 429,
          headers: {
            'Content-Type': 'application/json',
            'Retry-After': Math.ceil((result.resetTime - Date.now()) / 1000).toString(),
            'X-RateLimit-Limit': config.maxRequests.toString(),
            'X-RateLimit-Remaining': result.remaining.toString(),
            'X-RateLimit-Reset': Math.ceil(result.resetTime / 1000).toString(),
          },
        }
      )
    }
    
    // Add rate limit headers to response
    return null // Continue processing
  }
}

/**
 * Validate request size to prevent large payload attacks
 */
export function validateRequestSize(request: Request, maxSizeBytes = 10 * 1024 * 1024): boolean {
  const contentLength = request.headers.get('content-length')
  
  if (contentLength) {
    const size = parseInt(contentLength, 10)
    return !isNaN(size) && size <= maxSizeBytes
  }
  
  return true // Allow if no content-length header
}

/**
 * Generate nonce for CSP
 */
export function generateNonce(): string {
  const array = new Uint8Array(16)
  crypto.getRandomValues(array)
  return btoa(String.fromCharCode(...array))
}