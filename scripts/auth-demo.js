#!/usr/bin/env node

/**
 * Demo script showing TanStack Start API Authentication
 * Run with: node scripts/auth-demo.js
 */

const API_BASE = 'http://localhost:3000/api'

// Demo user credentials
const demoUser = {
  email: 'demo@tancms.com',
  password: 'SecurePassword123!',
  name: 'Demo User'
}

let authTokens = null

console.log('🚀 TanCMS API Authentication Demo')
console.log('=====================================\n')

// Simulate API calls for demonstration
async function demoRegistration() {
  console.log('1. 📝 User Registration')
  console.log('POST /api/auth?action=register')
  console.log('Request:', JSON.stringify({
    email: demoUser.email,
    password: demoUser.password,
    name: demoUser.name,
    confirmPassword: demoUser.password
  }, null, 2))

  // Mock response
  const response = {
    user: {
      id: 'demo-user-123',
      email: demoUser.email,
      name: demoUser.name,
      role: 'AUTHOR'
    },
    tokens: {
      accessToken: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...',
      refreshToken: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...',
      expiresIn: '7d'
    }
  }

  console.log('✅ Response:', JSON.stringify(response, null, 2))
  console.log('   → User registered successfully with JWT tokens\n')

  authTokens = response.tokens
  return response
}

async function demoLogin() {
  console.log('2. 🔐 User Login (with JWT + Session)')
  console.log('POST /api/auth?action=login')
  console.log('Request:', JSON.stringify({
    email: demoUser.email,
    password: demoUser.password
  }, null, 2))

  // Mock response showing both JWT and session cookie
  const response = {
    user: {
      id: 'demo-user-123',
      email: demoUser.email,
      name: demoUser.name,
      role: 'AUTHOR'
    },
    tokens: {
      accessToken: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.new-token...',
      refreshToken: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.refresh-token...',
      expiresIn: '7d'
    }
  }

  console.log('✅ Response:', JSON.stringify(response, null, 2))
  console.log('   → Headers: Set-Cookie: session=abc123...; HttpOnly; Secure')
  console.log('   → Both session cookie AND JWT tokens provided\n')

  authTokens = response.tokens
  return response
}

async function demoProtectedAccess() {
  console.log('3. 🛡️ Accessing Protected Endpoint')
  console.log('GET /api/protected')
  console.log('Headers:', JSON.stringify({
    'Authorization': `Bearer ${authTokens.accessToken}`
  }, null, 2))

  // Mock response
  const response = {
    message: 'This is a protected endpoint',
    userRole: 'AUTHOR',
    timestamp: new Date().toISOString(),
    meta: {
      authenticatedUser: {
        id: 'demo-user-123',
        email: demoUser.email,
        role: 'AUTHOR'
      },
      timestamp: new Date().toISOString()
    }
  }

  console.log('✅ Response:', JSON.stringify(response, null, 2))
  console.log('   → Access granted with user context\n')

  return response
}

async function demoRoleProtectedAccess() {
  console.log('4. 👑 Role-Protected Content Creation')
  console.log('POST /api/content/posts (requires AUTHOR role)')
  console.log('Headers:', JSON.stringify({
    'Authorization': `Bearer ${authTokens.accessToken}`,
    'Content-Type': 'application/json'
  }, null, 2))

  const requestData = {
    slug: 'my-first-post',
    fieldValues: [
      { fieldId: 'title', value: 'My First Blog Post' },
      { fieldId: 'content', value: 'This is the content of my first post...' },
      { fieldId: 'status', value: 'draft' }
    ]
  }

  console.log('Request Body:', JSON.stringify(requestData, null, 2))

  // Mock response with audit trail
  const response = {
    message: 'Entry created successfully in content type \'posts\'',
    data: {
      entry: {
        id: 'post-456',
        slug: 'my-first-post',
        fieldValues: requestData.fieldValues,
        contentTypeId: 'posts-ct-id'
      },
      createdBy: {
        id: 'demo-user-123',
        email: demoUser.email,
        role: 'AUTHOR'
      },
      timestamp: new Date().toISOString()
    },
    meta: {
      authenticatedUser: {
        id: 'demo-user-123',
        email: demoUser.email,
        role: 'AUTHOR'
      },
      timestamp: new Date().toISOString()
    }
  }

  console.log('✅ Response:', JSON.stringify(response, null, 2))
  console.log('   → Content created with audit trail\n')

  return response
}

