import React from 'react'
import { cn } from '~/lib/utils'

interface MobileLayoutProps {
  children: React.ReactNode
  className?: string
  showSidebar?: boolean
  onSidebarToggle?: () => void
  sidebarContent?: React.ReactNode
  header?: React.ReactNode
}

/**
 * Mobile-optimized layout component for TanCMS
 * Provides responsive behavior and touch-friendly interactions
 */
export function MobileLayout({
  children,
  className,
  showSidebar = false,
  onSidebarToggle,
  sidebarContent,
  header,
}: MobileLayoutProps) {
  return (
    <div className={cn('min-h-screen bg-background', className)}>
      {/* Mobile Header */}
      {header && (
        <header className='sticky top-0 z-40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 border-b'>
          <div className='container flex h-14 items-center px-4 sm:px-6'>
            {header}
          </div>
        </header>
      )}

      <div className='flex min-h-screen'>
        {/* Mobile Sidebar Backdrop */}
        {showSidebar && (
          <div
            className='fixed inset-0 z-40 bg-black/50 backdrop-blur-sm md:hidden'
            onClick={onSidebarToggle}
            aria-hidden='true'
          />
        )}

        {/* Sidebar */}
        {sidebarContent && (
          <aside
            className={cn(
              'fixed inset-y-0 left-0 z-50 w-72 transform bg-background border-r transition-transform duration-200 ease-in-out md:relative md:translate-x-0',
              showSidebar ? 'translate-x-0' : '-translate-x-full'
            )}
          >
            <div className='flex h-full flex-col overflow-y-auto px-4 py-4'>
              {sidebarContent}
            </div>
          </aside>
        )}

        {/* Main Content */}
        <main className='flex-1 overflow-x-hidden'>
          <div className='container px-4 py-4 sm:px-6 sm:py-6 md:px-8 md:py-8'>
            {children}
          </div>
        </main>
      </div>
    </div>
  )
}

interface MobileCardProps {
  children: React.ReactNode
  className?: string
  onClick?: () => void
  selected?: boolean
  showSelection?: boolean
  onSelectionChange?: (selected: boolean) => void
}

/**
 * Mobile-optimized card component for displaying data
 */
export function MobileCard({
  children,
  className,
  onClick,
  selected = false,
  showSelection = false,
  onSelectionChange,
}: MobileCardProps) {
  return (
    <div
      className={cn(
        'rounded-lg border bg-card p-4 space-y-3 transition-colors',
        onClick && 'cursor-pointer hover:bg-muted/50',
        selected && 'border-primary bg-muted/50',
        className
      )}
      onClick={onClick}
    >
      {showSelection && (
        <div className='flex items-center space-x-2 pb-2 border-b'>
          <input
            type='checkbox'
            checked={selected}
            onChange={e => {
              e.stopPropagation()
              onSelectionChange?.(e.target.checked)
            }}
            className='w-4 h-4 rounded'
            aria-label='Select item'
          />
          <span className='text-sm text-muted-foreground'>Select item</span>
        </div>
      )}
      {children}
    </div>
  )
}

interface MobileCardFieldProps {
  label: string
  value: React.ReactNode
  isPrimary?: boolean
}

/**
 * Mobile card field component for consistent data display
 */
export function MobileCardField({ label, value, isPrimary = false }: MobileCardFieldProps) {
  if (!value && value !== 0) return null

  return (
    <div className={cn('flex flex-col space-y-1', isPrimary && 'pb-2')}>
      <div className='text-xs font-medium text-muted-foreground uppercase tracking-wide'>
        {label}
      </div>
      <div
        className={cn(
          'text-sm',
          isPrimary && 'font-medium text-foreground text-base'
        )}
      >
        {value}
      </div>
    </div>
  )
}

interface MobileNavItemProps {
  children: React.ReactNode
  href?: string
  onClick?: () => void
  icon?: React.ReactNode
  active?: boolean
  className?: string
}

/**
 * Mobile-optimized navigation item with touch-friendly sizing
 */
export function MobileNavItem({
  children,
  href,
  onClick,
  icon,
  active = false,
  className,
}: MobileNavItemProps) {
  const baseClasses = cn(
    'flex items-center px-3 py-3 sm:px-4 sm:py-2 text-sm font-medium rounded-md transition-colors min-h-[48px] sm:min-h-[auto]',
    'hover:bg-accent hover:text-accent-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2',
    active && 'bg-accent text-accent-foreground',
    className
  )

  const content = (
    <>
      {icon && <span className='mr-3' aria-hidden='true'>{icon}</span>}
      {children}
    </>
  )

  if (href) {
    return (
      <a href={href} className={baseClasses} onClick={onClick}>
        {content}
      </a>
    )
  }

  return (
    <button className={baseClasses} onClick={onClick}>
      {content}
    </button>
  )
}

interface MobileTouchTargetProps {
  children: React.ReactNode
  className?: string
  onClick?: () => void
  disabled?: boolean
}

/**
 * Ensures minimum touch target size for mobile accessibility
 */
export function MobileTouchTarget({
  children,
  className,
  onClick,
  disabled = false,
}: MobileTouchTargetProps) {
  return (
    <button
      className={cn(
        'inline-flex items-center justify-center min-h-touch min-w-touch p-2 rounded-md transition-colors',
        'hover:bg-accent hover:text-accent-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2',
        'disabled:pointer-events-none disabled:opacity-50',
        className
      )}
      onClick={onClick}
      disabled={disabled}
    >
      {children}
    </button>
  )
}

export {
  MobileLayout as default,
  MobileCard,
  MobileCardField,
  MobileNavItem,
  MobileTouchTarget,
}