# TanCMS

A modern, type-safe Content Management System built with TanStack Start, Prisma,
and React. Designed for performance, developer experience, and scalability.

## 🚀 Features

- **Modern Tech Stack**: Built with TanStack Start (React SSR), Prisma ORM, and
  TypeScript
- **Role-Based Access Control**: Admin, Editor, Author, and Viewer roles with
  granular permissions
- **Content Management**: Full CRUD operations for posts, tags, and media
- **File Uploads**: S3-compatible storage with signed uploads
- **SEO Optimized**: Server-side rendering with metadata management
- **Type Safety**: End-to-end type safety with TypeScript and Zod validation
- **Authentication**: Secure session-based auth with Lucia or Auth.js
- **Responsive Design**: Built with Tailwind CSS and modern UI components
- **Production Ready**: Optimized for Vercel deployment with excellent
  performance

## 📋 Prerequisites

- **Node.js** 18+
- **npm** or **yarn**
- **Database**: PostgreSQL, MySQL, or SQLite (for development)
- **S3-compatible storage** (optional, for file uploads)

## 🛠 Quick Start

### 1. Clone and Install

```bash
git clone https://github.com/vyquocvu/tancms.git
cd tancms
npm install
```

### 2. Environment Setup

TanCMS provides comprehensive environment configuration management for different
deployment scenarios.

**Quick Setup (Recommended):**

```bash
# Initialize development environment
npm run env:init development

# Validate configuration
npm run env:validate

# Auto-fix common issues
npm run dev:fix-env
```

**Manual Setup:** Create a `.env` file in the root directory:

```bash
# Database
DATABASE_URL="file:./dev.db"  # SQLite for development
# DATABASE_URL="postgresql://username:password@localhost:5432/tancms"  # PostgreSQL for production

# Authentication
AUTH_SECRET="your-32-character-secret-key-here"

# Application
APP_URL="http://localhost:3000"

# Optional: S3-compatible storage
S3_ENDPOINT="https://your-s3-endpoint.com"
S3_ACCESS_KEY_ID="your-access-key"
S3_SECRET_ACCESS_KEY="your-secret-key"
S3_BUCKET="your-bucket-name"
```

**Environment Management Commands:**

```bash
# Available commands
npm run env:validate          # Validate current configuration
npm run env:templates         # Show available environment templates
npm run env:init <env>        # Initialize environment (development/staging/production/test)
npm run env:compare <e1> <e2> # Compare two environments

# Development tools
npm run check-env             # Basic environment check
npm run dev:fix-env          # Auto-fix configuration issues
```

For detailed configuration options, see
[Environment Configuration Guide](./docs/ENVIRONMENT_CONFIGURATION.md).

### 3. Database Setup

```bash
# Generate Prisma client
npx prisma generate

# Run database migrations
npx prisma migrate dev

# Seed the database (optional)
npx prisma db seed
```

### 4. Start Development Server

```bash
npm run dev
```

Visit `http://localhost:3000` to see your CMS in action!

## 📚 Documentation

### Getting Started

- **[Installation Guide](./docs/INSTALLATION.md)** - Comprehensive setup
  instructions for all environments
- **[Quick Start Guide](./QUICKSTART.md)** - Get running in 5 minutes
- **[User Guide](./docs/USER_GUIDE.md)** - Complete guide for content creators
  and editors
- **[Demo Workflow](./docs/DEMO_WORKFLOW.md)** - Interactive demonstrations and
  automated workflows
- **[Developer Guide](./docs/DEVELOPER_GUIDE.md)** - Complete development setup
  and workflow
- **[Database Setup](./docs/DATABASE.md)** - SQLite database configuration and
  usage
- **[Troubleshooting](./docs/TROUBLESHOOTING.md)** - Comprehensive
  troubleshooting guide

### Technical Documentation

- [Architecture Overview](./docs/ARCHITECTURE.md) - Technical deep dive
- [API Reference](./docs/API.md) - Complete API documentation
- [API Manager](./docs/API_MANAGER.md) - REST API management and middleware
- [Content Type Builder](./docs/CONTENT_TYPE_BUILDER.md) - Dynamic content types
- [Dynamic API](./docs/DYNAMIC_API.md) - Auto-generated API endpoints
- [Authentication](./docs/AUTHENTICATION.md) - Auth system and security

### Feature Analysis & Roadmap

- **[Executive Summary](./docs/EXECUTIVE_SUMMARY.md)** - TanCMS vs Strapi
  analysis overview
- **[Feature Comparison](./docs/STRAPI_COMPARISON.md)** - Detailed comparison
  with Strapi
- **[Implementation Tasks](./docs/FEATURE_TASKS.md)** - Detailed roadmap for
  missing features
- **[Quick Wins](./docs/QUICK_WINS.md)** - Immediate improvements (1-2 weeks
  each)

### Development & Deployment

- [Deployment Guide](./docs/DEPLOYMENT.md) - Deploy to any platform
- [Contributing Guide](./CONTRIBUTING.md) - Development workflow
- [Development Playbook](./Agents.md) - For AI agents and detailed development
- [Security Policy](./SECURITY.md) - Security guidelines and reporting

## 🏗 Architecture

TanCMS is built with a modern, scalable architecture:

### Tech Stack

- **Frontend**: React 19, TanStack Start (SSR), TanStack Query
- **Backend**: TanStack Start server functions, Prisma ORM
- **Database**: PostgreSQL/MySQL (production), SQLite (development)
- **Authentication**: Lucia or Auth.js with session cookies
- **Storage**: S3-compatible (Cloudflare R2, AWS S3, etc.)
- **Styling**: Tailwind CSS
- **Validation**: Zod schemas
- **Testing**: Vitest (unit), Playwright (e2e)
- **Deployment**: Vercel

