# Installation Guide

This comprehensive guide covers installing TanCMS in various environments and
configurations.

## 📋 System Requirements

### Minimum Requirements

- **Node.js**: 18.0.0 or higher
- **npm**: 8.0.0 or higher (comes with Node.js)
- **Memory**: 2GB RAM minimum (4GB recommended)
- **Disk Space**: 1GB free space

### Recommended Requirements

- **Node.js**: 20.x LTS (latest stable)
- **npm**: 10.x or higher
- **Memory**: 8GB RAM for development
- **Disk Space**: 5GB free space

### Database Options

- **Development**: SQLite (default, zero-config)
- **Production**: PostgreSQL 13+ (recommended)
- **Alternative**: MySQL 8.0+

### Optional Components

- **Storage**: S3-compatible service for file uploads
- **CDN**: CloudFlare, AWS CloudFront for media delivery
- **Email**: SMTP service for notifications

## 🚀 Installation Methods

### Method 1: Quick Setup (Recommended)

Perfect for getting started quickly:

```bash
# Clone the repository
git clone https://github.com/vyquocvu/tancms.git
cd tancms

# One-command setup
npm run setup

# Start development server
npm run dev
```

### Method 2: Manual Installation

For users who prefer step-by-step control:

```bash
# Clone the repository
git clone https://github.com/vyquocvu/tancms.git
cd tancms

# Install dependencies
npm install

# Setup environment
cp .env.example .env
npm run dev:fix-env

# Database setup
npm run db:generate
npm run db:migrate
npm run db:seed

# Start development
npm run dev
```

### Method 3: Docker Setup

Using Docker for containerized development:

```bash
# Clone repository
git clone https://github.com/vyquocvu/tancms.git
cd tancms

# Build and run with Docker Compose
docker-compose up --build
```

## 🔧 Environment Configuration

### Development Environment

```bash
# Initialize development environment
npm run env:init development

# Validate configuration
npm run env:validate
```

**Key development settings:**

- Database: SQLite (file:./dev.db)
- Auth: Development-friendly settings
- Caching: Disabled for faster development
- Logging: Verbose for debugging

### Staging Environment

```bash
# Initialize staging environment
npm run env:init staging

# Configure for staging
cp .env.staging .env
# Edit .env with your staging database URL and secrets
```

**Key staging settings:**

- Database: PostgreSQL connection
- Auth: Production-like security
- Caching: Enabled for performance testing
- Logging: Balanced for monitoring

### Production Environment

```bash
# Initialize production environment
npm run env:init production

# Configure for production
cp .env.production .env
# Edit .env with your production credentials
```

**Key production settings:**

- Database: PostgreSQL with connection pooling
- Auth: Maximum security headers
- Caching: Optimized for performance
- Logging: Error-focused

## 🗄️ Database Setup

### SQLite (Development)

SQLite is configured by default and requires no additional setup:

```bash
# Database file will be created automatically
DATABASE_URL="file:./dev.db"

# Initialize database
npm run db:migrate
npm run db:seed
```

### PostgreSQL (Production)

#### Local PostgreSQL

```bash
# Install PostgreSQL (Ubuntu/Debian)
sudo apt update
sudo apt install postgresql postgresql-contrib

# Create database and user
sudo -u postgres psql
CREATE DATABASE tancms;
CREATE USER tancms_user WITH PASSWORD 'secure_password';
GRANT ALL PRIVILEGES ON DATABASE tancms TO tancms_user;
\q

# Update .env
DATABASE_URL="postgresql://tancms_user:secure_password@localhost:5432/tancms"
```

#### Cloud PostgreSQL

**Supabase:**

```bash
# Create project at https://supabase.com
# Get connection string from project settings
DATABASE_URL="postgresql://postgres:[password]@[host]:5432/postgres"
```

**Railway:**

```bash
# Create PostgreSQL service at https://railway.app
# Copy connection string from service variables
DATABASE_URL="postgresql://postgres:[password]@[host]:5432/railway"
```

**Neon:**

```bash
# Create database at https://neon.tech
# Copy connection string from dashboard
DATABASE_URL="postgresql://[user]:[password]@[host]/[database]?sslmode=require"
```

### MySQL (Alternative)

```bash
# Local MySQL setup
sudo apt install mysql-server
sudo mysql_secure_installation

# Create database
mysql -u root -p
CREATE DATABASE tancms;
CREATE USER 'tancms_user'@'localhost' IDENTIFIED BY 'secure_password';
GRANT ALL PRIVILEGES ON tancms.* TO 'tancms_user'@'localhost';
FLUSH PRIVILEGES;

# Update .env
DATABASE_URL="mysql://tancms_user:secure_password@localhost:3306/tancms"
```

