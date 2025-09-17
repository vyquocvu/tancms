# API Manager Documentation

The TanCMS API Manager provides a centralized, middleware-based system for
handling REST API operations. It coordinates all API functionality with support
for authentication, logging, CORS, and custom middleware.

## Features

- **Centralized API Management**: Single point of control for all API operations
- **Middleware Support**: Extensible middleware system for cross-cutting
  concerns
- **Built-in Authentication**: API key-based authentication with configurable
  keys
- **Request Logging**: Automatic request/response logging with timing
- **CORS Support**: Cross-Origin Resource Sharing for browser clients
- **Error Handling**: Consistent error responses across all endpoints
- **Type Safety**: Full TypeScript support with comprehensive type definitions

## Quick Start

### Basic Usage

```typescript
import { api } from '~/lib/api-manager'

// Get API status
const status = await api.getStatus()

// List content entries
const entries = await api.listEntries('product', {
  page: 1,
  limit: 10,
  search: 'laptop',
})

// Create a new entry
const newEntry = await api.createEntry('product', {
  fieldValues: [
    { fieldId: 'title-field-id', value: 'New Product' },
    { fieldId: 'price-field-id', value: '99.99' },
  ],
})
```

### HTTP Endpoints

The API manager automatically exposes HTTP endpoints via TanStack Start:

```bash
# Get API status
GET /api/status

# List entries for a content type
GET /api/{contentType}?page=1&limit=10&search=term

# Get a specific entry
GET /api/{contentType}/{entryId}

# Create a new entry
POST /api/{contentType}
Content-Type: application/json
{
  "fieldValues": [
    { "fieldId": "field1", "value": "Title" },
    { "fieldId": "field2", "value": "99.99" }
  ]
}

# Update an entry
PUT /api/{contentType}/{entryId}
Content-Type: application/json
{
  "fieldValues": [
    { "fieldId": "field1", "value": "Updated Title" }
  ]
}

# Delete an entry
DELETE /api/{contentType}/{entryId}
```

## Configuration

### Environment Variables

```bash
# Enable authentication in production
API_KEYS=key1,key2,key3

# The API manager will automatically:
# - Enable auth when API_KEYS is set and NODE_ENV=production
# - Disable logging when NODE_ENV=test
# - Enable CORS by default
```

### Programmatic Configuration

```typescript
import { configureApiManager } from '~/lib/api-manager'

const apiManager = configureApiManager({
  enableAuth: true,
  apiKeys: ['my-secret-key'],
  enableLogging: true,
  corsEnabled: true,
  rateLimit: {
    windowMs: 15 * 60 * 1000, // 15 minutes
    maxRequests: 100,
  },
})
```

## Authentication

When authentication is enabled, API requests must include an API key:

```bash
# As query parameter
GET /api/product?api_key=your-secret-key

# Alternative parameter name
GET /api/product?apiKey=your-secret-key
```

The `/api/status` endpoint is always accessible without authentication.

### Error Responses

```json
{
  "success": false,
  "error": "Authentication required",
  "details": ["API key is required. Provide it as ?api_key=your_key"]
}
```

## Middleware System

### Built-in Middleware

1. **Logging Middleware**: Logs requests and responses with timing
2. **Authentication Middleware**: Validates API keys
3. **CORS Middleware**: Adds Cross-Origin Resource Sharing headers

### Custom Middleware

```typescript
import { ApiManager } from '~/lib/api-manager'

const apiManager = new ApiManager()

apiManager.addMiddleware({
  name: 'rate-limiter',
  handler: async (request, next) => {
    // Rate limiting logic here
    const allowed = await checkRateLimit(request)

    if (!allowed) {
      return {
        success: false,
        error: 'Rate limit exceeded',
        details: ['Too many requests. Please try again later.'],
      }
    }

    return next()
  },
})
```

## API Response Format

All API endpoints return a consistent response format:

### Success Response

```json
{
  "success": true,
  "data": {
    // Response data here
  }
}
```

### Error Response

```json
{
  "success": false,
  "error": "Brief error description",
  "details": ["Detailed error message", "Additional context if needed"]
}
```

## Content Type API

### List Entries

