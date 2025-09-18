# TanCMS Demo Workflow Documentation

## Overview

The TanCMS Demo Workflow is a comprehensive demonstration system that showcases the platform's capabilities through automated workflows, interactive demos, and complete feature walkthroughs.

## 🎯 Purpose

The demo workflow serves multiple purposes:

- **Feature Demonstration**: Showcase TanCMS capabilities to potential users
- **Development Testing**: Validate system functionality during development
- **Deployment Validation**: Ensure proper deployment and configuration
- **Training Material**: Provide hands-on examples for new users

## 🏗️ Architecture

### Components

1. **GitHub Actions Workflow** (`.github/workflows/demo-deployment.yml`)
   - Automated CI/CD pipeline
   - Multi-environment deployment
   - Quality checks and testing
   - Automated demo data setup

2. **Database Demo Workflow** (`app/server/db-examples.ts`)
   - Enhanced database operations examples
   - Content management demonstrations
   - User workflow examples
   - System health checks

3. **Demo Workflow Script** (`scripts/demo-workflow.js`)
   - Standalone demo execution
   - Command-line interface
   - Detailed reporting
   - Environment-specific configurations

4. **Demo Interfaces**
   - Static demo page (`public/demo.html`)
   - Admin demo interface (`demo-admin.html`)
   - Analytics demo (`app/routes/admin/analytics-demo.tsx`)

## 🚀 Getting Started

### Quick Demo

```bash
# Run the complete demo workflow
npm run demo:workflow

# Run with verbose output
npm run demo:workflow:verbose

# Run for staging environment
npm run demo:staging
```

### Manual Setup

1. **Environment Setup**
   ```bash
   # Copy environment template
   cp .env.example .env
   
   # Install dependencies
   npm install
   
   # Setup database
   npm run db:generate
   npm run db:migrate
   npm run db:seed
   ```

2. **Run Demo Components**
   ```bash
   # Start development server
   npm run dev
   
   # Access demo interfaces
   # http://localhost:3000/demo.html
   # http://localhost:3000/admin
   # http://localhost:3000/analytics
   ```

## 📋 Demo Workflow Steps

### 1. Quality Check Phase
- **Linting**: Code quality validation
- **Testing**: Unit and integration tests
- **Build Validation**: Ensure application builds successfully

### 2. Database Operations
- **Tag Management**: Create and manage demo tags
- **Session Cleanup**: Clean expired user sessions
- **Content Workflow**: Demonstrate content operations
- **User Management**: Show user workflow capabilities

### 3. System Health Validation
- **Database Connectivity**: Verify database connection
- **Data Integrity**: Check data consistency
- **Performance Metrics**: Basic performance validation

### 4. Demo Environment Setup
- **Sample Data**: Load demo content and users
- **Configuration**: Set up demo-specific settings
- **Access Credentials**: Configure demo user accounts

## 🔧 Configuration

### Environment Variables

```bash
# Demo-specific configuration
DEMO_APP_URL=https://demo.tancms.dev
DEMO_AUTH_SECRET=demo-secret-key-32-chars-minimum-length

# GitHub Actions secrets
VERCEL_TOKEN=your-vercel-token
VERCEL_ORG_ID=your-org-id
VERCEL_PROJECT_ID=your-project-id
```

### Demo Data Configuration

The demo workflow includes:

- **Default Users**:
  - Admin: `admin@tancms.dev` / `admin123`
  - Editor: `editor@tancms.dev` / `editor123`

- **Sample Content**:
  - Welcome posts and guides
  - Technology-related tags
  - Sample media files

- **Content Types**:
  - Blog posts
  - Pages
  - Portfolio items

## 🎮 Interactive Demo Features

### Admin Dashboard Demo
- Content management interface
- User role management
- Analytics and reporting
- Media library management

### Analytics Demo
- Real-time metrics simulation
- Content performance analytics
- User activity tracking
- System health monitoring

