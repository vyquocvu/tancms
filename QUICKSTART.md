# Quick Start Guide

Get TanCMS running in 5 minutes! 🚀

## ⚡ One-Command Setup

```bash
# Clone and setup
git clone https://github.com/vyquocvu/tancms.git
cd tancms
cp .env.example .env
npm install && npm run db:generate && npm run db:migrate && npm run db:seed && npm run dev
```

That's it! Your CMS is running at `http://localhost:3000`

## 🔑 Default Credentials

**Admin Access**: `http://localhost:3000/admin`

- Email: `admin@tancms.dev`
- Password: `admin123`

**Editor Access**:

- Email: `editor@tancms.dev`
- Password: `editor123`

⚠️ **Change these in production!**

## 🔧 Troubleshooting

### Common Setup Issues

#### Port 3000 Already in Use

```bash
# Kill process using port 3000
lsof -ti:3000 | xargs kill -9

# Or use different port
npm run dev -- --port 3001
```

#### Database Issues

```bash
# Reset database if corrupted
npm run db:reset

# Check database status
npm run env:validate
```

#### Permission Errors

```bash
# Fix npm permissions (Linux/macOS)
sudo chown -R $(whoami) ~/.npm

# Clear npm cache
npm cache clean --force
```

#### Environment Configuration

```bash
# Auto-fix common configuration issues
npm run dev:fix-env

# Validate environment setup
npm run env:validate
```

### Getting Help

- **Issues not listed here?** Check our
  [comprehensive troubleshooting guide](./docs/TROUBLESHOOTING.md)
- **Still stuck?**
  [Open an issue](https://github.com/vyquocvu/tancms/issues/new) on GitHub
- **Need help?** See our
  [community support options](./docs/TROUBLESHOOTING.md#getting-help)

## 📚 Next Steps

Once you have TanCMS running:

1. **Explore the Admin Interface**: Visit `/admin` to manage content
2. **Read the User Guide**: [User Guide](./docs/USER_GUIDE.md) for content
   management
3. **Check the API**: [API Documentation](./docs/API.md) for integration
4. **Customize Your Setup**:
   [Configuration Guide](./docs/ENVIRONMENT_CONFIGURATION.md)
5. **Deploy to Production**: [Deployment Guide](./docs/DEPLOYMENT.md)

Welcome to TanCMS! 🎉

## 🐳 Docker Quick Start

```bash
# Run with Docker Compose
git clone https://github.com/vyquocvu/tancms.git
cd tancms
docker-compose up -d
```

Access at `http://localhost:3000`

## 🌟 What's Included

- ✅ **Sample Posts**: Welcome post and getting started guide
- ✅ **Demo Users**: Admin and Editor accounts
- ✅ **Sample Tags**: Technology, Web Development, React
- ✅ **Media Example**: Sample image for testing

## 🎯 Next Steps

1. **Customize**: Update your site title and branding
2. **Content**: Create your first real post
3. **Deploy**: Push to Vercel for instant deployment
4. **Configure**: Set up your database and file storage

## 📚 Learn More

- [Full Documentation](./README.md)
- [API Reference](./docs/API.md)
- [Deployment Guide](./docs/DEPLOYMENT.md)
- [Contributing](./CONTRIBUTING.md)

Happy building! 🎉
