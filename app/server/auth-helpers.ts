import { requireAuth, requireRole } from './auth-middleware'
import type { AuthUser } from './auth'

/**
 * Higher-order function to add authentication to API route handlers
 */
export function withAuth<T extends Record<string, unknown>>(
  handler: (params: T & { user: AuthUser }) => Promise<Response>
) {
  return async (params: T & { request: Request }): Promise<Response> => {
    const authResult = await requireAuth(params.request)

    if ('error' in authResult) {
      return new Response(
        JSON.stringify({
          error: authResult.error,
        }),
        {
          status: authResult.status,
          headers: { 'Content-Type': 'application/json' },
        }
      )
    }

    return handler({ ...params, user: authResult.user })
  }
}

/**
 * Higher-order function to add role-based authentication to API route handlers
 */
export function withRole<T extends Record<string, unknown>>(
  requiredRole: AuthUser['role'],
  handler: (params: T & { user: AuthUser }) => Promise<Response>
) {
  return async (params: T & { request: Request }): Promise<Response> => {
    const authResult = await requireRole(params.request, requiredRole)

    if ('error' in authResult) {
      return new Response(
        JSON.stringify({
          error: authResult.error,
        }),
        {
          status: authResult.status,
          headers: { 'Content-Type': 'application/json' },
        }
      )
    }

    return handler({ ...params, user: authResult.user })
  }
}

/**
 * Utility function to create authenticated API responses with user context
 */
export function createAuthenticatedResponse(
  data: unknown,
  user: AuthUser,
  status = 200,
  headers: Record<string, string> = {}
): Response {
  return new Response(
    JSON.stringify({
      ...data,
      meta: {
        authenticatedUser: {
          id: user.id,
          email: user.email,
          role: user.role,
        },
        timestamp: new Date().toISOString(),
      },
    }),
    {
      status,
      headers: {
        'Content-Type': 'application/json',
        ...headers,
      },
    }
  )
}