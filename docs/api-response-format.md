# API Response Format Documentation

## Overview

TanCMS now uses a standardized API response format across all endpoints for
improved consistency, error handling, and developer experience.

## Response Structure

All API responses follow this standardized structure:

```typescript
{
  success: boolean           // Indicates if the request was successful
  message: string            // Human-readable message describing the outcome
  data?: T                   // Response payload (only present on success)
  error?: {                  // Error details (only present on failure)
    code: ApiErrorCode       // Standardized error code
    message: string          // Error message
    details?: string[]       // Additional error details
    debug?: unknown          // Debug information (non-production only)
  }
  meta: {                    // Response metadata
    requestId: string        // Unique request identifier
    timestamp: string        // ISO timestamp when response was generated
    version: string          // API version
    processingTime?: number  // Processing time in milliseconds (when available)
  }
}
```

## Error Codes

The API uses standardized error codes with appropriate HTTP status codes:

| Error Code                | HTTP Status | Description                                          |
| ------------------------- | ----------- | ---------------------------------------------------- |
| `VALIDATION_ERROR`        | 400         | Input validation failed                              |
| `BAD_REQUEST`             | 400         | Invalid request format or missing required data      |
| `AUTHENTICATION_REQUIRED` | 401         | Authentication is required but not provided          |
| `AUTHENTICATION_FAILED`   | 401         | Invalid credentials provided                         |
| `AUTHORIZATION_FAILED`    | 403         | Insufficient permissions for the requested operation |
| `NOT_FOUND`               | 404         | Requested resource was not found                     |
| `METHOD_NOT_ALLOWED`      | 405         | HTTP method not supported for this endpoint          |
| `CONFLICT`                | 409         | Resource conflict (e.g., duplicate data)             |
| `RATE_LIMITED`            | 429         | Rate limit exceeded                                  |
| `INTERNAL_SERVER_ERROR`   | 500         | Unexpected server error                              |

## Response Examples

### Success Response

```json
{
  "success": true,
  "message": "Entry created successfully in content type 'products'",
  "data": {
    "entry": {
      "id": "entry_123",
      "slug": "new-product",
      "fieldValues": [
        {
          "fieldId": "field_title",
          "value": "New Product"
        }
      ]
    },
    "contentType": {
      "id": "ct_products",
      "slug": "products",
      "displayName": "Products"
    }
  },
  "meta": {
    "requestId": "req_abc123",
    "timestamp": "2024-01-20T10:30:00.000Z",
    "version": "1.0.0",
    "processingTime": 45
  }
}
```

### Error Response

```json
{
  "success": false,
  "message": "Validation failed",
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Validation failed",
    "details": [
      "Field 'Title' is required",
      "Field 'Price' must be a valid number"
    ]
  },
  "meta": {
    "requestId": "req_def456",
    "timestamp": "2024-01-20T10:30:05.000Z",
    "version": "1.0.0"
  }
}
```

## Headers

All API responses include standard headers:

- `Content-Type: application/json`
- `X-Request-ID: <unique-request-id>`
- `X-API-Version: <api-version>`
- Standard CORS headers for cross-origin requests

## Backward Compatibility

The new response format maintains backward compatibility:

- The `success` field continues to indicate success/failure
- Success responses still include `data` field
- Error responses still provide error information
- Existing client code will continue to work with minimal adjustments

## Environment-Specific Features

### Debug Information

In non-production environments, error responses may include debug information:

```json
{
  "success": false,
  "message": "Internal server error",
  "error": {
    "code": "INTERNAL_SERVER_ERROR",
    "message": "Internal server error",
    "details": ["Database connection failed"],
    "debug": {
      "stack": "Error: Connection timeout...",
      "context": {...}
    }
  },
  "meta": {...}
}
```

In production environments, the `debug` field is automatically excluded for
security.

## Usage in Client Applications

### JavaScript/TypeScript

```typescript
// Type-safe response handling
interface ProductEntry {
  id: string
  name: string
  price: number
}

const response = await fetch('/api/products', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify(newProduct),
})

const apiResponse: StandardApiResponse<{ entry: ProductEntry }> =
  await response.json()

if (apiResponse.success) {
  console.log('Created product:', apiResponse.data.entry)
  console.log('Request ID:', apiResponse.meta.requestId)
} else {
  console.error('Error:', apiResponse.error?.code)
  console.error('Details:', apiResponse.error?.details)
}
```

### Error Handling Best Practices

```typescript
function handleApiError(response: StandardApiResponse) {
  if (!response.success && response.error) {
    switch (response.error.code) {
      case 'VALIDATION_ERROR':
        // Show validation errors to user
        showValidationErrors(response.error.details || [])
        break
      case 'AUTHENTICATION_REQUIRED':
        // Redirect to login
        redirectToLogin()
        break
      case 'NOT_FOUND':
        // Show not found message
        showNotFoundMessage(response.message)
        break
      default:
        // Show generic error
        showGenericError(response.message)
    }
  }
}
```

## Migration Guide

For existing client applications, minimal changes are required:

1. **Success responses**: Continue using `response.success` and `response.data`
2. **Error handling**: Update to use `response.error.code` instead of
   `response.error` for error type checking
3. **Error messages**: Use `response.message` for user-facing messages
4. **Error details**: Access detailed errors via `response.error.details`
   instead of `response.details`

### Before (Legacy)

```typescript
if (!response.success) {
  console.error('Error:', response.error)
  console.error('Details:', response.details)
}
```

### After (Standardized)

```typescript
if (!response.success) {
  console.error('Error:', response.error?.code)
  console.error('Message:', response.message)
  console.error('Details:', response.error?.details)
}
```

## Benefits

1. **Consistency**: All endpoints use the same response structure
2. **Better Error Handling**: Categorized error codes with appropriate HTTP
   status codes
3. **Request Tracking**: Unique request IDs for debugging and monitoring
4. **Type Safety**: Full TypeScript support for error handling
5. **Security**: Environment-aware debug information
6. **Developer Experience**: Predictable responses and comprehensive error
   information
7. **Integration Reliability**: Standardized structure makes client integration
   easier
