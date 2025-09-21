# Dynamic Database Adapter Usage Examples

This document provides examples of how to use TanCMS's dynamic database adapter system.

## Basic Usage

### Using the Database Manager

```typescript
import { databaseManager } from '~/server/database-manager'

// Initialize with automatic provider detection
const client = await databaseManager.initialize()

// Or initialize with specific connection string
const client = await databaseManager.initialize('mysql://user:pass@localhost:3306/db')

// Use the Prisma client
const users = await client.user.findMany()
```

### Using Environment Variables

```bash
# .env file
DATABASE_PROVIDER="mysql"
DATABASE_URL="mysql://user:password@localhost:3306/tancms"
DATABASE_POOL_SIZE="15"
DATABASE_CONNECTION_TIMEOUT="30000"
DATABASE_SSL="true"
```

## Provider-Specific Examples

### SQLite Configuration

```typescript
// Environment
DATABASE_PROVIDER="sqlite"
DATABASE_URL="file:./dev.db"

// Usage
import { databaseManager } from '~/server/database-manager'

await databaseManager.initialize()
const adapter = databaseManager.getAdapter()

// SQLite-specific features
if (adapter.provider === 'sqlite') {
  await adapter.optimizeSettings()
  await adapter.enableWALMode()
  await adapter.vacuum()
}
```

### MySQL Configuration

```typescript
// Environment
DATABASE_PROVIDER="mysql"
DATABASE_URL="mysql://user:pass@localhost:3306/tancms"
DATABASE_POOL_SIZE="10"
DATABASE_SSL="false"

// Usage
import { databaseManager } from '~/server/database-manager'

await databaseManager.initialize()
const adapter = databaseManager.getAdapter()

// MySQL-specific features
if (adapter.provider === 'mysql') {
  const version = await adapter.getServerVersion()
  const features = await adapter.checkFeatureSupport()
  
  console.log('MySQL Version:', version)
  console.log('Supports JSON:', features.supportsJSON)
  console.log('Is MariaDB:', features.isMariaDB)
  
  // Optimize tables
  await adapter.optimizeTables()
}
```

### PostgreSQL Configuration

```typescript
// Environment
DATABASE_PROVIDER="postgresql"
DATABASE_URL="postgresql://user:pass@localhost:5432/tancms"
DATABASE_POOL_SIZE="20"
DATABASE_SSL="true"

// Usage
import { databaseManager } from '~/server/database-manager'

await databaseManager.initialize()
const adapter = databaseManager.getAdapter()

// PostgreSQL-specific features
if (adapter.provider === 'postgresql') {
  const version = await adapter.getServerVersion()
  console.log('PostgreSQL Version:', version)
}
```

## Health Monitoring

### Health Check API

```typescript
// app/routes/api/health/database.ts
import { databaseManager } from '~/server/database-manager'

export async function GET() {
  const health = await databaseManager.healthCheck()
  const stats = await databaseManager.getStatistics()
  
  return Response.json({
    health,
    statistics: stats,
    timestamp: new Date().toISOString()
  })
}
```

### Connection Monitoring

```typescript
import { databaseManager } from '~/server/database-manager'

// Check connection status
const status = await databaseManager.getConnectionStatus()
console.log('Connected:', status.isConnected)
console.log('Active Connections:', status.activeConnections)
console.log('Pool Size:', status.poolSize)

// Test connection
const isConnected = await databaseManager.testConnection()
if (!isConnected) {
  console.error('Database connection failed!')
}
```

## Advanced Usage

### Dynamic Provider Switching

```typescript
import { DatabaseAdapterFactory } from '~/server/database-adapter'

// Create adapter for specific provider
const config = {
  provider: 'mysql',
  url: 'mysql://user:pass@localhost:3306/db',
  poolSize: 10,
  connectionTimeout: 30000,
  ssl: true
}

const adapter = DatabaseAdapterFactory.createAdapter(config)
const client = await adapter.initialize()
```

### Error Handling