### API Demo
- RESTful API demonstrations
- Content CRUD operations
- Authentication examples
- Rate limiting and security

## 🧪 Testing the Demo Workflow

### Automated Testing

```bash
# Run the demo workflow test
npm run test -- tests/demo-workflow.test.js

# Test specific components
npm run test -- tests/db-examples.test.js
```

### Manual Testing Checklist

- [ ] Demo workflow script executes without errors
- [ ] All demo interfaces are accessible
- [ ] Sample data loads correctly
- [ ] Authentication works with demo credentials
- [ ] Admin features are functional
- [ ] Analytics demo displays data
- [ ] API endpoints respond correctly

## 📊 Monitoring and Reporting

### Workflow Reports

The demo workflow generates detailed reports including:

- Execution statistics
- System health metrics
- Performance data
- Error logs and debugging information

### Deployment Reports

GitHub Actions workflow creates:

- Deployment status reports
- Feature validation reports
- Access information and credentials
- System configuration summaries

## 🔄 Continuous Integration

### Automated Deployment

The demo workflow automatically deploys when:

- Changes are pushed to `main` branch
- Pull requests are created
- Manual workflow dispatch is triggered

### Quality Gates

Before deployment, the workflow ensures:

- ✅ Code passes linting checks
- ✅ Tests execute successfully
- ✅ Application builds without errors
- ✅ Database migrations apply correctly

## 🛠️ Customization

### Adding New Demo Features

1. **Extend Database Examples**
   ```typescript
   // Add to app/server/db-examples.ts
   async function myDemoFeature() {
     // Implementation
   }
   ```

2. **Update Workflow Script**
   ```javascript
   // Add to scripts/demo-workflow.js
   await myDemoFeature()
   ```

3. **Add to Documentation**
   - Update this file with new features
   - Add usage examples
   - Include testing instructions

### Environment-Specific Configurations

```bash
# Development
npm run demo:workflow

# Staging
npm run demo:staging

# Production (via GitHub Actions)
gh workflow run demo-deployment.yml -f environment=production
```

## 🐛 Troubleshooting

### Common Issues

1. **Database Connection Errors**
   ```bash
   # Check database URL
   npm run check-env
   
   # Reset database
   npm run db:reset
   ```

2. **Demo Data Not Loading**
   ```bash
   # Re-run seed
   npm run db:seed
   
   # Run demo workflow manually
   npm run demo:workflow:verbose
   ```

3. **Build Failures**
   ```bash
   # Clean and reinstall
   rm -rf node_modules package-lock.json
   npm install
   npm run build
   ```

### Debug Mode

```bash
# Run with debug information
DEBUG=tancms:* npm run demo:workflow:verbose
```

## 📈 Analytics and Metrics

The demo workflow tracks:

- **Execution Time**: How long each step takes
- **Success Rates**: Which components succeed/fail
- **Resource Usage**: Database queries, memory usage
- **User Interactions**: Demo interface usage patterns

## 🔐 Security Considerations

### Demo Environment Security

- Demo credentials are publicly known
- Regular cleanup of demo data
- Isolated from production systems
- Rate limiting on demo endpoints

### Access Control

- Demo users have limited permissions
- Admin features are sandboxed
- File uploads are restricted
- API endpoints are protected

## 📚 Additional Resources

- [TanCMS Architecture](./ARCHITECTURE.md)
- [API Documentation](./API.md)
- [Deployment Guide](./DEPLOYMENT.md)
- [Contributing Guidelines](../CONTRIBUTING.md)

## 🤝 Contributing

To contribute to the demo workflow:

1. Fork the repository
2. Create a feature branch
3. Add your demo enhancements
4. Update documentation
5. Test thoroughly
6. Submit a pull request

## 📞 Support

For questions about the demo workflow:

- Open an issue on GitHub
- Check the troubleshooting section
- Review existing documentation
- Contact the development team

---

**Last Updated**: December 2024  
**Version**: 1.0.0  
**Maintainer**: TanCMS Development Team