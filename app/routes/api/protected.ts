import { createAPIFileRoute } from '@tanstack/start/api'
import { withAuth, withRole, createAuthenticatedResponse } from '~/server/auth-helpers'
import { applySecurityHeaders } from '~/server/security-headers'

export const Route = createAPIFileRoute('/api/protected')({
  GET: withAuth(async ({ user }) => {
    // This route requires authentication (any role)
    const response = createAuthenticatedResponse(
      {
        message: 'This is a protected endpoint',
        userRole: user.role,
        timestamp: new Date().toISOString(),
      },
      user
    )

    return applySecurityHeaders(response)
  }),

  POST: withRole('AUTHOR', async ({ request, user }) => {
    // This route requires AUTHOR role or higher
    let body: unknown
    try {
      body = await request.json()
    } catch {
      return new Response(
        JSON.stringify({
          error: 'Invalid JSON in request body',
        }),
        {
          status: 400,
          headers: { 'Content-Type': 'application/json' },
        }
      )
    }

    const response = createAuthenticatedResponse(
      {
        message: 'Successfully created content',
        data: body,
        createdBy: user.email,
      },
      user,
      201
    )

    return applySecurityHeaders(response)
  }),
})