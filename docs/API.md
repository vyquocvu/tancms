# API Reference

TanCMS provides a comprehensive API for managing content, users, and media. All
API endpoints are built using TanStack Start server functions with full type
safety.

## Authentication

All admin API endpoints require authentication. Users must be logged in with
appropriate role permissions.

### Session Management

TanCMS uses session-based authentication with secure cookies.

```typescript
// Login
POST /api/auth/login
{
  "email": "user@example.com",
  "password": "password"
}

// Logout
POST /api/auth/logout

// Get current user
GET /api/auth/me
```

## Tags API

### List Tags

```typescript
GET /api/tags

Response:
{
  "id": string,
  "name": string,
  "postCount": number
}[]
```

### Create Tag

```typescript
POST /api/tags
Requires: EDITOR role or higher

{
  "name": string
}

Response: Tag
```

### Update Tag

```typescript
PUT /api/tags/:id
Requires: EDITOR role or higher

{
  "name": string
}

Response: Tag
```

### Delete Tag

```typescript
DELETE /api/tags/:id
Requires: ADMIN role

Response: { "success": true }
```

## Media API

### List Media

```typescript
GET /api/media
Query Parameters:
- page?: number (default: 1)
- limit?: number (default: 20)

Response:
{
  "media": Media[],
  "pagination": PaginationInfo
}
```

### Upload Media

```typescript
POST /api/media/upload
Requires: AUTHOR role or higher
Content-Type: multipart/form-data

{
  "file": File,
  "altText"?: string
}

Response: Media
```

### Get Upload URL (S3 Signed URL)

```typescript
POST /api/media/upload-url
Requires: AUTHOR role or higher

{
  "filename": string,
  "contentType": string,
  "size": number
}

Response:
{
  "uploadUrl": string,
  "mediaId": string,
  "fields": Record<string, string>
}
```

### Delete Media

```typescript
DELETE /api/media/:id
Requires: EDITOR role or higher

Response: { "success": true }
```

## Users API

### List Users

```typescript
GET /api/users
Requires: ADMIN role

Query Parameters:
- page?: number
- limit?: number
- role?: Role

Response: User[]
```

### Create User

```typescript
POST /api/users
Requires: ADMIN role

{
  "email": string,
  "name": string,
  "password": string,
  "role": Role
}

Response: User
```

### Update User

```typescript
PUT /api/users/:id
Requires: ADMIN role or self

{
  "email"?: string,
  "name"?: string,
  "role"?: Role  // ADMIN only
}

Response: User
```

### Delete User

```typescript
DELETE /api/users/:id
Requires: ADMIN role

Response: { "success": true }
```

## Data Types

### User

```typescript
interface User {
  id: string
  email: string
  name: string | null
  role: Role
  createdAt: string
  updatedAt: string
}

enum Role {
  ADMIN = 'ADMIN',
  EDITOR = 'EDITOR',
  AUTHOR = 'AUTHOR',
  VIEWER = 'VIEWER',
}
```

### Tag

```typescript
interface Tag {
  id: string
  name: string
}
```

### Media

```typescript
interface Media {
  id: string
  url: string
  altText: string | null
  createdAt: string
  updatedAt: string
}
```

## Error Handling

All API endpoints return structured error responses:

```typescript
// Validation Error (400)
{
  "error": "Validation failed",
  "details": [
    {
      "field": "title",
      "message": "Title is required"
    }
  ]
}

// Authentication Error (401)
{
  "error": "Authentication required"
}

// Authorization Error (403)
{
  "error": "Insufficient permissions"
}

// Not Found Error (404)
{
  "error": "Resource not found"
}

// Server Error (500)
{
  "error": "Internal server error"
}
```

## Rate Limiting

API endpoints are rate limited to prevent abuse:

- **General endpoints**: 100 requests per minute
- **Upload endpoints**: 10 requests per minute
- **Authentication endpoints**: 5 requests per minute

Rate limit headers are included in responses:

```
X-RateLimit-Limit: 100
X-RateLimit-Remaining: 95
X-RateLimit-Reset: 1640995200
```

## Pagination

List endpoints support cursor-based pagination:

```typescript
{
  "data": T[],
  "pagination": {
    "page": number,
    "limit": number,
    "total": number,
    "totalPages": number,
    "hasNext": boolean,
    "hasPrev": boolean
  }
}
```

## Filtering and Sorting

### General Filtering

```typescript
GET /api/tags?name=technology
GET /api/media?type=image
```

### Sorting

```typescript
GET /api/tags?sort=name&order=asc
GET /api/media?sort=createdAt&order=desc
```

Available sort fields vary by endpoint:

- `createdAt`
- `updatedAt`
- `name`

## Webhooks

TanCMS supports webhooks for real-time integrations:

### Event Types

- `post.created`
- `post.updated`
- `post.published`
- `post.deleted`
- `media.uploaded`
- `user.created`

### Webhook Payload

```typescript
{
  "event": string,
  "data": T,
  "timestamp": string,
  "id": string
}
```

### Configuration

Webhooks are configured through environment variables:

```bash
WEBHOOK_URL=https://your-service.com/webhook
WEBHOOK_SECRET=your-secret-key
```

## SDK / Client Libraries

### JavaScript/TypeScript

```bash
npm install @tancms/client
```

```typescript
import { TanCMSClient } from '@tancms/client'

const client = new TanCMSClient({
  baseUrl: 'https://your-cms.vercel.app',
  apiKey: 'your-api-key',
})

// Get tags
const tags = await client.tags.list()

// Create tag
const newTag = await client.tags.create({
  name: 'Technology',
})

// Upload media
const media = await client.media.upload(file)
```

## GraphQL (Coming Soon)

TanCMS will support GraphQL in addition to REST:

```graphql
query GetTags($limit: Int) {
  tags(limit: $limit) {
    id
    name
  }
}

query GetMedia($type: MediaType) {
  media(type: $type) {
    id
    url
    filename
    altText
  }
}
```
