/**
 * Demo script showing how to use the Dynamic Content Type API
 */

import { api } from '../app/routes/api'
import { mockApi } from '../app/lib/mock-api'

async function runDemo() {
  console.log('🚀 Dynamic Content Type API Demo\n')

  // Create a content type for blog posts
  console.log('1. Creating a "blog-post" content type...')
  const blogContentType = await mockApi.createContentType({
    name: 'blog-post',
    displayName: 'Blog Post',
    description: 'Blog post content type with title, content, and tags',
    fields: [
      {
        name: 'title',
        displayName: 'Title',
        fieldType: 'TEXT',
        required: true,
        unique: true,
        order: 0,
      },
      {
        name: 'content',
        displayName: 'Content',
        fieldType: 'TEXTAREA',
        required: true,
        unique: false,
        order: 1,
      },
      {
        name: 'published',
        displayName: 'Published',
        fieldType: 'BOOLEAN',
        required: false,
        unique: false,
        defaultValue: 'false',
        order: 2,
      },
      {
        name: 'tags',
        displayName: 'Tags',
        fieldType: 'TEXT',
        required: false,
        unique: false,
        order: 3,
      },
    ],
  })
  console.log(
    `✅ Created content type: ${blogContentType.displayName} (slug: ${blogContentType.slug})`
  )

  // Create a blog post entry
  console.log('\n2. Creating a blog post entry...')
  const createResponse = await api.createEntry('blog-post', {
    slug: 'my-first-post',
    fieldValues: [
      { fieldId: blogContentType.fields[0].id, value: 'My First Blog Post' },
      {
        fieldId: blogContentType.fields[1].id,
        value: 'This is the content of my first blog post. It talks about dynamic content types!',
      },
      { fieldId: blogContentType.fields[2].id, value: 'true' },
      { fieldId: blogContentType.fields[3].id, value: 'api, cms, dynamic' },
    ],
  })

  if (createResponse.success) {
    console.log(`✅ Created blog post: "${createResponse.data.entry.slug}"`)
    const entryId = createResponse.data.entry.id

    // List all blog posts
    console.log('\n3. Listing all blog posts...')
    const listResponse = await api.listEntries('blog-post')
    if (listResponse.success) {
      console.log(`✅ Found ${listResponse.data.entries.length} blog post(s)`)
      listResponse.data.entries.forEach((entry: any) => {
        const titleField = entry.fieldValues.find((fv: any) => fv.field.name === 'title')
        console.log(`   - ${titleField?.value} (${entry.slug})`)
      })
    }

    // Get a specific blog post
    console.log('\n4. Getting the blog post by ID...')
    const getResponse = await api.getEntry('blog-post', entryId)
    if (getResponse.success) {
      const entry = getResponse.data.entry
      const titleField = entry.fieldValues.find((fv: any) => fv.field.name === 'title')
      const contentField = entry.fieldValues.find((fv: any) => fv.field.name === 'content')
      console.log(`✅ Retrieved: "${titleField?.value}"`)
      console.log(`   Content: ${contentField?.value?.substring(0, 50)}...`)
    }

    // Update the blog post
    console.log('\n5. Updating the blog post...')
    const updateResponse = await api.updateEntry('blog-post', entryId, {
      fieldValues: [
        { fieldId: blogContentType.fields[0].id, value: 'My Updated Blog Post Title' },
        {
          fieldId: blogContentType.fields[1].id,
          value: 'This is the updated content with more details about the API!',
        },
        { fieldId: blogContentType.fields[2].id, value: 'true' },
        { fieldId: blogContentType.fields[3].id, value: 'api, cms, dynamic, updated' },
      ],
    })

    if (updateResponse.success) {
      const titleField = updateResponse.data.entry.fieldValues.find(
        (fv: any) => fv.field.name === 'title'
      )
      console.log(`✅ Updated title to: "${titleField?.value}"`)
    }

    // Search for blog posts
    console.log('\n6. Searching for posts with "API"...')
    const searchResponse = await api.listEntries('blog-post', { search: 'API' })
    if (searchResponse.success) {
      console.log(`✅ Found ${searchResponse.data.entries.length} post(s) containing "API"`)
    }

    // Delete the blog post
    console.log('\n7. Deleting the blog post...')
    const deleteResponse = await api.deleteEntry('blog-post', entryId)
    if (deleteResponse.success) {
      console.log(`✅ Deleted blog post: ${deleteResponse.data.deletedEntryId}`)
    }

    // Verify deletion
    console.log('\n8. Verifying deletion...')
    const finalListResponse = await api.listEntries('blog-post')
    if (finalListResponse.success) {
      console.log(`✅ Remaining blog posts: ${finalListResponse.data.entries.length}`)
    }
  } else {
    console.log('❌ Failed to create blog post:', createResponse.error)
    console.log('   Details:', createResponse.details)
  }

  console.log('\n🎉 Demo completed!')
}

// Available endpoints for each content type:
console.log(`
📚 Available API Endpoints for any content type:

GET    /api/{contentType}       - List entries (with pagination & search)
POST   /api/{contentType}       - Create new entry  
GET    /api/{contentType}/:id   - Get entry by ID
PUT    /api/{contentType}/:id   - Update entry
DELETE /api/{contentType}/:id   - Delete entry

Example usage:
- GET /api/blog-post?page=1&limit=10&search=typescript
- POST /api/product (with field values in body)
- PUT /api/event/abc123 (update event entry with ID abc123)
`)

// Run the demo if this file is executed directly
if (typeof require !== 'undefined' && require.main === module) {
  runDemo().catch(console.error)
}

export { runDemo }
