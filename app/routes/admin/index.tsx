import AdminLayout from './layout'
import { Card, CardContent, CardHeader, CardTitle } from '~/components/ui/card'
import { Button } from '~/components/ui/button'
import { CheckCircle, Tag, Image, TrendingUp, Plus, ExternalLink } from 'lucide-react'
import { DashboardStatsSkeleton, RecentActivitySkeleton } from '~/components/ui/loading-states'
import { EmptyActivity } from '~/components/ui/empty-states'
import { useState, useEffect } from 'react'

interface DashboardStatsProps {
  title: string
  value: number
  icon: React.ReactNode
  trend?: string
  isLoading?: boolean
}

function DashboardStats({ title, value, icon, trend, isLoading = false }: DashboardStatsProps) {
  if (isLoading) {
    return (
      <div className='rounded-lg border bg-card text-card-foreground shadow-sm'>
        <div className='p-6'>
          <div className='animate-pulse'>
            <div className='flex items-center'>
              <div className='flex-shrink-0'>
                <div className='h-6 w-6 bg-muted rounded' />
              </div>
              <div className='ml-5 w-0 flex-1'>
                <div className='h-4 w-20 bg-muted rounded mb-2' />
                <div className='h-6 w-8 bg-muted rounded' />
              </div>
            </div>
            <div className='mt-2 flex items-center'>
              <div className='h-4 w-4 bg-muted rounded mr-1' />
              <div className='h-4 w-16 bg-muted rounded' />
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <Card>
      <CardContent className='p-6'>
        <div className='flex items-center'>
          <div className='flex-shrink-0'>{icon}</div>
          <div className='ml-5 w-0 flex-1'>
            <dl>
              <dt className='text-sm font-medium text-muted-foreground truncate'>{title}</dt>
              <dd className='text-lg font-medium'>{value}</dd>
            </dl>
          </div>
        </div>
        {trend && (
          <div className='mt-2 flex items-center'>
            <TrendingUp className='h-4 w-4 text-green-500 mr-1' aria-hidden='true' />
            <span className='text-sm text-green-600'>{trend}</span>
          </div>
        )}
      </CardContent>
    </Card>
  )
}

interface RecentActivityItem {
  id: string
  type: 'tag' | 'media' | 'content'
  title: string
  user: string
  time: string
}

function RecentActivity() {
  const [activities, setActivities] = useState<RecentActivityItem[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    // Simulate loading recent activity
    const loadActivity = () => {
      setTimeout(() => {
        setActivities([
          {
            id: '1',
            type: 'content',
            title: 'Created new content type',
            user: 'Admin User',
            time: '2 hours ago',
          },
          {
            id: '2',
            type: 'tag',
            title: 'Created tag "Technology"',
            user: 'Admin User',
            time: '4 hours ago',
          },
          {
            id: '3',
            type: 'media',
            title: 'Uploaded banner.jpg',
            user: 'Admin User',
            time: '1 day ago',
          },
        ])
        setIsLoading(false)
      }, 1000)
    }

    loadActivity()
  }, [])

  const getActivityIcon = (type: string) => {
    switch (type) {
      case 'content':
        return <CheckCircle className='h-5 w-5 text-blue-500' />
      case 'tag':
        return <Tag className='h-5 w-5 text-green-500' />
      case 'media':
        return <Image className='h-5 w-5 text-purple-500' />
      default:
        return <CheckCircle className='h-5 w-5 text-gray-500' />
    }
  }

  if (isLoading) {
    return <RecentActivitySkeleton />
  }

  if (activities.length === 0) {
    return <EmptyActivity />
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Recent Activity</CardTitle>
      </CardHeader>
      <CardContent>
        <div className='flow-root'>
          <ul className='-my-5 divide-y divide-border'>
            {activities.map(activity => (
              <li key={activity.id} className='py-4'>
                <div className='flex items-center space-x-4'>
                  <div className='flex-shrink-0' aria-hidden='true'>
                    {getActivityIcon(activity.type)}
                  </div>
                  <div className='flex-1 min-w-0'>
                    <p className='text-sm font-medium truncate'>{activity.title}</p>
                    <p className='text-sm text-muted-foreground'>
                      by {activity.user} • {activity.time}
                    </p>
                  </div>
                </div>
              </li>
            ))}
          </ul>
        </div>
      </CardContent>
    </Card>
  )
}

export default function AdminDashboard() {
  const [statsLoading, setStatsLoading] = useState(true)
  const [stats, setStats] = useState({
    contentTypes: 0,
    tags: 0,
    media: 0,
  })

  useEffect(() => {
    // Simulate loading stats
    const loadStats = () => {
      setTimeout(() => {
        setStats({
          contentTypes: 5,
          tags: 15,
          media: 24,
        })
        setStatsLoading(false)
      }, 800)
    }

    loadStats()
  }, [])

  return (
    <AdminLayout>
      <div className='space-y-6'>
        {/* Page Header */}
        <div>
          <h1 className='text-3xl font-bold tracking-tight'>Dashboard</h1>
          <p className='text-muted-foreground'>
            Welcome to your TanCMS admin dashboard. Manage your content, media, and settings.
          </p>
        </div>

        {/* Stats Grid */}
        {statsLoading ? (
          <DashboardStatsSkeleton />
        ) : (
          <div className='grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3'>
            <DashboardStats
              title='Content Types'
              value={stats.contentTypes}
              icon={<CheckCircle className='h-6 w-6 text-blue-400' />}
              trend='+1 this week'
            />
            <DashboardStats
              title='Total Tags'
              value={stats.tags}
              icon={<Tag className='h-6 w-6 text-yellow-400' />}
              trend='+3 this week'
            />
            <DashboardStats
              title='Media Files'
              value={stats.media}
              icon={<Image className='h-6 w-6 text-purple-400' />}
              trend='+5 this week'
            />
          </div>
        )}

        <div className='grid grid-cols-1 lg:grid-cols-2 gap-6'>
          {/* Recent Activity */}
          <RecentActivity />

          {/* Quick Actions */}
          <Card>
            <CardHeader>
              <CardTitle className='flex items-center gap-2'>
                <Plus className='h-5 w-5' aria-hidden='true' />
                Quick Actions
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className='space-y-3'>
                <Button asChild className='w-full justify-start'>
                  <a href='/admin/content-types' className='flex items-center gap-2'>
                    <Plus className='h-4 w-4' />
                    Create Content Type
                  </a>
                </Button>
                <Button asChild variant='outline' className='w-full justify-start'>
                  <a href='/admin/tags' className='flex items-center gap-2'>
                    <Tag className='h-4 w-4' />
                    Manage Tags
                  </a>
                </Button>
                <Button asChild variant='outline' className='w-full justify-start'>
                  <a href='/admin/media' className='flex items-center gap-2'>
                    <Image className='h-4 w-4' />
                    Upload Media
                  </a>
                </Button>
                <hr className='my-4' />
                <Button
                  asChild
                  variant='ghost'
                  className='w-full justify-start text-muted-foreground'
                >
                  <a href='/' className='flex items-center gap-2'>
                    <ExternalLink className='h-4 w-4' />
                    View Site
                  </a>
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </AdminLayout>
  )
}
