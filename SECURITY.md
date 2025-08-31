# Security Policy

## Supported Versions

We currently support the following versions of TanCMS with security updates:

| Version | Supported          |
| ------- | ------------------ |
| 0.1.x   | :white_check_mark: |
| < 0.1   | :x:                |

## Reporting a Vulnerability

We take security seriously. If you discover a security vulnerability, please follow these steps:

### 🔒 Private Disclosure

**DO NOT** create a public GitHub issue for security vulnerabilities.

Instead, please email security issues to: **security@tancms.dev** (or create a private security advisory on GitHub)

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

TanCMS implements several security measures:

- **Authentication**: Secure session management with HTTP-only cookies
- **Authorization**: Role-based access control (RBAC)
- **Input Validation**: Zod schemas for all user inputs
- **SQL Injection**: Prisma ORM protects against SQL injection
- **XSS Prevention**: React's built-in XSS protection
- **File Upload Security**: Type and size validation
- **HTTPS**: Enforced in production
- **Dependency Scanning**: Regular security updates

### 🏆 Recognition

We appreciate security researchers who help keep TanCMS secure. Legitimate security reports will be acknowledged in our security advisories (with your permission).

### 📝 Disclosure Policy

We follow responsible disclosure:

1. Work with us to understand and resolve the issue
2. Give us reasonable time to fix the vulnerability
3. Avoid accessing user data or disrupting services
4. Don't publicly disclose until we've had time to address the issue

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