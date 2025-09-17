# TanCMS SQLite Database Setup

This document provides comprehensive information about the SQLite database
implementation in TanCMS.

## Database Overview

TanCMS uses **SQLite** for development and **PostgreSQL/MySQL** for production,
managed through **Prisma ORM**. The database is designed to support a
full-featured Content Management System with the following entities:

### Core Models

- **User**: Admin users with role-based permissions (ADMIN, EDITOR, AUTHOR,
  VIEWER)
- **Tag**: Categorization system for content organization
- **Media**: File uploads and media management
- **Session**: Authentication sessions for user security
- **ContentType**: Dynamic content type definitions
- **ContentEntry**: Flexible content entries based on content types

## Quick Start

### 1. Environment Setup

Copy the environment template:

```bash
cp .env.example .env
```

The default configuration uses SQLite for development:

```env
DATABASE_URL="file:./dev.db"
```

### 2. Database Initialization

```bash
# Install dependencies
npm install

# Generate Prisma client
npm run db:generate

# Run database migrations
npm run db:migrate

# Seed sample data
npm run db:seed
```

### 3. Verify Setup

```bash
# Open Prisma Studio to browse data
npm run db:studio
```

## Database Schema

### Content Type System

- **Dynamic Content Types**: Define custom content structures
- **Field Types**: Support for text, numbers, booleans, dates, relations, and
  media
- **Validation**: Built-in required and unique field constraints
- **Relationships**: Link content types together

### User Roles

- **ADMIN**: Full system access
- **EDITOR**: Can manage all content
- **AUTHOR**: Can manage own content
- **VIEWER**: Read-only access

### Performance Optimizations

The schema includes strategic indexes for:

- Content type filtering
- Creation date sorting
- User-based queries
- Session management
- User role filtering

## Available Scripts

```bash
# Database operations
npm run db:generate    # Generate Prisma client
npm run db:migrate     # Run migrations
npm run db:deploy      # Deploy to production
npm run db:seed        # Seed sample data
npm run db:studio      # Open database browser
npm run db:reset       # Reset database

# Development
npm run dev           # Start development server
npm run build         # Build for production
npm run test          # Run tests
```

## Utility Functions

The database includes helper functions for common operations:

### Tag Management

- `upsertTag()` - Create or get existing tags

### Session Management

- `cleanupExpiredSessions()` - Remove expired authentication sessions

## Sample Data

The seed script creates:

### Users

- **Admin User**: admin@tancms.dev / admin123
- **Editor User**: editor@tancms.dev / editor123

### Content

- **Tags**: Technology, Web Development, React
- **Sample Media**: Placeholder images

⚠️ **Security Note**: Change default credentials in production!

## Migration Workflow

### Creating Migrations

```bash
# After schema changes
npm run db:migrate
```

### Production Deployment

```bash
# Deploy migrations without prompts
npm run db:deploy
```

## Troubleshooting

### Common Issues

1. **Prisma Client Generation Fails**

   ```bash
   npx prisma generate --force
   ```

2. **Migration Conflicts**

   ```bash
   npm run db:reset
   npm run db:seed
   ```

3. **Database Lock Issues**
   - Ensure no other processes are using the database
   - Restart the development server

### Database File Location

SQLite database file: `./dev.db` (created automatically)

### Backup and Restore

```bash
# Backup
cp dev.db backup-$(date +%Y%m%d).db

# Restore
cp backup-20240101.db dev.db
```

## Production Configuration

For production, update your environment variables:

```env
# PostgreSQL example
DATABASE_URL="postgresql://username:password@localhost:5432/tancms"

# MySQL example
DATABASE_URL="mysql://username:password@localhost:3306/tancms"
```

Then update the Prisma schema provider accordingly.

## Performance Tips

1. **Use Indexes**: The schema includes optimized indexes for common queries
2. **Connection Pooling**: Prisma handles connection management automatically
3. **Query Optimization**: Use `include` and `select` to fetch only needed data
4. **Session Cleanup**: Regular cleanup of expired sessions improves performance

## Security Considerations

1. **Password Hashing**: Uses bcrypt with 12 rounds for secure password storage
2. **Session Management**: Time-based session expiration
3. **Role-Based Access**: Granular permission system
4. **SQL Injection**: Prisma provides automatic protection
5. **Data Validation**: Input validation through Zod schemas (recommended)

## Support

For issues or questions:

1. Check the [troubleshooting section](#troubleshooting)
2. Review Prisma documentation
3. Open an issue on the project repository
