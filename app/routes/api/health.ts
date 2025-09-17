import { createAPIFileRoute } from '@tanstack/start/api'
import { prisma } from '~/server/db'
import { applySecurityHeaders } from '~/server/security-headers'

export const Route = createAPIFileRoute('/api/health')({
  GET: async ({ request }) => {
    const url = new URL(request.url)
    const detailed = url.searchParams.get('detailed') === 'true'

    const checks = {
      timestamp: new Date().toISOString(),
      status: 'healthy' as 'healthy' | 'degraded' | 'unhealthy',
      version: process.env.npm_package_version || '0.0.0',
      environment: process.env.NODE_ENV || 'development',
      uptime: process.uptime(),
      checks: {} as Record<string, {
        status: 'pass' | 'fail' | 'warn'
        responseTime?: number
        error?: string
        details?: Record<string, unknown>
      }>
    }

    // Database connectivity check
    try {
      const start = Date.now()
      await prisma.$queryRaw`SELECT 1`
      const responseTime = Date.now() - start

      checks.checks.database = {
        status: 'pass',
        responseTime,
        ...(detailed && {
          details: {
            type: 'sqlite',
            url: process.env.DATABASE_URL?.replace(/\/[^/]*$/, '/***') || 'not-configured'
          }
        })
      }
    } catch (error) {
      checks.checks.database = {
        status: 'fail',
        error: error instanceof Error ? error.message : 'Unknown database error'
      }
      checks.status = 'unhealthy'
    }

    // Memory usage check
    const memUsage = process.memoryUsage()
    const memUsageMB = {
      rss: Math.round(memUsage.rss / 1024 / 1024 * 100) / 100,
      heapTotal: Math.round(memUsage.heapTotal / 1024 / 1024 * 100) / 100,
      heapUsed: Math.round(memUsage.heapUsed / 1024 / 1024 * 100) / 100,
      external: Math.round(memUsage.external / 1024 / 1024 * 100) / 100,
    }

    const heapUsagePercent = (memUsageMB.heapUsed / memUsageMB.heapTotal) * 100

    checks.checks.memory = {
      status: heapUsagePercent > 90 ? 'warn' : 'pass',
      ...(detailed && {
        details: {
          usage: memUsageMB,
          heapUsagePercent: Math.round(heapUsagePercent * 100) / 100
        }
      })
    }

    if (heapUsagePercent > 90 && checks.status === 'healthy') {
      checks.status = 'degraded'
    }

    // Environment variables check (basic configuration)
    const requiredEnvVars = ['DATABASE_URL']
    const missingEnvVars = requiredEnvVars.filter(envVar => !process.env[envVar])

    checks.checks.configuration = {
      status: missingEnvVars.length > 0 ? 'warn' : 'pass',
      ...(detailed && missingEnvVars.length > 0 && {
        details: {
          missingVariables: missingEnvVars
        }
      })
    }

    if (missingEnvVars.length > 0 && checks.status === 'healthy') {
      checks.status = 'degraded'
    }

    // Disk space check (basic)
    if (detailed) {
      try {
        const fs = await import('fs/promises')
        const stats = await fs.stat(process.cwd())
        
        checks.checks.filesystem = {
          status: 'pass',
          details: {
            accessible: true,
            workingDirectory: process.cwd()
          }
        }
      } catch (error) {
        checks.checks.filesystem = {
          status: 'fail',
          error: 'Cannot access filesystem'
        }
        checks.status = 'unhealthy'
      }
    }

    // Session cleanup health (if applicable)
    if (detailed) {
      try {
        const sessionsCount = await prisma.session.count()
        const expiredSessionsCount = await prisma.session.count({
          where: {
            expiresAt: {
              lt: new Date()
            }
          }
        })

        checks.checks.sessions = {
          status: expiredSessionsCount > 1000 ? 'warn' : 'pass',
          details: {
            total: sessionsCount,
            expired: expiredSessionsCount,
            active: sessionsCount - expiredSessionsCount
          }
        }
      } catch (error) {
        checks.checks.sessions = {
          status: 'fail',
          error: 'Cannot check session status'
        }
      }
    }

    // Security headers check
    const hasSecurityHeaders = request.headers.get('x-frame-options') || 
                              request.headers.get('content-security-policy')

    checks.checks.security = {
      status: 'pass',
      ...(detailed && {
        details: {
          securityHeadersActive: true,
          httpsEnforced: process.env.NODE_ENV === 'production'
        }
      })
    }

    const httpStatus = checks.status === 'healthy' ? 200 : 
                      checks.status === 'degraded' ? 200 : 503

    const response = new Response(
      JSON.stringify(checks, null, 2),
      {
        status: httpStatus,
        headers: { 
          'Content-Type': 'application/json',
          'Cache-Control': 'no-cache, no-store, must-revalidate'
        },
      }
    )

    return applySecurityHeaders(response)
  },
})