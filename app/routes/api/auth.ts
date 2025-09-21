import { createAPIFileRoute } from '@tanstack/start/api'
import {
  createSession,
  deleteSession,
  getSessionUser,
  createUser,
  getUserById,
} from '~/server/auth'
import { authenticateUserSecure, securityAudit } from '~/server/security-auth'
import { validatePasswordStrength } from '~/server/security-auth'
import { sanitizeApiInput } from '~/lib/security/sanitization'
import { applySecurityHeaders } from '~/server/security-headers'
import { ApiResponseBuilder } from '~/lib/api-response'
import { 
  verifyToken, 
  extractTokenFromHeader,
  generateAccessToken,
} from '~/server/jwt-auth'
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

            const response = ApiResponseBuilder.createHttpResponse(
              ApiResponseBuilder.error({
                code: 'VALIDATION_ERROR',
                message: 'Validation failed',
                details: result.error.flatten().fieldErrors
                  ? Object.values(result.error.flatten().fieldErrors).flat()
                  : ['Invalid input data'],
              })
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

            const response = ApiResponseBuilder.createHttpResponse(
              ApiResponseBuilder.error({
                code: 'AUTHENTICATION_FAILED',
                message: authResult.error || 'Authentication failed',
                details: authResult.lockoutTime 
                  ? [`Account locked. Please try again later.`]
                  : ['Invalid email or password'],
              })
            )
            return applySecurityHeaders(response)
          }

          securityAudit.log('LOGIN_SUCCESS', request, authResult.user.id, true, {
            email,
            role: authResult.user.role,
          })

          const sessionId = await createSession(authResult.user.id)
          const accessToken = generateAccessToken(authResult.user)
          
          const responseData = {
            user: {
              id: authResult.user.id,
              email: authResult.user.email,
              name: authResult.user.name,
              role: authResult.user.role,
            },
            tokens: {
              accessToken,
              expiresIn: '1h',
            },
          }

          const response = ApiResponseBuilder.createHttpResponse(
            ApiResponseBuilder.success({
              message: 'Login successful',
              data: responseData,
            }),
            {
              'Set-Cookie': `session=${sessionId}; Max-Age=${30 * 24 * 60 * 60}; Path=/; HttpOnly; SameSite=Strict${process.env.NODE_ENV === 'production' ? '; Secure' : ''}`,
            }
          )

          return applySecurityHeaders(response)
        }

        case 'register': {
          const rawBody = await request.json()
          const body = sanitizeApiInput(rawBody)
          const result = registerSchema.safeParse(body)

          if (!result.success) {
            const response = ApiResponseBuilder.createHttpResponse(
              ApiResponseBuilder.error({
                code: 'VALIDATION_ERROR',
                message: 'Validation failed',
                details: result.error.flatten().fieldErrors
                  ? Object.values(result.error.flatten().fieldErrors).flat()
                  : ['Invalid input data'],
              })
            )
            return applySecurityHeaders(response)
          }

          const { email, password, name } = result.data

          try {
            // For now, only allow admin registration in development
            const role = process.env.NODE_ENV === 'development' ? 'ADMIN' : 'VIEWER'
            const user = await createUser(email, password, name, role)
            const sessionId = await createSession(user.id)
            const accessToken = generateAccessToken(user)
            
            const responseData = {
              user: {
                id: user.id,
                email: user.email,
                name: user.name,
                role: user.role,
              },
              tokens: {
                accessToken,
                expiresIn: '1h',
              },
            }

            const response = ApiResponseBuilder.createHttpResponse(
              ApiResponseBuilder.success({
                message: 'Registration successful',
                data: responseData,
              }),
              {
                'Set-Cookie': `session=${sessionId}; Max-Age=${30 * 24 * 60 * 60}; Path=/; HttpOnly; SameSite=Strict${process.env.NODE_ENV === 'production' ? '; Secure' : ''}`,
              }
            )

            return applySecurityHeaders(response)
          } catch (error: unknown) {
            if (error && typeof error === 'object' && 'code' in error && error.code === 'P2002') {
              // Prisma unique constraint error
              const response = ApiResponseBuilder.createHttpResponse(
                ApiResponseBuilder.error({
                  code: 'CONFLICT',
                  message: 'Email already exists',
                  details: ['An account with this email address already exists'],
                })
              )
              return applySecurityHeaders(response)
            }

            const response = ApiResponseBuilder.createHttpResponse(
              ApiResponseBuilder.internalError(error)
            )
            return applySecurityHeaders(response)
          }
        }

        case 'logout': {
          const sessionId = getSessionIdFromRequest(request)

          if (sessionId) {
            await deleteSession(sessionId)
          }

          const response = ApiResponseBuilder.createHttpResponse(
            ApiResponseBuilder.success({
              message: 'Logged out successfully',
            }),
            {
              'Set-Cookie': 'session=; Max-Age=0; Path=/; HttpOnly',
            }
          )

          return applySecurityHeaders(response)
        }

        case 'refresh': {
          const token = extractTokenFromHeader(request)
          
          if (!token) {
            const response = ApiResponseBuilder.createHttpResponse(
              ApiResponseBuilder.error({
                code: 'AUTHENTICATION_REQUIRED',
                message: 'Refresh token required',
              })
            )
            return applySecurityHeaders(response)
          }

          const payload = verifyToken(token)
          if (!payload) {
            const response = ApiResponseBuilder.createHttpResponse(
              ApiResponseBuilder.error({
                code: 'AUTHENTICATION_FAILED',
                message: 'Invalid or expired refresh token',
              })
            )
            return applySecurityHeaders(response)
          }

          // Get fresh user data
          const user = await getUserById(payload.userId)
          if (!user) {
            const response = ApiResponseBuilder.createHttpResponse(
              ApiResponseBuilder.error({
                code: 'NOT_FOUND',
                message: 'User not found',
              })
            )
            return applySecurityHeaders(response)
          }

          // Generate new access token
          const newAccessToken = generateAccessToken(user)

          const response = ApiResponseBuilder.createHttpResponse(
            ApiResponseBuilder.success({
              message: 'Token refreshed successfully',
              data: {
                accessToken: newAccessToken,
                user: {
                  id: user.id,
                  email: user.email,
                  name: user.name,
                  role: user.role,
                },
              },
            })
          )

          return applySecurityHeaders(response)
        }

        default:
          const response = ApiResponseBuilder.createHttpResponse(
            ApiResponseBuilder.error({
              code: 'BAD_REQUEST',
              message: 'Invalid action',
              details: ['Supported actions: login, register, logout, refresh'],
            })
          )
          return applySecurityHeaders(response)
      }
    } catch (error) {
      console.error('Auth API error:', error)
      const response = ApiResponseBuilder.createHttpResponse(
        ApiResponseBuilder.internalError(error)
      )
      return applySecurityHeaders(response)
    }
  },

  GET: async ({ request }) => {
    const url = new URL(request.url)
    const action = url.searchParams.get('action')

    if (action === 'me') {
      const sessionId = getSessionIdFromRequest(request)

      if (!sessionId) {
        const response = ApiResponseBuilder.createHttpResponse(
          ApiResponseBuilder.success({
            message: 'No active session',
            data: { user: null },
          })
        )
        return applySecurityHeaders(response)
      }

      const user = await getSessionUser(sessionId)

      const response = ApiResponseBuilder.createHttpResponse(
        ApiResponseBuilder.success({
          message: user ? 'User session found' : 'No user found for session',
          data: {
            user: user
              ? {
                  id: user.id,
                  email: user.email,
                  name: user.name,
                  role: user.role,
                }
              : null,
          },
        })
      )

      return applySecurityHeaders(response)
    }

    const response = ApiResponseBuilder.createHttpResponse(
      ApiResponseBuilder.error({
        code: 'BAD_REQUEST',
        message: 'Invalid action',
        details: ['Supported actions: me'],
      })
    )
    return applySecurityHeaders(response)
  },
})
