import { createServerFn } from '@tanstack/start'
import { json } from '@tanstack/start'

export const getPosts = createServerFn('GET', async () => {
  // Simulated database call - in real app this would use Prisma
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
  ]

  return json(posts)
})

export const createPost = createServerFn('POST', async (formData: FormData) => {
  const title = formData.get('title') as string
  const content = formData.get('content') as string
  const slug = title.toLowerCase().replace(/\s+/g, '-')

  // Simulated database call
  const newPost = {
    id: Date.now(),
    title,
    content,
    slug,
    published: false,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  }

  return json(newPost)
})