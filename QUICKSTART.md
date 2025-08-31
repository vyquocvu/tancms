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