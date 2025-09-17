/**
 * Content Preview Modal Component
 * Provides a read-only view of content with proper formatting
 */

import { X, Eye, ExternalLink } from 'lucide-react'
import { Button } from './button'
import { Card, CardContent, CardHeader, CardTitle } from './card'
import { Badge } from './badge'
import { formatFieldValue, getFieldTypeLabel } from '~/lib/formatters'
import type { ContentType, ContentField, ContentStatus } from '~/lib/mock-api'

interface ContentPreviewProps {
  isOpen: boolean
  onClose: () => void
  contentType: ContentType
  formData: Record<string, string>
  slug?: string
  status?: ContentStatus
  scheduledAt?: string
  mode?: 'modal' | 'side-by-side'
}

export function ContentPreview({
  isOpen,
  onClose,
  contentType,
  formData,
  slug,
  status = 'DRAFT',
  scheduledAt,
  mode = 'modal',
}: ContentPreviewProps) {
  if (!isOpen) return null

  const getStatusBadge = (status: ContentStatus) => {
    const statusConfig = {
      DRAFT: { color: 'bg-yellow-100 text-yellow-800', emoji: '📝', label: 'Draft' },
      PUBLISHED: { color: 'bg-green-100 text-green-800', emoji: '✅', label: 'Published' },
      SCHEDULED: { color: 'bg-blue-100 text-blue-800', emoji: '⏰', label: 'Scheduled' },
      ARCHIVED: { color: 'bg-gray-100 text-gray-800', emoji: '📦', label: 'Archived' },
    }

    const config = statusConfig[status]
    return (
      <Badge className={`${config.color} font-medium`}>
        {config.emoji} {config.label}
      </Badge>
    )
  }

  const renderFieldValue = (field: ContentField, value: string) => {
    const formatted = formatFieldValue(field, value)

    if (formatted.isLink && formatted.linkUrl) {
      return (
        <div className='flex items-center gap-2'>
          <a
            href={formatted.linkUrl}
            target='_blank'
            rel='noopener noreferrer'
            className='text-blue-600 hover:text-blue-800 underline flex items-center gap-1'
          >
            {formatted.displayValue}
            <ExternalLink className='w-3 h-3' />
          </a>
        </div>
      )
    }

    if (formatted.isHtml) {
      return (
        <div
          className='prose prose-sm max-w-none'
          dangerouslySetInnerHTML={{ __html: formatted.displayValue }}
        />
      )
    }

    return <span className='whitespace-pre-wrap'>{formatted.displayValue}</span>
  }

  const modalContent = (
    <div className='space-y-6'>
      {/* Header */}
      <div className='flex items-center justify-between border-b pb-4'>
        <div>
          <h2 className='text-xl font-semibold text-gray-900'>{contentType.displayName} Preview</h2>
          <p className='text-sm text-gray-500 mt-1'>Preview how this content will appear</p>
        </div>
        <div className='flex items-center gap-2'>
          {getStatusBadge(status)}
          <Button variant='ghost' size='sm' onClick={onClose}>
            <X className='h-4 w-4' />
          </Button>
        </div>
      </div>

      {/* Metadata */}
      <div className='grid grid-cols-1 md:grid-cols-2 gap-4 p-4 bg-gray-50 rounded-lg'>
        <div>
          <label className='text-xs font-medium text-gray-500 uppercase tracking-wide'>
            URL Slug
          </label>
          <p className='text-sm text-gray-900 mt-1'>{slug ? `/${slug}` : '(auto-generated)'}</p>
        </div>
        <div>
          <label className='text-xs font-medium text-gray-500 uppercase tracking-wide'>
            Status
          </label>
          <div className='mt-1'>{getStatusBadge(status)}</div>
        </div>
        {status === 'SCHEDULED' && scheduledAt && (
          <div className='md:col-span-2'>
            <label className='text-xs font-medium text-gray-500 uppercase tracking-wide'>
              Scheduled Publication
            </label>
            <p className='text-sm text-gray-900 mt-1'>{new Date(scheduledAt).toLocaleString()}</p>
          </div>
        )}
      </div>

      {/* Content Fields */}
      <div className='space-y-6'>
        <h3 className='text-lg font-medium text-gray-900'>Content Fields</h3>
        <div className='space-y-4'>
          {contentType.fields
            .sort((a, b) => a.order - b.order)
            .map(field => {
              const value = formData[field.id] || ''

              return (
                <div key={field.id} className='border rounded-lg p-4'>
                  <div className='flex items-center justify-between mb-2'>
                    <div>
                      <h4 className='font-medium text-gray-900'>
                        {field.displayName}
                        {field.required && <span className='text-red-500 ml-1'>*</span>}
                      </h4>
                      <p className='text-xs text-gray-500'>{getFieldTypeLabel(field.fieldType)}</p>
                    </div>
                  </div>

                  <div className='mt-3'>
                    {value.trim() === '' ? (
                      <p className='text-gray-400 italic'>(No content)</p>
                    ) : (
                      renderFieldValue(field, value)
                    )}
                  </div>

                  {field.helpText && (
                    <p className='text-xs text-gray-500 mt-2 italic'>{field.helpText}</p>
                  )}
                </div>
              )
            })}
        </div>
      </div>
    </div>
  )

  if (mode === 'side-by-side') {
    return (
      <Card className='h-full'>
        <CardHeader className='pb-4'>
          <CardTitle className='flex items-center gap-2'>
            <Eye className='w-4 h-4' />
            Preview
          </CardTitle>
        </CardHeader>
        <CardContent className='h-full overflow-y-auto'>{modalContent}</CardContent>
      </Card>
    )
  }

  // Modal mode
  return (
    <div className='fixed inset-0 bg-background/80 backdrop-blur-sm overflow-y-auto h-full w-full z-50'>
      <div className='relative top-10 mx-auto p-5 border w-full max-w-4xl shadow-lg rounded-lg bg-card mb-10'>
        <div className='max-h-[80vh] overflow-y-auto'>{modalContent}</div>
      </div>
    </div>
  )
}
