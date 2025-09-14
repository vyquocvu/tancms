import { getSessionUser } from './auth'
import type { AuthUser } from './auth'

/**
 * Middleware to check if user is authenticated via session
 */
export async function requireAuth(request: Request): Promise<{ user: AuthUser } | { error: string; status: number }> {
  const cookieHeader = request.headers.get('cookie')
  if (!cookieHeader) {
    return { error: 'Authentication required', status: 401 }
  }

  const cookies = cookieHeader.split(';').reduce((acc, cookie) => {
    const [key, value] = cookie.trim().split('=')
    acc[key] = value
    return acc
  }, {} as Record<string, string>)

  const sessionId = cookies['session']
  if (!sessionId) {
    return { error: 'Authentication required', status: 401 }
  }

  const user = await getSessionUser(sessionId)
  if (!user) {
    return { error: 'Invalid or expired session', status: 401 }
  }

  return { user }
}

/**
 * Middleware to check if user has required role
 */
export async function requireRole(request: Request, requiredRole: AuthUser['role']): Promise<{ user: AuthUser } | { error: string; status: number }> {
  const authResult = await requireAuth(request)
  
  if ('error' in authResult) {
    return authResult
  }

  const roleHierarchy: Record<AuthUser['role'], number> = {
    'VIEWER': 1,
    'AUTHOR': 2,
    'EDITOR': 3,
    'ADMIN': 4
  }

  const userLevel = roleHierarchy[authResult.user.role]
  const requiredLevel = roleHierarchy[requiredRole]

  if (userLevel < requiredLevel) {
    return { 
      error: `Insufficient permissions. Required: ${requiredRole}, Current: ${authResult.user.role}`, 
      status: 403 
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

  const cookies = cookieHeader.split(';').reduce((acc, cookie) => {
    const [key, value] = cookie.trim().split('=')
    acc[key] = value
    return acc
  }, {} as Record<string, string>)

  return cookies['session'] || null
}