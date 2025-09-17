import { createAPIFileRoute } from '@tanstack/start/api'
import {
  createSession,
  deleteSession,
  getSessionUser,
  createUser,
} from '~/server/auth'
import { authenticateUserSecure, securityAudit, generateSecureToken } from '~/server/security-auth'
import { validatePasswordStrength } from '~/server/security-auth'
import { sanitizeApiInput } from '~/lib/security/sanitization'
import { applySecurityHeaders } from '~/server/security-headers'
import { z } from 'zod'

// Validation schemas
const loginSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
})

const registerSchema = z
  .object({
    email: z.string().email('Invalid email address'),
    password: z.string().min(8, 'Password must be at least 8 characters'),
    name: z.string().min(1, 'Name is required'),
    confirmPassword: z.string(),
  })
  .refine(data => data.password === data.confirmPassword, {
    message: "Passwords don't match",
    path: ['confirmPassword'],
  })
  .refine(data => {
    const validation = validatePasswordStrength(data.password)
    return validation.isValid
  }, {
    message: "Password must contain uppercase, lowercase, numbers, and special characters",
    path: ['password'],
  })

// Helper functions
function getSessionIdFromRequest(request: Request): string | null {
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

function createSessionCookie(sessionId: string): string {
  const maxAge = 30 * 24 * 60 * 60 // 30 days in seconds
  return `session=${sessionId}; Max-Age=${maxAge}; Path=/; HttpOnly; SameSite=Strict${process.env.NODE_ENV === 'production' ? '; Secure' : ''}`
}

export const Route = createAPIFileRoute('/api/auth')({
  POST: async ({ request }) => {
    const url = new URL(request.url)
    const action = url.searchParams.get('action')

    try {
      switch (action) {
        case 'login': {
          const rawBody = await request.json()
          const body = sanitizeApiInput(rawBody)
          const result = loginSchema.safeParse(body)

          if (!result.success) {
            securityAudit.log('LOGIN_ATTEMPT', request, undefined, false, {
              error: 'Validation failed',
              details: result.error.flatten(),
            })

            const response = new Response(
              JSON.stringify({
                error: 'Validation failed',
                details: result.error.flatten(),
              }),
              {
                status: 400,
                headers: { 'Content-Type': 'application/json' },
              }
            )
            return applySecurityHeaders(response)
          }

          const { email, password } = result.data
          const authResult = await authenticateUserSecure(email, password, request)

          if (!authResult.user) {
            securityAudit.log('LOGIN_ATTEMPT', request, undefined, false, {
              email,
              error: authResult.error,
            })

            const response = new Response(
              JSON.stringify({
                error: authResult.error || 'Authentication failed',
                ...(authResult.lockoutTime && { lockoutTime: authResult.lockoutTime }),
              }),
              {
                status: 401,
                headers: { 'Content-Type': 'application/json' },
              }
            )
            return applySecurityHeaders(response)
          }

          securityAudit.log('LOGIN_SUCCESS', request, authResult.user.id, true, {
            email,
            role: authResult.user.role,
          })

          const sessionId = await createSession(authResult.user.id)

          const response = new Response(
            JSON.stringify({
              user: {
                id: authResult.user.id,
                email: authResult.user.email,
                name: authResult.user.name,
                role: authResult.user.role,
              },
            }),
            {
              status: 200,
              headers: {
                'Content-Type': 'application/json',
                'Set-Cookie': createSessionCookie(sessionId),
              },
            }
          )
          return applySecurityHeaders(response)
        }

        case 'register': {
          const body = await request.json()
          const result = registerSchema.safeParse(body)

          if (!result.success) {
            return new Response(
              JSON.stringify({
                error: 'Validation failed',
                details: result.error.flatten(),
              }),
              {
                status: 400,
                headers: { 'Content-Type': 'application/json' },
              }
            )
          }

          const { email, password, name } = result.data

          try {
            // For now, only allow admin registration in development
            const role = process.env.NODE_ENV === 'development' ? 'ADMIN' : 'VIEWER'
            const user = await createUser(email, password, name, role)
            const sessionId = await createSession(user.id)

            return new Response(
              JSON.stringify({
                user: {
                  id: user.id,
                  email: user.email,
                  name: user.name,
                  role: user.role,
                },
              }),
              {
                status: 201,
                headers: {
                  'Content-Type': 'application/json',
                  'Set-Cookie': createSessionCookie(sessionId),
                },
              }
            )
          } catch (error: any) {
            if (error.code === 'P2002') {
              // Prisma unique constraint error
              return new Response(
                JSON.stringify({
                  error: 'Email already exists',
                }),
                {
                  status: 409,
                  headers: { 'Content-Type': 'application/json' },
                }
              )
            }

            return new Response(
              JSON.stringify({
                error: 'Registration failed',
              }),
              {
                status: 500,
                headers: { 'Content-Type': 'application/json' },
              }
            )
          }
        }

        case 'logout': {
          const sessionId = getSessionIdFromRequest(request)

          if (sessionId) {
            await deleteSession(sessionId)
          }

          return new Response(
            JSON.stringify({
              message: 'Logged out successfully',
            }),
            {
              status: 200,
              headers: {
                'Content-Type': 'application/json',
                'Set-Cookie': 'session=; Max-Age=0; Path=/; HttpOnly',
              },
            }
          )
        }

        default:
          return new Response(
            JSON.stringify({
              error: 'Invalid action',
            }),
            {
              status: 400,
              headers: { 'Content-Type': 'application/json' },
            }
          )
      }
    } catch (error) {
      console.error('Auth API error:', error)
      return new Response(
        JSON.stringify({
          error: 'Internal server error',
        }),
        {
          status: 500,
          headers: { 'Content-Type': 'application/json' },
        }
      )
    }
  },

  GET: async ({ request }) => {
    const url = new URL(request.url)
    const action = url.searchParams.get('action')

    if (action === 'me') {
      const sessionId = getSessionIdFromRequest(request)

      if (!sessionId) {
        return new Response(
          JSON.stringify({
            user: null,
          }),
          {
            status: 200,
            headers: { 'Content-Type': 'application/json' },
          }
        )
      }

      const user = await getSessionUser(sessionId)

      return new Response(
        JSON.stringify({
          user: user
            ? {
                id: user.id,
                email: user.email,
                name: user.name,
                role: user.role,
              }
            : null,
        }),
        {
          status: 200,
          headers: { 'Content-Type': 'application/json' },
        }
      )
    }

    return new Response(
      JSON.stringify({
        error: 'Invalid action',
      }),
      {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      }
    )
  },
})
