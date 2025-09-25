# TanCMS Database Setup

This document provides comprehensive information about the database
implementation in TanCMS, now supporting multiple database providers.

## Database Overview

TanCMS uses **SQLite** for development and **PostgreSQL/MySQL** for production,
managed through **Prisma ORM**. The database supports dynamic provider selection
with the following options:

- **SQLite**: Recommended for development and small deployments
- **MySQL/MariaDB**: Popular choice for shared hosting and medium-scale applications  
- **PostgreSQL**: Recommended for production and large-scale applications

The database is designed to support a full-featured Content Management System with the following entities:

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
DATABASE_PROVIDER="sqlite"
DATABASE_URL="file:./dev.db"
```

For MySQL/MariaDB:

```env
DATABASE_PROVIDER="mysql"
DATABASE_URL="mysql://username:password@localhost:3306/tancms"
```

For PostgreSQL:

```env
DATABASE_PROVIDER="postgresql"
DATABASE_URL="postgresql://username:password@localhost:5432/tancms"
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

## MySQL/MariaDB Setup

### Local MySQL Installation

#### Ubuntu/Debian
```bash
# Install MySQL Server
sudo apt update
sudo apt install mysql-server

# Secure installation
sudo mysql_secure_installation

# Create database and user
sudo mysql -u root -p
```

#### macOS (with Homebrew)
```bash
# Install MySQL
brew install mysql

# Start MySQL service
brew services start mysql

# Secure installation
mysql_secure_installation
```

#### Windows
Download and install MySQL from the [official website](https://dev.mysql.com/downloads/mysql/).

### Database Configuration

After installing MySQL, create the database and user:

```sql
-- Connect to MySQL as root
mysql -u root -p

-- Create database
CREATE DATABASE tancms CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- Create user with secure password
CREATE USER 'tancms_user'@'localhost' IDENTIFIED BY 'your_secure_password';

-- Grant permissions
GRANT ALL PRIVILEGES ON tancms.* TO 'tancms_user'@'localhost';
FLUSH PRIVILEGES;

-- Exit MySQL
EXIT;
```

### Environment Configuration

Update your `.env` file:

```env
# Database provider
DATABASE_PROVIDER="mysql"

# MySQL connection string
DATABASE_URL="mysql://tancms_user:your_secure_password@localhost:3306/tancms"

# Optional: Connection pool settings
DATABASE_POOL_SIZE="10"
DATABASE_CONNECTION_TIMEOUT="30000"
DATABASE_SSL="false"
```

### Cloud MySQL Services

#### MySQL on DigitalOcean
```env
DATABASE_URL="mysql://username:password@hostname:port/database?sslmode=require"
DATABASE_SSL="true"
```

#### MySQL on AWS RDS
```env
DATABASE_URL="mysql://username:password@rds-hostname.region.rds.amazonaws.com:3306/database"
DATABASE_SSL="true"
```

#### MySQL on Google Cloud SQL
```env
DATABASE_URL="mysql://username:password@ip-address:3306/database?sslmode=require"
DATABASE_SSL="true"
```

### MariaDB Support

TanCMS fully supports MariaDB as a drop-in replacement for MySQL:

```env
DATABASE_PROVIDER="mysql"  # Use mysql provider for MariaDB
DATABASE_URL="mysql://username:password@localhost:3306/tancms"
```

### MySQL-Specific Features

- **JSON Support**: Available in MySQL 5.7+ and MariaDB 10.2+
- **Full-text Search**: Supported with InnoDB engine
- **Connection Pooling**: Automatic connection management
- **Performance Optimization**: Table optimization and maintenance tools

### Troubleshooting MySQL

#### Common Connection Issues

1. **Access Denied Error**:
   ```bash
   # Check if user exists and has correct permissions
   mysql -u root -p -e "SELECT user, host FROM mysql.user WHERE user='tancms_user';"
   ```

2. **Can't Connect to Server**:
   ```bash
   # Check if MySQL is running
   sudo systemctl status mysql  # Linux
   brew services list | grep mysql  # macOS
   ```

3. **SSL Connection Issues**:
   ```env
   # Disable SSL for local development
   DATABASE_URL="mysql://user:pass@localhost:3306/db?sslmode=disable"
   ```

#### Performance Tuning

1. **Enable Query Cache** (MySQL 5.7 and earlier):
   ```sql
   SET GLOBAL query_cache_type = ON;
   SET GLOBAL query_cache_size = 64*1024*1024;  -- 64MB
   ```

2. **Optimize InnoDB Settings**:
   ```sql
   SET GLOBAL innodb_buffer_pool_size = 256*1024*1024;  -- 256MB
   ```

3. **Regular Maintenance**:
   ```bash
   # Using TanCMS built-in tools (when using MySQL adapter)
   npm run db:optimize  # (if implemented)
   ```

## Performance Tips

### General Performance

1. **Use Indexes**: The schema includes optimized indexes for common queries
2. **Connection Pooling**: Prisma handles connection management automatically  
3. **Query Optimization**: Use `include` and `select` to fetch only needed data
4. **Session Cleanup**: Regular cleanup of expired sessions improves performance

### SQLite-Specific Performance

1. **Enable WAL Mode**: Better concurrency for read-heavy workloads
2. **Memory Mapping**: Faster I/O for larger databases
3. **Cache Size**: Increase cache size for better performance
4. **Vacuum Regularly**: Reclaim space and optimize database

### MySQL-Specific Performance

1. **InnoDB Buffer Pool**: Increase buffer pool size for better caching
2. **Query Cache**: Enable query cache for repeated queries (MySQL 5.7 and earlier)
3. **Connection Pooling**: Optimize pool size based on workload
4. **Table Optimization**: Run OPTIMIZE TABLE periodically
5. **Index Optimization**: Use EXPLAIN to analyze query performance

### PostgreSQL-Specific Performance

1. **Shared Buffers**: Increase shared_buffers for better caching
2. **Work Memory**: Optimize work_mem for complex queries
3. **Connection Pooling**: Use external poolers like PgBouncer for high concurrency
4. **VACUUM and ANALYZE**: Regular maintenance for optimal performance

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
