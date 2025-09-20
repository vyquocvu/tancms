import { getSessionUser, getUserById } from './auth'
import { verifyToken, extractTokenFromHeader } from './jwt-auth'
import type { AuthUser } from './auth'

/**
 * Middleware to check if user is authenticated via session or JWT
 */
export async function requireAuth(
  request: Request
): Promise<{ user: AuthUser } | { error: string; status: number }> {
  // Try JWT authentication first
  const jwtResult = await tryJWTAuth(request)
  if (jwtResult.success) {
    return { user: jwtResult.user! }
  }

  // Fall back to session authentication
  const sessionResult = await trySessionAuth(request)
  if (sessionResult.success) {
    return { user: sessionResult.user! }
  }

  return { error: 'Authentication required', status: 401 }
}

/**
 * Try JWT authentication
 */
async function tryJWTAuth(request: Request): Promise<{ success: boolean; user?: AuthUser }> {
  const token = extractTokenFromHeader(request)
  if (!token) {
    return { success: false }
  }

  const payload = verifyToken(token)
  if (!payload) {
    return { success: false }
  }

  // Get fresh user data from database
  const user = await getUserById(payload.userId)
  if (!user) {
    return { success: false }
  }

  return { success: true, user }
}

/**
 * Try session authentication
 */
async function trySessionAuth(request: Request): Promise<{ success: boolean; user?: AuthUser }> {
  const cookieHeader = request.headers.get('cookie')
  if (!cookieHeader) {
    return { success: false }
  }

  const cookies = cookieHeader.split(';').reduce(
    (acc, cookie) => {
      const [key, value] = cookie.trim().split('=')
      acc[key] = value
      return acc
    },
    {} as Record<string, string>
  )

  const sessionId = cookies['session']
  if (!sessionId) {
    return { success: false }
  }

  const user = await getSessionUser(sessionId)
  if (!user) {
    return { success: false }
  }

  return { success: true, user }
}

/**
 * Middleware to check if user has required role
 */
export async function requireRole(
  request: Request,
  requiredRole: AuthUser['role']
): Promise<{ user: AuthUser } | { error: string; status: number }> {
  const authResult = await requireAuth(request)

  if ('error' in authResult) {
    return authResult
  }

  const roleHierarchy: Record<AuthUser['role'], number> = {
    VIEWER: 1,
    AUTHOR: 2,
    EDITOR: 3,
    ADMIN: 4,
  }

  const userLevel = roleHierarchy[authResult.user.role]
  const requiredLevel = roleHierarchy[requiredRole]

  if (userLevel < requiredLevel) {
    return {
      error: `Insufficient permissions. Required: ${requiredRole}, Current: ${authResult.user.role}`,
      status: 403,
    }
  }

  return authResult
}

/**
 * Helper to extract session ID from request headers
 */
export function getSessionIdFromRequest(request: Request): string | null {
  const cookieHeader = request.headers.get('cookie')
  if (!cookieHeader) return null

  const cookies = cookieHeader.split(';').reduce(
    (acc, cookie) => {
      const [key, value] = cookie.trim().split('=')
      acc[key] = value
      return acc
    },
    {} as Record<string, string>
  )

  return cookies['session'] || null
}
