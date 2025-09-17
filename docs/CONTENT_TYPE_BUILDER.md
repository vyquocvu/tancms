# Content Type Builder

The Content Type Builder is a powerful feature inspired by Strapi that allows
you to create custom content types with configurable fields, similar to how you
would design database schemas or API endpoints dynamically.

## Overview

This feature enables administrators to:

- **Create Custom Content Types**: Define new content structures beyond the
  default Post model
- **Configure Fields**: Add various field types (text, number, boolean, date,
  etc.) with validation rules
- **Manage Content**: Create, edit, and delete entries for each content type
- **Generate APIs**: Automatically create REST endpoints for each content type

## Database Schema

The content type builder introduces four new models:

### ContentType

- `id`: Unique identifier
- `name`: Machine-readable name (e.g., "product")
- `displayName`: Human-readable name (e.g., "Product")
- `description`: Optional description
- `slug`: URL-friendly slug for API endpoints
- `fields`: Related content fields
- `entries`: Content entries of this type

### ContentField

- `id`: Unique identifier
- `name`: Field name (e.g., "title")
- `displayName`: Human-readable field name (e.g., "Title")
- `fieldType`: Type of field (TEXT, NUMBER, BOOLEAN, etc.)
- `required`: Whether the field is required
- `unique`: Whether values must be unique
- `defaultValue`: Optional default value
- `options`: JSON configuration for field options
- `relatedType`: For relation fields, the target content type
- `order`: Display order of the field

### ContentEntry

- `id`: Unique identifier
- `contentTypeId`: Reference to the content type
- `slug`: Optional URL-friendly identifier
- `fieldValues`: Related field values

### ContentFieldValue

- `id`: Unique identifier
- `fieldId`: Reference to the content field definition
- `entryId`: Reference to the content entry
- `value`: JSON-encoded field value

## Supported Field Types

1. **TEXT**: Short text input
2. **TEXTAREA**: Multi-line text area
3. **NUMBER**: Numeric input with validation
4. **BOOLEAN**: True/false toggle
5. **DATE**: Date picker
6. **EMAIL**: Email address with validation
7. **URL**: Web URL with validation
8. **JSON**: Complex JSON data objects
9. **MEDIA**: File/image uploads (references Media model)
10. **RELATION**: Links to other content types

## API Endpoints

For each content type, the following REST endpoints are automatically available:

```
GET    /api/{contentType}       # List entries
POST   /api/{contentType}       # Create entry
GET    /api/{contentType}/:id   # Get entry by ID
PUT    /api/{contentType}/:id   # Update entry
DELETE /api/{contentType}/:id   # Delete entry
```

## Usage Examples

### Creating a Product Content Type

1. Navigate to **Admin > Content Types**
2. Click **"Create Content Type"**
3. Configure basic settings:
   - Name: `product`
   - Display Name: `Product`
   - Description: `E-commerce product catalog`

4. Add fields:
   - **Title** (TEXT, required, unique)
   - **Price** (NUMBER, required)
   - **Description** (TEXTAREA, optional)
   - **Category** (RELATION to category content type)
   - **Images** (MEDIA, multiple)

5. Save the content type

### Managing Product Entries

1. Navigate to **Admin > Content Types > Products**
2. Click **"Create Product"**
3. Fill in the dynamic form with all configured fields
4. Save to create a new product entry

### API Usage

Once created, you can interact with the Product content type via API:

```javascript
// Fetch all products
const products = await fetch('/api/product').then(r => r.json())

// Create a new product
const newProduct = await fetch('/api/product', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    fieldValues: [
      { fieldId: 'title-field-id', value: 'New Product' },
      { fieldId: 'price-field-id', value: 29.99 },
      { fieldId: 'description-field-id', value: 'Product description' },
    ],
  }),
})
```

## Implementation Details

### Server Functions

The `content-type-utils.ts` file provides comprehensive functions for:

- **Content Type Management**: `createContentType`, `updateContentType`,
  `deleteContentType`
- **Field Management**: `addFieldToContentType`, `updateContentField`,
  `deleteContentField`
- **Entry Management**: `createContentEntry`, `updateContentEntry`,
  `deleteContentEntry`
- **Data Retrieval**: `getContentTypes`, `getContentEntries`, etc.

### UI Components

1. **Content Types Listing** (`/admin/content-types`):
   - Grid and table views of all content types
   - Statistics and quick actions
   - Search and filtering

2. **Content Type Builder** (`/admin/content-types/builder`):
   - Drag-and-drop field editor
   - Field type selection with previews
   - Real-time API endpoint preview
   - Validation configuration

3. **Content Entry Management** (`/admin/content-types/{slug}`):
   - Dynamic table based on content type fields
   - Search and pagination
   - CRUD operations for entries

### Dynamic Form Generation

The system generates forms dynamically based on content type definitions:

```typescript
const renderField = (field: ContentField, value: any) => {
  switch (field.fieldType) {
    case 'TEXT':
      return <Input type="text" required={field.required} />
    case 'NUMBER':
      return <Input type="number" required={field.required} />
    case 'BOOLEAN':
      return <Checkbox required={field.required} />
    case 'DATE':
      return <DatePicker required={field.required} />
    // ... other field types
  }
}
```

## Migration

The database migration adds the new tables:

```sql
-- See: prisma/migrations/20241208000000_add_content_types/migration.sql
CREATE TABLE "ContentType" ( ... );
CREATE TABLE "ContentField" ( ... );
CREATE TABLE "ContentEntry" ( ... );
CREATE TABLE "ContentFieldValue" ( ... );
```

## Future Enhancements

1. **Field Validation**: Custom validation rules and error messages
2. **Conditional Fields**: Show/hide fields based on other field values
3. **Field Groups**: Organize fields into collapsible sections
4. **Import/Export**: Bulk import content or export content type definitions
5. **Permissions**: Field-level access control
6. **Webhooks**: Trigger events on content changes
7. **GraphQL**: Auto-generated GraphQL schema and resolvers
8. **Content Preview**: Preview how content will appear on the frontend

## Performance Considerations

- **Indexing**: Strategic database indexes on frequently queried fields
- **Caching**: Cache content type definitions and frequently accessed entries
- **Pagination**: Proper pagination for large content sets
- **Query Optimization**: Efficient joins between related tables

## Security

- **Input Validation**: All field values validated according to field type
- **SQL Injection Prevention**: Parameterized queries via Prisma
- **XSS Protection**: Content sanitization before rendering
- **RBAC Integration**: Role-based access to content type management

This content type builder provides a flexible foundation for creating complex
content structures while maintaining type safety and good performance
characteristics.