```typescript
import { databaseManager } from '~/server/database-manager'

try {
  await databaseManager.initialize()
  
  // Database operations
  const users = await databaseManager.getClient().user.findMany()
  
} catch (error) {
  if (error.code === 'P1001') {
    console.error('Database connection failed:', error.message)
  } else if (error.code === 'P2002') {
    console.error('Unique constraint violation:', error.message)
  } else {
    console.error('Database error:', error.message)
  }
} finally {
  await databaseManager.close()
}
```

### Performance Monitoring

```typescript
import { databaseManager } from '~/server/database-manager'

// Get detailed statistics
const stats = await databaseManager.getStatistics()

console.log('Provider:', stats.provider)
console.log('Connection Status:', stats.connectionStatus)

// Provider-specific stats
if (stats.serverVersion) {
  console.log('Server Version:', stats.serverVersion)
}

if (stats.featureSupport) {
  console.log('Feature Support:', stats.featureSupport)
}
```

## Environment Templates

### Development (.env.development)

```env
DATABASE_PROVIDER="sqlite"
DATABASE_URL="file:./dev.db"
DATABASE_POOL_SIZE="5"
DATABASE_CONNECTION_TIMEOUT="10000"
DATABASE_SSL="false"
```

### Staging (.env.staging)

```env
DATABASE_PROVIDER="mysql"
DATABASE_URL="mysql://staging_user:password@staging-mysql:3306/tancms_staging"
DATABASE_POOL_SIZE="10"
DATABASE_CONNECTION_TIMEOUT="30000"
DATABASE_SSL="true"
```

### Production (.env.production)

```env
DATABASE_PROVIDER="postgresql"
DATABASE_URL="postgresql://prod_user:password@prod-postgres:5432/tancms_prod"
DATABASE_POOL_SIZE="20"
DATABASE_CONNECTION_TIMEOUT="60000"
DATABASE_SSL="true"
```

## Testing

### Unit Tests with Database Manager

```typescript
import { describe, it, expect, beforeEach, afterEach } from 'vitest'
import { DatabaseManager } from '~/server/database-manager'

describe('Database Operations', () => {
  let manager: DatabaseManager
  
  beforeEach(async () => {
    manager = new DatabaseManager()
    await manager.initialize('file::memory:?cache=shared')
  })
  
  afterEach(async () => {
    await manager.close()
  })
  
  it('should connect to database', async () => {
    const connected = await manager.testConnection()
    expect(connected).toBe(true)
  })
  
  it('should perform CRUD operations', async () => {
    const client = manager.getClient()
    
    const user = await client.user.create({
      data: {
        email: 'test@example.com',
        name: 'Test User',
        password: 'hashed_password'
      }
    })
    
    expect(user.email).toBe('test@example.com')
  })
})
```

## Deployment Examples

### Docker with MySQL

```dockerfile
# Dockerfile
FROM node:18-alpine

WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production

COPY . .
RUN npm run build

EXPOSE 3000
CMD ["npm", "start"]
```

```yaml
# docker-compose.yml
version: '3.8'
services:
  app:
    build: .
    ports:
      - "3000:3000"
    environment:
      - DATABASE_PROVIDER=mysql
      - DATABASE_URL=mysql://tancms:password@mysql:3306/tancms
      - DATABASE_POOL_SIZE=15
      - DATABASE_SSL=false
    depends_on:
      - mysql
  
  mysql:
    image: mysql:8.0
    environment:
      - MYSQL_ROOT_PASSWORD=rootpassword
      - MYSQL_DATABASE=tancms
      - MYSQL_USER=tancms
      - MYSQL_PASSWORD=password
    volumes:
      - mysql_data:/var/lib/mysql
    ports:
      - "3306:3306"

volumes:
  mysql_data:
```

### Vercel with PlanetScale

```env
# Vercel environment variables
DATABASE_PROVIDER="mysql"
DATABASE_URL="mysql://username:password@aws.connect.psdb.cloud/database?sslaccept=strict"
DATABASE_POOL_SIZE="10"
DATABASE_SSL="true"
```

This adapter system provides flexibility and scalability for TanCMS deployments across different environments and hosting providers.