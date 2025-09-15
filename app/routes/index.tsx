import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/')({
  component: HomePage,
})

function HomePage() {
  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <div className="bg-white p-8 rounded-lg shadow-md max-w-md w-full">
        <h1 className="text-3xl font-bold text-gray-900 mb-4">TanCMS</h1>
        <p className="text-gray-600 mb-6">Welcome to your modern Content Management System!</p>
        <p className="text-gray-500 mb-8">Built with TanStack Start, React, TypeScript, Prisma, and SQLite.</p>
        
        <div className="space-y-3">
          <a
            href="/admin"
            className="block w-full bg-indigo-600 text-white text-center py-3 px-4 rounded-md hover:bg-indigo-700 transition-colors font-medium"
          >
            Go to Admin Dashboard
          </a>
          <a
            href="/login"
            className="block w-full bg-gray-600 text-white text-center py-3 px-4 rounded-md hover:bg-gray-700 transition-colors font-medium"
          >
            Admin Login
          </a>
          <div className="text-center">
            <a href="/blog" className="text-indigo-600 hover:text-indigo-700 text-sm">
              View Blog →
            </a>
          </div>
        </div>
      </div>
    </div>
  )
}