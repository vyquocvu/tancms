import { PrismaClient, Role, PostStatus } from '@prisma/client'
import { hash } from 'bcryptjs'

const prisma = new PrismaClient()

async function main() {
  console.log('🌱 Seeding database...')

  // Create admin user
  const hashedPassword = await hash('admin123', 12)
  
  const admin = await prisma.user.upsert({
    where: { email: 'admin@tancms.dev' },
    update: {},
    create: {
      email: 'admin@tancms.dev',
      name: 'Admin User',
      password: hashedPassword,
      role: Role.ADMIN,
    },
  })

  console.log('👤 Created admin user:', admin.email)

  // Create editor user
  const editorPassword = await hash('editor123', 12)
  
  const editor = await prisma.user.upsert({
    where: { email: 'editor@tancms.dev' },
    update: {},
    create: {
      email: 'editor@tancms.dev',
      name: 'Editor User',
      password: editorPassword,
      role: Role.EDITOR,
    },
  })

  console.log('👤 Created editor user:', editor.email)

  // Create sample tags
  const techTag = await prisma.tag.upsert({
    where: { name: 'Technology' },
    update: {},
    create: { name: 'Technology' },
  })

  const webdevTag = await prisma.tag.upsert({
    where: { name: 'Web Development' },
    update: {},
    create: { name: 'Web Development' },
  })

  const reactTag = await prisma.tag.upsert({
    where: { name: 'React' },
    update: {},
    create: { name: 'React' },
  })

  console.log('🏷️  Created tags:', [techTag.name, webdevTag.name, reactTag.name])

  // Create sample posts
  const welcomePost = await prisma.post.upsert({
    where: { id: 'welcome-post' },
    update: {},
    create: {
      id: 'welcome-post',
      title: 'Welcome to TanCMS',
      slug: 'welcome-to-tancms',
      excerpt: 'A modern, type-safe Content Management System built with cutting-edge technologies.',
      content: `# Welcome to TanCMS

TanCMS is a modern, type-safe Content Management System built with cutting-edge technologies:

- **TanStack Start** for server-side rendering and routing
- **Prisma** for type-safe database operations  
- **React** for the user interface
- **TypeScript** for type safety throughout
- **Tailwind CSS** for styling

## Getting Started

This is your first post! You can edit or delete this post from the admin dashboard.

### Features

- ✅ Role-based access control
- ✅ Media management
- ✅ SEO optimization
- ✅ Tag system
- ✅ Responsive design
- ✅ Server-side rendering

### Admin Access

Default admin credentials:
- Email: admin@tancms.dev
- Password: admin123

**Important:** Change these credentials in production!

Happy blogging! 🚀`,
      status: PostStatus.PUBLISHED,
      authorId: admin.id,
      tags: {
        connect: [
          { id: techTag.id },
          { id: webdevTag.id }
        ]
      }
    },
  })

  const gettingStartedPost = await prisma.post.upsert({
    where: { id: 'getting-started' },
    update: {},
    create: {
      id: 'getting-started',
      title: 'Getting Started with TanCMS',
      slug: 'getting-started-with-tancms',
      excerpt: 'This guide will help you get up and running with TanCMS quickly.',
      content: `# Getting Started with TanCMS

This guide will help you get up and running with TanCMS quickly.

## Installation

1. Clone the repository
2. Install dependencies with \`npm install\`
3. Set up your environment variables
4. Run database migrations
5. Start the development server

## Configuration

TanCMS uses environment variables for configuration. Copy \`.env.example\` to \`.env\` and update the values:

\`\`\`bash
cp .env.example .env
\`\`\`

## Database Setup

TanCMS uses Prisma for database management:

\`\`\`bash
# Generate Prisma client
npx prisma generate

# Run migrations
npx prisma migrate dev

# Seed sample data
npx prisma db seed
\`\`\`

## Development

Start the development server:

\`\`\`bash
npm run dev
\`\`\`

Your CMS will be available at \`http://localhost:3000\`.

## Admin Dashboard

Access the admin dashboard at \`/admin\` with your credentials.

Happy coding! 💻`,
      status: PostStatus.PUBLISHED,
      authorId: editor.id,
      tags: {
        connect: [
          { id: techTag.id },
          { id: reactTag.id }
        ]
      }
    },
  })

  console.log('📝 Created sample posts:', [welcomePost.title, gettingStartedPost.title])

  // Create sample media (placeholder)
  const sampleMedia = await prisma.media.create({
    data: {
      url: 'https://images.unsplash.com/photo-1555066931-4365d14bab8c?w=800&h=400&fit=crop',
      altText: 'Sample hero image',
    },
  })

  console.log('🖼️  Created sample media:', sampleMedia.url)

  console.log('✅ Database seeded successfully!')
  console.log('📧 Admin email: admin@tancms.dev')
  console.log('🔑 Admin password: admin123')
  console.log('📧 Editor email: editor@tancms.dev')
  console.log('🔑 Editor password: editor123')
  console.log('')
  console.log('⚠️  Remember to change these credentials in production!')
}

main()
  .then(async () => {
    await prisma.$disconnect()
  })
  .catch(async (e) => {
    console.error('❌ Error seeding database:', e)
    await prisma.$disconnect()
    process.exit(1)
  })