# Contributing to TanCMS

Thank you for your interest in contributing to TanCMS! This guide will help you get started with contributing to our modern CMS built with TanStack Start and Prisma.

## 🤝 Code of Conduct

This project adheres to a code of conduct. By participating, you are expected to uphold this code. Please report unacceptable behavior to the project maintainers.

## 🚀 Quick Start for Contributors

### Prerequisites

- Node.js 18+
- npm or yarn
- Git
- Basic knowledge of React, TypeScript, and Prisma

### Development Setup

1. **Fork and Clone**
   ```bash
   git clone https://github.com/your-username/tancms.git
   cd tancms
   ```

2. **Install Dependencies**
   ```bash
   npm install
   ```

3. **Environment Setup**
   ```bash
   cp .env.example .env
   # Edit .env with your local configuration
   ```

4. **Database Setup**
   ```bash
   npx prisma generate
   npx prisma migrate dev
   npx prisma db seed  # Optional: seed with sample data
   ```

5. **Start Development**
   ```bash
   npm run dev
   ```

## 📋 Development Workflow

### Branching Strategy

- **main**: Production-ready code
- **develop**: Integration branch for features
- **feature/**: Feature branches (`feature/user-authentication`)
- **fix/**: Bug fix branches (`fix/login-validation`)
- **docs/**: Documentation updates (`docs/api-reference`)

### Commit Convention

We use [Conventional Commits](https://conventionalcommits.org/) for clear commit messages:

```
<type>[optional scope]: <description>

[optional body]

[optional footer(s)]
```

**Types:**
- `feat:` New features
- `fix:` Bug fixes
- `docs:` Documentation changes
- `style:` Code style changes (formatting, etc.)
- `refactor:` Code refactoring
- `test:` Adding or updating tests
- `chore:` Maintenance tasks

**Examples:**
```bash
feat(auth): add role-based access control
fix(posts): resolve duplicate slug validation
docs(readme): update installation instructions
```

### Pull Request Process

1. **Create a Feature Branch**
   ```bash
   git checkout -b feature/your-feature-name
   ```

2. **Make Changes**
   - Write clear, focused commits
   - Follow the coding standards
   - Add tests for new functionality
   - Update documentation as needed

3. **Test Your Changes**
   ```bash
   npm run lint       # Check code style
   npm run test       # Run unit tests
   npm run test:e2e   # Run end-to-end tests
   npm run build      # Ensure it builds
   ```

4. **Push and Create PR**
   ```bash
   git push origin feature/your-feature-name
   ```
   - Create a pull request on GitHub
   - Use the PR template
   - Link related issues

5. **Review Process**
   - Maintainers will review your PR
   - Address feedback promptly
   - Keep PR scope focused and small

## 🏗 Architecture Guidelines

### File Organization

Follow the established project structure:

```
/app
  /routes           # File-based routes
  /components       # Reusable UI components
  /server           # Server-only code
  /lib              # Shared utilities
  /styles           # Global styles
```

### Component Guidelines

1. **Naming**: Use PascalCase for components
2. **Props**: Define TypeScript interfaces for props
3. **Exports**: Use default exports for components
4. **Styling**: Use Tailwind CSS classes

Example:
```tsx
// components/PostCard.tsx
interface PostCardProps {
  title: string
  excerpt?: string
  publishedAt: Date
}

export default function PostCard({ title, excerpt, publishedAt }: PostCardProps) {
  return (
    <article className="p-6 bg-white rounded-lg shadow-md">
      <h2 className="text-xl font-bold mb-2">{title}</h2>
      {excerpt && <p className="text-gray-600 mb-4">{excerpt}</p>}
      <time className="text-sm text-gray-500">
        {publishedAt.toLocaleDateString()}
      </time>
    </article>
  )
}
```

### Server Function Guidelines

1. **Validation**: Use Zod schemas for input validation
2. **Error Handling**: Return appropriate error responses
3. **Type Safety**: Ensure end-to-end type safety

Example:
```tsx
// routes/api/posts.ts
import { z } from 'zod'
import { prisma } from '~/server/db'

const CreatePostSchema = z.object({
  title: z.string().min(1).max(200),
  content: z.string().min(1),
  slug: z.string().regex(/^[a-z0-9-]+$/),
})

export async function createPost(input: unknown) {
  const data = CreatePostSchema.parse(input)
  
  return await prisma.post.create({
    data: {
      ...data,
      authorId: userId,
    },
  })
}
```

### Database Guidelines

1. **Migrations**: Always create migrations for schema changes
2. **Naming**: Use descriptive migration names
3. **Relations**: Properly define foreign keys and relations

```bash
# Create a migration
npx prisma migrate dev --name add_post_status_field
```

## 🧪 Testing Guidelines

### Unit Tests

- Write tests for utility functions
- Test server functions and API endpoints
- Use Vitest for testing framework

```tsx
// lib/utils.test.ts
import { describe, it, expect } from 'vitest'
import { generateSlug } from './utils'

describe('generateSlug', () => {
  it('should convert title to lowercase slug', () => {
    expect(generateSlug('Hello World')).toBe('hello-world')
  })

  it('should handle special characters', () => {
    expect(generateSlug('Hello & Goodbye!')).toBe('hello-goodbye')
  })
})
```

### End-to-End Tests

- Test critical user journeys
- Use Playwright for E2E testing
- Focus on admin workflows and public pages

```tsx
// tests/e2e/admin.spec.ts
import { test, expect } from '@playwright/test'

test('admin can create a new post', async ({ page }) => {
  await page.goto('/admin/login')
  await page.fill('[name="email"]', 'admin@example.com')
  await page.fill('[name="password"]', 'password')
  await page.click('button[type="submit"]')
  
  await page.goto('/admin/posts/new')
  await page.fill('[name="title"]', 'Test Post')
  await page.fill('[name="content"]', 'This is a test post')
  await page.click('button[type="submit"]')
  
  await expect(page.locator('text=Post created successfully')).toBeVisible()
})
```

## 🎯 Areas for Contribution

### High Priority
- [ ] Authentication system improvements
- [ ] Media upload optimization
- [ ] SEO enhancements
- [ ] Performance optimizations
- [ ] Accessibility improvements

### Medium Priority
- [ ] Content revision system
- [ ] Advanced search functionality
- [ ] Email notifications
- [ ] Webhook integrations
- [ ] Multi-language support

### Documentation
- [ ] API documentation
- [ ] Deployment guides
- [ ] Tutorial content
- [ ] Video tutorials
- [ ] Migration guides

### Testing
- [ ] Increase test coverage
- [ ] Performance testing
- [ ] Security testing
- [ ] Cross-browser testing

## 🐛 Bug Reports

When reporting bugs, please include:

1. **Environment**: OS, Node.js version, browser
2. **Steps to Reproduce**: Clear, numbered steps
3. **Expected vs Actual**: What should happen vs what happens
4. **Screenshots/Logs**: If applicable
5. **Additional Context**: Any relevant information

Use the bug report template when creating issues.

## 💡 Feature Requests

For feature requests:

1. **Use Case**: Describe the problem you're solving
2. **Proposed Solution**: Your suggested approach
3. **Alternatives**: Other approaches considered
4. **Impact**: Who would benefit from this feature

## 📚 Resources

### Learning Resources
- [TanStack Start Docs](https://tanstack.com/start)
- [Prisma Docs](https://prisma.io/docs)
- [React Docs](https://react.dev)
- [TypeScript Handbook](https://typescriptlang.org/docs)

### Community
- [GitHub Discussions](https://github.com/vyquocvu/tancms/discussions)
- [Discord Server](#) (Coming Soon)
- [Twitter](https://twitter.com/tancms) (Coming Soon)

## 🙏 Recognition

Contributors will be recognized in:
- README.md contributors section
- Release notes for significant contributions
- GitHub repository insights

Thank you for contributing to TanCMS! 🚀