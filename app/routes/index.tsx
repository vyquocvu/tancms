import { createFileRoute } from '@tanstack/react-router'
import { useState } from 'react'
import { WysiwygEditor } from '~/components/ui/wysiwyg-editor'
import { Textarea } from '~/components/ui/textarea'

export const Route = createFileRoute('/')({
  component: HomePage,
})

function HomePage() {
  const [showDemo, setShowDemo] = useState(false)
  const [basicText, setBasicText] = useState('This is plain text content without any formatting options.')
  const [richText, setRichText] = useState('<p>This is <strong>rich text content</strong> with <em>formatting</em> options!</p><ul><li>Bold and italic text</li><li>Lists</li><li>And more formatting features</li></ul>')

  if (showDemo) {
    return (
      <div className="min-h-screen bg-gray-50 p-8">
        <div className="max-w-6xl mx-auto">
          <div className="mb-8 text-center">
            <h1 className="text-4xl font-bold text-gray-900 mb-2">WYSIWYG Editor Implementation ✅</h1>
            <p className="text-lg text-gray-600 mb-4">
              Rich content editing is now available in TanCMS!
            </p>
            <button
              onClick={() => setShowDemo(false)}
              className="bg-gray-600 text-white px-4 py-2 rounded hover:bg-gray-700"
            >
              ← Back to Homepage
            </button>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Before: Basic Textarea */}
            <div className="bg-white p-6 rounded-lg shadow-md">
              <h3 className="text-xl font-bold text-red-600 mb-4">BEFORE: Basic Textarea</h3>
              <p className="text-gray-600 mb-4">Limited to plain text input with no formatting options</p>
              
              <div className="space-y-2 mb-4">
                <label className="block text-sm font-medium">Content (Plain Text)</label>
                <Textarea
                  value={basicText}
                  onChange={(e) => setBasicText(e.target.value)}
                  placeholder="Enter content..."
                  rows={6}
                />
              </div>
              
              <div className="bg-red-50 p-3 rounded">
                <h4 className="font-semibold mb-2">Limitations:</h4>
                <ul className="text-sm text-gray-600 space-y-1">
                  <li>• No text formatting (bold, italic)</li>
                  <li>• No lists or structured content</li>
                  <li>• No links or media embedding</li>
                  <li>• Poor user experience for content creation</li>
                </ul>
              </div>
            </div>

            {/* After: WYSIWYG Editor */}
            <div className="bg-white p-6 rounded-lg shadow-md">
              <h3 className="text-xl font-bold text-green-600 mb-4">AFTER: WYSIWYG Editor</h3>
              <p className="text-gray-600 mb-4">Rich text editing with formatting options and visual feedback</p>
              
              <div className="space-y-2 mb-4">
                <label className="block text-sm font-medium">Content (Rich Text)</label>
                <WysiwygEditor
                  value={richText}
                  onChange={setRichText}
                  placeholder="Enter rich content..."
                  rows={6}
                />
              </div>
              
              <div className="bg-green-50 p-3 rounded">
                <h4 className="font-semibold mb-2">Features:</h4>
                <ul className="text-sm text-gray-600 space-y-1">
                  <li>• ✅ Text formatting (bold, italic, colors)</li>
                  <li>• ✅ Lists and structured content</li>
                  <li>• ✅ Links and media support</li>
                  <li>• ✅ Visual editing with WYSIWYG interface</li>
                </ul>
              </div>
            </div>
          </div>

          <div className="mt-8 bg-white p-6 rounded-lg shadow-md">
            <h3 className="text-xl font-bold mb-4">Implementation Summary</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h4 className="font-semibold mb-3">What Changed:</h4>
                <ul className="text-sm space-y-1">
                  <li>• Added @tinymce/tinymce-react package</li>
                  <li>• Created WysiwygEditor component</li>
                  <li>• Updated content-entry-form.tsx</li>
                  <li>• TEXTAREA fields now use rich editor</li>
                </ul>
              </div>
              <div>
                <h4 className="font-semibold mb-3">Where It's Used:</h4>
                <ul className="text-sm space-y-1">
                  <li>• All content entry forms</li>
                  <li>• Blog post content editing</li>
                  <li>• Product description fields</li>
                  <li>• Any TEXTAREA field type</li>
                </ul>
              </div>
            </div>
            
            <div className="mt-6 p-4 bg-blue-50 rounded-lg">
              <p className="text-sm text-blue-700">
                <strong>Try it out:</strong> Go to Admin → Content Types → Create/Edit any content entry with a TEXTAREA field to see the WYSIWYG editor in action!
              </p>
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <div className="bg-white p-8 rounded-lg shadow-md max-w-md w-full">
        <h1 className="text-3xl font-bold text-gray-900 mb-4">TanCMS</h1>
        <p className="text-gray-600 mb-6">Welcome to your modern Content Management System!</p>
        <p className="text-gray-500 mb-8">Built with TanStack Start, React, TypeScript, Prisma, and SQLite.</p>
        
        <div className="space-y-3">
          <button
            onClick={() => setShowDemo(true)}
            className="block w-full bg-green-600 text-white text-center py-3 px-4 rounded-md hover:bg-green-700 transition-colors font-medium"
          >
            🎉 See WYSIWYG Editor Demo
          </button>
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