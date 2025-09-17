#!/usr/bin/env tsx

/**
 * Script to demonstrate the new standardized API response format
 */

import { ApiResponseBuilder } from '../app/lib/api-response.js'

console.log('🚀 TanCMS API Response Format Demo\n')

// Demo 1: Success Response
console.log('📋 Success Response Example:')
const successResponse = ApiResponseBuilder.success({
  message: 'Entry created successfully',
  data: {
    id: 'entry_123',
    title: 'Sample Entry',
    status: 'published'
  }
})
console.log(JSON.stringify(successResponse, null, 2))
console.log('')

// Demo 2: Validation Error
console.log('❌ Validation Error Example:')
const validationError = ApiResponseBuilder.validationError([
  "Field 'title' is required",
  "Field 'email' must be a valid email address"
])
console.log(JSON.stringify(validationError, null, 2))
console.log('')

// Demo 3: Not Found Error
console.log('🔍 Not Found Error Example:')
const notFoundError = ApiResponseBuilder.notFound('User', 'user_123')
console.log(JSON.stringify(notFoundError, null, 2))
console.log('')

// Demo 4: Authentication Error
console.log('🔐 Authentication Error Example:')
const authError = ApiResponseBuilder.authRequired('Please provide a valid API key')
console.log(JSON.stringify(authError, null, 2))
console.log('')

// Demo 5: HTTP Response Creation
console.log('🌐 HTTP Response Example:')
const httpResponse = ApiResponseBuilder.createHttpResponse(successResponse)
console.log('Status Code:', httpResponse.status)
console.log('Headers:')
console.log('  Content-Type:', httpResponse.headers.get('Content-Type'))
console.log('  X-Request-ID:', httpResponse.headers.get('X-Request-ID'))
console.log('  X-API-Version:', httpResponse.headers.get('X-API-Version'))
console.log('')

// Demo 6: Legacy Compatibility
console.log('🔄 Legacy Compatibility Example:')
const legacyResponse = {
  success: false,
  error: 'Something went wrong',
  details: ['Database connection failed']
}
const standardizedLegacy = ApiResponseBuilder.fromLegacy(legacyResponse)
console.log(JSON.stringify(standardizedLegacy, null, 2))
console.log('')

console.log('\n✅ Demo completed! All responses follow the standardized format.')
console.log('\n📚 Features demonstrated:')
console.log('  • Consistent response structure across all endpoints')
console.log('  • Standardized error codes with HTTP status mapping')
console.log('  • Request tracking with unique IDs and timestamps')
console.log('  • Environment-aware debug information')
console.log('  • Backward compatibility with legacy responses')
console.log('  • Type-safe error handling')