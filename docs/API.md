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

## Error Handling

All API endpoints return standardized error responses:

```typescript
{
  "success": false,
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Invalid input data",
    "details": ["Title is required", "Content must be at least 10 characters"]
  }
}
```

### Error Codes Reference

| Code | Description | HTTP Status |
|------|-------------|-------------|
| `VALIDATION_ERROR` | Input validation failed | 400 |
| `AUTHENTICATION_REQUIRED` | User not authenticated | 401 |
| `INSUFFICIENT_PERMISSIONS` | User lacks required permissions | 403 |
| `RESOURCE_NOT_FOUND` | Requested resource doesn't exist | 404 |
| `DUPLICATE_ENTRY` | Resource already exists | 409 |
| `RATE_LIMIT_EXCEEDED` | Too many requests | 429 |
| `INTERNAL_ERROR` | Server error | 500 |

### Example Error Responses

#### Validation Error
```typescript
{
  "success": false,
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Post validation failed",
    "details": [
      "Title must be between 1 and 200 characters",
      "Content is required",
      "Category must be a valid category ID"
    ]
  }
}
```

#### Authentication Error
```typescript
{
  "success": false,
  "error": {
    "code": "AUTHENTICATION_REQUIRED",
    "message": "Authentication required to access this resource"
  }
}
```

#### Permission Error
```typescript
{
  "success": false,
  "error": {
    "code": "INSUFFICIENT_PERMISSIONS",
    "message": "Admin role required to perform this action"
  }
}
```

## Code Examples & SDK Usage

### JavaScript/TypeScript Client

#### Basic Setup
```typescript
import { TanCMSClient } from '@tancms/client'

const client = new TanCMSClient({
  baseURL: 'https://your-tancms-site.com',
  apiKey: 'your-api-key' // For server-to-server communication
})

// Or for browser-based authentication
const client = new TanCMSClient({
  baseURL: 'https://your-tancms-site.com',
  credentials: 'include' // Uses session cookies
})
```

#### Complete Post Management Example
```typescript
// Create a new post
const createPost = async () => {
  try {
    const newPost = await client.posts.create({
      title: "Getting Started with TanCMS",
      content: "TanCMS is a modern content management system...",
      excerpt: "Learn how to build amazing websites with TanCMS",
      status: "published",
      category: "tutorials",
      tags: ["cms", "javascript", "react"],
      meta: {
        seoTitle: "TanCMS Tutorial - Build Better Websites",
        seoDescription: "Complete guide to getting started with TanCMS",
        featuredImage: "/uploads/tancms-hero.jpg"
      }
    })
    
    console.log('Post created:', newPost.data)
    return newPost.data
  } catch (error) {
    console.error('Failed to create post:', error.message)
    if (error.details) {
      error.details.forEach(detail => console.error('- ' + detail))
    }
  }
}

// Update an existing post
const updatePost = async (postId: number) => {
  try {
    const updatedPost = await client.posts.update(postId, {
      title: "Updated: Getting Started with TanCMS",
      content: "This is the updated content...",
      status: "published"
    })
    
    console.log('Post updated:', updatedPost.data)
  } catch (error) {
    if (error.code === 'RESOURCE_NOT_FOUND') {
      console.error('Post not found')
    } else {
      console.error('Update failed:', error.message)
    }
  }
}

// Get posts with filtering and pagination
const getPosts = async () => {
  try {
    const posts = await client.posts.list({
      status: 'published',
      category: 'tutorials',
      limit: 10,
      offset: 0,
      sortBy: 'createdAt',
      sortOrder: 'desc',
      search: 'TanCMS'
    })
    
    console.log(`Found ${posts.data.length} posts`)
    console.log(`Total: ${posts.total}, Page: ${posts.page}`)
    
    posts.data.forEach(post => {
      console.log(`- ${post.title} (${post.status})`)
    })
  } catch (error) {
    console.error('Failed to fetch posts:', error.message)
  }
}
```

### React Hooks Integration

