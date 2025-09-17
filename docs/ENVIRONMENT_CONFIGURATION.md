# Environment Configuration Management

TanCMS provides robust environment configuration management to streamline setup and deployment across different environments (development, staging, production, test).

## 🚀 Quick Start

### 1. Choose Your Environment

```bash
# Development (default)
npm run env:init development

# Staging
npm run env:init staging

# Production
npm run env:init production

# Testing
npm run env:init test
```

### 2. Validate Configuration

```bash
npm run env:validate
```

### 3. Auto-fix Common Issues

```bash
npm run dev:fix-env
```

## 📋 Available Environment Templates

| Template | Purpose | Database | Security | Caching |
|----------|---------|----------|----------|---------|
| `.env.development` | Local development | SQLite | Basic | Disabled |
| `.env.staging` | Staging/preview | PostgreSQL | Enhanced | Enabled |
| `.env.production` | Production | PostgreSQL | Maximum | Optimized |
| `.env.test` | Testing | In-memory | Minimal | Disabled |

## 🔧 Configuration Commands

### Environment Management
```bash
# Validate current configuration
npm run env:validate

# Show available templates
npm run env:templates

# Initialize specific environment
npm run env:init <environment>

# Compare configurations
npm run env:compare development production
```

### Development Tools
```bash
# Basic environment check
npm run check-env

# Auto-fix configuration issues
npm run dev:fix-env

# Show development status
npm run dev:status

# Complete development setup
npm run dev:setup
```

## 🔑 Core Configuration Variables

### Required Variables

| Variable | Description | Example |
|----------|-------------|---------|
| `NODE_ENV` | Environment type | `development`, `production` |
| `DATABASE_URL` | Database connection | `file:./dev.db` or `postgresql://...` |
| `AUTH_SECRET` | Authentication secret | 32+ character random string |
| `APP_URL` | Application base URL | `http://localhost:3000` |

### Optional Variables

| Variable | Description | Default | Environment |
|----------|-------------|---------|-------------|
| `PORT` | Server port | `3000` | Development |
| `SECURE_HEADERS` | Enable security headers | `false` | Production |
| `FORCE_HTTPS` | Force HTTPS redirects | `false` | Production |
| `CACHE_TTL` | Cache time-to-live (seconds) | `3600` | Production |
| `DATABASE_POOL_SIZE` | Connection pool size | `10` | Production |

### Storage (S3-Compatible)

| Variable | Description | Required |
|----------|-------------|----------|
| `S3_ENDPOINT` | S3 endpoint URL | Optional |
| `S3_ACCESS_KEY_ID` | Access key | If S3 enabled |
| `S3_SECRET_ACCESS_KEY` | Secret key | If S3 enabled |
| `S3_BUCKET` | Bucket name | If S3 enabled |
| `S3_REGION` | AWS region | Optional |

### Email (SMTP)

| Variable | Description | Required |
|----------|-------------|----------|
| `SMTP_HOST` | SMTP server | Optional |
| `SMTP_PORT` | SMTP port | Optional |
| `SMTP_USER` | SMTP username | If SMTP enabled |
| `SMTP_PASS` | SMTP password | If SMTP enabled |
| `SMTP_FROM` | From address | If SMTP enabled |

## 🛡️ Security Best Practices

### Development
- Use auto-generated secrets: `npm run dev:fix-env`
- SQLite is acceptable for local development
- Enable debug logging if needed

### Staging
- Use production-like configuration
- Enable HTTPS if possible
- Use separate S3 buckets
- Test with realistic data volumes

### Production
- **CRITICAL**: Use secure, unique `AUTH_SECRET` (64+ characters)
- **REQUIRED**: Use PostgreSQL with connection pooling
- **REQUIRED**: Enable HTTPS and security headers
- Use environment variables, not `.env` files
- Enable monitoring and logging
- Use Prisma Accelerate for serverless deployments

## 🏗️ Deployment Setup

### Vercel Deployment

1. **Set Environment Variables in Vercel Dashboard:**
   ```bash
   NODE_ENV=production
   DATABASE_URL=postgresql://...
   AUTH_SECRET=your-ultra-secure-secret
   APP_URL=https://yourdomain.com
   ```

2. **Configure Build Settings:**
   ```bash
   Build Command: npm run build
   Install Command: npm install
   ```

3. **Add Production Environment Variables:**
   ```bash
   SECURE_HEADERS=true
   FORCE_HTTPS=true
   S3_ENDPOINT=https://...
   S3_ACCESS_KEY_ID=...
   S3_SECRET_ACCESS_KEY=...
   ```

### Docker Deployment

