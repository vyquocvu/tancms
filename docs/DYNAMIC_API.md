# Dynamic Content Type REST API

This document describes the implementation of REST APIs for dynamic content types in TanCMS.

## Overview

The Dynamic Content Type API provides REST endpoints that are automatically available for any content type created through the Content Type Builder. Each content type gets a full set of CRUD operations without requiring manual API endpoint creation.

## API Endpoints

For each content type, the following REST endpoints are automatically available:

```
GET    /api/{contentType}       # List entries
POST   /api/{contentType}       # Create entry
GET    /api/{contentType}/:id   # Get entry by ID
PUT    /api/{contentType}/:id   # Update entry
DELETE /api/{contentType}/:id   # Delete entry
```

Where `{contentType}` is the slug of the content type (e.g., `product`, `blog-post`, `event`).

## Implementation Files

### Core API Files

- **`app/routes/api/content-api.ts`** - Main API logic with CRUD operations
- **`app/routes/api/index.ts`** - API router and convenience functions
- **`tests/api.test.ts`** - Comprehensive test suite

### Supporting Files

- **`app/lib/mock-api.ts`** - Mock data layer (to be replaced with real database)
- **`app/server/content-type-utils.ts`** - Database utilities for content types

## API Reference

### List Entries
```http
GET /api/{contentType}?page=1&limit=10&search=keyword
```

**Query Parameters:**
- `page` (optional) - Page number for pagination (default: 1)
- `limit` (optional) - Number of entries per page (default: 10)
- `search` (optional) - Search term to filter entries

**Response:**
```json
{
  "success": true,
  "data": {
    "entries": [...],
    "contentType": {...},
    "pagination": {
      "page": 1,
      "limit": 10,
      "total": 25,
      "totalPages": 3,
      "hasNext": true,
      "hasPrev": false
    }
  }
}
```

### Create Entry
```http
POST /api/{contentType}
Content-Type: application/json
```

**Request Body:**
```json
{
  "slug": "optional-custom-slug",
  "fieldValues": [
    {
      "fieldId": "field-id-1",
      "value": "Field value"
    }
  ]
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "entry": {...},
    "contentType": {...}
  }
}
```

### Get Entry
```http
GET /api/{contentType}/{entryId}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "entry": {...},
    "contentType": {...}
  }
}
```

### Update Entry
```http
PUT /api/{contentType}/{entryId}
Content-Type: application/json
```

**Request Body:**
```json
{
  "slug": "updated-slug",
  "fieldValues": [
    {
      "fieldId": "field-id-1", 
      "value": "Updated value"
    }
  ]
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "entry": {...},
    "contentType": {...}
  }
}
```

### Delete Entry
```http
DELETE /api/{contentType}/{entryId}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "message": "Entry deleted successfully",
    "deletedEntryId": "entry-id"
  }
}
```

## Error Responses

All endpoints return structured error responses:

```json
{
  "success": false,
  "error": "Error message",
  "details": ["Detailed error information"]
}
```

**Common Error Types:**
- `Content type not found` (404) - Invalid content type slug
- `Entry not found` (404) - Invalid entry ID
- `Validation failed` (400) - Missing required fields or invalid data
- `Internal server error` (500) - Unexpected server error

## Usage Examples

### JavaScript/TypeScript
```typescript
import { api } from '~/routes/api'

// List products
const products = await api.listEntries('product', { page: 1, limit: 10 })

// Create a product
const newProduct = await api.createEntry('product', {
  fieldValues: [
    { fieldId: 'title-field-id', value: 'MacBook Pro' },
    { fieldId: 'price-field-id', value: '2999.99' }
  ]
})

// Update a product
const updated = await api.updateEntry('product', 'product-id', {
  fieldValues: [
    { fieldId: 'price-field-id', value: '2799.99' }
  ]
})

// Delete a product
const deleted = await api.deleteEntry('product', 'product-id')
```

### Fetch API
```javascript
// List entries
const response = await fetch('/api/product?page=1&limit=5')
const data = await response.json()

// Create entry
const createResponse = await fetch('/api/product', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    fieldValues: [
      { fieldId: 'field1', value: 'Product Name' }
    ]
  })
})
```

## Features

### ✅ Implemented
- Dynamic routing based on content type slug
- Full CRUD operations (Create, Read, Update, Delete)
- Field validation for required fields
- Pagination support
- Search functionality
- Type-safe responses
- Comprehensive error handling
- Auto-generated entry slugs
- Unique slug enforcement

### 🔄 Future Enhancements
- Real database integration (replace mock API)
- Authentication and authorization
- Rate limiting
- Caching
- GraphQL support
- Webhook triggers
- Batch operations
- File upload handling for media fields

## Testing

Run the test suite:
```bash
npm test tests/api.test.ts
```

The test suite covers:
- All CRUD operations
- Validation scenarios
- Error handling
- Pagination and search
- Edge cases

## Integration

To integrate with the existing admin UI:

1. Replace `mockApi` calls with the new `api` functions
2. Update the Content Entry components to use the dynamic endpoints
3. Add real HTTP server routing (Express, Fastify, or TanStack Start)

## Security Considerations

- Input validation on all fields
- Sanitization of search queries
- Authentication required for write operations
- Content type access control
- Rate limiting on API endpoints

## Performance

- Efficient pagination with cursor-based approach
- Search indexing for large datasets
- Caching of content type metadata
- Lazy loading of field values

---

This implementation provides a solid foundation for dynamic content type APIs that can scale with the growing needs of TanCMS users.