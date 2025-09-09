/**
 * Example usage of the TanCMS API Manager
 * This file demonstrates how to use the centralized API manager for REST operations
 */

import { api, ApiManager, configureApiManager } from '../app/lib/api-manager'

/**
 * Example 1: Basic API operations using the default api client
 */
async function basicApiExample() {
  console.log('=== Basic API Operations ===')
  
  try {
    // Get API status
    const status = await api.getStatus()
    console.log('API Status:', status.data)

    // List entries for a content type
    const productEntries = await api.listEntries('product', {
      page: 1,
      limit: 5,
      search: 'laptop'
    })
    console.log('Product entries:', productEntries.data?.entries?.length || 0)

    // Create a new product entry
    const newProduct = await api.createEntry('product', {
      slug: 'example-product',
      fieldValues: [
        { fieldId: 'field1', value: 'Example Product' },
        { fieldId: 'field2', value: '199.99' },
        { fieldId: 'field3', value: 'This is an example product created via the API manager' }
      ]
    })

    if (newProduct.success) {
      console.log('Created product:', newProduct.data?.entry?.id)

      // Get the created entry
      const retrievedProduct = await api.getEntry('product', newProduct.data!.entry!.id)
      console.log('Retrieved product:', retrievedProduct.data?.entry?.slug)

      // Update the entry
      const updatedProduct = await api.updateEntry('product', newProduct.data!.entry!.id, {
        fieldValues: [
          { fieldId: 'field1', value: 'Updated Example Product' },
          { fieldId: 'field2', value: '299.99' },
          { fieldId: 'field3', value: 'This product has been updated' }
        ]
      })
      console.log('Updated product:', updatedProduct.success)

      // Delete the entry
      const deletedProduct = await api.deleteEntry('product', newProduct.data!.entry!.id)
      console.log('Deleted product:', deletedProduct.success)
    }

  } catch (error) {
    console.error('Error in basic API example:', error)
  }
}

/**
 * Example 2: Using a custom API manager with authentication
 */
async function authenticatedApiExample() {
  console.log('\n=== Authenticated API Operations ===')
  
  // Create an API manager with authentication enabled
  const authApiManager = configureApiManager({
    enableAuth: true,
    apiKeys: ['demo-api-key', 'admin-key'],
    enableLogging: true,
    corsEnabled: true
  })

  try {
    // This should fail without API key
    const unauthorizedResponse = await authApiManager.get('/api/product')
    console.log('Without API key:', unauthorizedResponse.success) // Should be false

    // This should succeed with API key
    const authorizedResponse = await authApiManager.get('/api/product', { api_key: 'demo-api-key' })
    console.log('With API key:', authorizedResponse.success) // Should be true

    // Status endpoint should always work
    const statusResponse = await authApiManager.get('/api/status')
    console.log('Status without auth:', statusResponse.success) // Should be true

  } catch (error) {
    console.error('Error in authenticated API example:', error)
  }
}

/**
 * Example 3: Custom middleware usage
 */
async function customMiddlewareExample() {
  console.log('\n=== Custom Middleware Example ===')
  
  const customApiManager = new ApiManager({
    enableAuth: false,
    enableLogging: false,
    corsEnabled: true
  })

  // Add custom rate limiting middleware
  customApiManager.addMiddleware({
    name: 'rate-limiter',
    handler: async (request, next) => {
      console.log(`Rate limiter: Processing ${request.method} ${request.path}`)
      
      // Simple rate limiting logic (in production, you'd use Redis or similar)
      const now = Date.now()
      const rateLimitKey = `${request.path}-${request.method}`
      
      // For demo purposes, we'll allow all requests
      console.log(`Rate limit check passed for ${rateLimitKey}`)
      
      return next()
    }
  })

  // Add request timing middleware
  customApiManager.addMiddleware({
    name: 'timer',
    handler: async (request, next) => {
      const startTime = Date.now()
      const response = await next()
      const duration = Date.now() - startTime
      
      console.log(`Request ${request.method} ${request.path} took ${duration}ms`)
      
      return response
    }
  })

  try {
    // Test the custom middleware
    const response = await customApiManager.get('/api/status')
    console.log('Custom middleware response:', response.success)

    // Remove a middleware
    customApiManager.removeMiddleware('rate-limiter')
    console.log('Removed rate-limiter middleware')

    // Test again without rate limiter
    const response2 = await customApiManager.get('/api/status')
    console.log('Without rate limiter:', response2.success)

  } catch (error) {
    console.error('Error in custom middleware example:', error)
  }
}

