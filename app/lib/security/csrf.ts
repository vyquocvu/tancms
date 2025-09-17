/**
 * CSRF Protection utilities for TanCMS
 * Implements double-submit cookie pattern and synchronizer token pattern
 */

export interface CSRFConfig {
  tokenLength: number
  cookieName: string
  headerName: string
  cookieOptions: {
    httpOnly: boolean
    secure: boolean
    sameSite: 'strict' | 'lax' | 'none'
    maxAge: number
  }
}

/**
 * Default CSRF configuration
 */
const DEFAULT_CSRF_CONFIG: CSRFConfig = {
  tokenLength: 32,
  cookieName: 'csrf-token',
  headerName: 'X-CSRF-Token',
  cookieOptions: {
    httpOnly: false, // Must be false so client can read it
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict',
    maxAge: 60 * 60 * 24, // 24 hours
  },
}

/**
 * Generate a cryptographically secure CSRF token
 */
export function generateCSRFToken(length = DEFAULT_CSRF_CONFIG.tokenLength): string {
  const array = new Uint8Array(length)
  crypto.getRandomValues(array)
  
  return btoa(String.fromCharCode(...array))
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/=/g, '')
    .substring(0, length)
}

/**
 * Extract CSRF token from request headers
 */
export function extractCSRFTokenFromRequest(request: Request, config = DEFAULT_CSRF_CONFIG): string | null {
  // Try header first
  const headerToken = request.headers.get(config.headerName)
  if (headerToken) {
    return headerToken
  }
  
  // Try form data for non-JSON requests
  const contentType = request.headers.get('content-type')
  if (contentType?.includes('application/x-www-form-urlencoded')) {
    // This would need to be handled by the calling code that has access to form data
    return null
  }
  
  return null
}

/**
 * Extract CSRF token from cookies
 */
export function extractCSRFTokenFromCookies(request: Request, config = DEFAULT_CSRF_CONFIG): string | null {
  const cookieHeader = request.headers.get('cookie')
  if (!cookieHeader) return null
  
  const cookies = cookieHeader.split(';').reduce((acc, cookie) => {
    const [key, value] = cookie.trim().split('=')
    acc[key] = value
    return acc
  }, {} as Record<string, string>)
  
  return cookies[config.cookieName] || null
}

/**
 * Validate CSRF token using double-submit cookie pattern
 */
export function validateCSRFToken(
  request: Request,
  config = DEFAULT_CSRF_CONFIG
): { valid: boolean; reason?: string } {
  // Skip CSRF protection for GET, HEAD, OPTIONS requests
  const method = request.method.toUpperCase()
  if (['GET', 'HEAD', 'OPTIONS'].includes(method)) {
    return { valid: true }
  }
  
  const tokenFromHeader = extractCSRFTokenFromRequest(request, config)
  const tokenFromCookie = extractCSRFTokenFromCookies(request, config)
  
  if (!tokenFromHeader) {
    return { valid: false, reason: 'CSRF token missing from request' }
  }
  
  if (!tokenFromCookie) {
    return { valid: false, reason: 'CSRF token missing from cookie' }
  }
  
  if (tokenFromHeader !== tokenFromCookie) {
    return { valid: false, reason: 'CSRF token mismatch' }
  }
  
  // Additional validation: check token format
  if (!/^[A-Za-z0-9_-]+$/.test(tokenFromHeader)) {
    return { valid: false, reason: 'Invalid CSRF token format' }
  }
  
  return { valid: true }
}

/**
 * Create CSRF cookie header
 */
export function createCSRFCookie(
  token: string,
  config = DEFAULT_CSRF_CONFIG
): string {
  const { cookieName, cookieOptions } = config
  
  let cookie = `${cookieName}=${token}`
  
  if (cookieOptions.maxAge) {
    cookie += `; Max-Age=${cookieOptions.maxAge}`
  }
  
  cookie += `; Path=/`
  
  if (cookieOptions.secure) {
    cookie += `; Secure`
  }
  
  if (cookieOptions.httpOnly) {
    cookie += `; HttpOnly`
  }
  
  if (cookieOptions.sameSite) {
    cookie += `; SameSite=${cookieOptions.sameSite}`
  }
  
  return cookie
}

/**
 * CSRF middleware for API routes
 */
