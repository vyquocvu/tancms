import { type ReactNode } from 'react'
import { Button } from '~/components/ui/button'
import { LayoutDashboard, FileText, Tag, Image, Database } from 'lucide-react'

interface AdminLayoutProps {
  children: ReactNode
}

export default function AdminLayout({ children }: AdminLayoutProps) {
  return (
    <div className="min-h-screen bg-background">
      {/* Admin Header */}
      <header className="border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <a href="#/" className="text-xl font-bold hover:text-primary">TanCMS Admin</a>
            </div>
            <div className="flex items-center space-x-4">
              <span className="text-sm text-muted-foreground">Welcome, Admin</span>
              <Button variant="outline" size="sm">
                Logout
              </Button>
            </div>
          </div>
        </div>
      </header>

      <div className="flex">
        {/* Sidebar Navigation */}
        <nav className="w-64 border-r bg-card h-screen sticky top-0">
          <div className="p-6">
            <ul className="space-y-2">
              <li>
                <a
                  href="#/admin"
                  className="flex items-center px-4 py-2 text-sm font-medium text-foreground rounded-md hover:bg-accent hover:text-accent-foreground"
                >
                  <LayoutDashboard className="mr-3 h-5 w-5" />
                  Dashboard
                </a>
              </li>
              <li>
                <a
                  href="#/admin/posts"
                  className="flex items-center px-4 py-2 text-sm font-medium text-foreground rounded-md hover:bg-accent hover:text-accent-foreground"
                >
                  <FileText className="mr-3 h-5 w-5" />
                  Posts
                </a>
              </li>
              <li>
                <a
                  href="#/admin/content-types"
                  className="flex items-center px-4 py-2 text-sm font-medium text-foreground rounded-md hover:bg-accent hover:text-accent-foreground"
                >
                  <Database className="mr-3 h-5 w-5" />
                  Content Types
                </a>
              </li>
              <li>
                <a
                  href="#/admin/tags"
                  className="flex items-center px-4 py-2 text-sm font-medium text-foreground rounded-md hover:bg-accent hover:text-accent-foreground"
                >
                  <Tag className="mr-3 h-5 w-5" />
                  Tags
                </a>
              </li>
              <li>
                <a
                  href="#/admin/media"
                  className="flex items-center px-4 py-2 text-sm font-medium text-foreground rounded-md hover:bg-accent hover:text-accent-foreground"
                >
                  <Image className="mr-3 h-5 w-5" />
                  Media
                </a>
              </li>
            </ul>
          </div>
        </nav>

        {/* Main Content */}
        <main className="flex-1 p-8">
          {children}
        </main>
      </div>
    </div>
  )
}