1. **Use Environment-specific Dockerfile:**
   ```dockerfile
   # Copy appropriate template
   COPY .env.production .env.example
   
   # Set build-time environment
   ARG NODE_ENV=production
   ENV NODE_ENV=$NODE_ENV
   ```

2. **Pass Secrets via Environment:**
   ```bash
   docker run -e DATABASE_URL="postgresql://..." \\
              -e AUTH_SECRET="your-secret" \\
              -e APP_URL="https://yourdomain.com" \\
              tancms
   ```

### Manual Server Deployment

1. **Prepare Environment:**
   ```bash
   cp .env.production .env
   # Edit .env with production values
   ```

2. **Build and Deploy:**
   ```bash
   npm install --production
   npm run build
   npm run db:deploy
   npm start
   ```

## 🔍 Validation & Troubleshooting

### Comprehensive Validation

```bash
npm run env:validate
```

This checks for:
- Missing required variables
- Insecure default values
- Environment-specific security issues
- Type validation (URLs, emails, numbers)
- Security best practices

### Common Issues & Solutions

#### 1. "AUTH_SECRET needs to be updated from default value"
```bash
# Auto-fix for development
npm run dev:fix-env

# Manual fix - generate secure secret
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

#### 2. "DATABASE_URL missing from .env"
```bash
# Development
echo 'DATABASE_URL="file:./dev.db"' >> .env

# Production
echo 'DATABASE_URL="postgresql://user:pass@host:5432/db"' >> .env
```

#### 3. "Production APP_URL must use HTTPS"
```bash
# Update APP_URL in production
APP_URL="https://yourdomain.com"
```

#### 4. "Configuration validation failed"
```bash
# Get detailed validation report
npm run env:validate

# Fix issues one by one
npm run dev:fix-env
```

### Environment Comparison

Compare configurations between environments:

```bash
# Compare development vs production
npm run env:compare development production

# Check what's different between staging and production
npm run env:compare staging production
```

## 📝 Advanced Configuration

### Custom Environment Templates

Create custom templates by copying existing ones:

```bash
# Create custom template
cp .env.production .env.custom

# Initialize from custom template
cp .env.custom .env
```

### Environment-specific Overrides

Environment files are loaded in this order (later overrides earlier):

1. Process environment variables (highest priority)
2. `.env` file
3. `.env.${NODE_ENV}` file (lowest priority)

### Validation Schema

The system validates against a comprehensive schema including:

- **Type validation**: string, number, boolean, URL, email, secret
- **Security validation**: Detects insecure defaults and weak secrets
- **Environment-specific rules**: Different requirements for dev/staging/prod
- **Dependency validation**: Ensures related variables are set together

### Integration with Application Code

```typescript
// Import the environment configuration manager
import { envConfig } from '~/lib/env-config'

// Get configuration values
const dbUrl = envConfig.get('DATABASE_URL')
const authSecret = envConfig.get('AUTH_SECRET')
const environment = envConfig.getEnvironment()

// Validate configuration at startup
const validation = envConfig.validate()
if (!validation.isValid) {
  console.error('Configuration errors:', validation.errors)
  process.exit(1)
}
```

## 🔄 Migration from Basic Setup

If you're upgrading from a basic `.env` setup:

1. **Backup current configuration:**
   ```bash
   cp .env .env.backup
   ```

2. **Initialize new environment:**
   ```bash
   npm run env:init development
   ```

3. **Migrate custom values:**
   ```bash
   # Compare your backup with the new template
   npm run env:compare .env.backup .env.development
   ```

4. **Validate new configuration:**
   ```bash
   npm run env:validate
   ```

## 🎯 Best Practices Summary

### Development
- ✅ Use auto-generated secrets
- ✅ Use SQLite for simplicity
- ✅ Enable debug logging
- ✅ Use `npm run dev:fix-env` for quick fixes

### Staging
- ✅ Mirror production configuration
- ✅ Use separate databases and storage
- ✅ Test with production-like data
- ✅ Enable security headers

### Production
- ✅ Use 64+ character AUTH_SECRET
- ✅ Use PostgreSQL with connection pooling
- ✅ Enable all security features
- ✅ Monitor and log everything
- ✅ Use environment variables, not files
- ✅ Regular security audits

### Testing
- ✅ Use in-memory database
- ✅ Mock external services
- ✅ Minimal configuration
- ✅ Fast test execution

## 📞 Getting Help

- Run `npm run env:validate` for configuration issues
- Check `npm run env:templates` for available templates  
- Use `npm run check-env` for basic environment verification
- Review logs for specific error messages
- See [CONTRIBUTING.md](./CONTRIBUTING.md) for development guidelines