import { createServerFn } from '@tanstack/start'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

export const getAnalyticsData = createServerFn(
  'GET',
  async () => {
    try {
      // Get content statistics
      const [
        totalContentTypes,
        totalEntries,
        publishedEntries,
        draftEntries,
        recentEntries,
        contentTypeStats,
        totalUsers,
        userSessions
      ] = await Promise.all([
        // Total content types
        prisma.contentType.count(),
        
        // Total content entries
        prisma.contentEntry.count(),
        
        // Published entries
        prisma.contentEntry.count({
          where: { status: 'PUBLISHED' }
        }),
        
        // Draft entries
        prisma.contentEntry.count({
          where: { status: 'DRAFT' }
        }),
        
        // Recent entries (last 7 days)
        prisma.contentEntry.count({
          where: {
            createdAt: {
              gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)
            }
          }
        }),
        
        // Content type distribution
        prisma.contentType.findMany({
          include: {
            _count: {
              select: { entries: true }
            }
          }
        }),
        
        // Total users
        prisma.user.count(),
        
        // Recent user sessions (active in last 24 hours)
        prisma.session.count({
          where: {
            createdAt: {
              gte: new Date(Date.now() - 24 * 60 * 60 * 1000)
            }
          }
        })
      ])

      // Calculate content type distribution
      const totalContentEntries = totalEntries || 1 // Avoid division by zero
      const topContentTypes = contentTypeStats
        .map(ct => ({
          name: ct.displayName || ct.name,
          count: ct._count.entries,
          percentage: Math.round((ct._count.entries / totalContentEntries) * 100)
        }))
        .sort((a, b) => b.count - a.count)
        .slice(0, 5) // Top 5 content types

      // Get recent activity
      const recentActivity = await prisma.contentEntry.findMany({
        take: 10,
        orderBy: { createdAt: 'desc' },
        include: {
          author: {
            select: { name: true, email: true }
          },
          contentType: {
            select: { displayName: true, name: true }
          }
        }
      })

      const formattedActivity = recentActivity.map(entry => ({
        id: entry.id,
        type: 'content' as const,
        description: `${entry.status === 'PUBLISHED' ? 'Published' : 'Created'} ${entry.contentType.displayName || entry.contentType.name}`,
        timestamp: formatTimeAgo(entry.createdAt),
        user: entry.author?.name || entry.author?.email || 'Unknown'
      }))

      // Calculate system metrics
      const dbStats = await prisma.$queryRaw<{ page_count: number; page_size: number }[]>`
        PRAGMA page_count;
      `
      
      const dbSizePages = Array.isArray(dbStats) && dbStats.length > 0 ? dbStats[0].page_count : 0
      const dbSizeKB = Math.round((dbSizePages * 4096) / 1024) // SQLite page size is typically 4KB

      return {
        success: true,
        data: {
          contentStats: {
            totalContentTypes,
            totalEntries,
            recentEntries,
            publishedEntries,
            draftEntries
          },
          userActivity: {
            totalUsers,
            activeUsers: userSessions, // Users with sessions in last 24h
            recentLogins: userSessions,
            avgSessionDuration: 45 // Mock value - would need session tracking
          },
          systemMetrics: {
            dbSize: dbSizeKB,
            apiCalls: 1500 + Math.floor(Math.random() * 500), // Mock value
            avgResponseTime: 80 + Math.floor(Math.random() * 50), // Mock value
            uptime: 99.5 + Math.random() * 0.5 // Mock value
          },
          topContentTypes,
          recentActivity: formattedActivity
        }
      }
    } catch (error) {
      console.error('Analytics data fetch error:', error)
      return {
        success: false,
        error: 'Failed to fetch analytics data'
      }
    }
  }
)

function formatTimeAgo(date: Date): string {
  const now = new Date()
  const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000)
  
  if (diffInSeconds < 60) {
    return 'Just now'
  } else if (diffInSeconds < 3600) {
    const minutes = Math.floor(diffInSeconds / 60)
    return `${minutes} minute${minutes === 1 ? '' : 's'} ago`
  } else if (diffInSeconds < 86400) {
    const hours = Math.floor(diffInSeconds / 3600)
    return `${hours} hour${hours === 1 ? '' : 's'} ago`
  } else {
    const days = Math.floor(diffInSeconds / 86400)
    return `${days} day${days === 1 ? '' : 's'} ago`
  }
}