# TanCMS Developer Guide

Welcome to TanCMS development! This guide will help you get up and running quickly and provide you with everything you need to contribute effectively.

## 🚀 Quick Start

### Prerequisites

- **Node.js 18+** - [Download here](https://nodejs.org/)
- **npm** (comes with Node.js)
- **Git** - [Download here](https://git-scm.com/)
- Basic knowledge of React, TypeScript, and Prisma

### One-Command Setup

```bash
# Clone the repository
git clone https://github.com/vyquocvu/tancms.git
cd tancms

# Automated setup (recommended)
make setup
# OR
npm run setup && npm run dev:setup
```

### Manual Setup

If you prefer step-by-step setup:

```bash
# 1. Install dependencies
npm install

# 2. Environment configuration
cp .env.example .env
npm run dev:fix-env  # Generates secure keys automatically

# 3. Database setup (if network allows)
npm run db:generate
npm run db:migrate
npm run db:seed

# 4. Start development
npm run dev
```

## 🛠️ Development Workflow

### Daily Development Commands

```bash
# Start development server
npm run dev

# Run tests while developing
npm run test

# Check code quality
npm run lint
npm run format

# Check environment health
npm run dev:status
```

### Code Quality Standards

#### Formatting
- We use **Prettier** for consistent formatting
- Run `npm run format` before committing
- Configuration in `.prettierrc`

#### Linting
- **ESLint** with TypeScript rules
- Run `npm run lint:fix` to auto-fix issues
- Configuration in `eslint.config.js`

#### Testing
- **Vitest** for unit tests
- Tests should be in `tests/` directory
- Run `npm run test:coverage` for coverage reports

### Git Workflow

1. **Create a feature branch**
   ```bash
   git checkout -b feature/your-feature-name
   ```

2. **Make your changes**
   - Follow existing code patterns
   - Add tests for new functionality
   - Update documentation if needed

3. **Quality checks**
   ```bash
   npm run doctor  # Runs full health check
   ```

4. **Commit your changes**
   ```bash
   git add .
   git commit -m "feat: description of your changes"
   ```

5. **Push and create PR**
   ```bash
   git push origin feature/your-feature-name
   ```

## 🏗️ Project Architecture

### Directory Structure

```
/app
  /routes           # File-based routing
    /admin          # Admin interface
    /api            # API endpoints
  /components       # Reusable UI components
    /ui             # Base UI components
    /forms          # Form components
    /auth           # Authentication components
  /server           # Server-only code
  /lib              # Shared utilities
  /styles           # Global styles
/prisma             # Database schema and migrations
/scripts            # Development and build scripts
/tests              # Test files
/docs               # Documentation
```

### Key Technologies

- **TanStack Start** - Full-stack React framework
- **Prisma** - Database ORM and migrations
- **TypeScript** - Type safety
- **Tailwind CSS** - Styling
- **Vitest** - Testing framework

## 🔧 Development Tools

### Environment Validation

```bash
npm run check-env    # Validate environment setup
npm run dev:status   # Show development status
npm run dev:fix-env  # Fix common configuration issues
```

### Database Management

```bash
npm run db:studio    # Visual database browser
npm run db:reset     # Reset database completely
npm run db:seed      # Add sample data
```

### Code Quality Tools

```bash
npm run lint         # Check for code issues
npm run lint:fix     # Auto-fix linting issues
npm run format       # Format code with Prettier
npm run format:check # Check if code is formatted
```

### Testing

```bash
npm run test         # Run unit tests
npm run test:watch   # Run tests in watch mode
npm run test:coverage # Generate coverage report
npm run test:e2e     # Run end-to-end tests
```

### Build and Deployment

```bash
npm run build        # Build for production
npm run preview      # Preview production build
npm run doctor       # Full health check
```

## 🐛 Troubleshooting

### Common Issues and Solutions

#### 1. Environment Configuration

**Problem**: Missing or invalid environment variables

**Solution**:
```bash
npm run dev:fix-env  # Auto-generates secure keys
npm run check-env    # Validates configuration
```

#### 2. Database Issues

**Problem**: Database not initialized or corrupted

**Solution**:
```bash
npm run db:reset     # Reset everything
npm run db:seed      # Add sample data
```

#### 3. Dependency Issues

**Problem**: Package conflicts or missing dependencies

**Solution**:
```bash
rm -rf node_modules package-lock.json
npm install
```

#### 4. Build Failures

**Problem**: TypeScript or build errors

**Solution**:
```bash
npm run lint:fix     # Fix linting issues
npm run format       # Format code
npx tsc --noEmit     # Check TypeScript
```

#### 5. Prisma Network Restrictions

**Problem**: Errors like "getaddrinfo ENOTFOUND binaries.prisma.sh" or Prisma engine download failures

**Root Cause**: Network restrictions in sandboxed environments (CI, GitHub Codespaces, etc.) blocking access to `binaries.prisma.sh` and `checkpoint.prisma.io`

**Impact**: Limited database operations, but core development still works

**What Still Works**:
- ✅ Tests pass (107/107)
- ✅ Build completes successfully  
- ✅ Linting and formatting
- ✅ Development server starts
- ✅ Most application features

**What's Limited**:
- ❌ Database migrations
- ❌ Database seeding
- ❌ Prisma Studio
- ❌ Database-dependent features

**Solutions**:

**Option A: Use without database** (recommended for code review/testing)
```bash
# These commands work normally
npm run test         # All tests pass
npm run build        # Build succeeds
npm run lint         # Code quality checks
npm run format       # Code formatting
```

**Option B: Work with restrictions** (shows helpful warnings)
```bash
npm run dev:setup    # Handles errors gracefully
npm run check-env    # Shows clear status and guidance
```

**Option C: For repository admins** (configure network access)
Add these domains to the allowlist in [Copilot coding agent settings](https://github.com/vyquocvu/tancms/settings/copilot/coding_agent):
- `binaries.prisma.sh`
- `checkpoint.prisma.io`

#### 5. Network Issues (Prisma)

**Problem**: Cannot download Prisma engines

**Solution**:
- This is common in restricted environments
- The application will still work for most development tasks
- Database operations may be limited

### Getting Help

1. **Run diagnostics**:
   ```bash
   npm run doctor
   ```

2. **Check specific status**:
   ```bash
   npm run dev:status
   ```

3. **Review logs**: Look for error messages in the console

4. **Check documentation**: See [docs/](./docs/) for detailed guides

5. **Ask for help**: Create an issue with:
   - Output of `npm run doctor`
   - Steps to reproduce
   - Error messages
   - Environment details

## 📚 Development Resources

### Essential Files to Know

- **`package.json`** - Scripts and dependencies
- **`prisma/schema.prisma`** - Database schema
- **`app.config.ts`** - Application configuration
- **`vite.config.ts`** - Build configuration
- **`.env`** - Environment variables

### Key Directories

- **`app/routes/`** - Add new pages here
- **`app/components/`** - Reusable components
- **`app/server/`** - Server-side logic
- **`tests/`** - Test files
- **`docs/`** - Documentation

### Useful Commands Reference

| Command | Purpose |
|---------|---------|
| `make help` | Show all available Make commands |
| `npm run doctor` | Complete health check |
| `npm run dev:status` | Development environment status |
| `npm run check-env` | Validate environment |
| `npm run dev:fix-env` | Fix environment issues |

## 🤝 Contributing Guidelines

### Before You Start

1. Read [CONTRIBUTING.md](../CONTRIBUTING.md)
2. Check existing issues and PRs
3. Run `npm run doctor` to ensure your environment is ready

### Code Standards

- Follow existing code patterns
- Write meaningful commit messages
- Add tests for new features
- Update documentation when needed
- Ensure code passes `npm run doctor`

### Pull Request Process

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Ensure quality checks pass
5. Submit a pull request with clear description

For detailed contributing guidelines, see [CONTRIBUTING.md](../CONTRIBUTING.md).

## 📖 Additional Documentation

- [API Documentation](./API.md)
- [Database Guide](./DATABASE.md)
- [Deployment Guide](./DEPLOYMENT.md)
- [Architecture Overview](./ARCHITECTURE.md)
- [Authentication System](./AUTHENTICATION.md)

Happy coding! 🎉