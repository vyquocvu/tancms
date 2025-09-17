# Authentication Feature

This document describes the authentication system implemented for TanCMS.

## Overview

TanCMS uses session-based authentication with role-based access control (RBAC).
The system provides secure login, logout, and registration functionality with
different permission levels.

## Architecture

### Database Models

- **User Model**: Stores user credentials and profile information
  - `id`: Unique identifier
  - `email`: Email address (unique)
  - `password`: Hashed password using bcryptjs
  - `name`: Optional display name
  - `role`: User role (ADMIN, EDITOR, AUTHOR, VIEWER)

- **Session Model**: Manages user sessions
  - `id`: Session identifier
  - `userId`: Reference to user
  - `expiresAt`: Session expiration timestamp

### Role Hierarchy

1. **ADMIN**: Full system access
2. **EDITOR**: Content management and editing
3. **AUTHOR**: Content creation
4. **VIEWER**: Read-only access

Each role inherits permissions from lower roles.

## API Endpoints

### Authentication Endpoints (`/api/auth`)

#### POST `/api/auth?action=login`

Authenticates a user with email and password.

**Request Body:**

```json
{
  "email": "user@example.com",
  "password": "password123"
}
```

**Response:**

```json
{
  "user": {
    "id": "user_id",
    "email": "user@example.com",
    "name": "User Name",
    "role": "ADMIN"
  }
}
```

#### POST `/api/auth?action=register`

Creates a new user account.

**Request Body:**

```json
{
  "email": "user@example.com",
  "password": "password123",
  "confirmPassword": "password123",
  "name": "User Name"
}
```

#### POST `/api/auth?action=logout`

Logs out the current user by invalidating their session.

#### GET `/api/auth?action=me`

Returns the current authenticated user information.

## Frontend Components

### Authentication Context (`useAuth`)

Provides authentication state and methods throughout the React app:

```tsx
const { user, loading, login, logout, register } = useAuth()
```

### Login Form (`LoginForm`)

Professional login component with:

- Email and password validation
- Error handling
- Loading states
- Password visibility toggle

### Register Form (`RegisterForm`)

Registration component with:

- Form validation
- Password confirmation
- Error handling
- User feedback

### Protected Routes

Admin routes automatically redirect unauthenticated users to the login page.

## Security Features

### Password Security

- Passwords are hashed using bcryptjs with 12 salt rounds
- No plain text passwords are stored
- Password strength validation (minimum 6 characters)

### Session Management

- Sessions expire after 30 days
- HttpOnly cookies prevent XSS attacks
- SameSite cookie attribute for CSRF protection
- Secure cookies in production

### Authorization

- Role-based access control
- Permission hierarchy enforcement
- Route-level protection

## Default Users

The seed script creates default users for testing:

- **Admin User**
  - Email: `admin@tancms.dev`
  - Password: `admin123`
  - Role: ADMIN

- **Editor User**
  - Email: `editor@tancms.dev`
  - Password: `editor123`
  - Role: EDITOR

⚠️ **Important**: Change these credentials in production!

## Usage Examples

### Login Flow

1. User navigates to `/login` or `#/login`
2. User enters email and password
3. System validates credentials
4. Session cookie is set
5. User is redirected to admin dashboard

### Logout Flow

1. User clicks logout button
2. System invalidates session
3. Session cookie is cleared
4. User is redirected to login page

### Protected Access

1. User attempts to access admin route
2. System checks for valid session
3. If authenticated, access is granted
4. If not authenticated, redirect to login

## Development

### Testing Authentication

Run the test suite to verify authentication functionality:

```bash
npm test -- auth.test.ts
```

### Database Setup

Initialize the database with default users:

```bash
npm run db:migrate
npm run db:seed
```

### Environment Variables

Required environment variables:

```bash
DATABASE_URL="file:./dev.db"
AUTH_SECRET="your-secure-secret-key-32-chars-minimum"
NODE_ENV="development"
```

## Security Considerations

1. **Always use HTTPS in production**
2. **Change default credentials**
3. **Use strong AUTH_SECRET**
4. **Regular session cleanup**
5. **Monitor authentication attempts**
6. **Implement rate limiting for production**

## Troubleshooting

### Common Issues

1. **"Authentication required" error**
   - Check session cookie
   - Verify user is logged in
   - Check session expiration

2. **"Insufficient permissions" error**
   - Verify user role
   - Check role hierarchy
   - Ensure proper role assignment

3. **Login fails with correct credentials**
   - Check password hashing
   - Verify database connection
   - Check for case sensitivity in email

### Debugging

Enable debug logging by setting `DEBUG=*` in development environment.
