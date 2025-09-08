import AdminLayout from './layout'
import { Card, CardContent, CardHeader, CardTitle } from '~/components/ui/card'
import { Button } from '~/components/ui/button'
import { FileText, CheckCircle, Tag, Image, TrendingUp } from 'lucide-react'

interface DashboardStatsProps {
  title: string
  value: number
  icon: React.ReactNode
  trend?: string
}

function DashboardStats({ title, value, icon, trend }: DashboardStatsProps) {
  return (
    <Card>
      <CardContent className="p-6">
        <div className="flex items-center">
          <div className="flex-shrink-0">
            {icon}
          </div>
          <div className="ml-5 w-0 flex-1">
            <dl>
              <dt className="text-sm font-medium text-muted-foreground truncate">{title}</dt>
              <dd className="text-lg font-medium">{value}</dd>
            </dl>
          </div>
        </div>
        {trend && (
          <div className="mt-2 flex items-center">
            <TrendingUp className="h-4 w-4 text-green-500 mr-1" />
            <span className="text-sm text-green-600">{trend}</span>
          </div>
        )}
      </CardContent>
    </Card>
  )
}

interface RecentActivityItem {
  id: string
  type: 'post' | 'tag' | 'media'
  title: string
  user: string
  time: string
}

function RecentActivity() {
  // Mock data - in real implementation this would come from the database
  const activities: RecentActivityItem[] = [
    {
      id: '1',
      type: 'post',
      title: 'Getting Started with TanCMS',
      user: 'Admin User',
      time: '2 hours ago'
    },
    {
      id: '2',
      type: 'tag',
      title: 'Created tag "Technology"',
      user: 'Admin User',
      time: '4 hours ago'
    },
    {
      id: '3',
      type: 'media',
      title: 'Uploaded banner.jpg',
      user: 'Admin User',
      time: '1 day ago'
    }
  ]

  const getActivityIcon = (type: string) => {
    switch (type) {
      case 'post':
        return <FileText className="h-5 w-5 text-blue-500" />
      case 'tag':
        return <Tag className="h-5 w-5 text-green-500" />
      case 'media':
        return <Image className="h-5 w-5 text-purple-500" />
      default:
        return <FileText className="h-5 w-5 text-gray-500" />
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Recent Activity</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flow-root">
          <ul className="-my-5 divide-y divide-gray-200">
            {activities.map((activity) => (
              <li key={activity.id} className="py-4">
                <div className="flex items-center space-x-4">
                  <div className="flex-shrink-0">
                    {getActivityIcon(activity.type)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium truncate">
                      {activity.title}
                    </p>
                    <p className="text-sm text-muted-foreground">
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
  return (
    <AdminLayout>
      <div className="space-y-6">
        {/* Page Header */}
        <div>
          <h1 className="text-3xl font-bold">Dashboard</h1>
          <p className="text-muted-foreground">
            Welcome to your TanCMS admin dashboard
          </p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
          <DashboardStats
            title="Total Posts"
            value={12}
            icon={<FileText className="h-6 w-6 text-blue-400" />}
            trend="+2 this week"
          />
          <DashboardStats
            title="Published Posts"
            value={8}
            icon={<CheckCircle className="h-6 w-6 text-green-400" />}
            trend="+1 this week"
          />
          <DashboardStats
            title="Total Tags"
            value={15}
            icon={<Tag className="h-6 w-6 text-yellow-400" />}
            trend="+3 this week"
          />
          <DashboardStats
            title="Media Files"
            value={24}
            icon={<Image className="h-6 w-6 text-purple-400" />}
            trend="+5 this week"
          />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Recent Activity */}
          <RecentActivity />

          {/* Quick Actions */}
          <Card>
            <CardHeader>
              <CardTitle>Quick Actions</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <Button asChild className="w-full">
                  <a href="/admin/posts/new">
                    Create New Post
                  </a>
                </Button>
                <Button asChild variant="outline" className="w-full">
                  <a href="/admin/content-types">
                    Manage Content Types
                  </a>
                </Button>
                <Button asChild variant="outline" className="w-full">
                  <a href="/admin/tags">
                    Manage Tags
                  </a>
                </Button>
                <Button asChild variant="outline" className="w-full">
                  <a href="/admin/media">
                    Upload Media
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