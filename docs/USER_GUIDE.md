# User Guide

This guide helps content creators, editors, and administrators effectively use
TanCMS for content management.

## 🏠 Getting Started

### Accessing TanCMS

1. **Frontend Website**: `https://yourdomain.com` - Public-facing site
2. **Admin Dashboard**: `https://yourdomain.com/admin` - Content management
   interface

### User Roles & Permissions

| Role       | Permissions                           |
| ---------- | ------------------------------------- |
| **Viewer** | Read-only access to content           |
| **Author** | Create and edit own content           |
| **Editor** | Manage all content, moderate comments |
| **Admin**  | Full system access, user management   |

## 📝 Content Management

### Creating Your First Post

1. **Access Admin Dashboard**
   - Navigate to `/admin`
   - Login with your credentials
   - Click "Posts" in the sidebar

2. **Create New Post**

   ```
   1. Click "New Post" button
   2. Enter post title
   3. Select category/tags
   4. Write content in the editor
   5. Set publish status (Draft/Published)
   6. Click "Save" or "Publish"
   ```

3. **Content Editor Features**
   - **Rich Text Editor**: Format text, add links, images
   - **Media Library**: Upload and manage files
   - **SEO Settings**: Meta titles, descriptions
   - **Scheduling**: Set publish date/time

### Managing Content

#### Post Status Options

- **Draft**: Work in progress, not visible to public
- **Published**: Live and visible to visitors
- **Scheduled**: Will publish automatically at set time

#### Content Organization

- **Categories**: Broad content groupings (e.g., "News", "Blog")
- **Tags**: Specific keywords (e.g., "javascript", "tutorial")
- **Featured Posts**: Highlighted content for homepage

### Media Management

#### Uploading Files

```
1. Go to "Media" section
2. Click "Upload" or drag & drop files
3. Add alt text for images (for accessibility)
4. Organize into folders if needed
```

#### Supported File Types

- **Images**: JPG, PNG, GIF, WebP (up to 10MB)
- **Documents**: PDF, DOC, DOCX (up to 25MB)
- **Videos**: MP4, WebM (up to 100MB)

#### Image Optimization

- Images are automatically resized for web
- Multiple sizes generated for responsive design
- WebP format used when supported

## 👥 User Management

### Managing User Accounts (Admin Only)

#### Creating New Users

```
1. Navigate to "Users" section
2. Click "Add New User"
3. Fill in user details:
   - Email address
   - Full name
   - Role assignment
   - Initial password
4. Send invitation email
```

#### User Profile Management

- **Profile Information**: Name, bio, avatar
- **Security Settings**: Password, two-factor auth
- **Notification Preferences**: Email alerts, digest frequency

### Role Assignment

#### Author Role

- Create and edit own posts
- Upload media files
- Access to drafts and published content
- Cannot delete published posts

#### Editor Role

- Manage all content from all authors
- Moderate and approve comments
- Manage categories and tags
- Access to analytics dashboard

#### Admin Role

- Full system access
- User management and role assignment
- System settings and configuration
- Plugin and theme management

## 🎨 Customization

### Site Settings

#### General Settings

- **Site Title**: Your website name
- **Tagline**: Brief description
- **Logo**: Upload site logo (recommended: 300x100px)
- **Favicon**: Small icon for browser tabs (32x32px)

#### Content Settings

- **Homepage Layout**: Choose default layout
- **Posts per Page**: Number of posts in listings
- **Comment System**: Enable/disable comments
- **SEO Defaults**: Default meta descriptions

### Theme Customization

#### Colors and Branding

```
1. Go to "Appearance" > "Customize"
2. Select color scheme
3. Upload custom logo
4. Adjust typography settings
5. Preview changes
6. Publish when satisfied
```

#### Navigation Menus

- **Primary Menu**: Main site navigation
- **Footer Menu**: Links in site footer
- **Custom Menus**: Additional navigation areas

## 📊 Analytics & Insights

### Content Performance

#### Post Analytics

- **Views**: Total page views per post
- **Engagement**: Time spent reading
- **Popular Content**: Most viewed posts
- **Traffic Sources**: Where visitors come from

#### User Engagement

- **Comment Activity**: Most commented posts
- **Share Metrics**: Social media shares
- **Search Terms**: What people search for
- **Bounce Rate**: Visitor retention

### Dashboard Widgets

#### Quick Stats

- Today's views and visitors
- Recent comments and messages
- Draft posts needing attention
- Recent media uploads

#### Weekly/Monthly Reports

- Traffic trends and growth
- Content performance summaries
- User activity patterns
- System health status

## 🔍 SEO Optimization

### On-Page SEO

#### Post-Level Optimization

```
For each post:
1. Write compelling titles (50-60 characters)
2. Create meta descriptions (150-160 characters)
3. Use header tags (H1, H2, H3) appropriately
4. Add alt text to all images
5. Include relevant keywords naturally
6. Create descriptive URLs
```

#### Content Best Practices

- **Keyword Usage**: Natural integration, avoid stuffing
- **Internal Linking**: Link to related content
- **External Links**: Link to authoritative sources
- **Content Length**: Aim for 300+ words for blog posts