```typescript
import { usePosts, usePost, useCreatePost } from '@tancms/react'

// List posts with real-time updates
function PostsList() {
  const { data: posts, loading, error } = usePosts({
    status: 'published',
    limit: 10
  })

  if (loading) return <div>Loading posts...</div>
  if (error) return <div>Error: {error.message}</div>

  return (
    <div>
      {posts?.data.map(post => (
        <article key={post.id}>
          <h2>{post.title}</h2>
          <p>{post.excerpt}</p>
          <time>{new Date(post.createdAt).toLocaleDateString()}</time>
        </article>
      ))}
    </div>
  )
}

// Create post form with validation
function CreatePostForm() {
  const createPost = useCreatePost()
  const [formData, setFormData] = useState({
    title: '',
    content: '',
    status: 'draft'
  })

  const handleSubmit = async (e) => {
    e.preventDefault()
    try {
      const result = await createPost.mutate(formData)
      console.log('Post created:', result.data)
      // Reset form or redirect
    } catch (error) {
      console.error('Creation failed:', error.message)
    }
  }

  return (
    <form onSubmit={handleSubmit}>
      <input
        type="text"
        placeholder="Post title"
        value={formData.title}
        onChange={e => setFormData({...formData, title: e.target.value})}
        required
      />
      <textarea
        placeholder="Post content"
        value={formData.content}
        onChange={e => setFormData({...formData, content: e.target.value})}
        required
      />
      <select
        value={formData.status}
        onChange={e => setFormData({...formData, status: e.target.value})}
      >
        <option value="draft">Draft</option>
        <option value="published">Published</option>
      </select>
      <button type="submit" disabled={createPost.loading}>
        {createPost.loading ? 'Creating...' : 'Create Post'}
      </button>
      
      {createPost.error && (
        <div className="error">
          {createPost.error.message}
          {createPost.error.details && (
            <ul>
              {createPost.error.details.map(detail => (
                <li key={detail}>{detail}</li>
              ))}
            </ul>
          )}
        </div>
      )}
    </form>
  )
}
```

### Python Client Example

```python
import requests
from typing import Dict, List, Optional

class TanCMSClient:
    def __init__(self, base_url: str, api_key: str = None):
        self.base_url = base_url.rstrip('/')
        self.session = requests.Session()
        if api_key:
            self.session.headers.update({'Authorization': f'Bearer {api_key}'})
    
    def create_post(self, post_data: Dict) -> Dict:
        """Create a new post"""
        response = self.session.post(
            f'{self.base_url}/api/posts',
            json=post_data
        )
        response.raise_for_status()
        return response.json()
    
    def get_posts(self, **params) -> Dict:
        """Get posts with optional filtering"""
        response = self.session.get(
            f'{self.base_url}/api/posts',
            params=params
        )
        response.raise_for_status()
        return response.json()
    
    def upload_media(self, file_path: str, alt_text: str = '') -> Dict:
        """Upload a media file"""
        with open(file_path, 'rb') as file:
            files = {'file': file}
            data = {'altText': alt_text}
            response = self.session.post(
                f'{self.base_url}/api/media/upload',
                files=files,
                data=data
            )
        response.raise_for_status()
        return response.json()

# Usage example
client = TanCMSClient('https://your-site.com', 'your-api-key')

# Create a blog post
new_post = client.create_post({
    'title': 'My Python Blog Post',
    'content': 'This post was created using Python!',
    'status': 'published',
    'tags': ['python', 'api', 'automation']
})

print(f"Created post: {new_post['data']['title']}")

# Upload an image
media = client.upload_media('./hero-image.jpg', 'Hero image for blog post')
print(f"Uploaded media: {media['data']['url']}")
```

### PHP Client Example

