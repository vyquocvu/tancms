import { createFileRoute } from '@tanstack/react-router'
import { useState } from 'react'

export const Route = createFileRoute('/admin/posts')({
  component: PostsPage,
})

// Mock posts data
const mockPosts = [
  {
    id: 1,
    title: 'Welcome to TanCMS',
    content: 'This is your first blog post with TanStack Start!',
    slug: 'welcome-to-tancms',
    published: true,
    status: 'PUBLISHED',
    publishedAt: new Date('2024-01-22'),
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: 2,
    title: 'Getting Started with TanStack Start',
    content: 'Learn how to build fullstack applications with TanStack Start.',
    slug: 'getting-started',
    published: true,
    status: 'PUBLISHED',
    publishedAt: new Date('2024-01-19'),
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: 3,
    title: 'Draft Post',
    content: 'This is a draft post that has not been published yet.',
    slug: 'draft-post',
    published: false,
    status: 'DRAFT',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: 4,
    title: 'Scheduled for Tomorrow',
    content: 'This post is scheduled to be published tomorrow morning.',
    slug: 'scheduled-post',
    published: false,
    status: 'SCHEDULED',
    scheduledAt: new Date(Date.now() + 24 * 60 * 60 * 1000), // Tomorrow
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
]

function PostsPage() {
  const posts = mockPosts
  const [statusFilter, setStatusFilter] = useState('ALL')

  const filteredPosts = posts.filter(post => {
    if (statusFilter === 'ALL') return true
    return post.status === statusFilter
  })

  const getStatusCounts = () => {
    return {
      ALL: posts.length,
      DRAFT: posts.filter(p => p.status === 'DRAFT').length,
      PUBLISHED: posts.filter(p => p.status === 'PUBLISHED').length,
      SCHEDULED: posts.filter(p => p.status === 'SCHEDULED').length,
    }
  }

  const handleQuickAction = (postId: number, action: string) => {
    // In a real app, this would call the API
    console.log(`Performing ${action} on post ${postId}`)
    alert(`Would ${action} post ${postId} - this is a demo`)
  }

  const statusCounts = getStatusCounts()

  return (
    <div className='min-h-screen bg-gray-50'>
      <div className='max-w-7xl mx-auto py-6 sm:px-6 lg:px-8'>
        <div className='px-4 py-6 sm:px-0'>
          <div className='flex justify-between items-center mb-6'>
            <h1 className='text-3xl font-bold text-gray-900'>Posts</h1>
            <button className='bg-indigo-600 text-white px-4 py-2 rounded-md hover:bg-indigo-700'>
              Create Post
            </button>
          </div>

          {/* Status Filter Tabs */}
          <div className='mb-6'>
            <div className='border-b border-gray-200'>
              <nav className='-mb-px flex space-x-8'>
                {[
                  { key: 'ALL', label: 'All Posts', count: statusCounts.ALL },
                  { key: 'DRAFT', label: 'Drafts', count: statusCounts.DRAFT },
                  { key: 'PUBLISHED', label: 'Published', count: statusCounts.PUBLISHED },
                  { key: 'SCHEDULED', label: 'Scheduled', count: statusCounts.SCHEDULED },
                ].map(tab => (
                  <button
                    key={tab.key}
                    onClick={() => setStatusFilter(tab.key)}
                    className={`whitespace-nowrap py-2 px-1 border-b-2 font-medium text-sm ${
                      statusFilter === tab.key
                        ? 'border-indigo-500 text-indigo-600'
                        : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                    }`}
                  >
                    {tab.label} ({tab.count})
                  </button>
                ))}
              </nav>
            </div>
          </div>

          <div className='bg-white shadow overflow-hidden sm:rounded-md'>
            <ul className='divide-y divide-gray-200'>
              {filteredPosts.map(post => (
                <li key={post.id}>
                  <div className='px-4 py-4 sm:px-6'>
                    <div className='flex items-center justify-between'>
                      <div className='flex-1 min-w-0'>
                        <h3 className='text-lg font-medium text-gray-900 truncate'>{post.title}</h3>
                        <p className='mt-1 text-sm text-gray-500'>
                          {post.content.substring(0, 100)}...
                        </p>
                        <p className='mt-1 text-xs text-gray-400'>
                          Created: {new Date(post.createdAt).toLocaleDateString()}
                        </p>
                      </div>
                      <div className='flex items-center space-x-2'>
                        <span
                          className={`px-2 py-1 text-xs font-medium rounded-full ${
                            post.status === 'PUBLISHED'
                              ? 'bg-green-100 text-green-800'
                              : post.status === 'SCHEDULED'
                                ? 'bg-blue-100 text-blue-800'
                                : 'bg-yellow-100 text-yellow-800'
                          }`}
                        >
                          {post.status === 'PUBLISHED' && '✅ Published'}
                          {post.status === 'DRAFT' && '📝 Draft'}
                          {post.status === 'SCHEDULED' && '⏰ Scheduled'}
                        </span>
                        {post.status === 'SCHEDULED' && post.scheduledAt && (
                          <span className='text-xs text-gray-500'>
                            {new Date(post.scheduledAt).toLocaleDateString()} at{' '}
                            {new Date(post.scheduledAt).toLocaleTimeString([], {
                              hour: '2-digit',
                              minute: '2-digit',
                            })}
                          </span>
                        )}
                        {post.status === 'PUBLISHED' && post.publishedAt && (
                          <span className='text-xs text-gray-500'>
                            Published: {new Date(post.publishedAt).toLocaleDateString()}
                          </span>
                        )}

                        {/* Quick Workflow Actions */}
                        <div className='flex space-x-1'>
                          {post.status === 'DRAFT' && (
                            <button
                              onClick={() => handleQuickAction(post.id, 'publish')}
                              className='px-2 py-1 text-xs bg-green-100 text-green-800 rounded hover:bg-green-200'
                              title='Publish now'
                            >
                              Publish
                            </button>
                          )}
                          {post.status === 'PUBLISHED' && (
                            <button
                              onClick={() => handleQuickAction(post.id, 'unpublish')}
                              className='px-2 py-1 text-xs bg-yellow-100 text-yellow-800 rounded hover:bg-yellow-200'
                              title='Move to draft'
                            >
                              Unpublish
                            </button>
                          )}
                          {post.status === 'SCHEDULED' && (
                            <button
                              onClick={() => handleQuickAction(post.id, 'unschedule')}
                              className='px-2 py-1 text-xs bg-gray-100 text-gray-800 rounded hover:bg-gray-200'
                              title='Cancel scheduling'
                            >
                              Unschedule
                            </button>
                          )}
                          {(post.status === 'DRAFT' || post.status === 'PUBLISHED') && (
                            <button
                              onClick={() => handleQuickAction(post.id, 'schedule')}
                              className='px-2 py-1 text-xs bg-blue-100 text-blue-800 rounded hover:bg-blue-200'
                              title='Schedule for later'
                            >
                              Schedule
                            </button>
                          )}
                        </div>

                        <button className='text-indigo-600 hover:text-indigo-900 text-sm font-medium'>
                          Edit
                        </button>
                      </div>
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          </div>

          <div className='mt-6'>
            <a href='/admin' className='text-indigo-600 hover:text-indigo-500 text-sm font-medium'>
              ← Back to Dashboard
            </a>
          </div>
        </div>
      </div>
    </div>
  )
}
