import ReactDOM from 'react-dom/client'
import { useState, useEffect } from 'react'
import './styles/globals.css'

// Import admin components
import AdminDashboard from './routes/admin/index'
import PostsPage from './routes/admin/posts'
import TagsPage from './routes/admin/tags'
import MediaPage from './routes/admin/media'

function App() {
  const [currentRoute, setCurrentRoute] = useState('/')

  // Simple routing based on hash
  const handleHashChange = () => {
    setCurrentRoute(window.location.hash || '/')
  }

  // Set up hash change listener
  useEffect(() => {
    window.addEventListener('hashchange', handleHashChange)
    handleHashChange() // Check initial hash
    return () => window.removeEventListener('hashchange', handleHashChange)
  }, [])

  const renderRoute = () => {
    switch (currentRoute) {
      case '#/admin':
        return <AdminDashboard />
      case '#/admin/posts':
        return <PostsPage />
      case '#/admin/tags':
        return <TagsPage />
      case '#/admin/media':
        return <MediaPage />
      default:
        return (
          <div className="min-h-screen bg-gray-50 flex items-center justify-center">
            <div className="bg-white p-8 rounded-lg shadow-md max-w-md w-full">
              <h1 className="text-3xl font-bold text-gray-900 mb-4">TanCMS</h1>
              <p className="text-gray-600 mb-6">Welcome to your modern Content Management System!</p>
              <p className="text-gray-500 mb-8">Built with React, TypeScript, Prisma, and SQLite.</p>
              
              <div className="space-y-3">
                <a
                  href="#/admin"
                  className="block w-full bg-indigo-600 text-white text-center py-3 px-4 rounded-md hover:bg-indigo-700 transition-colors font-medium"
                >
                  Go to Admin Dashboard
                </a>
                <div className="text-center">
                  <a href="#/blog" className="text-indigo-600 hover:text-indigo-700 text-sm">
                    View Blog →
                  </a>
                </div>
              </div>
            </div>
          </div>
        )
    }
  }

  return renderRoute()
}

const rootElement = document.getElementById('root')!
const root = ReactDOM.createRoot(rootElement)
root.render(<App />)
