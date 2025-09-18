import { type ReactNode, useState, useEffect } from 'react'
import { Button } from '~/components/ui/button'
import {
  LayoutDashboard,
  Tag,
  Image,
  Database,
  FileText,
  ChevronDown,
  ChevronRight,
  Settings,
  LogOut,
  Menu,
  X,
  Activity,
  BarChart3,
} from 'lucide-react'
import { mockApi, type ContentType } from '~/lib/mock-api'
import { useAuth } from '~/lib/auth-context'
import ProtectedRoute from '~/components/auth/protected-route'
import { ToastProvider, setToastRef, useToast } from '~/components/ui/toast'
import { cn } from '~/lib/utils'
import type { AuthUser } from '~/server/auth'

interface AdminLayoutProps {
  children: ReactNode
}

export default function AdminLayout({ children }: AdminLayoutProps) {
  const [contentTypes, setContentTypes] = useState<ContentType[]>([])
  const [isContentTypesExpanded, setIsContentTypesExpanded] = useState(true)
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  const [loading, setLoading] = useState(true)
  const { user, logout } = useAuth()

  return (
    <ProtectedRoute requiredRole='AUTHOR'>
      <ToastProvider>
        <AdminLayoutContent
          contentTypes={contentTypes}
          setContentTypes={setContentTypes}
          isContentTypesExpanded={isContentTypesExpanded}
          setIsContentTypesExpanded={setIsContentTypesExpanded}
          isMobileMenuOpen={isMobileMenuOpen}
          setIsMobileMenuOpen={setIsMobileMenuOpen}
          loading={loading}
          setLoading={setLoading}
          user={user}
          logout={logout}
        >
          {children}
        </AdminLayoutContent>
      </ToastProvider>
    </ProtectedRoute>
  )
}

interface AdminLayoutContentProps {
  children: ReactNode
  contentTypes: ContentType[]
  setContentTypes: (types: ContentType[]) => void
  isContentTypesExpanded: boolean
  setIsContentTypesExpanded: (expanded: boolean) => void
  isMobileMenuOpen: boolean
  setIsMobileMenuOpen: (open: boolean) => void
  loading: boolean
  setLoading: (loading: boolean) => void
  user: AuthUser | null
  logout: () => Promise<void>
}

