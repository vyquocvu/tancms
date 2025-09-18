# Troubleshooting Guide

This guide helps you resolve common issues when working with TanCMS. If you
can't find a solution here, check our
[GitHub Issues](https://github.com/vyquocvu/tancms/issues) or create a new
issue.

## 🚀 Quick Diagnostics

### Health Check Commands

Run these commands to quickly identify issues:

```bash
# Comprehensive health check
npm run doctor

# Check environment configuration
npm run env:validate

# Check development status
npm run dev:status

# Auto-fix common issues
npm run dev:fix-env
```

### System Requirements Check

```bash
# Check Node.js version (requires 18+)
node --version

# Check npm version
npm --version

# Check git version
git --version

# Check available disk space
df -h .

# Check memory usage
free -h
```

## 🔧 Installation Issues

### Node.js Version Problems

#### Issue: "Unsupported Node.js version"

```bash
Error: TanCMS requires Node.js 18 or higher
```

**Solution:**

```bash
# Install Node Version Manager (nvm)
curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.0/install.sh | bash
source ~/.bashrc

# Install latest LTS Node.js
nvm install 20
nvm use 20
nvm alias default 20

# Verify version
node --version  # Should show v20.x.x
```

#### Issue: Permission denied when installing packages

```bash
Error: EACCES: permission denied, mkdir '/usr/local/lib/node_modules'
```

**Solution:**

```bash
# Option 1: Use nvm (recommended)
# Follow Node.js version solution above

# Option 2: Fix npm permissions
sudo chown -R $(whoami) ~/.npm
npm config set prefix ~/.npm-global
echo 'export PATH=~/.npm-global/bin:$PATH' >> ~/.bashrc
source ~/.bashrc

# Option 3: Use yarn instead
npm install -g yarn
yarn install
```

### Dependency Issues

#### Issue: Package installation fails

```bash
Error: Failed to fetch package from registry
```

**Solution:**

```bash
# Clear npm cache
npm cache clean --force

# Delete node_modules and package-lock.json
rm -rf node_modules package-lock.json

# Reinstall dependencies
npm install

# If still failing, try with legacy peer deps
npm install --legacy-peer-deps
```

#### Issue: Module resolution errors

```bash
Error: Cannot resolve module '@tancms/...'
```

**Solution:**

```bash
# Regenerate TypeScript types
npm run db:generate

# Clear build cache
rm -rf .vite .turbo dist

# Restart TypeScript server in your IDE
# VS Code: Ctrl+Shift+P -> "TypeScript: Restart TS Server"

# Reinstall dependencies
npm install
```

## 🗄️ Database Issues

### SQLite Issues (Development)

#### Issue: Database locked error

```bash
Error: SQLITE_BUSY: database is locked
```

**Solution:**

```bash
# Kill processes using the database file
lsof ./dev.db | awk 'NR!=1 {print $2}' | xargs kill -9

# Or reset the database
npm run db:reset

# If database file is corrupted
rm ./dev.db
npm run db:migrate
npm run db:seed
```

#### Issue: Database file not found

```bash
Error: SQLITE_CANTOPEN: unable to open database file
```

**Solution:**

```bash
# Check if database file exists
ls -la ./dev.db

# Check DATABASE_URL in .env
cat .env | grep DATABASE_URL

# If missing, initialize database
npm run db:migrate
npm run db:seed
```

### PostgreSQL Issues (Production)

#### Issue: Connection refused

```bash
Error: connect ECONNREFUSED 127.0.0.1:5432
```

**Solution:**

```bash
# Check if PostgreSQL is running
sudo systemctl status postgresql

# Start PostgreSQL if not running
sudo systemctl start postgresql

# Check connection string in .env
cat .env | grep DATABASE_URL

# Test connection manually
psql "postgresql://username:password@host:port/database"
```

#### Issue: Authentication failed

```bash
Error: password authentication failed for user "username"
```

**Solution:**

```bash
# Reset database user password
sudo -u postgres psql
ALTER USER your_username PASSWORD 'new_password';
\q

# Update .env with new password
DATABASE_URL="postgresql://your_username:new_password@localhost:5432/tancms"

# Validate connection
npm run env:validate
```

#### Issue: SSL connection required

```bash
Error: connection requires a valid client certificate
```

**Solution:**

```bash
# Add SSL parameters to connection string
DATABASE_URL="postgresql://user:pass@host:port/db?sslmode=require"

# For development with self-signed certificates
DATABASE_URL="postgresql://user:pass@host:port/db?sslmode=require&sslcert=client-cert.pem&sslkey=client-key.pem&sslrootcert=ca-cert.pem"

# Disable SSL for local development (not recommended for production)
DATABASE_URL="postgresql://user:pass@localhost:port/db?sslmode=disable"
```

### Prisma Issues

#### Issue: Prisma client not generated

```bash
Error: Cannot find module '@prisma/client'
```

**Solution:**

```bash
# Generate Prisma client
npm run db:generate

# If generation fails due to network issues
npx prisma generate --generator client

# For sandboxed environments
PRISMA_DISABLE_BINARY_VALIDATION=1 npm run db:generate
```

#### Issue: Schema out of sync

```bash
Error: Database schema is not in sync with Prisma schema
```

**Solution:**

```bash
# Apply pending migrations
npm run db:migrate

# Reset database and reapply all migrations
npm run db:reset

# For production, deploy migrations
npm run db:deploy
```

## 🌐 Environment Configuration Issues

### Environment File Problems

#### Issue: .env file not found

```bash
Warning: .env file missing
```

**Solution:**

```bash
# Copy example environment file
cp .env.example .env

# Generate secure secrets
npm run dev:fix-env

# Validate configuration
npm run env:validate
```

#### Issue: Invalid AUTH_SECRET

```bash
Error: AUTH_SECRET appears to be using a default or insecure value
```

**Solution:**

```bash
# Generate secure AUTH_SECRET automatically
npm run dev:fix-env

# Or generate manually (32+ characters)
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"

# Update .env file
AUTH_SECRET="your-generated-secure-secret-here"
```

#### Issue: Environment variable validation fails

```bash
Error: Configuration validation failed
```

**Solution:**

```bash
# Run detailed validation
npm run env:validate

# Check specific environment
npm run env:init development
npm run env:validate

# Compare environments
npm run env:compare development production

# View available templates
npm run env:templates
```

### Port and Network Issues

#### Issue: Port 3000 already in use

```bash
Error: listen EADDRINUSE: address already in use :::3000
```

**Solution:**

```bash
# Find process using port 3000
lsof -ti:3000

# Kill the process
lsof -ti:3000 | xargs kill -9

# Or use a different port
npm run dev -- --port 3001

# Or set PORT environment variable
PORT=3001 npm run dev
```

#### Issue: Network connection timeout

```bash
Error: timeout of 30000ms exceeded
```

**Solution:**

```bash
# Check internet connectivity
ping google.com

# Check firewall settings
sudo ufw status

# For corporate networks, configure proxy
npm config set proxy http://proxy.company.com:8080
npm config set https-proxy http://proxy.company.com:8080

# Skip Prisma binary download in restricted environments
PRISMA_DISABLE_BINARY_VALIDATION=1 npm install
```

## 🔐 Authentication Issues

### Session Problems

#### Issue: User logged out unexpectedly

```bash
Error: Authentication required
```

**Solution:**

```bash
# Check AUTH_SECRET consistency
grep AUTH_SECRET .env

# Clear browser cookies and localStorage
# In browser dev tools: Application > Clear Storage

# Check session expiration in config
# Default is 30 days, adjust if needed
SESSION_MAX_AGE=2592000  # 30 days in seconds
```

#### Issue: Cannot login with default credentials

```bash
Error: Invalid email or password
```

**Solution:**

```bash
# Reseed database with default users
npm run db:seed

# Check if users exist
npx prisma studio
# Navigate to User table and verify admin@tancms.dev exists

# Reset admin password manually
npm run dev
# Navigate to /admin/reset-password (if available)

# Or update directly in database
npx prisma studio
# Update user password hash
```

### CORS Issues

#### Issue: CORS error in browser

```bash
Error: Access to fetch blocked by CORS policy
```

**Solution:**

```bash
# Update CORS configuration in app.config.ts
export default defineConfig({
  server: {
    cors: {
      origin: ['http://localhost:3000', 'https://yourdomain.com'],
      credentials: true
    }
  }
})

# For development, allow all origins (not for production)
cors: {
  origin: true,
  credentials: true
}
```

## 🎨 Build and Development Issues

### Build Failures

#### Issue: TypeScript compilation errors

```bash
Error: Type 'string' is not assignable to type 'number'
```

**Solution:**

```bash
# Check TypeScript configuration
npx tsc --noEmit

# Update types after schema changes
npm run db:generate

# Clear TypeScript cache
rm -rf .tsbuildinfo

# Restart TypeScript server in your editor
# VS Code: Ctrl+Shift+P -> "TypeScript: Restart TS Server"
```

#### Issue: Vite build fails

```bash
Error: Could not resolve dependencies
```

**Solution:**

```bash
# Clear Vite cache
rm -rf .vite node_modules/.vite

# Update Vite configuration
# Check vite.config.ts for correct paths and plugins

# Try building with verbose output
npm run build -- --debug

# For memory issues during build
NODE_OPTIONS="--max-old-space-size=4096" npm run build
```

### Development Server Issues

#### Issue: Hot reload not working

```bash
Warning: HMR not connected
```

**Solution:**

```bash
# Check if running on correct port
npm run dev

# Clear browser cache
# Hard refresh: Ctrl+Shift+R (Chrome/Firefox)

# Check Vite HMR configuration
# In vite.config.ts:
server: {
  hmr: {
    port: 24678
  }
}

# Restart development server
npm run dev
```

#### Issue: CSS not updating

```bash
Styles not reflecting changes
```

**Solution:**

```bash
# Clear Tailwind cache
rm -rf .tailwindcss

# Restart dev server
npm run dev

# Check Tailwind configuration
npx tailwindcss --watch --input ./app/styles/global.css --output ./public/styles.css

# Verify CSS imports in main.tsx
```

## 📱 Browser and Client Issues

### JavaScript Errors

#### Issue: "Module not found" in browser

```bash
Error: Failed to resolve module specifier
```

**Solution:**

```bash
# Check import paths in source files
# Use relative paths for local modules
import { component } from './component'

# Use proper import syntax for packages
import { query } from '@tanstack/react-query'

# Clear browser cache
# Chrome: Ctrl+Shift+Delete
# Firefox: Ctrl+Shift+Delete
```

#### Issue: Hydration mismatch

```bash
Error: Hydration failed because the initial UI does not match
```

**Solution:**

```bash
# Check for server/client differences
# Common causes:
# - Date/time formatting
# - Random values
# - Conditional rendering based on client-only APIs

# Use useEffect for client-only code
useEffect(() => {
  // Client-only code here
}, [])

# Use dynamic imports for client-only components
const ClientComponent = dynamic(() => import('./ClientComponent'), {
  ssr: false
})
```

### Performance Issues

#### Issue: Slow page loading

```bash
Pages taking too long to load
```

**Solution:**

```bash
# Check database query performance
# Enable query logging in Prisma

# Optimize images
# Use next-gen formats (WebP, AVIF)
# Implement lazy loading

# Check bundle size
npm run build
# Look for large chunks in build output

# Use React DevTools Profiler
# Identify slow components

# Enable compression
# Add gzip/brotli compression to server
```

#### Issue: Memory leaks

```bash
Application consuming too much memory
```

**Solution:**

```bash
# Check for memory leaks in browser DevTools
# Memory tab -> Take heap snapshot

# Common causes:
# - Event listeners not cleaned up
# - Timers not cleared
# - Large objects not garbage collected

# Use useEffect cleanup
useEffect(() => {
  const interval = setInterval(callback, 1000)
  return () => clearInterval(interval)
}, [])
```

## 🚀 Deployment Issues

### Vercel Deployment

#### Issue: Build fails on Vercel

```bash
Error: Command "npm run build" exited with 1
```

**Solution:**

```bash
# Check build logs in Vercel dashboard
# Common issues:
# - Environment variables missing
# - Database connection failures
# - Memory limits exceeded

# Set environment variables in Vercel:
# PROJECT_SETTINGS -> Environment Variables
DATABASE_URL="your-production-db-url"
AUTH_SECRET="your-secure-secret"
NODE_ENV="production"

# Increase memory limit if needed
# In package.json:
"build": "NODE_OPTIONS='--max-old-space-size=2048' vite build"
```

#### Issue: Database connection fails on Vercel

```bash
Error: Can't reach database server
```

**Solution:**

```bash
# Check DATABASE_URL format for serverless
# Should include connection pooling
DATABASE_URL="postgresql://user:pass@host:port/db?pgbouncer=true&connection_limit=1"

# For Supabase
DATABASE_URL="postgresql://user:pass@host:port/db?sslmode=require"

# Test connection locally with production URL
DATABASE_URL="your-prod-url" npm run db:migrate
```

### Docker Deployment

#### Issue: Docker build fails

```bash
Error: Docker build failed at step X
```

**Solution:**

```bash
# Check Dockerfile syntax
docker build --no-cache -t tancms .

# Common issues:
# - Wrong base image
# - Missing dependencies
# - Incorrect file paths

# Use multi-stage build to reduce size
FROM node:20-alpine AS builder
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production

FROM node:20-alpine AS runner
WORKDIR /app
COPY --from=builder /app/node_modules ./node_modules
```

#### Issue: Container exits immediately

```bash
Container stopped with exit code 1
```

**Solution:**

```bash
# Check container logs
docker logs container-name

# Run container interactively for debugging
docker run -it tancms /bin/sh

# Check environment variables
docker run --env-file .env tancms

# Verify database connectivity from container
docker run tancms npm run env:validate
```

## 🔍 Debugging Tips

### Enable Debug Mode

```bash
# Enable verbose logging
DEBUG=* npm run dev

# TanStack Router debugging
DEBUG=tanstack-router npm run dev

# Prisma query logging
DATABASE_URL="your-url?log=query,info,warn,error" npm run dev
```

### Browser DevTools

1. **Network Tab**: Check API requests and responses
2. **Console**: Look for JavaScript errors
3. **Application Tab**: Check localStorage, sessionStorage, cookies
4. **Performance Tab**: Profile page loading and rendering
5. **Memory Tab**: Check for memory leaks

### Log Analysis

```bash
# Check application logs
tail -f logs/app.log

# Check system logs
sudo journalctl -u your-service -f

# Check database logs
sudo tail -f /var/log/postgresql/postgresql.log
```

## 🆘 Getting Help

### Before Asking for Help

1. ✅ Run `npm run doctor` to check system health
2. ✅ Search existing issues on GitHub
3. ✅ Check documentation for your specific case
4. ✅ Try the suggested solutions above
5. ✅ Prepare minimal reproduction steps

### Information to Include

When reporting issues, include:

- **Environment**: OS, Node.js version, npm version
- **TanCMS Version**: From package.json
- **Error Message**: Full error with stack trace
- **Steps to Reproduce**: Minimal steps to trigger the issue
- **Expected vs Actual**: What should happen vs what happens
- **Configuration**: Relevant .env variables (without secrets)

### Community Support

- **GitHub Issues**:
  [Report bugs and request features](https://github.com/vyquocvu/tancms/issues)
- **GitHub Discussions**:
  [Ask questions and share ideas](https://github.com/vyquocvu/tancms/discussions)
- **Discord Community**: Real-time chat support (if available)

### Professional Support

For enterprise users needing priority support:

- **Enterprise Support**: Priority response and dedicated help
- **Custom Development**: Feature development and integrations
- **Training Services**: Team onboarding and best practices
- **Consulting**: Architecture review and optimization

---

**Still having issues?** Open a
[GitHub issue](https://github.com/vyquocvu/tancms/issues/new) with detailed
information about your problem.