### Technical SEO

#### Automated Features

- **XML Sitemap**: Automatically generated and updated
- **Meta Tags**: Generated from content settings
- **Schema Markup**: Structured data for search engines
- **Open Graph**: Social media preview optimization

#### Manual Optimizations

- **Custom Meta Titles**: Override default titles
- **Featured Images**: Improve social sharing
- **Canonical URLs**: Prevent duplicate content issues

## 💬 Comment Management

### Comment Moderation

#### Approval Workflow

```
1. New comments appear in "Pending" queue
2. Review content for appropriateness
3. Approve, edit, or reject comments
4. Set auto-approval for trusted users
```

#### Spam Protection

- **Automated Filtering**: Built-in spam detection
- **Blacklist Words**: Block specific terms
- **User Reputation**: Track comment history
- **Manual Review**: Flag suspicious comments

### Community Engagement

#### Responding to Comments

- Reply directly to build community
- Use professional, friendly tone
- Address questions and concerns promptly
- Thank users for valuable contributions

#### Comment Settings

- **Registration Required**: Require login to comment
- **Moderation Level**: Auto-approve vs manual review
- **Threading**: Allow reply chains
- **Email Notifications**: Alert on new comments

## 🔒 Security Best Practices

### Account Security

#### Strong Passwords

- Use 12+ characters minimum
- Include uppercase, lowercase, numbers, symbols
- Avoid personal information
- Use unique passwords for each account

#### Two-Factor Authentication

```
1. Go to "Profile" > "Security"
2. Enable 2FA with authenticator app
3. Save backup codes safely
4. Test login with 2FA enabled
```

### Content Security

#### Safe Practices

- **Regular Backups**: Export content regularly
- **Update Awareness**: Apply security updates promptly
- **Suspicious Activity**: Report unusual behavior
- **File Uploads**: Only upload trusted files

#### Data Protection

- **User Privacy**: Respect visitor data
- **GDPR Compliance**: Handle EU visitors appropriately
- **Cookie Consent**: Inform users about tracking
- **SSL Certificate**: Ensure HTTPS is enabled

## 📱 Mobile Management

### Mobile Admin Access

#### Responsive Dashboard

- Full admin functionality on mobile devices
- Touch-optimized interface
- Quick content editing
- Media upload from phone camera

#### Mobile-Specific Features

- **Draft Sync**: Work on posts across devices
- **Push Notifications**: Content alerts
- **Offline Editing**: Work without internet
- **Voice-to-Text**: Dictate content

### Mobile Content Optimization

#### Responsive Design

- Content automatically adapts to screen size
- Images scale appropriately
- Navigation optimized for touch
- Fast loading on mobile networks

## 🆘 Getting Help

### Self-Service Resources

#### Documentation

- **Quick Start Guide**: [QUICKSTART.md](../QUICKSTART.md)
- **Developer Guide**: [DEVELOPER_GUIDE.md](./DEVELOPER_GUIDE.md)
- **API Documentation**: [API.md](./API.md)
- **Troubleshooting**: [Common Issues](#troubleshooting)

#### Video Tutorials

- Getting Started Walkthrough
- Content Creation Best Practices
- SEO Optimization Guide
- User Management Tutorial

### Support Channels

#### Community Support

- **GitHub Discussions**: Ask questions, share tips
- **Discord Community**: Real-time chat support
- **Forum**: Searchable knowledge base
- **User Meetups**: Local and virtual events

#### Professional Support

- **Priority Support**: Paid support plans
- **Custom Development**: Feature requests
- **Training Services**: Team onboarding
- **Consulting**: Site optimization and strategy

## 🚀 Advanced Features

### Content Workflows

#### Editorial Calendar

- Plan content publication dates
- Assign authors to topics
- Track content status and deadlines
- Coordinate team collaboration

#### Bulk Operations

```
Manage multiple posts at once:
1. Select posts using checkboxes
2. Choose bulk action (publish, delete, categorize)
3. Apply changes to all selected items
4. Review changes before confirming
```

### Automation Features

#### Scheduled Publishing

- Write content in advance
- Set future publication dates
- Automatic social media posting
- Email newsletter integration

#### Content Templates

- Create reusable post templates
- Standardize content structure
- Speed up content creation
- Maintain brand consistency

## 📈 Growth Strategies

### Content Strategy

#### Building Audience

- **Consistent Publishing**: Regular content schedule
- **Quality Focus**: Value-driven content
- **Community Building**: Engage with readers
- **SEO Optimization**: Improve search visibility

#### Content Types

- **Blog Posts**: Regular articles and updates
- **Landing Pages**: Marketing and conversion focused
- **Resource Pages**: Comprehensive guides
- **News Updates**: Timely announcements

### Performance Monitoring

#### Key Metrics

- **Traffic Growth**: Month-over-month visitors
- **Engagement Rate**: Time on site, pages per visit
- **Conversion Goals**: Newsletter signups, downloads
- **Content Performance**: Top performing posts

---

This user guide covers the essential features for content creators and site
administrators. For technical implementation details, see our
[Developer Guide](./DEVELOPER_GUIDE.md).