async function demoTokenRefresh() {
  console.log('5. 🔄 Token Refresh')
  console.log('POST /api/auth?action=refresh')
  console.log('Headers:', JSON.stringify({
    'Authorization': `Bearer ${authTokens.refreshToken}`
  }, null, 2))

  // Mock response
  const response = {
    accessToken: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.refreshed-token...',
    user: {
      id: 'demo-user-123',
      email: demoUser.email,
      name: demoUser.name,
      role: 'AUTHOR'
    }
  }

  console.log('✅ Response:', JSON.stringify(response, null, 2))
  console.log('   → New access token generated\n')

  authTokens.accessToken = response.accessToken
  return response
}

async function demoRoleRestriction() {
  console.log('6. 🚫 Role Restriction Demo')
  console.log('DELETE /api/content/posts?id=post-456 (requires ADMIN role)')
  console.log('Headers:', JSON.stringify({
    'Authorization': `Bearer ${authTokens.accessToken}`
  }, null, 2))

  // Mock error response - AUTHOR trying to delete (ADMIN required)
  const response = {
    error: 'Insufficient permissions. Required: ADMIN, Current: AUTHOR',
    status: 403
  }

  console.log('❌ Response:', JSON.stringify(response, null, 2))
  console.log('   → Access denied due to insufficient role\n')

  return response
}

async function demoSessionAuth() {
  console.log('7. 🍪 Session-Based Authentication (Browser)')
  console.log('GET /api/auth?action=me')
  console.log('Headers: Cookie: session=abc123... (set by browser)')

  // Mock response using session authentication
  const response = {
    user: {
      id: 'demo-user-123',
      email: demoUser.email,
      name: demoUser.name,
      role: 'AUTHOR'
    }
  }

  console.log('✅ Response:', JSON.stringify(response, null, 2))
  console.log('   → Authenticated via session cookie\n')

  return response
}

async function demoApiKeyAuth() {
  console.log('8. 🔑 API Key Authentication (Server-to-Server)')
  console.log('GET /api/content/posts?api_key=server-api-key-123')

  // Mock response using API key authentication
  const response = {
    data: {
      posts: [
        {
          id: 'post-456',
          title: 'My First Blog Post',
          status: 'published'
        }
      ],
      pagination: {
        page: 1,
        total: 1
      }
    }
  }

  console.log('✅ Response:', JSON.stringify(response, null, 2))
  console.log('   → Authenticated via API key\n')

  return response
}

// Run the demo
async function runDemo() {
  try {
    await demoRegistration()
    await demoLogin()
    await demoProtectedAccess()
    await demoRoleProtectedAccess()
    await demoTokenRefresh()
    await demoRoleRestriction()
    await demoSessionAuth()
    await demoApiKeyAuth()

    console.log('🎉 Demo Complete!')
    console.log('=====================================')
    console.log('')
    console.log('📚 Key Features Demonstrated:')
    console.log('• JWT token authentication for API clients')
    console.log('• Session cookie authentication for browsers')
    console.log('• API key authentication for server-to-server')
    console.log('• Role-based access control (VIEWER < AUTHOR < EDITOR < ADMIN)')
    console.log('• Token refresh mechanism')
    console.log('• Audit trails for authenticated operations')
    console.log('• Middleware decorators for route protection')
    console.log('')
    console.log('📖 Documentation:')
    console.log('• API Guide: docs/API.md')
    console.log('• Authentication Guide: docs/API_AUTHENTICATION.md')
    console.log('• Test Examples: tests/auth-integration.test.ts')
    console.log('')
    console.log('🔧 Middleware Usage:')
    console.log('• withAuth(handler) - Requires any authenticated user')
    console.log('• withRole(\'ROLE\', handler) - Requires specific role or higher')
    console.log('• Manual: requireAuth(request) / requireRole(request, role)')

  } catch (error) {
    console.error('Demo failed:', error)
  }
}

// Export for testing, run if called directly
if (import.meta.url === `file://${process.argv[1]}`) {
  runDemo()
}

export {
  runDemo,
  demoUser,
  demoRegistration,
  demoLogin,
  demoProtectedAccess,
  demoRoleProtectedAccess,
  demoTokenRefresh,
  demoRoleRestriction,
  demoSessionAuth,
  demoApiKeyAuth
}