import { createAPIFileRoute } from '@tanstack/start/api'
import { requireRole } from '~/server/auth-middleware'
import { securityAudit } from '~/server/security-auth'
import { applySecurityHeaders } from '~/server/security-headers'

export const Route = createAPIFileRoute('/api/security/audit')({
  GET: async ({ request }) => {
    // Require admin role for security audit access
    const authResult = await requireRole(request, 'ADMIN')

    if ('error' in authResult) {
      const response = new Response(
        JSON.stringify({
          error: authResult.error,
        }),
        {
          status: authResult.status,
          headers: { 'Content-Type': 'application/json' },
        }
      )
      return applySecurityHeaders(response)
    }

    const url = new URL(request.url)
    const action = url.searchParams.get('action')
    const limit = parseInt(url.searchParams.get('limit') || '100', 10)

    try {
      let auditData

      switch (action) {
        case 'failed-logins':
          const since = url.searchParams.get('since')
          const sinceDate = since ? new Date(since) : undefined
          auditData = securityAudit.getFailedLogins(sinceDate)
          break

        case 'user-activity':
          const userId = url.searchParams.get('userId')
          if (!userId) {
            const response = new Response(
              JSON.stringify({
                error: 'userId parameter is required for user-activity action',
              }),
              {
                status: 400,
                headers: { 'Content-Type': 'application/json' },
              }
            )
            return applySecurityHeaders(response)
          }
          auditData = securityAudit.getLogsByUser(userId, limit)
          break

        default:
          auditData = securityAudit.getRecentLogs(limit)
      }

      // Log the audit access
      securityAudit.log('AUDIT_ACCESS', request, authResult.user.id, true, {
        action: action || 'recent-logs',
        limit,
      })

      const response = new Response(
        JSON.stringify({
          data: auditData,
          total: auditData.length,
          action: action || 'recent-logs',
          timestamp: new Date().toISOString(),
        }),
        {
          status: 200,
          headers: { 'Content-Type': 'application/json' },
        }
      )

      return applySecurityHeaders(response)
    } catch (error) {
      console.error('Security audit API error:', error)

      const response = new Response(
        JSON.stringify({
          error: 'Internal server error',
        }),
        {
          status: 500,
          headers: { 'Content-Type': 'application/json' },
        }
      )

      return applySecurityHeaders(response)
    }
  },
})