/**
 * Example 4: Generic request handling
 */
async function genericRequestExample() {
  console.log('\n=== Generic Request Example ===')
  
  try {
    // Use the generic request method
    const getResponse = await api.request('GET', '/api/status')
    console.log('Generic GET:', getResponse.success)

    // POST request with body
    const postResponse = await api.request('POST', '/api/blog-post', {
      body: {
        fieldValues: [
          { fieldId: 'field4', value: 'API Manager Tutorial' },
          { fieldId: 'field5', value: 'Learn how to use the TanCMS API Manager...' },
          { fieldId: 'field6', value: 'true' }
        ]
      }
    })
    console.log('Generic POST:', postResponse.success)

    if (postResponse.success) {
      // Update using generic request
      const putResponse = await api.request('PUT', `/api/blog-post/${postResponse.data!.entry!.id}`, {
        body: {
          fieldValues: [
            { fieldId: 'field4', value: 'Updated API Manager Tutorial' },
            { fieldId: 'field5', value: 'Updated content about the TanCMS API Manager...' },
            { fieldId: 'field6', value: 'true' }
          ]
        }
      })
      console.log('Generic PUT:', putResponse.success)

      // Delete using generic request
      const deleteResponse = await api.request('DELETE', `/api/blog-post/${postResponse.data!.entry!.id}`)
      console.log('Generic DELETE:', deleteResponse.success)
    }

  } catch (error) {
    console.error('Error in generic request example:', error)
  }
}

/**
 * Example 5: Error handling patterns
 */
async function errorHandlingExample() {
  console.log('\n=== Error Handling Example ===')
  
  try {
    // Try to access non-existent content type
    const invalidTypeResponse = await api.listEntries('nonexistent-type')
    if (!invalidTypeResponse.success) {
      console.log('Expected error for invalid type:', invalidTypeResponse.error)
      console.log('Error details:', invalidTypeResponse.details)
    }

    // Try to get non-existent entry
    const invalidEntryResponse = await api.getEntry('product', 'nonexistent-id')
    if (!invalidEntryResponse.success) {
      console.log('Expected error for invalid entry:', invalidEntryResponse.error)
    }

    // Try to create entry with missing required fields
    const validationErrorResponse = await api.createEntry('product', {
      fieldValues: [
        // Missing required fields
        { fieldId: 'field3', value: 'Only description, missing title and price' }
      ]
    })
    if (!validationErrorResponse.success) {
      console.log('Validation error:', validationErrorResponse.error)
      console.log('Validation details:', validationErrorResponse.details)
    }

  } catch (error) {
    console.error('Error in error handling example:', error)
  }
}

/**
 * Run all examples
 */
async function runExamples() {
  console.log('TanCMS API Manager Examples\n')
  
  await basicApiExample()
  await authenticatedApiExample()
  await customMiddlewareExample()
  await genericRequestExample()
  await errorHandlingExample()
  
  console.log('\n=== Examples Complete ===')
}

// Export for use in other files or run directly
export {
  basicApiExample,
  authenticatedApiExample,
  customMiddlewareExample,
  genericRequestExample,
  errorHandlingExample,
  runExamples
}

// If running this file directly (for demonstration)
if (typeof process !== 'undefined' && process.argv[1]?.includes('api-manager-examples')) {
  runExamples().catch(console.error)
}