### Project Structure

```
/app
  /routes           # File-based routing (public + admin)
    index.tsx       # Homepage
    blog.tsx        # Blog listing
    blog.$slug.tsx  # Individual blog posts
    admin/          # Admin interface
      posts.tsx     # Post management
      tags.tsx      # Tag management
      media.tsx     # Media management
  /components       # Reusable UI components
  /server           # Server-only modules
    db.ts           # Prisma client
    auth.ts         # Authentication logic
    rbac.ts         # Role-based access control
  /lib              # Shared utilities
  /styles           # Global styles
/prisma
  schema.prisma     # Database schema
  /migrations       # Database migrations
/scripts            # Build and deployment scripts
/tests              # Unit and e2e tests
```

### Database Schema

The CMS uses a relational database with the following main entities:

- **User**: Admin users with role-based permissions
- **Post**: Blog posts and pages with content, metadata, and relations
- **Tag**: Categorization system for content
- **Media**: File uploads and media management
- **Session**: Authentication sessions

## 🔧 Development

### Quick Setup

For new contributors, use our automated setup:

```bash
# One-command setup (recommended)
make setup

# Or using npm
npm run setup
npm run dev:setup  # Fix common configuration issues
```

### Available Scripts

#### Core Development

```bash
npm run dev        # Start development server
npm run build      # Build for production
npm run preview    # Preview production build
npm run test       # Run unit tests
npm run test:e2e   # Run end-to-end tests
```

#### Code Quality

```bash
npm run lint       # Run ESLint
npm run lint:fix   # Fix ESLint issues automatically
npm run format     # Format code with Prettier
npm run format:check # Check if code is formatted
```

#### Development Utilities

```bash
npm run check-env  # Validate environment configuration
npm run dev:status # Show development environment status
npm run dev:fix-env # Fix common .env issues
npm run doctor     # Run full health check
```

#### Database Management

```bash
npm run db:generate # Generate Prisma client
npm run db:migrate  # Run database migrations
npm run db:seed     # Seed with sample data
npm run db:studio   # Open database browser
npm run db:reset    # Reset database completely
```

#### Demo Workflow

```bash
npm run demo:workflow         # Run complete demo workflow
npm run demo:workflow:verbose # Run with detailed output
npm run demo:staging          # Run for staging environment
```

### Using Make (Alternative)

If you have `make` available, you can use the Makefile for convenience:

```bash
make help          # Show all available commands
make setup         # Complete project setup
make dev           # Start development server
make test          # Run tests
make lint          # Run linter
make db-reset      # Reset database
make doctor        # Full health check
```

### Troubleshooting

#### Common Issues

1. **Environment not configured**

   ```bash
   npm run dev:fix-env  # Automatically fix .env issues
   ```

2. **Database issues**

   ```bash
   npm run db:reset     # Reset and reinitialize database
   npm run db:seed      # Add sample data
   ```

3. **Dependency issues**

   ```bash
   rm -rf node_modules package-lock.json
   npm install
   ```

4. **Code formatting issues**
   ```bash
   npm run format       # Format all code
   npm run lint:fix     # Fix linting issues
   ```

#### Getting Help

- Run `npm run doctor` for a comprehensive health check
- Check `npm run dev:status` for current environment status
- Review logs in the console for specific error messages
- See [CONTRIBUTING.md](./CONTRIBUTING.md) for detailed development guidelines

### Environment Variables

| Variable               | Description                               | Required |
| ---------------------- | ----------------------------------------- | -------- |
| `DATABASE_URL`         | Database connection string                | Yes      |
| `AUTH_SECRET`          | Secret for session encryption (32+ chars) | Yes      |
| `APP_URL`              | Application URL                           | Yes      |
| `S3_ENDPOINT`          | S3-compatible storage endpoint            | No       |
| `S3_ACCESS_KEY_ID`     | S3 access key                             | No       |
| `S3_SECRET_ACCESS_KEY` | S3 secret key                             | No       |
| `S3_BUCKET`            | S3 bucket name                            | No       |

### Database Commands

```bash
# Reset database
npx prisma migrate reset

# View database in browser
npx prisma studio

# Deploy migrations to production
npx prisma migrate deploy

# Generate Prisma client after schema changes
npx prisma generate
```

## 🚢 Deployment

TanCMS is optimized for deployment on Vercel but can be deployed anywhere that
supports Node.js.

### Vercel (Recommended)

1. Connect your repository to Vercel
2. Set environment variables in Vercel dashboard
3. Deploy automatically on push to main branch

### Manual Deployment

1. Build the application: `npm run build`
2. Set production environment variables
3. Run database migrations: `npx prisma migrate deploy`
4. Start the server: `npm start`

See [Deployment Guide](./docs/DEPLOYMENT.md) for detailed instructions.

## 🤝 Contributing

We welcome contributions! Please see our [Contributing Guide](./CONTRIBUTING.md)
for details on:

- Code of conduct
- Development workflow
- Commit conventions
- Pull request process

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file
for details.

## 🔗 Links

- [TanStack Start Documentation](https://tanstack.com/start)
- [Prisma Documentation](https://prisma.io/docs)
- [Vercel Documentation](https://vercel.com/docs)

## 🐛 Issues & Support

- [Report a Bug](https://github.com/vyquocvu/tancms/issues/new?template=bug_report.md)
- [Request a Feature](https://github.com/vyquocvu/tancms/issues/new?template=feature_request.md)
- [View Documentation](https://github.com/vyquocvu/tancms/wiki)

---

Built with ❤️ by the TanCMS team
