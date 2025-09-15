import { createFileRoute } from '@tanstack/react-router'

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
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: 2,
    title: 'Getting Started with TanStack Start',
    content: 'Learn how to build fullstack applications with TanStack Start.',
    slug: 'getting-started',
    published: true,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: 3,
    title: 'Draft Post',
    content: 'This is a draft post that has not been published yet.',
    slug: 'draft-post',
    published: false,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
]

function PostsPage() {
  const posts = mockPosts

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="px-4 py-6 sm:px-0">
          <div className="flex justify-between items-center mb-6">
            <h1 className="text-3xl font-bold text-gray-900">Posts</h1>
            <button className="bg-indigo-600 text-white px-4 py-2 rounded-md hover:bg-indigo-700">
              Create Post
            </button>
          </div>
          
          <div className="bg-white shadow overflow-hidden sm:rounded-md">
            <ul className="divide-y divide-gray-200">
              {posts.map((post) => (
                <li key={post.id}>
                  <div className="px-4 py-4 sm:px-6">
                    <div className="flex items-center justify-between">
                      <div className="flex-1 min-w-0">
                        <h3 className="text-lg font-medium text-gray-900 truncate">
                          {post.title}
                        </h3>
                        <p className="mt-1 text-sm text-gray-500">
                          {post.content.substring(0, 100)}...
                        </p>
                        <p className="mt-1 text-xs text-gray-400">
                          Created: {new Date(post.createdAt).toLocaleDateString()}
                        </p>
                      </div>
                      <div className="flex items-center space-x-2">
                        <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                          post.published 
                            ? 'bg-green-100 text-green-800' 
                            : 'bg-yellow-100 text-yellow-800'
                        }`}>
                          {post.published ? 'Published' : 'Draft'}
                        </span>
                        <button className="text-indigo-600 hover:text-indigo-900 text-sm font-medium">
                          Edit
                        </button>
                      </div>
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          </div>
          
          <div className="mt-6">
            <a 
              href="/admin" 
              className="text-indigo-600 hover:text-indigo-500 text-sm font-medium"
            >
              ← Back to Dashboard
            </a>
          </div>
        </div>
      </div>
    </div>
  )
}