```typescript
// GET /api/{contentType}
const response = await api.listEntries('product', {
  page: 1,
  limit: 10,
  search: 'laptop'
})

// Response format
{
  "success": true,
  "data": {
    "entries": [...],
    "contentType": {...},
    "pagination": {
      "page": 1,
      "limit": 10,
      "total": 50,
      "totalPages": 5,
      "hasNext": true,
      "hasPrev": false
    }
  }
}
```

### Get Single Entry

```typescript
// GET /api/{contentType}/{entryId}
const response = await api.getEntry('product', 'entry-123')

// Response format
{
  "success": true,
  "data": {
    "entry": {
      "id": "entry-123",
      "contentTypeId": "content-type-id",
      "slug": "product-slug",
      "fieldValues": [
        {
          "id": "fv-1",
          "fieldId": "field-1",
          "value": "Product Title",
          "field": {...}
        }
      ],
      "createdAt": "2024-01-20T10:00:00Z",
      "updatedAt": "2024-01-22T15:30:00Z"
    },
    "contentType": {...}
  }
}
```

### Create Entry

```typescript
// POST /api/{contentType}
const response = await api.createEntry('product', {
  slug: 'custom-slug', // Optional
  fieldValues: [
    { fieldId: 'title-field', value: 'New Product' },
    { fieldId: 'price-field', value: '99.99' },
  ],
})

// Response format: Same as get single entry
```

### Update Entry

```typescript
// PUT /api/{contentType}/{entryId}
const response = await api.updateEntry('product', 'entry-123', {
  fieldValues: [{ fieldId: 'title-field', value: 'Updated Title' }],
})

// Response format: Same as get single entry
```

### Delete Entry

```typescript
// DELETE /api/{contentType}/{entryId}
const response = await api.deleteEntry('product', 'entry-123')

// Response format
{
  "success": true,
  "data": {
    "message": "Entry deleted successfully",
    "deletedEntryId": "entry-123"
  }
}
```

## Error Codes

| HTTP Status | Error Type            | Description                              |
| ----------- | --------------------- | ---------------------------------------- |
| 200         | Success               | Request successful                       |
| 201         | Created               | Resource created successfully            |
| 400         | Bad Request           | Invalid request data or validation error |
| 401         | Unauthorized          | Authentication required or failed        |
| 404         | Not Found             | Resource not found                       |
| 429         | Too Many Requests     | Rate limit exceeded                      |
| 500         | Internal Server Error | Server error                             |

## Common Error Scenarios

### Content Type Not Found

```json
{
  "success": false,
  "error": "Content type not found",
  "details": ["Content type with slug 'invalid-type' does not exist"]
}
```

### Validation Errors

```json
{
  "success": false,
  "error": "Validation failed",
  "details": ["Field 'Title' is required", "Field 'Price' is required"]
}
```

### Entry Not Found

```json
{
  "success": false,
  "error": "Entry not found",
  "details": ["Entry with ID 'invalid-id' not found in content type 'product'"]
}
```

## Development and Testing

### Running Tests

```bash
npm test                 # Run all tests
npm run test:coverage    # Run tests with coverage
npm run test:ui          # Run tests with UI
```

### Debug Logging

Enable detailed logging in development:

```typescript
import { configureApiManager } from '~/lib/api-manager'

const apiManager = configureApiManager({
  enableLogging: true, // Will log all requests/responses
})
```

## Security Considerations

1. **API Keys**: Store API keys securely and rotate them regularly
2. **Environment Variables**: Never commit API keys to version control
3. **HTTPS**: Always use HTTPS in production
4. **Rate Limiting**: Implement rate limiting for production use
5. **Input Validation**: All inputs are validated before processing
6. **Error Messages**: Error messages don't expose sensitive information

## Performance Tips

1. **Pagination**: Use pagination for large datasets
2. **Search Filtering**: Apply search filters to reduce response size
3. **Caching**: Consider implementing response caching for frequently accessed
   data
4. **Database Optimization**: Ensure proper database indexing for content fields

## Migration from Legacy API

If you're migrating from the old API system:

```typescript
// Old way
import { api } from '~/routes/api'

// New way
import { api } from '~/lib/api-manager'

// The API interface remains the same for compatibility
const entries = await api.listEntries('product')
```

The new API manager is backward compatible with the existing API interface while
adding new features and better error handling.
