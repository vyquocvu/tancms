import { type ReactNode, useState, useEffect } from 'react'
import { Button } from '~/components/ui/button'
import { LayoutDashboard, Tag, Image, Database, FileText, ChevronDown, ChevronRight, Settings, LogOut } from 'lucide-react'
import { mockApi, type ContentType } from '~/lib/mock-api'
import { useAuth } from '~/lib/auth-context'
import ProtectedRoute from '~/components/auth/protected-route'

interface AdminLayoutProps {
  children: ReactNode
}

export default function AdminLayout({ children }: AdminLayoutProps) {
  const [contentTypes, setContentTypes] = useState<ContentType[]>([])
  const [isContentTypesExpanded, setIsContentTypesExpanded] = useState(true)
  const [loading, setLoading] = useState(true)
  const { user, logout } = useAuth()

  return (
    <ProtectedRoute requiredRole="AUTHOR">
      <AdminLayoutContent 
        contentTypes={contentTypes}
        setContentTypes={setContentTypes}
        isContentTypesExpanded={isContentTypesExpanded}
        setIsContentTypesExpanded={setIsContentTypesExpanded}
        loading={loading}
        setLoading={setLoading}
        user={user}
        logout={logout}
      >
        {children}
      </AdminLayoutContent>
    </ProtectedRoute>
  )
}

interface AdminLayoutContentProps {
  children: ReactNode
  contentTypes: ContentType[]
  setContentTypes: (types: ContentType[]) => void
  isContentTypesExpanded: boolean
  setIsContentTypesExpanded: (expanded: boolean) => void
  loading: boolean
  setLoading: (loading: boolean) => void
  user: any
  logout: () => Promise<void>
}

function AdminLayoutContent({ 
  children, 
  contentTypes, 
  setContentTypes, 
  isContentTypesExpanded, 
  setIsContentTypesExpanded, 
  loading, 
  setLoading, 
  user, 
  logout 
}: AdminLayoutContentProps) {

  // Load content types for sidebar
  useEffect(() => {
    const loadContentTypes = async () => {
      try {
        const types = await mockApi.getContentTypes()
        setContentTypes(types)
      } catch (error) {
        console.error('Failed to load content types for sidebar:', error)
      } finally {
        setLoading(false)
      }
    }
    loadContentTypes()
  }, [])

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
              <span className="text-sm text-muted-foreground">Welcome, {user.name || user.email}</span>
              <Button 
                variant="outline" 
                size="sm"
                onClick={async () => {
                  await logout()
                  window.location.href = '/login'
                }}
              >
                <LogOut className="w-4 h-4 mr-2" />
                Logout
              </Button>
            </div>
          </div>
        </div>
      </header>

      <div className="flex">
        {/* Sidebar Navigation */}
        <nav className="w-64 border-r bg-card h-screen sticky top-0 overflow-y-auto">
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
                  href="#/admin/content-types"
                  className="flex items-center px-4 py-2 text-sm font-medium text-foreground rounded-md hover:bg-accent hover:text-accent-foreground"
                >
                  <Database className="mr-3 h-5 w-5" />
                  Content Types
                </a>
              </li>
              <li>
                <a
                  href="#/admin/api-manager"
                  className="flex items-center px-4 py-2 text-sm font-medium text-foreground rounded-md hover:bg-accent hover:text-accent-foreground"
                >
                  <Settings className="mr-3 h-5 w-5" />
                  API Manager
                </a>
              </li>
              
              {/* Dynamic Content Types Section */}
              {!loading && contentTypes.length > 0 && (
                <li className="mt-6">
                  <div className="px-4 py-2">
                    <button
                      onClick={() => setIsContentTypesExpanded(!isContentTypesExpanded)}
                      className="flex items-center justify-between w-full text-sm font-medium text-muted-foreground hover:text-foreground"
                    >
                      <span>Content Collections</span>
                      {isContentTypesExpanded ? (
                        <ChevronDown className="h-4 w-4" />
                      ) : (
                        <ChevronRight className="h-4 w-4" />
                      )}
                    </button>
                  </div>
                  {isContentTypesExpanded && (
                    <ul className="ml-4 mt-2 space-y-1">
                      {contentTypes.map((contentType) => (
                        <li key={contentType.id}>
                          <a
                            href={`#/admin/content-types/${contentType.slug}`}
                            className="flex items-center px-4 py-2 text-sm text-muted-foreground rounded-md hover:bg-accent hover:text-accent-foreground group"
                          >
                            <FileText className="mr-3 h-4 w-4" />
                            <span className="truncate">{contentType.displayName}</span>
                          </a>
                        </li>
                      ))}
                    </ul>
                  )}
                </li>
              )}
              
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