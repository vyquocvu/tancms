import { createFileRoute } from '@tanstack/react-router'
import { useState, useEffect } from 'react'

export const Route = createFileRoute('/blog')({
  component: BlogPage,
})

function BlogPage() {
  const [posts, setPosts] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch('/api/posts')
      .then(res => res.json())
      .then(data => {
        // Filter only published posts for the public blog
        setPosts(data.filter((post: any) => post.published))
        setLoading(false)
      })
      .catch(err => {
        console.error('Failed to load posts:', err)
        setLoading(false)
      })
  }, [])

  if (loading) {
    return (
      <div className='min-h-screen bg-white flex items-center justify-center'>
        <div className='text-center'>
          <h2 className='text-2xl font-semibold text-gray-900 mb-2'>Loading...</h2>
          <p className='text-gray-600'>Fetching the latest posts</p>
        </div>
      </div>
    )
  }

  return (
    <div className='min-h-screen bg-white'>
      {/* Header */}
      <header className='bg-white shadow'>
        <div className='max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8'>
          <div className='flex justify-between items-center'>
            <h1 className='text-3xl font-bold text-gray-900'>TanCMS Blog</h1>
            <nav className='space-x-4'>
              <a href='/' className='text-gray-600 hover:text-gray-900'>
                Home
              </a>
              <a href='/admin' className='text-gray-600 hover:text-gray-900'>
                Admin
              </a>
            </nav>
          </div>
        </div>
      </header>

      {/* Main content */}
      <main className='max-w-4xl mx-auto py-8 px-4 sm:px-6 lg:px-8'>
        {posts.length === 0 ? (
          <div className='text-center py-12'>
            <h2 className='text-2xl font-semibold text-gray-900 mb-2'>No posts yet</h2>
            <p className='text-gray-600 mb-4'>Check back later for updates!</p>
            <a
              href='/admin'
              className='inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700'
            >
              Create your first post
            </a>
          </div>
        ) : (
          <div className='space-y-8'>
            {posts.map(post => (
              <article
                key={post.id}
                className='bg-white border border-gray-200 rounded-lg p-6 shadow-sm'
              >
                <header className='mb-4'>
                  <h2 className='text-2xl font-bold text-gray-900 mb-2'>{post.title}</h2>
                  <p className='text-sm text-gray-500'>
                    Published on{' '}
                    {new Date(post.createdAt).toLocaleDateString('en-US', {
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric',
                    })}
                  </p>
                </header>
                <div className='prose prose-sm max-w-none'>
                  <p className='text-gray-700'>{post.content}</p>
                </div>
                <footer className='mt-4 pt-4 border-t border-gray-100'>
                  <a
                    href={`/blog/${post.slug}`}
                    className='text-indigo-600 hover:text-indigo-500 font-medium'
                  >
                    Read more →
                  </a>
                </footer>
              </article>
            ))}
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className='bg-gray-50 border-t border-gray-200 mt-16'>
        <div className='max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8'>
          <p className='text-center text-gray-500'>
            Powered by <span className='font-semibold'>TanCMS</span> - Built with TanStack Start
          </p>
        </div>
      </footer>
    </div>
  )
}