function AdminLayoutContent({
  children,
  contentTypes,
  setContentTypes,
  isContentTypesExpanded,
  setIsContentTypesExpanded,
  isMobileMenuOpen,
  setIsMobileMenuOpen,
  loading,
  setLoading,
  user,
  logout,
}: AdminLayoutContentProps) {
  const toastContext = useToast()

  // Load content types for sidebar
  useEffect(() => {
    const loadContentTypes = async () => {
      try {
        const types = await mockApi.getContentTypes()
        setContentTypes(types)
      } catch (_error) {
        console.error('Failed to load content types for sidebar:', _error)
        toastContext.showError(
          'Failed to load content types',
          'Please refresh the page to try again.'
        )
      } finally {
        setLoading(false)
      }
    }
    loadContentTypes()
  }, [setContentTypes, setLoading, toastContext])

  // Set global toast ref for use in other components
  useEffect(() => {
    setToastRef(toastContext)
  }, [toastContext])

  // Close mobile menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as Element
      const sidebar = document.getElementById('mobile-sidebar')
      const menuButton = document.getElementById('mobile-menu-button')

      if (
        isMobileMenuOpen &&
        sidebar &&
        !sidebar.contains(target) &&
        !menuButton?.contains(target)
      ) {
        setIsMobileMenuOpen(false)
      }
    }

    if (isMobileMenuOpen) {
      document.addEventListener('mousedown', handleClickOutside)
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [isMobileMenuOpen, setIsMobileMenuOpen])

  // Handle keyboard navigation
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape' && isMobileMenuOpen) {
        setIsMobileMenuOpen(false)
      }
    }

    document.addEventListener('keydown', handleKeyDown)
    return () => document.removeEventListener('keydown', handleKeyDown)
  }, [isMobileMenuOpen, setIsMobileMenuOpen])

  return (
    <div className='min-h-screen bg-background'>
      {/* Skip to main content link */}
      <a href="#main-content" className="skip-link">
        Skip to main content
      </a>
      
      {/* Admin Header */}
      <header className='border-b bg-card/50 backdrop-blur supports-[backdrop-filter]:bg-card/50'>
        <div className='max-w-7xl mx-auto px-4 sm:px-6 lg:px-8'>
          <div className='flex justify-between items-center h-16'>
            <div className='flex items-center gap-4'>
              {/* Mobile menu button */}
              <button
                id='mobile-menu-button'
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                className='md:hidden p-2 rounded-md hover:bg-accent hover:text-accent-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2'
                aria-expanded={isMobileMenuOpen}
                aria-controls='mobile-sidebar'
                aria-label='Toggle navigation menu'
              >
                {isMobileMenuOpen ? <X className='h-5 w-5' /> : <Menu className='h-5 w-5' />}
              </button>

              <a
                href='#/'
                className='text-xl font-bold hover:text-primary transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 rounded-md px-2 py-1'
              >
                TanCMS Admin
              </a>
            </div>
            <div className='flex items-center space-x-4'>
              <span className='text-sm text-muted-foreground hidden sm:block'>
                Welcome, {user?.name || user?.email || 'User'}
              </span>
              <Button
                variant='outline'
                size='sm'
                onClick={async () => {
                  try {
                    await logout()
                    window.location.href = '/login'
                  } catch (error) {
                    toastContext.showError('Logout failed', 'Please try again.')
                  }
                }}
                className='flex items-center gap-2'
              >
                <LogOut className='w-4 h-4' />
                <span className='hidden sm:inline'>Logout</span>
              </Button>
            </div>
          </div>
        </div>
      </header>

      <div className='flex'>
        {/* Mobile sidebar backdrop */}
        {isMobileMenuOpen && (
          <div
            className='fixed inset-0 z-40 bg-black/50 backdrop-blur-sm md:hidden'
            aria-hidden='true'
          />
        )}

        {/* Sidebar Navigation */}
        <nav
          id='mobile-sidebar'
          className={cn(
            'w-64 border-r bg-card h-screen sticky top-0 overflow-y-auto transition-transform duration-200 ease-in-out z-50',
            'md:translate-x-0',
            isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'
          )}
          aria-label='Main navigation'
        >
          <div className='p-6'>
            <ul className='space-y-2 nav-accessible' role='menubar'>
              <li role='none'>
                <a
                  href='#/admin'
                  className='flex items-center px-4 py-2 text-sm font-medium text-foreground rounded-md hover:bg-accent hover:text-accent-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 transition-colors'
                  role='menuitem'
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  <LayoutDashboard className='mr-3 h-5 w-5' aria-hidden='true' />
                  Dashboard
                </a>
              </li>
              <li role='none'>
                <a
                  href='#/admin/content-types'
                  className='flex items-center px-4 py-2 text-sm font-medium text-foreground rounded-md hover:bg-accent hover:text-accent-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 transition-colors'
                  role='menuitem'
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  <Database className='mr-3 h-5 w-5' aria-hidden='true' />
                  Content Types
                </a>
              </li>
              <li role='none'>
                <a
                  href='#/admin/api-manager'
                  className='flex items-center px-4 py-2 text-sm font-medium text-foreground rounded-md hover:bg-accent hover:text-accent-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 transition-colors'
                  role='menuitem'
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  <Settings className='mr-3 h-5 w-5' aria-hidden='true' />
                  API Manager
                </a>
              </li>
              <li role='none'>
                <a
                  href='#/admin/analytics'
                  className='flex items-center px-4 py-2 text-sm font-medium text-foreground rounded-md hover:bg-accent hover:text-accent-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 transition-colors'
                  role='menuitem'
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  <BarChart3 className='mr-3 h-5 w-5' aria-hidden='true' />
                  Analytics
                </a>
              </li>
              <li role='none'>
                <a
                  href='#/admin/health'
                  className='flex items-center px-4 py-2 text-sm font-medium text-foreground rounded-md hover:bg-accent hover:text-accent-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 transition-colors'
                  role='menuitem'
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  <Activity className='mr-3 h-5 w-5' aria-hidden='true' />
                  Health Monitor
                </a>
              </li>

              {/* Dynamic Content Types Section */}
              {!loading && contentTypes.length > 0 && (
                <li className='mt-6' role='none'>
                  <div className='px-4 py-2'>
                    <button
                      onClick={() => setIsContentTypesExpanded(!isContentTypesExpanded)}
                      className='flex items-center justify-between w-full text-sm font-medium text-muted-foreground hover:text-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 rounded-md transition-colors'
                      aria-expanded={isContentTypesExpanded}
                      aria-controls='content-types-submenu'
                      aria-label='Toggle content types menu'
                    >
                      <span>Content Collections</span>
                      {isContentTypesExpanded ? (
                        <ChevronDown className='h-4 w-4' aria-hidden='true' />
                      ) : (
                        <ChevronRight className='h-4 w-4' aria-hidden='true' />
                      )}
                    </button>
                  </div>
                  {isContentTypesExpanded && (
                    <ul
                      id='content-types-submenu'
                      className='ml-4 mt-2 space-y-1'
                      role='menu'
                      aria-label='Content types'
                    >
                      {contentTypes.map(contentType => (
                        <li key={contentType.id} role='none'>
                          <a
                            href={`#/admin/content-types/${contentType.slug}`}
                            className='flex items-center px-4 py-2 text-sm text-muted-foreground rounded-md hover:bg-accent hover:text-accent-foreground group focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 transition-colors'
                            role='menuitem'
                            onClick={() => setIsMobileMenuOpen(false)}
                          >
                            <FileText className='mr-3 h-4 w-4' aria-hidden='true' />
                            <span className='truncate'>{contentType.displayName}</span>
                          </a>
                        </li>
                      ))}
                    </ul>
                  )}
                </li>
              )}

              <li role='none'>
                <a
                  href='#/admin/tags'
                  className='flex items-center px-4 py-2 text-sm font-medium text-foreground rounded-md hover:bg-accent hover:text-accent-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 transition-colors'
                  role='menuitem'
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  <Tag className='mr-3 h-5 w-5' aria-hidden='true' />
                  Tags
                </a>
              </li>
              <li role='none'>
                <a
                  href='#/admin/media'
                  className='flex items-center px-4 py-2 text-sm font-medium text-foreground rounded-md hover:bg-accent hover:text-accent-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 transition-colors'
                  role='menuitem'
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  <Image className='mr-3 h-5 w-5' aria-hidden='true' />
                  Media
                </a>
              </li>
            </ul>
          </div>
        </nav>

        {/* Main Content */}
        <main id="main-content" className='flex-1 p-4 md:p-8 max-w-full' tabIndex={-1}>
          {children}
        </main>
      </div>
    </div>
  )
}