```php
<?php

class TanCMSClient {
    private $baseUrl;
    private $apiKey;

    public function __construct($baseUrl, $apiKey = null) {
        $this->baseUrl = rtrim($baseUrl, '/');
        $this->apiKey = $apiKey;
    }

    private function makeRequest($method, $endpoint, $data = null) {
        $url = $this->baseUrl . $endpoint;
        $headers = ['Content-Type: application/json'];
        
        if ($this->apiKey) {
            $headers[] = 'Authorization: Bearer ' . $this->apiKey;
        }

        $ch = curl_init();
        curl_setopt_array($ch, [
            CURLOPT_URL => $url,
            CURLOPT_RETURNTRANSFER => true,
            CURLOPT_HTTPHEADER => $headers,
            CURLOPT_CUSTOMREQUEST => $method,
        ]);

        if ($data && in_array($method, ['POST', 'PUT', 'PATCH'])) {
            curl_setopt($ch, CURLOPT_POSTFIELDS, json_encode($data));
        }

        $response = curl_exec($ch);
        $httpCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
        curl_close($ch);

        $decoded = json_decode($response, true);
        
        if ($httpCode >= 400) {
            throw new Exception($decoded['error']['message'] ?? 'API Error');
        }

        return $decoded;
    }

    public function createPost($postData) {
        return $this->makeRequest('POST', '/api/posts', $postData);
    }

    public function getPosts($params = []) {
        $query = http_build_query($params);
        $endpoint = '/api/posts' . ($query ? '?' . $query : '');
        return $this->makeRequest('GET', $endpoint);
    }

    public function updatePost($postId, $postData) {
        return $this->makeRequest('PUT', "/api/posts/{$postId}", $postData);
    }
}

// Usage
$client = new TanCMSClient('https://your-site.com', 'your-api-key');

try {
    // Create a post
    $newPost = $client->createPost([
        'title' => 'My PHP Blog Post',
        'content' => 'This post was created using PHP!',
        'status' => 'published'
    ]);
    
    echo "Created post: " . $newPost['data']['title'] . "\n";
    
    // Get published posts
    $posts = $client->getPosts(['status' => 'published', 'limit' => 5]);
    echo "Found " . count($posts['data']) . " published posts\n";
    
} catch (Exception $e) {
    echo "Error: " . $e->getMessage() . "\n";
}
?>
```

## Webhooks

TanCMS supports webhooks for real-time notifications of content changes.

### Webhook Events

| Event | Description | Payload |
|-------|-------------|---------|
| `post.created` | New post created | Full post object |
| `post.updated` | Post modified | Updated post object |
| `post.deleted` | Post removed | Post ID and metadata |
| `post.published` | Post status changed to published | Full post object |
| `media.uploaded` | New media file uploaded | Media object |
| `user.created` | New user registered | User object (no sensitive data) |

### Webhook Setup

```typescript
// Configure webhook endpoint
const webhook = await client.webhooks.create({
  url: 'https://your-app.com/webhooks/tancms',
  events: ['post.created', 'post.updated', 'post.published'],
  secret: 'your-webhook-secret' // For signature verification
})

// Verify webhook signature (Express.js example)
app.post('/webhooks/tancms', (req, res) => {
  const signature = req.headers['x-tancms-signature']
  const payload = JSON.stringify(req.body)
  const expectedSignature = crypto
    .createHmac('sha256', process.env.WEBHOOK_SECRET)
    .update(payload)
    .digest('hex')

  if (signature !== `sha256=${expectedSignature}`) {
    return res.status(401).send('Invalid signature')
  }

  const { event, data } = req.body
  
  switch (event) {
    case 'post.created':
      console.log('New post created:', data.title)
      // Trigger your application logic
      break
    case 'post.published':
      console.log('Post published:', data.title)
      // Send notifications, update cache, etc.
      break
  }

  res.status(200).send('OK')
})
```

## Best Practices

### Performance Optimization

1. **Use Pagination**: Always specify `limit` and `offset` for large datasets
2. **Field Selection**: Request only needed fields to reduce payload size
3. **Caching**: Implement client-side caching for frequently accessed data
4. **Compression**: Enable gzip compression for API responses

### Security Considerations

1. **API Keys**: Store API keys securely, never in client-side code
2. **HTTPS**: Always use HTTPS for API communication
3. **Rate Limiting**: Implement client-side rate limiting to respect API limits
4. **Validation**: Validate all input data before sending to API

### Error Handling Best Practices

```typescript
const handleApiCall = async (apiFunction) => {
  try {
    const result = await apiFunction()
    return { success: true, data: result.data }
  } catch (error) {
    // Log error for debugging
    console.error('API Error:', error)
    
    // Handle different error types
    switch (error.code) {
      case 'VALIDATION_ERROR':
        return { 
          success: false, 
          message: 'Please check your input data',
          details: error.details 
        }
      case 'AUTHENTICATION_REQUIRED':
        // Redirect to login
        window.location.href = '/login'
        break
      case 'INSUFFICIENT_PERMISSIONS':
        return { 
          success: false, 
          message: 'You do not have permission to perform this action' 
        }
      default:
        return { 
          success: false, 
          message: 'An unexpected error occurred. Please try again.' 
        }
    }
  }
}
```

---

For more information, see our [Developer Guide](./DEVELOPER_GUIDE.md) and [Authentication Documentation](./AUTHENTICATION.md).
