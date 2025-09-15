import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'

export default defineConfig({
  plugins: [
    react(),
    {
      name: 'api-routes',
      configureServer(server) {
        server.middlewares.use('/api/posts', async (req, res, next) => {
          if (req.method === 'GET') {
            // Mock posts data
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

            res.setHeader('Content-Type', 'application/json')
            res.end(JSON.stringify(posts))
          } else {
            next()
          }
        })
      },
    },
  ],
  root: './app',
  build: {
    outDir: '../dist',
    emptyOutDir: true,
  },
  resolve: {
    alias: {
      '~': path.resolve(__dirname, './app'),
    },
  },
  server: {
    port: 3000,
  },
})
