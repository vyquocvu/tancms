import { PrismaClient, Role } from '@prisma/client'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

async function main() {
  console.log('🌱 Seeding database...')

  // Create admin user
  const hashedPassword = await bcrypt.hash('admin123', 12)

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
  const editorPassword = await bcrypt.hash('editor123', 12)

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

  // Create sample media (placeholder)
  const sampleMedia = await prisma.media.create({
    data: {
      url: 'https://images.unsplash.com/photo-1555066931-4365d14bab8c?w=800&h=400&fit=crop',
      filename: 'sample-hero.jpg',
      size: 245760,
      mimeType: 'image/jpeg',
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
  .catch(async e => {
    console.error('❌ Error seeding database:', e)
    await prisma.$disconnect()
    process.exit(1)
  })