## 🔐 Authentication Setup

### Basic Auth (Default)

TanCMS uses secure session-based authentication:

```bash
# Generate secure auth secret (automatic)
npm run dev:fix-env

# Or manually set in .env
AUTH_SECRET="your-32-character-ultra-secure-secret-key"
```

### OAuth Setup (Optional)

Configure external OAuth providers:

```bash
# Google OAuth
GOOGLE_CLIENT_ID="your-google-client-id"
GOOGLE_CLIENT_SECRET="your-google-client-secret"

# GitHub OAuth
GITHUB_CLIENT_ID="your-github-client-id"
GITHUB_CLIENT_SECRET="your-github-client-secret"
```

## 💾 File Storage Setup

### Local Storage (Development)

Files stored in `public/uploads` directory (default):

```bash
STORAGE_TYPE="local"
UPLOAD_DIR="./public/uploads"
```

### S3-Compatible Storage (Production)

Configure S3 or compatible services:

```bash
# AWS S3
S3_ENDPOINT="https://s3.amazonaws.com"
S3_ACCESS_KEY_ID="your-access-key"
S3_SECRET_ACCESS_KEY="your-secret-key"
S3_BUCKET="your-bucket-name"
S3_REGION="us-east-1"

# Alternative: Cloudflare R2
S3_ENDPOINT="https://your-account.r2.cloudflarestorage.com"
S3_ACCESS_KEY_ID="your-r2-access-key"
S3_SECRET_ACCESS_KEY="your-r2-secret-key"
S3_BUCKET="your-r2-bucket"
```

## 🚀 Platform-Specific Installation

### Vercel Deployment

```bash
# Install Vercel CLI
npm i -g vercel

# Deploy
vercel

# Set environment variables in Vercel dashboard:
# - DATABASE_URL
# - AUTH_SECRET
# - S3_* variables (if using S3)
```

### Railway Deployment

```bash
# Install Railway CLI
npm install -g @railway/cli

# Login and deploy
railway login
railway deploy

# Set environment variables via Railway dashboard
```

### Docker Deployment

```bash
# Build image
docker build -t tancms .

# Run container
docker run -p 3000:3000 \
  -e DATABASE_URL="your-db-url" \
  -e AUTH_SECRET="your-secret" \
  tancms
```

## 🔍 Verification & Testing

### Health Check

```bash
# Run comprehensive health check
npm run doctor

# Check specific components
npm run check-env
npm run test
npm run build
```

### Access TanCMS

1. **Frontend**: http://localhost:3000
2. **Admin Dashboard**: http://localhost:3000/admin
3. **API Endpoints**: http://localhost:3000/api

### Default Credentials

**Admin User:**

- Email: `admin@tancms.dev`
- Password: `admin123`

**Editor User:**

- Email: `editor@tancms.dev`
- Password: `editor123`

⚠️ **Important**: Change these credentials in production!

## 🔧 Troubleshooting

### Common Installation Issues

#### Node.js Version Issues

```bash
# Check Node.js version
node --version

# Install Node Version Manager (nvm)
curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.0/install.sh | bash
nvm install 20
nvm use 20
```

#### Database Connection Issues

```bash
# Verify database connectivity
npm run db:generate

# Reset database if corrupted
npm run db:reset

# Check database status
npm run env:validate
```

#### Port Already in Use

```bash
# Kill process using port 3000
lsof -ti:3000 | xargs kill -9

# Or use different port
npm run dev -- --port 3001
```

#### Permission Issues

```bash
# Fix npm permissions (Linux/macOS)
sudo chown -R $(whoami) ~/.npm
npm cache clean --force
```

### Getting Help

- **Documentation**: Check our [docs](../docs/) directory
- **Issues**: [GitHub Issues](https://github.com/vyquocvu/tancms/issues)
- **Discussions**:
  [GitHub Discussions](https://github.com/vyquocvu/tancms/discussions)
- **Discord**: [Community Discord](https://discord.gg/tancms) (if available)

## 📚 Next Steps

After successful installation:

1. **Read the User Guide**: [User Guide](./USER_GUIDE.md)
2. **Explore the API**: [API Documentation](./API.md)
3. **Customize Your Setup**:
   [Configuration Guide](./ENVIRONMENT_CONFIGURATION.md)
4. **Deploy to Production**: [Deployment Guide](./DEPLOYMENT.md)
5. **Contribute**: [Contributing Guide](../CONTRIBUTING.md)

---

Need help? Check our
[troubleshooting guide](./DEVELOPER_GUIDE.md#troubleshooting) or
[open an issue](https://github.com/vyquocvu/tancms/issues/new).