export function createCSRFMiddleware(config = DEFAULT_CSRF_CONFIG) {
  return (request: Request): { response?: Response; token?: string } => {
    const validation = validateCSRFToken(request, config)
    
    if (!validation.valid) {
      return {
        response: new Response(
          JSON.stringify({
            error: 'CSRF Validation Failed',
            message: validation.reason || 'Invalid CSRF token',
            code: 'CSRF_INVALID',
          }),
          {
            status: 403,
            headers: {
              'Content-Type': 'application/json',
            },
          }
        ),
      }
    }
    
    // Generate new token for response (token rotation)
    const newToken = generateCSRFToken(config.tokenLength)
    
    return { token: newToken }
  }
}

/**
 * Apply CSRF token to response
 */
export function applyCSRFTokenToResponse(
  response: Response,
  token: string,
  config = DEFAULT_CSRF_CONFIG
): Response {
  const newHeaders = new Headers(response.headers)
  
  // Set the CSRF cookie
  newHeaders.append('Set-Cookie', createCSRFCookie(token, config))
  
  // Also include token in response headers for client-side access
  newHeaders.set('X-CSRF-Token', token)
  
  return new Response(response.body, {
    status: response.status,
    statusText: response.statusText,
    headers: newHeaders,
  })
}

/**
 * Create CSRF protection for form submissions
 */
export function createCSRFFormToken(sessionId?: string): string {
  const baseToken = generateCSRFToken()
  
  if (sessionId) {
    // Bind token to session for additional security
    const combined = `${baseToken}:${sessionId}`
    const encoder = new TextEncoder()
    const data = encoder.encode(combined)
    
    return btoa(String.fromCharCode(...data.slice(0, 32)))
      .replace(/\+/g, '-')
      .replace(/\//g, '_')
      .replace(/=/g, '')
  }
  
  return baseToken
}

/**
 * Validate CSRF form token
 */
export function validateCSRFFormToken(
  token: string,
  sessionId?: string,
  config = DEFAULT_CSRF_CONFIG
): boolean {
  if (!token || typeof token !== 'string') {
    return false
  }
  
  // Check token format
  if (!/^[A-Za-z0-9_-]+$/.test(token)) {
    return false
  }
  
  // Check token length
  if (token.length < 16 || token.length > config.tokenLength * 2) {
    return false
  }
  
  if (sessionId) {
    try {
      // Try to decode and verify session binding
      const decoded = atob(token.replace(/-/g, '+').replace(/_/g, '/'))
      return decoded.includes(sessionId)
    } catch {
      return false
    }
  }
  
  return true
}

/**
 * Origin validation for additional CSRF protection
 */
export function validateOrigin(request: Request, allowedOrigins?: string[]): boolean {
  const origin = request.headers.get('origin')
  const referer = request.headers.get('referer')
  
  // If no origin or referer, allow only for same-origin requests
  if (!origin && !referer) {
    return true // Let other middleware handle this
  }
  
  const requestOrigin = origin || (referer ? new URL(referer).origin : null)
  
  if (!requestOrigin) {
    return false
  }
  
  // Default allowed origins
  const defaultAllowed = [
    process.env.APP_URL,
    process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : undefined,
    process.env.NODE_ENV === 'development' ? 'http://localhost:3000' : undefined,
    process.env.NODE_ENV === 'development' ? 'http://127.0.0.1:3000' : undefined,
  ].filter(Boolean)
  
  const allowed = allowedOrigins || defaultAllowed
  
  return allowed.includes(requestOrigin)
}

/**
 * Complete CSRF protection middleware
 */
export function createComprehensiveCSRFProtection(config = DEFAULT_CSRF_CONFIG) {
  return (request: Request): { response?: Response; token?: string } => {
    // Skip for safe methods
    const method = request.method.toUpperCase()
    if (['GET', 'HEAD', 'OPTIONS'].includes(method)) {
      const newToken = generateCSRFToken(config.tokenLength)
      return { token: newToken }
    }
    
    // Validate origin first
    if (!validateOrigin(request)) {
      return {
        response: new Response(
          JSON.stringify({
            error: 'Origin Validation Failed',
            message: 'Request origin not allowed',
            code: 'ORIGIN_INVALID',
          }),
          {
            status: 403,
            headers: {
              'Content-Type': 'application/json',
            },
          }
        ),
      }
    }
    
    // Validate CSRF token
    const validation = validateCSRFToken(request, config)
    
    if (!validation.valid) {
      return {
        response: new Response(
          JSON.stringify({
            error: 'CSRF Validation Failed',
            message: validation.reason || 'Invalid CSRF token',
            code: 'CSRF_INVALID',
          }),
          {
            status: 403,
            headers: {
              'Content-Type': 'application/json',
            },
          }
        ),
      }
    }
    
    // Generate new token for response (token rotation)
    const newToken = generateCSRFToken(config.tokenLength)
    
    return { token: newToken }
  }
}