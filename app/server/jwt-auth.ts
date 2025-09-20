import jwt from 'jsonwebtoken'
import type { AuthUser } from './auth'

export interface JWTPayload {
  userId: string
  email: string
  role: AuthUser['role']
  iat?: number
  exp?: number
}

const JWT_SECRET = process.env.JWT_SECRET || process.env.AUTH_SECRET || 'fallback-secret-key'
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || '7d'
const JWT_REFRESH_EXPIRES_IN = process.env.JWT_REFRESH_EXPIRES_IN || '30d'

/**
 * Generate JWT access token for API authentication
 */
export function generateAccessToken(user: AuthUser): string {
  const payload: JWTPayload = {
    userId: user.id,
    email: user.email,
    role: user.role,
  }

  return jwt.sign(payload, JWT_SECRET, {
    expiresIn: JWT_EXPIRES_IN,
    issuer: 'tancms-api',
    audience: 'tancms-client',
  })
}

/**
 * Generate JWT refresh token for token renewal
 */
export function generateRefreshToken(user: AuthUser): string {
  const payload: JWTPayload = {
    userId: user.id,
    email: user.email,
    role: user.role,
  }

  return jwt.sign(payload, JWT_SECRET, {
    expiresIn: JWT_REFRESH_EXPIRES_IN,
    issuer: 'tancms-api',
    audience: 'tancms-client',
  })
}

/**
 * Verify and decode JWT token
 */
export function verifyToken(token: string): JWTPayload | null {
  try {
    const decoded = jwt.verify(token, JWT_SECRET, {
      issuer: 'tancms-api',
      audience: 'tancms-client',
    }) as JWTPayload

    return decoded
  } catch (error) {
    console.error('JWT verification failed:', error)
    return null
  }
}

/**
 * Extract JWT token from Authorization header
 */
export function extractTokenFromHeader(request: Request): string | null {
  const authHeader = request.headers.get('authorization')
  if (!authHeader) return null

  const parts = authHeader.split(' ')
  if (parts.length !== 2 || parts[0] !== 'Bearer') return null

  return parts[1]
}

/**
 * Create authentication response with both session and JWT
 */
export function createAuthResponse(user: AuthUser, sessionId?: string) {
  const accessToken = generateAccessToken(user)
  const refreshToken = generateRefreshToken(user)

  const response = {
    user: {
      id: user.id,
      email: user.email,
      name: user.name,
      role: user.role,
    },
    tokens: {
      accessToken,
      refreshToken,
      expiresIn: JWT_EXPIRES_IN,
    },
  }

  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
  }

  // Add session cookie if sessionId is provided (for browser clients)
  if (sessionId) {
    const maxAge = 30 * 24 * 60 * 60 // 30 days in seconds
    headers['Set-Cookie'] = `session=${sessionId}; Max-Age=${maxAge}; Path=/; HttpOnly; SameSite=Strict${process.env.NODE_ENV === 'production' ? '; Secure' : ''}`
  }

  return { response, headers }
}