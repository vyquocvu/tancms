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

