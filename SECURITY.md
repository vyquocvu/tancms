# Security Policy

## Supported Versions

We currently support the following versions of TanCMS with security updates:

| Version | Supported          |
| ------- | ------------------ |
| 0.1.x   | :white_check_mark: |
| < 0.1   | :x:                |

## Reporting a Vulnerability

We take security seriously. If you discover a security vulnerability, please
follow these steps:

### 🔒 Private Disclosure

**DO NOT** create a public GitHub issue for security vulnerabilities.

Instead, please email security issues to: **security@tancms.dev** (or create a
private security advisory on GitHub)

### 📋 What to Include

Please include the following information:

- **Description**: Clear description of the vulnerability
- **Impact**: Potential impact and severity
- **Reproduction**: Step-by-step instructions to reproduce
- **Environment**: Affected versions and configurations
- **Mitigation**: Any temporary workarounds (if known)

### 🕐 Response Timeline

- **24 hours**: Initial response acknowledging the report
- **72 hours**: Initial assessment and severity classification
- **30 days**: Target for fix and disclosure (may vary by severity)

### 🛡️ Security Measures

TanCMS implements comprehensive security measures:

- **Authentication**: Secure session management with HTTP-only cookies
- **Authorization**: Role-based access control (RBAC)
- **Input Validation**: Zod schemas for all user inputs
- **Input Sanitization**: XSS prevention with comprehensive HTML sanitization
- **SQL Injection**: Prisma ORM protects against SQL injection
- **XSS Prevention**: React's built-in XSS protection + custom sanitization
- **CSRF Protection**: Double-submit cookie pattern with origin validation
- **File Upload Security**: Type, size, and filename validation
- **Security Headers**: CSP, X-Frame-Options, HSTS, and more
- **Rate Limiting**: API endpoint protection against abuse
- **Password Security**: Strong password requirements and hashing
- **Login Protection**: Account lockout after failed attempts
- **Session Security**: Secure session management with fingerprinting
- **Security Monitoring**: Comprehensive audit logging
- **HTTPS**: Enforced in production
- **Dependency Scanning**: Regular security updates

### 🏆 Recognition

We appreciate security researchers who help keep TanCMS secure. Legitimate
security reports will be acknowledged in our security advisories (with your
permission).

### 📝 Disclosure Policy

We follow responsible disclosure:

1. Work with us to understand and resolve the issue
2. Give us reasonable time to fix the vulnerability
3. Avoid accessing user data or disrupting services
4. Don't publicly disclose until we've had time to address the issue

## Security Features

### Input Sanitization

TanCMS includes comprehensive input sanitization to prevent XSS attacks:

- HTML content sanitization with configurable allowed tags
- URL validation to prevent malicious redirects
- File upload sanitization with secure filename handling
- JSON input sanitization for API endpoints

### CSRF Protection

Cross-Site Request Forgery protection using:

- Double-submit cookie pattern
- Origin validation for requests
- Token rotation on each request
- Automatic protection for state-changing operations

### Security Headers

Comprehensive security headers implementation:

- Content Security Policy (CSP)
- X-Frame-Options (clickjacking protection)
- X-Content-Type-Options (MIME sniffing protection)
- Referrer Policy
- Permissions Policy
- Strict Transport Security (HTTPS enforcement)

### Enhanced Authentication

Secure authentication features:

- Strong password requirements
- Account lockout after failed attempts
- Session fingerprinting
- Secure session token generation
- IP-based login tracking

### Rate Limiting

API protection against abuse:

- Configurable request limits per time window
- IP-based tracking
- Graceful error responses with retry information

### Security Monitoring

Comprehensive audit logging:

- Authentication events
- Security violations
- API access patterns
- Admin-only security audit endpoints

## Security Best Practices

### For Developers

- Keep dependencies updated
- Follow secure coding practices
- Use environment variables for secrets
- Implement proper error handling
- Validate all inputs
- Use HTTPS in production

### For Users

- Use strong, unique passwords
- Keep your installation updated
- Configure proper database security
- Use secure hosting environments
- Regular backups
- Monitor for suspicious activity

## Security Resources

- [OWASP Top 10](https://owasp.org/www-project-top-ten/)
- [Node.js Security Best Practices](https://nodejs.org/en/docs/guides/security/)
- [React Security Best Practices](https://react.dev/learn/security)
- [Prisma Security Guidelines](https://prisma.io/docs/guides/security)

Thank you for helping keep TanCMS secure! 🛡️
