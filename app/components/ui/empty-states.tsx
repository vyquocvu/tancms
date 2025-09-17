import React from 'react'
import { Button } from './button'
import { Card, CardContent, CardHeader, CardTitle } from './card'
import { cn } from '~/lib/utils'
import { 
  Database, 
  Tag, 
  Image, 
  FileText, 
  Settings,
  Users,
  Search,
  Inbox
} from 'lucide-react'

interface EmptyStateProps {
  icon: React.ReactNode
  title: string
  description: string
  action?: {
    label: string
    href?: string
    onClick?: () => void
  }
  className?: string
}

export function EmptyState({ icon, title, description, action, className }: EmptyStateProps) {
  return (
    <div className={cn(
      "flex flex-col items-center justify-center text-center p-6 md:p-12",
      className
    )}>
      <div className="rounded-full bg-muted p-3 mb-4">
        {icon}
      </div>
      <h3 className="text-lg font-medium mb-2">{title}</h3>
      <p className="text-muted-foreground mb-6 max-w-md">{description}</p>
      {action && (
        <Button 
          asChild={!!action.href} 
          onClick={action.onClick}
          className="flex items-center gap-2"
        >
          {action.href ? (
            <a href={action.href}>{action.label}</a>
          ) : (
            action.label
          )}
        </Button>
      )}
    </div>
  )
}

export function EmptyContentTypes() {
  return (
    <EmptyState
      icon={<Database className="h-8 w-8 text-muted-foreground" />}
      title="No content types yet"
      description="Content types define the structure of your content. Create your first content type to get started."
      action={{
        label: "Create Content Type",
        href: "/admin/content-types"
      }}
    />
  )
}

export function EmptyTags() {
  return (
    <EmptyState
      icon={<Tag className="h-8 w-8 text-muted-foreground" />}
      title="No tags created"
      description="Tags help organize and categorize your content. Create your first tag to start organizing."
      action={{
        label: "Add Tag",
        onClick: () => {} // This would be passed from parent component
      }}
    />
  )
}

export function EmptyMedia() {
  return (
    <EmptyState
      icon={<Image className="h-8 w-8 text-muted-foreground" />}
      title="No media files"
      description="Upload images, videos, and other media files to use in your content."
      action={{
        label: "Upload Media",
        href: "/admin/media"
      }}
    />
  )
}

export function EmptyContent({ contentTypeName }: { contentTypeName: string }) {
  return (
    <EmptyState
      icon={<FileText className="h-8 w-8 text-muted-foreground" />}
      title={`No ${contentTypeName} entries`}
      description={`You haven't created any ${contentTypeName} entries yet. Create your first entry to get started.`}
      action={{
        label: `Create ${contentTypeName}`,
        onClick: () => {} // This would be passed from parent component
      }}
    />
  )
}

export function EmptySearch({ searchTerm }: { searchTerm: string }) {
  return (
    <EmptyState
      icon={<Search className="h-8 w-8 text-muted-foreground" />}
      title="No results found"
      description={`No results found for "${searchTerm}". Try adjusting your search terms or filters.`}
      className="py-8"
    />
  )
}

export function EmptyActivity() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Recent Activity</CardTitle>
      </CardHeader>
      <CardContent>
        <EmptyState
          icon={<Inbox className="h-6 w-6 text-muted-foreground" />}
          title="No recent activity"
          description="Activity will appear here as you and your team work on content."
          className="py-4"
        />
      </CardContent>
    </Card>
  )
}

interface ErrorStateProps {
  title?: string
  description?: string
  action?: {
    label: string
    onClick: () => void
  }
}

export function ErrorState({ 
  title = "Something went wrong",
  description = "We encountered an error while loading this content. Please try again.",
  action
}: ErrorStateProps) {
  return (
    <EmptyState
      icon={<Settings className="h-8 w-8 text-destructive" />}
      title={title}
      description={description}
      action={action && {
        label: action.label,
        onClick: action.onClick
      }}
      className="py-8"
    />
  )
}

export function AccessDenied() {
  return (
    <EmptyState
      icon={<Users className="h-8 w-8 text-muted-foreground" />}
      title="Access denied"
      description="You don't have permission to access this resource. Contact your administrator if you believe this is an error."
      action={{
        label: "Back to Dashboard",
        href: "/admin"
      }}
    />
  )
}