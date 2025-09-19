# API Authentication Guide

This guide covers the comprehensive authentication system in TanCMS, built with TanStack Start Server Routes.

## Overview

TanCMS provides multiple authentication methods to support different types of clients:

1. **Session-based authentication** - For web browsers using secure cookies
2. **JWT token authentication** - For API clients and mobile apps
3. **API key authentication** - For server-to-server communication

## Authentication Methods

### 1. Session-Based Authentication

Best for web applications and browsers. Uses secure HTTP-only cookies.

**Login:**
```bash
curl -X POST https://your-app.com/api/auth?action=login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "user@example.com",
    "password": "yourpassword"
  }'
```

**Response:**
```json
{
  "user": {
    "id": "user-123",
    "email": "user@example.com",
    "name": "John Doe",
    "role": "EDITOR"
  },
  "tokens": {
    "accessToken": "eyJhbGciOiJIUzI1NiIs...",
    "refreshToken": "eyJhbGciOiJIUzI1NiIs...",
    "expiresIn": "7d"
  }
}
```

The session cookie is automatically set and will be included in future requests.

### 2. JWT Token Authentication

Best for API clients, mobile apps, and stateless authentication.

**Using Access Token:**
```bash
curl -X GET https://your-app.com/api/protected \
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIs..."
```

**Refreshing Token:**
```bash
curl -X POST https://your-app.com/api/auth?action=refresh \
  -H "Authorization: Bearer your-refresh-token"
```

### 3. API Key Authentication

Best for server-to-server communication and automated systems.

```bash
curl -X GET https://your-app.com/api/endpoint?api_key=your-api-key
```

## Protecting API Routes

### Using Authentication Middleware

TanCMS provides convenient middleware for protecting your API routes:

```typescript
import { createAPIFileRoute } from '@tanstack/start/api'
import { withAuth, withRole } from '~/server/auth-helpers'

export const Route = createAPIFileRoute('/api/posts')({
  // Any authenticated user can read
  GET: withAuth(async ({ user }) => {
    return new Response(JSON.stringify({
      posts: await getPosts(),
      requestedBy: user.email
    }))
  }),

  // Only AUTHORs and above can create
  POST: withRole('AUTHOR', async ({ request, user }) => {
    const data = await request.json()
    const post = await createPost(data, user.id)
    return new Response(JSON.stringify(post), { status: 201 })
  }),

  // Only EDITORs and above can update
  PUT: withRole('EDITOR', async ({ request, user }) => {
    const data = await request.json()
    const post = await updatePost(data, user.id)
    return new Response(JSON.stringify(post))
  }),

  // Only ADMINs can delete
  DELETE: withRole('ADMIN', async ({ user }) => {
    await deletePost()
    return new Response(JSON.stringify({ success: true }))
  })
})
```

### Manual Authentication Check

For more control, you can manually check authentication:

```typescript
import { requireAuth, requireRole } from '~/server/auth-middleware'

export const Route = createAPIFileRoute('/api/custom')({
  POST: async ({ request }) => {
    // Check authentication
    const authResult = await requireAuth(request)
    if ('error' in authResult) {
      return new Response(
        JSON.stringify({ error: authResult.error }),
        { status: authResult.status }
      )
    }

    const { user } = authResult

    // Check specific role
    const roleResult = await requireRole(request, 'EDITOR')
    if ('error' in roleResult) {
      return new Response(
        JSON.stringify({ error: roleResult.error }),
        { status: roleResult.status }
      )
    }

    // Process authenticated request
    return new Response(JSON.stringify({ success: true }))
  }
})
```

## Role Hierarchy

TanCMS uses a hierarchical role system:

1. **VIEWER** (Level 1) - Read-only access
2. **AUTHOR** (Level 2) - Can create content
3. **EDITOR** (Level 3) - Can edit and publish content
4. **ADMIN** (Level 4) - Full system access

Higher roles inherit permissions from lower roles.

## Security Best Practices

### Token Security

- **Access tokens** expire in 7 days (configurable)
- **Refresh tokens** expire in 30 days (configurable)
- Use HTTPS in production
- Store tokens securely (not in localStorage for web apps)

### Environment Variables

Set these environment variables for JWT configuration:

```bash
JWT_SECRET=your-super-secret-jwt-key
AUTH_SECRET=your-auth-secret  # Fallback if JWT_SECRET not set
JWT_EXPIRES_IN=7d            # Access token expiration
JWT_REFRESH_EXPIRES_IN=30d   # Refresh token expiration
```

### Session Security

- Sessions use HTTP-only cookies
- SameSite=Strict for CSRF protection
- Secure flag in production
- 30-day expiration with automatic cleanup

## Error Responses

### Authentication Errors

```json
{
  "error": "Authentication required",
  "status": 401
}
```

### Authorization Errors

```json
{
  "error": "Insufficient permissions. Required: EDITOR, Current: AUTHOR",
  "status": 403
}
```

### Token Errors

```json
{
  "error": "Invalid or expired refresh token",
  "status": 401
}
```

## Integration Examples

### React/Frontend Integration

```typescript
// Use the built-in auth context
import { useAuth } from '~/lib/auth-context'

function MyComponent() {
  const { user, login, logout } = useAuth()

  const handleLogin = async () => {
    const result = await login('user@example.com', 'password')
    if (result.success) {
      // User is now logged in, tokens are handled automatically
    }
  }

  return (
    <div>
      {user ? (
        <p>Welcome {user.name}! Role: {user.role}</p>
      ) : (
        <button onClick={handleLogin}>Login</button>
      )}
    </div>
  )
}
```

### Node.js Client

```typescript
import fetch from 'node-fetch'

class TanCMSClient {
  private accessToken?: string
  private refreshToken?: string

  async login(email: string, password: string) {
    const response = await fetch('https://your-app.com/api/auth?action=login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password })
    })

    const data = await response.json()
    this.accessToken = data.tokens.accessToken
    this.refreshToken = data.tokens.refreshToken
    
    return data.user
  }

  async apiCall(endpoint: string, options: RequestInit = {}) {
    const response = await fetch(`https://your-app.com${endpoint}`, {
      ...options,
      headers: {
        'Authorization': `Bearer ${this.accessToken}`,
        ...options.headers
      }
    })

    if (response.status === 401) {
      // Try to refresh token
      await this.refreshAccessToken()
      
      // Retry original request
      return fetch(`https://your-app.com${endpoint}`, {
        ...options,
        headers: {
          'Authorization': `Bearer ${this.accessToken}`,
          ...options.headers
        }
      })
    }

    return response
  }

  private async refreshAccessToken() {
    const response = await fetch('https://your-app.com/api/auth?action=refresh', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${this.refreshToken}`
      }
    })

    const data = await response.json()
    this.accessToken = data.accessToken
  }
}
```

This authentication system provides enterprise-grade security while maintaining ease of use for developers.