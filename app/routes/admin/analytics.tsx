import { useState, useEffect } from 'react'
import AdminLayout from './layout'
import { Card, CardContent, CardHeader, CardTitle } from '~/components/ui/card'
import { Button } from '~/components/ui/button'
import { Badge } from '~/components/ui/badge'
import { 
  BarChart3, 
  Users, 
  FileText, 
  Activity, 
  Download, 
  Calendar,
  TrendingUp,
  Database,
  Eye,
  Clock
} from 'lucide-react'

interface AnalyticsData {
  contentStats: {
    totalContentTypes: number
    totalEntries: number
    recentEntries: number
    publishedEntries: number
    draftEntries: number
  }
  userActivity: {
    totalUsers: number
    activeUsers: number
    recentLogins: number
    avgSessionDuration: number
  }
  systemMetrics: {
    dbSize: number
    apiCalls: number
    avgResponseTime: number
    uptime: number
  }
  topContentTypes: Array<{
    name: string
    count: number
    percentage: number
  }>
  recentActivity: Array<{
    id: string
    type: 'content' | 'user' | 'system'
    description: string
    timestamp: string
    user?: string
  }>
}

function MetricCard({ 
  title, 
  value, 
  icon, 
  trend, 
  subtitle,
  isLoading = false 
}: {
  title: string
  value: string | number
  icon: React.ReactNode
  trend?: string
  subtitle?: string
  isLoading?: boolean
}) {
  if (isLoading) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="animate-pulse">
            <div className="flex items-center">
              <div className="h-8 w-8 bg-muted rounded mr-4" />
              <div>
                <div className="h-4 w-20 bg-muted rounded mb-2" />
                <div className="h-6 w-12 bg-muted rounded" />
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardContent className="p-6">
        <div className="flex items-center">
          <div className="flex-shrink-0 mr-4">
            {icon}
          </div>
          <div className="flex-1">
            <p className="text-sm font-medium text-muted-foreground">{title}</p>
            <p className="text-2xl font-bold">{value}</p>
            {subtitle && <p className="text-xs text-muted-foreground">{subtitle}</p>}
            {trend && (
              <div className="flex items-center mt-1">
                <TrendingUp className="h-3 w-3 text-green-500 mr-1" />
                <span className="text-xs text-green-600">{trend}</span>
              </div>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

function ContentStatsChart({ data }: { data: AnalyticsData['topContentTypes'] }) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <BarChart3 className="h-5 w-5" />
          Content Distribution
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {data.map((item, index) => (
            <div key={index} className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-3 h-3 rounded-full bg-primary opacity-80" 
                     style={{ opacity: 1 - (index * 0.2) }} />
                <span className="text-sm font-medium">{item.name}</span>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-24 bg-muted rounded-full h-2">
                  <div 
                    className="bg-primary h-2 rounded-full transition-all duration-300"
                    style={{ width: `${item.percentage}%` }}
                  />
                </div>
                <span className="text-sm text-muted-foreground min-w-[2rem] text-right">
                  {item.count}
                </span>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}

function RecentActivityList({ activities }: { activities: AnalyticsData['recentActivity'] }) {
  const getActivityIcon = (type: string) => {
    switch (type) {
      case 'content':
        return <FileText className="h-4 w-4 text-blue-500" />
      case 'user':
        return <Users className="h-4 w-4 text-green-500" />
      case 'system':
        return <Activity className="h-4 w-4 text-orange-500" />
      default:
        return <Activity className="h-4 w-4 text-gray-500" />
    }
  }

  const getActivityBadgeColor = (type: string) => {
    switch (type) {
      case 'content':
        return 'bg-blue-100 text-blue-800'
      case 'user':
        return 'bg-green-100 text-green-800'
      case 'system':
        return 'bg-orange-100 text-orange-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Clock className="h-5 w-5" />
          Recent Activity
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {activities.map((activity) => (
            <div key={activity.id} className="flex items-start gap-3">
              <div className="flex-shrink-0 mt-1">
                {getActivityIcon(activity.type)}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium">{activity.description}</p>
                <div className="flex items-center gap-2 mt-1">
                  <Badge variant="secondary" className={`text-xs ${getActivityBadgeColor(activity.type)}`}>
                    {activity.type}
                  </Badge>
                  {activity.user && (
                    <span className="text-xs text-muted-foreground">by {activity.user}</span>
                  )}
                  <span className="text-xs text-muted-foreground">{activity.timestamp}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}

function ExportSection() {
  const [isExporting, setIsExporting] = useState(false)

  const handleExport = async (format: 'csv' | 'json') => {
    setIsExporting(true)
    try {
      // Simulate export process
      await new Promise(resolve => setTimeout(resolve, 1000))
      
      // In a real implementation, this would call an API endpoint
      const data = {
        exportDate: new Date().toISOString(),
        format,
        // Include analytics data here
      }
      
      const blob = new Blob([JSON.stringify(data, null, 2)], { 
        type: format === 'csv' ? 'text/csv' : 'application/json' 
      })
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `analytics-${Date.now()}.${format}`
      document.body.appendChild(a)
      a.click()
      document.body.removeChild(a)
      URL.revokeObjectURL(url)
    } catch (error) {
      console.error('Export failed:', error)
    } finally {
      setIsExporting(false)
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Download className="h-5 w-5" />
          Export Analytics
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <p className="text-sm text-muted-foreground">
            Download your analytics data for external reporting and analysis.
          </p>
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => handleExport('csv')}
              disabled={isExporting}
              className="flex items-center gap-2"
            >
              <Download className="h-4 w-4" />
              Export CSV
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => handleExport('json')}
              disabled={isExporting}
              className="flex items-center gap-2"
            >
              <Download className="h-4 w-4" />
              Export JSON
            </Button>
          </div>
          {isExporting && (
            <p className="text-xs text-muted-foreground">Preparing export...</p>
          )}
        </div>
      </CardContent>
    </Card>
  )
}

export default function AnalyticsDashboard() {
  const [analyticsData, setAnalyticsData] = useState<AnalyticsData | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const loadAnalyticsData = async () => {
      try {
        // For now, use mock data since server functions have compatibility issues
        // In a production environment, this would fetch from a proper API endpoint
        await new Promise(resolve => setTimeout(resolve, 800)) // Simulate loading
        
        const mockData: AnalyticsData = {
          contentStats: {
            totalContentTypes: 5,
            totalEntries: 42,
            recentEntries: 8,
            publishedEntries: 35,
            draftEntries: 7
          },
          userActivity: {
            totalUsers: 12,
            activeUsers: 8,
            recentLogins: 23,
            avgSessionDuration: 45
          },
          systemMetrics: {
            dbSize: 125,
            apiCalls: 1847,
            avgResponseTime: 120,
            uptime: 99.8
          },
          topContentTypes: [
            { name: 'Blog Posts', count: 24, percentage: 57 },
            { name: 'Pages', count: 12, percentage: 29 },
            { name: 'Products', count: 6, percentage: 14 }
          ],
          recentActivity: [
            {
              id: '1',
              type: 'content',
              description: 'New blog post published',
              timestamp: '2 hours ago',
              user: 'John Doe'
            },
            {
              id: '2',
              type: 'user',
              description: 'User logged in',
              timestamp: '3 hours ago',
              user: 'Jane Smith'
            },
            {
              id: '3',
              type: 'system',
              description: 'Database backup completed',
              timestamp: '6 hours ago'
            },
            {
              id: '4',
              type: 'content',
              description: 'Page updated',
              timestamp: '1 day ago',
              user: 'Bob Wilson'
            }
          ]
        }
        
        setAnalyticsData(mockData)
      } catch (error) {
        console.error('Failed to load analytics data:', error)
        // Show basic mock data on error
        setAnalyticsData({
          contentStats: {
            totalContentTypes: 0,
            totalEntries: 0,
            recentEntries: 0,
            publishedEntries: 0,
            draftEntries: 0
          },
          userActivity: {
            totalUsers: 0,
            activeUsers: 0,
            recentLogins: 0,
            avgSessionDuration: 0
          },
          systemMetrics: {
            dbSize: 0,
            apiCalls: 0,
            avgResponseTime: 0,
            uptime: 0
          },
          topContentTypes: [],
          recentActivity: []
        })
      } finally {
        setIsLoading(false)
      }
    }

    loadAnalyticsData()
  }, [])

  return (
    <AdminLayout>
      <div className="space-y-6">
        {/* Page Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Analytics Dashboard</h1>
            <p className="text-muted-foreground">
              Track your content performance and user activity.
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Calendar className="h-4 w-4 text-muted-foreground" />
            <span className="text-sm text-muted-foreground">Last 30 days</span>
          </div>
        </div>

        {/* Key Metrics Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <MetricCard
            title="Total Content"
            value={analyticsData?.contentStats.totalEntries || 0}
            icon={<FileText className="h-8 w-8 text-blue-500" />}
            trend="+8 this week"
            subtitle="across all types"
            isLoading={isLoading}
          />
          <MetricCard
            title="Active Users"
            value={analyticsData?.userActivity.activeUsers || 0}
            icon={<Users className="h-8 w-8 text-green-500" />}
            trend="+2 this week"
            subtitle="last 30 days"
            isLoading={isLoading}
          />
          <MetricCard
            title="Page Views"
            value="2.4k"
            icon={<Eye className="h-8 w-8 text-purple-500" />}
            trend="+15% this month"
            subtitle="unique visitors"
            isLoading={isLoading}
          />
          <MetricCard
            title="System Uptime"
            value={analyticsData ? `${analyticsData.systemMetrics.uptime}%` : '0%'}
            icon={<Activity className="h-8 w-8 text-orange-500" />}
            subtitle="last 30 days"
            isLoading={isLoading}
          />
        </div>

        {/* Content and Activity Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Content Distribution */}
          {analyticsData && (
            <ContentStatsChart data={analyticsData.topContentTypes} />
          )}

          {/* Recent Activity */}
          {analyticsData && (
            <RecentActivityList activities={analyticsData.recentActivity} />
          )}
        </div>

        {/* Additional Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <MetricCard
            title="Published Content"
            value={analyticsData?.contentStats.publishedEntries || 0}
            icon={<FileText className="h-6 w-6 text-green-500" />}
            subtitle="live content"
            isLoading={isLoading}
          />
          <MetricCard
            title="Draft Content"
            value={analyticsData?.contentStats.draftEntries || 0}
            icon={<FileText className="h-6 w-6 text-yellow-500" />}
            subtitle="pending review"
            isLoading={isLoading}
          />
          <MetricCard
            title="API Calls"
            value={analyticsData?.systemMetrics.apiCalls || 0}
            icon={<Database className="h-6 w-6 text-blue-500" />}
            trend="+120 today"
            subtitle="this month"
            isLoading={isLoading}
          />
        </div>

        {/* Export Section */}
        <ExportSection />
      </div>
    </AdminLayout>
  )
}