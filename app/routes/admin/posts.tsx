import AdminLayout from './layout'
import { Badge } from '~/components/ui/badge'
import { Button } from '~/components/ui/button'
import { Card, CardContent } from '~/components/ui/card'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '~/components/ui/table'
import { Filter, Plus, Eye, Trash2, Edit } from 'lucide-react'

interface Post {
  id: string
  title: string
  slug: string
  status: 'DRAFT' | 'PUBLISHED' | 'ARCHIVED'
  author: string
  createdAt: string
  updatedAt: string
}

function PostStatusBadge({ status }: { status: Post['status'] }) {
  const statusConfig = {
    DRAFT: { variant: 'secondary' as const, label: 'Draft' },
    PUBLISHED: { variant: 'default' as const, label: 'Published' },
    ARCHIVED: { variant: 'outline' as const, label: 'Archived' }
  }

  const config = statusConfig[status]

  return (
    <Badge variant={config.variant}>
      {config.label}
    </Badge>
  )
}

function PostsTable({ posts }: { posts: Post[] }) {
  return (
    <Card>
      <CardContent className="p-0">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Title</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Author</TableHead>
              <TableHead>Updated</TableHead>
              <TableHead>Slug</TableHead>
              <TableHead className="w-[100px]">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {posts.map((post) => (
              <TableRow key={post.id}>
                <TableCell className="font-medium">{post.title}</TableCell>
                <TableCell>
                  <PostStatusBadge status={post.status} />
                </TableCell>
                <TableCell>{post.author}</TableCell>
                <TableCell>{post.updatedAt}</TableCell>
                <TableCell className="font-mono text-xs text-muted-foreground">{post.slug}</TableCell>
                <TableCell>
                  <div className="flex items-center space-x-2">
                    <Button variant="ghost" size="icon">
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button variant="ghost" size="icon">
                      <Eye className="h-4 w-4" />
                    </Button>
                    <Button variant="ghost" size="icon">
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  )
}

export default function PostsPage() {
  // Mock data - in real implementation this would come from the database
  const posts: Post[] = [
    {
      id: '1',
      title: 'Getting Started with TanCMS',
      slug: 'getting-started-with-tancms',
      status: 'PUBLISHED',
      author: 'Admin User',
      createdAt: '2024-01-15',
      updatedAt: '2 hours ago'
    },
    {
      id: '2',
      title: 'Advanced Features and Customization',
      slug: 'advanced-features-and-customization',
      status: 'DRAFT',
      author: 'Admin User',
      createdAt: '2024-01-14',
      updatedAt: '1 day ago'
    },
    {
      id: '3',
      title: 'TanCMS Security Best Practices',
      slug: 'tancms-security-best-practices',
      status: 'PUBLISHED',
      author: 'Admin User',
      createdAt: '2024-01-13',
      updatedAt: '3 days ago'
    },
    {
      id: '4',
      title: 'Performance Optimization Guide',
      slug: 'performance-optimization-guide',
      status: 'ARCHIVED',
      author: 'Admin User',
      createdAt: '2024-01-10',
      updatedAt: '1 week ago'
    }
  ]

  return (
    <AdminLayout>
      <div className="space-y-6">
        {/* Page Header */}
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold">Posts</h1>
            <p className="text-muted-foreground">
              Manage your blog posts and articles
            </p>
          </div>
          <div className="flex space-x-3">
            <Button variant="outline">
              <Filter className="mr-2 h-4 w-4" />
              Filter
            </Button>
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              New Post
            </Button>
          </div>
        </div>

        {/* Stats Summary */}
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                    <span className="text-blue-600 text-sm font-medium">
                      {posts.length}
                    </span>
                  </div>
                </div>
                <div className="ml-5 w-0 flex-1">
                  <dl>
                    <dt className="text-sm font-medium text-muted-foreground truncate">Total Posts</dt>
                    <dd className="text-lg font-medium">{posts.length}</dd>
                  </dl>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                    <span className="text-green-600 text-sm font-medium">
                      {posts.filter(p => p.status === 'PUBLISHED').length}
                    </span>
                  </div>
                </div>
                <div className="ml-5 w-0 flex-1">
                  <dl>
                    <dt className="text-sm font-medium text-muted-foreground truncate">Published</dt>
                    <dd className="text-lg font-medium">
                      {posts.filter(p => p.status === 'PUBLISHED').length}
                    </dd>
                  </dl>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <div className="w-8 h-8 bg-yellow-100 rounded-full flex items-center justify-center">
                    <span className="text-yellow-600 text-sm font-medium">
                      {posts.filter(p => p.status === 'DRAFT').length}
                    </span>
                  </div>
                </div>
                <div className="ml-5 w-0 flex-1">
                  <dl>
                    <dt className="text-sm font-medium text-muted-foreground truncate">Drafts</dt>
                    <dd className="text-lg font-medium">
                      {posts.filter(p => p.status === 'DRAFT').length}
                    </dd>
                  </dl>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <div className="w-8 h-8 bg-gray-100 rounded-full flex items-center justify-center">
                    <span className="text-gray-600 text-sm font-medium">
                      {posts.filter(p => p.status === 'ARCHIVED').length}
                    </span>
                  </div>
                </div>
                <div className="ml-5 w-0 flex-1">
                  <dl>
                    <dt className="text-sm font-medium text-muted-foreground truncate">Archived</dt>
                    <dd className="text-lg font-medium">
                      {posts.filter(p => p.status === 'ARCHIVED').length}
                    </dd>
                  </dl>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Posts Table */}
        <PostsTable posts={posts} />

        {/* Pagination */}
        <Card>
          <CardContent className="flex items-center justify-between p-6">
            <div className="flex-1 flex justify-between sm:hidden">
              <Button variant="outline">Previous</Button>
              <Button variant="outline">Next</Button>
            </div>
            <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
              <div>
                <p className="text-sm text-muted-foreground">
                  Showing <span className="font-medium">1</span> to <span className="font-medium">{posts.length}</span> of{' '}
                  <span className="font-medium">{posts.length}</span> results
                </p>
              </div>
              <div className="flex space-x-2">
                <Button variant="outline" size="sm">Previous</Button>
                <Button variant="outline" size="sm">1</Button>
                <Button variant="outline" size="sm">Next</Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </AdminLayout>
  )
}