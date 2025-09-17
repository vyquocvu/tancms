import { json } from '@tanstack/start'

// Mock posts data - in a real app this would come from a database
const posts = [
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

export async function GET() {
  return json(posts)
}

export async function POST(request: Request) {
  const formData = await request.formData()
  const title = formData.get('title') as string
  const content = formData.get('content') as string
  const slug = title.toLowerCase().replace(/\s+/g, '-')

  const newPost = {
    id: Date.now(),
    title,
    content,
    slug,
    published: false,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  }

  posts.push(newPost)
  return json(newPost)
}
