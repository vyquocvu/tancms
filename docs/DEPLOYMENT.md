# Deployment Guide

This guide covers deploying TanCMS to various platforms. TanCMS is optimized for
Vercel but can be deployed to any platform that supports Node.js.

## 🚀 Vercel (Recommended)

Vercel provides the best experience for TanStack Start applications with
zero-config deployments.

### Prerequisites

- GitHub/GitLab/Bitbucket account
- Vercel account
- Database (PostgreSQL recommended)

### Setup Steps

1. **Connect Repository**
   - Go to [Vercel Dashboard](https://vercel.com/dashboard)
   - Click "New Project"
   - Import your TanCMS repository

2. **Configure Environment Variables**

   Add these environment variables in Vercel dashboard:

   ```bash
   # Database (required)
   DATABASE_URL=postgresql://username:password@host:port/database

   # Authentication (required)
   AUTH_SECRET=your-32-character-secret-key-here

   # Application (required)
   APP_URL=https://your-app.vercel.app

   # S3 Storage (optional)
   S3_ENDPOINT=https://your-s3-endpoint.com
   S3_ACCESS_KEY_ID=your-access-key
   S3_SECRET_ACCESS_KEY=your-secret-key
   S3_BUCKET=your-bucket-name

   # Prisma (optional)
   PRISMA_ACCELERATE_URL=your-accelerate-url
   ```

3. **Configure Build Settings**

   Vercel auto-detects these settings, but you can customize:

   ```bash
   # Build Command
   npm run build

   # Output Directory
   .vercel/output

   # Install Command
   npm install
   ```

4. **Database Setup**

   Before first deployment:

   ```bash
   # Generate Prisma client
   npx prisma generate

   # Deploy migrations
   npx prisma migrate deploy

   # Seed database (optional)
   npx prisma db seed
   ```

5. **Deploy**

   Push to your main branch or click "Deploy" in Vercel dashboard.

### Vercel Configuration

Create `vercel.json` for custom configuration:

```json
{
  "buildCommand": "prisma generate && npm run build",
  "installCommand": "npm install",
  "functions": {
    "app/server/**/*.ts": {
      "runtime": "nodejs18.x"
    }
  },
  "env": {
    "PRISMA_QUERY_ENGINE_LIBRARY": "@prisma/engines/libquery_engine-linux-musl.so.node"
  }
}
```

## 🐳 Docker

Deploy using Docker containers for consistent environments.

### Dockerfile

```dockerfile
FROM node:18-alpine AS builder

WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production && npm cache clean --force

COPY . .
RUN npx prisma generate
RUN npm run build

FROM node:18-alpine AS runner

WORKDIR /app
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/package.json ./package.json
COPY --from=builder /app/prisma ./prisma

EXPOSE 3000

CMD ["npm", "start"]
```

### Docker Compose

```yaml
version: '3.8'

services:
  tancms:
    build: .
    ports:
      - '3000:3000'
    environment:
      - DATABASE_URL=postgresql://postgres:password@db:5432/tancms
      - AUTH_SECRET=your-secret-key
      - APP_URL=http://localhost:3000
    depends_on:
      - db

  db:
    image: postgres:15
    environment:
      - POSTGRES_DB=tancms
      - POSTGRES_USER=postgres
      - POSTGRES_PASSWORD=password
    ports:
      - '5432:5432'
    volumes:
      - postgres_data:/var/lib/postgresql/data

volumes:
  postgres_data:
```

### Deploy Commands

```bash
# Build and run
docker-compose up -d

# Run migrations
docker-compose exec tancms npx prisma migrate deploy

# View logs
docker-compose logs -f tancms
```

## ☁️ AWS (EC2 + RDS)

Deploy to AWS for more control over infrastructure.

### Prerequisites

- AWS account
- EC2 instance (t3.small or larger)
- RDS PostgreSQL instance
- S3 bucket (for media)

### Setup Steps

1. **Launch EC2 Instance**

   ```bash
   # Amazon Linux 2
   sudo yum update -y
   sudo yum install -y nodejs npm git

   # Clone repository
   git clone https://github.com/your-username/tancms.git
   cd tancms
   ```

2. **Install Dependencies**

   ```bash
   npm install
   npx prisma generate
   ```

3. **Environment Configuration**

   ```bash
   # Create .env file
   cat > .env << EOF
   DATABASE_URL=postgresql://username:password@rds-endpoint:5432/tancms
   AUTH_SECRET=your-secret-key
   APP_URL=https://your-domain.com
   S3_ENDPOINT=https://s3.amazonaws.com
   S3_ACCESS_KEY_ID=your-access-key
   S3_SECRET_ACCESS_KEY=your-secret-key
   S3_BUCKET=your-bucket-name
   EOF
   ```

4. **Database Migration**

   ```bash
   npx prisma migrate deploy
   npx prisma db seed
   ```

5. **Build and Start**

   ```bash
   npm run build
   npm start
   ```

6. **Process Manager (PM2)**
   ```bash
   npm install -g pm2
   pm2 start npm --name "tancms" -- start
   pm2 startup
   pm2 save
   ```

### Nginx Configuration

```nginx
server {
    listen 80;
    server_name your-domain.com;
    return 301 https://$server_name$request_uri;
}

server {
    listen 443 ssl;
    server_name your-domain.com;

    ssl_certificate /path/to/cert.pem;
    ssl_certificate_key /path/to/key.pem;

    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
    }
}
```

## 🔵 DigitalOcean App Platform

Simple deployment with DigitalOcean's platform-as-a-service.

### App Spec

Create `.do/app.yaml`:

```yaml
name: tancms
services:
  - name: web
    source_dir: /
    github:
      repo: your-username/tancms
      branch: main
    run_command: npm start
    build_command: npm run build
    environment_slug: node-js
    instance_count: 1
    instance_size_slug: basic-xxs
    env:
      - key: DATABASE_URL
        value: ${db.DATABASE_URL}
      - key: AUTH_SECRET
        value: your-secret-key
      - key: APP_URL
        value: ${APP_URL}

databases:
  - name: db
    engine: PG
    version: '15'
    size_slug: db-s-1vcpu-1gb
```

### Deploy

```bash
# Install DigitalOcean CLI
doctl apps create .do/app.yaml

# Or use the web interface
# Upload app.yaml in DigitalOcean Apps dashboard
```

## 🌊 Railway

Quick deployment with Railway's developer-friendly platform.

### Setup

1. Connect repository to Railway
2. Set environment variables
3. Deploy automatically

### railway.json

```json
{
  "build": {
    "builder": "nixpacks",
    "buildCommand": "npm run build"
  },
  "deploy": {
    "startCommand": "npm start",
    "restartPolicyType": "always"
  }
}
```

## 🔧 Environment Variables Reference

### Required Variables

| Variable       | Description                           | Example                               |
| -------------- | ------------------------------------- | ------------------------------------- |
| `DATABASE_URL` | Database connection string            | `postgresql://user:pass@host:5432/db` |
| `AUTH_SECRET`  | Session encryption secret (32+ chars) | `your-32-character-secret-key`        |
| `APP_URL`      | Application base URL                  | `https://your-app.vercel.app`         |

### Optional Variables

| Variable                | Description                    | Default      |
| ----------------------- | ------------------------------ | ------------ |
| `S3_ENDPOINT`           | S3-compatible storage endpoint | -            |
| `S3_ACCESS_KEY_ID`      | S3 access key                  | -            |
| `S3_SECRET_ACCESS_KEY`  | S3 secret key                  | -            |
| `S3_BUCKET`             | S3 bucket name                 | -            |
| `PRISMA_ACCELERATE_URL` | Prisma Accelerate connection   | -            |
| `NODE_ENV`              | Environment mode               | `production` |
| `PORT`                  | Server port                    | `3000`       |

## 🗄️ Database Providers

### Vercel Postgres (Recommended for Vercel)

```bash
# Install Vercel CLI
npm i -g vercel

# Create database
vercel postgres create

# Get connection string from Vercel dashboard
```

### Neon (Serverless PostgreSQL)

1. Sign up at [neon.tech](https://neon.tech)
2. Create database
3. Copy connection string
4. Set `DATABASE_URL` environment variable

### Supabase

1. Create project at [supabase.com](https://supabase.com)
2. Get connection string from settings
3. Enable necessary extensions

### PlanetScale (MySQL)

1. Create database at [planetscale.com](https://planetscale.com)
2. Update Prisma schema for MySQL
3. Generate new migration

## 🗂️ File Storage Options

### Vercel Blob (Recommended for Vercel)

```bash
npm install @vercel/blob
```

### Cloudflare R2

```bash
# Environment variables
S3_ENDPOINT=https://account-id.r2.cloudflarestorage.com
S3_ACCESS_KEY_ID=your-access-key
S3_SECRET_ACCESS_KEY=your-secret-key
S3_BUCKET=your-bucket-name
```

### AWS S3

```bash
# Environment variables
S3_ENDPOINT=https://s3.amazonaws.com
S3_ACCESS_KEY_ID=your-access-key
S3_SECRET_ACCESS_KEY=your-secret-key
S3_BUCKET=your-bucket-name
```

## 🔍 Monitoring & Observability

### Vercel Analytics

Add to your app:

```bash
npm install @vercel/analytics
```

```tsx
// app/root.tsx
import { Analytics } from '@vercel/analytics/react'

export default function App() {
  return (
    <>
      <Outlet />
      <Analytics />
    </>
  )
}
```

### Sentry Error Tracking

```bash
npm install @sentry/node @sentry/react
```

### Uptime Monitoring

- [UptimeRobot](https://uptimerobot.com)
- [Pingdom](https://pingdom.com)
- [StatusCake](https://statuscake.com)

## 🚀 Performance Optimization

### Build Optimization

```bash
# Analyze bundle size
npm run build:analyze

# Enable compression
# Set in vercel.json or server config
```

### Database Optimization

```sql
-- Add indexes for better performance
CREATE INDEX idx_posts_published ON posts(published);
CREATE INDEX idx_posts_author ON posts(author_id);
CREATE INDEX idx_posts_created ON posts(created_at);
```

### CDN Configuration

Configure CDN for static assets:

```bash
# Vercel automatically handles this
# For other platforms, use CloudFlare or AWS CloudFront
```

## 🔄 CI/CD Pipeline

### GitHub Actions

```yaml
# .github/workflows/deploy.yml
name: Deploy

on:
  push:
    branches: [main]

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3

      - name: Setup Node.js
        uses: actions/setup-node@v3
        with:
          node-version: '18'
          cache: 'npm'

      - name: Install dependencies
        run: npm ci

      - name: Run tests
        run: npm test

      - name: Build
        run: npm run build

      - name: Deploy to Vercel
        uses: amondnet/vercel-action@v25
        with:
          vercel-token: ${{ secrets.VERCEL_TOKEN }}
          vercel-org-id: ${{ secrets.ORG_ID }}
          vercel-project-id: ${{ secrets.PROJECT_ID }}
```

## 🔐 Security Considerations

### SSL/TLS

- Use HTTPS in production
- Configure proper SSL certificates
- Enable HSTS headers

### Environment Security

- Never commit secrets to version control
- Use environment-specific configurations
- Rotate secrets regularly

### Database Security

- Use connection pooling
- Enable SSL for database connections
- Regular backups and disaster recovery

### Rate Limiting

Configure rate limiting for API endpoints:

```typescript
// Add to server configuration
const rateLimit = {
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per windowMs
}
```

## 📊 Backup & Recovery

### Database Backups

```bash
# PostgreSQL backup
pg_dump $DATABASE_URL > backup.sql

# Restore
psql $DATABASE_URL < backup.sql
```

### File Storage Backups

```bash
# S3 sync for backups
aws s3 sync s3://source-bucket s3://backup-bucket
```

## 🆘 Troubleshooting

### Common Issues

1. **Build Failures**
   - Check Node.js version compatibility
   - Clear npm cache: `npm cache clean --force`
   - Delete node_modules and reinstall

2. **Database Connection Issues**
   - Verify DATABASE_URL format
   - Check network connectivity
   - Ensure database is running

3. **Environment Variables**
   - Verify all required variables are set
   - Check for typos in variable names
   - Ensure proper encoding of special characters

### Debug Mode

```bash
# Enable debug logging
DEBUG=* npm start

# Database query logging
DATABASE_LOGGING=true npm start
```

### Health Checks

Add health check endpoint:

```typescript
// routes/api/health.ts
export async function GET() {
  try {
    await prisma.$queryRaw`SELECT 1`
    return new Response(JSON.stringify({ status: 'ok' }), {
      headers: { 'Content-Type': 'application/json' },
    })
  } catch (error) {
    return new Response(JSON.stringify({ status: 'error' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    })
  }
}
```

## 📞 Support

For deployment issues:

1. Check our [comprehensive troubleshooting guide](./TROUBLESHOOTING.md)
2. Search [GitHub Issues](https://github.com/vyquocvu/tancms/issues)
3. Create a new issue with deployment details
4. Review our [installation guide](./INSTALLATION.md) for platform-specific setup

### Additional Resources

- **[Environment Configuration](./ENVIRONMENT_CONFIGURATION.md)** - Detailed environment setup
- **[Database Guide](./DATABASE.md)** - Database configuration options
- **[API Documentation](./API.md)** - API reference for integrations
- **[Architecture Overview](./ARCHITECTURE.md)** - System design and components

Happy deploying! 🚀
