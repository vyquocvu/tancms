/**
 * TanCMS Environment Configuration Management
 * JavaScript version for use in Node.js scripts
 */

import { existsSync, readFileSync } from 'fs'
import { resolve } from 'path'

/**
 * Configuration schema for TanCMS
 */
export const CONFIG_SCHEMA = [
  // Core Application
  {
    key: 'NODE_ENV',
    required: true,
    type: 'string',
    description: 'Environment type',
    exampleValue: 'development',
  },
  {
    key: 'APP_URL',
    required: true,
    type: 'url',
    description: 'Base URL for the application',
    exampleValue: 'http://localhost:3000',
  },
  {
    key: 'PORT',
    required: false,
    type: 'number',
    description: 'Port number for the application',
    exampleValue: '3000',
  },

  // Database
  {
    key: 'DATABASE_PROVIDER',
    required: false,
    type: 'string',
    description: 'Database provider (sqlite, mysql, postgresql)',
    exampleValue: 'sqlite',
  },
  {
    key: 'DATABASE_URL',
    required: true,
    type: 'string',
    minLength: 10,
    description: 'Database connection string',
    exampleValue: 'file:./dev.db',
    securityLevel: 'high',
  },

  // Authentication
  {
    key: 'AUTH_SECRET',
    required: true,
    type: 'secret',
    minLength: 32,
    description: 'Secret key for authentication and session signing',
    securityLevel: 'critical',
  },

  // Storage (S3)
  {
    key: 'S3_ENDPOINT',
    required: false,
    type: 'url',
    description: 'S3-compatible storage endpoint',
    exampleValue: 'https://s3.amazonaws.com',
  },
  {
    key: 'S3_ACCESS_KEY_ID',
    required: false,
    type: 'string',
    minLength: 1,
    description: 'S3 access key ID',
    securityLevel: 'high',
  },
  {
    key: 'S3_SECRET_ACCESS_KEY',
    required: false,
    type: 'secret',
    minLength: 1,
    description: 'S3 secret access key',
    securityLevel: 'critical',
  },
  {
    key: 'S3_BUCKET',
    required: false,
    type: 'string',
    description: 'S3 bucket name',
    exampleValue: 'tancms-uploads',
  },

  // Email (SMTP)
  {
    key: 'SMTP_HOST',
    required: false,
    type: 'string',
    description: 'SMTP server hostname',
    exampleValue: 'smtp.gmail.com',
  },
  {
    key: 'SMTP_PORT',
    required: false,
    type: 'number',
    description: 'SMTP server port',
    exampleValue: '587',
  },
  {
    key: 'SMTP_USER',
    required: false,
    type: 'email',
    description: 'SMTP username (usually email)',
    exampleValue: 'user@example.com',
  },
  {
    key: 'SMTP_PASS',
    required: false,
    type: 'secret',
    description: 'SMTP password',
    securityLevel: 'high',
  },

  // Performance & Caching
  {
    key: 'CACHE_TTL',
    required: false,
    type: 'number',
    description: 'Cache time-to-live in seconds',
    exampleValue: '3600',
  },
  {
    key: 'DATABASE_POOL_SIZE',
    required: false,
    type: 'number',
    description: 'Database connection pool size',
    exampleValue: '10',
  },

  // Security
  {
    key: 'SECURE_HEADERS',
    required: false,
    type: 'boolean',
    description: 'Enable security headers',
    exampleValue: 'true',
  },
  {
    key: 'FORCE_HTTPS',
    required: false,
    type: 'boolean',
    description: 'Force HTTPS redirects',
    exampleValue: 'true',
  },
]

/**
 * Environment Configuration Manager
 */
export class EnvironmentConfigManager {
  constructor(environment) {
    this.config = {}
    this.environment = environment || this.detectEnvironment()
    this.loadConfiguration()
  }

  /**
   * Detect the current environment
   */
  detectEnvironment() {
    const nodeEnv = process.env.NODE_ENV
    if (['development', 'staging', 'production', 'test'].includes(nodeEnv)) {
      return nodeEnv
    }
    return 'development'
  }

  /**
   * Load configuration from environment files
   */
  loadConfiguration() {
    // Load from process.env first
    this.config = { ...process.env }

    // Load from .env file
    this.loadEnvFile('.env')

    // Load environment-specific file
    const envFile = `.env.${this.environment}`
    if (existsSync(envFile)) {
      this.loadEnvFile(envFile)
    }
  }

  /**
   * Load variables from a specific .env file
   */
  loadEnvFile(filename) {
    if (!existsSync(filename)) {
      return
    }

    try {
      const content = readFileSync(filename, 'utf8')
      const lines = content.split('\n')

      for (const line of lines) {
        const trimmed = line.trim()
        if (!trimmed || trimmed.startsWith('#')) {
          continue
        }

        const equalIndex = trimmed.indexOf('=')
        if (equalIndex === -1) {
          continue
        }

        const key = trimmed.slice(0, equalIndex).trim()
        let value = trimmed.slice(equalIndex + 1).trim()

        // Remove quotes if present
        if (
          (value.startsWith('"') && value.endsWith('"')) ||
          (value.startsWith("'") && value.endsWith("'"))
        ) {
          value = value.slice(1, -1)
        }

        // Only set if not already in config (process.env takes precedence)
        if (!(key in this.config)) {
          this.config[key] = value
        }
      }
    } catch (error) {
      console.warn(`Warning: Could not load ${filename}:`, error.message)
    }
  }

  /**
   * Get a configuration value
   */
  get(key, defaultValue) {
    return this.config[key] || defaultValue
  }

  /**
   * Get all configuration
   */
  getAll() {
    return { ...this.config }
  }

  /**
   * Get the current environment
   */
  getEnvironment() {
    return this.environment
  }

  /**
   * Validate the current configuration
   */
  validate() {
    const errors = []
    const warnings = []
    const suggestions = []

    for (const schema of CONFIG_SCHEMA) {
      const value = this.config[schema.key]
      const validation = this.validateField(schema, value)

      if (validation.error) {
        errors.push(validation.error)
      }
      if (validation.warning) {
        warnings.push(validation.warning)
      }
      if (validation.suggestion) {
        suggestions.push(validation.suggestion)
      }
    }

    // Environment-specific validations
    this.validateEnvironmentSpecific(errors, warnings, suggestions)

    return {
      isValid: errors.filter(e => e.severity === 'error' || e.severity === 'critical').length === 0,
      errors,
      warnings,
      suggestions,
    }
  }

  /**
   * Validate a specific field
   */
  validateField(schema, value) {
    // Check if required field is missing
    if (schema.required && !value) {
      return {
        error: {
          key: schema.key,
          message: `Required configuration '${schema.key}' is missing`,
          severity: schema.securityLevel === 'critical' ? 'critical' : 'error',
          suggestion: `Add ${schema.key}=${schema.exampleValue || 'your-value'} to your .env file`,
        },
      }
    }

    if (!value) {
      return {} // Optional field not set
    }

    // Check minimum length
    if (schema.minLength && value.length < schema.minLength) {
      return {
        error: {
          key: schema.key,
          message: `'${schema.key}' must be at least ${schema.minLength} characters long`,
          severity: schema.securityLevel === 'critical' ? 'critical' : 'error',
          suggestion: `Use a longer value for ${schema.key}`,
        },
      }
    }

    // Type-specific validations
    switch (schema.type) {
      case 'url':
        if (!this.isValidUrl(value)) {
          return {
            error: {
              key: schema.key,
              message: `'${schema.key}' must be a valid URL`,
              severity: 'error',
              suggestion: `Use format: https://example.com for ${schema.key}`,
            },
          }
        }
        break

      case 'email':
        if (!this.isValidEmail(value)) {
          return {
            error: {
              key: schema.key,
              message: `'${schema.key}' must be a valid email address`,
              severity: 'error',
              suggestion: `Use format: user@example.com for ${schema.key}`,
            },
          }
        }
        break

      case 'number':
        if (isNaN(Number(value))) {
          return {
            error: {
              key: schema.key,
              message: `'${schema.key}' must be a valid number`,
              severity: 'error',
              suggestion: `Use a numeric value for ${schema.key}`,
            },
          }
        }
        break

      case 'boolean':
        if (!['true', 'false'].includes(value.toLowerCase())) {
          return {
            error: {
              key: schema.key,
              message: `'${schema.key}' must be 'true' or 'false'`,
              severity: 'error',
              suggestion: `Set ${schema.key} to either true or false`,
            },
          }
        }
        break

      case 'secret':
        if (this.isInsecureSecret(value)) {
          return {
            error: {
              key: schema.key,
              message: `'${schema.key}' appears to be using a default or insecure value`,
              severity: 'critical',
              suggestion: `Generate a secure random value for ${schema.key}`,
            },
          }
        }
        break
    }

    return {}
  }

  /**
   * Environment-specific validations
   */
  validateEnvironmentSpecific(errors, warnings, suggestions) {
    switch (this.environment) {
      case 'production':
        this.validateProduction(errors, warnings, suggestions)
        break
      case 'staging':
        this.validateStaging(errors, warnings, suggestions)
        break
      case 'development':
        this.validateDevelopment(errors, warnings, suggestions)
        break
      case 'test':
        this.validateTest(errors, warnings, suggestions)
        break
    }
  }

  /**
   * Production-specific validations
   */
  validateProduction(errors, warnings, suggestions) {
    // Check APP_URL is HTTPS
    const appUrl = this.config.APP_URL
    if (appUrl && !appUrl.startsWith('https://')) {
      errors.push({
        key: 'APP_URL',
        message: 'Production APP_URL must use HTTPS',
        severity: 'critical',
        suggestion: 'Change APP_URL to use https:// protocol',
      })
    }

    // Check DATABASE_URL is not SQLite
    const dbUrl = this.config.DATABASE_URL
    if (dbUrl && dbUrl.startsWith('file:')) {
      warnings.push({
        key: 'DATABASE_URL',
        message: 'SQLite is not recommended for production',
        suggestion: 'Consider using PostgreSQL for production',
      })
    }

    // Security headers should be enabled
    if (this.config.SECURE_HEADERS !== 'true') {
      warnings.push({
        key: 'SECURE_HEADERS',
        message: 'Security headers should be enabled in production',
        suggestion: 'Set SECURE_HEADERS=true',
      })
    }

    // Check for long AUTH_SECRET
    const authSecret = this.config.AUTH_SECRET
    if (authSecret && authSecret.length < 64) {
      warnings.push({
        key: 'AUTH_SECRET',
        message: 'Consider using a longer AUTH_SECRET for production (64+ characters)',
        suggestion: 'Generate a longer secret key for enhanced security',
      })
    }
  }

  /**
   * Staging-specific validations
   */
  validateStaging(errors, warnings, suggestions) {
    // Similar to production but less strict
    const appUrl = this.config.APP_URL
    if (appUrl && !appUrl.startsWith('https://')) {
      warnings.push({
        key: 'APP_URL',
        message: 'Staging should preferably use HTTPS',
        suggestion: 'Consider using https:// for staging environment',
      })
    }
  }

  /**
   * Development-specific validations
   */
  validateDevelopment(errors, warnings, suggestions) {
    // Check if using default values
    if (this.config.AUTH_SECRET === 'your-32-character-secret-key-here-change-me') {
      suggestions.push('Run npm run dev:fix-env to generate a secure AUTH_SECRET')
    }
  }

  /**
   * Test-specific validations
   */
  validateTest(errors, warnings, suggestions) {
    // Validate test-specific configuration
    const dbUrl = this.config.DATABASE_URL
    if (dbUrl && !dbUrl.includes(':memory:')) {
      warnings.push({
        key: 'DATABASE_URL',
        message: 'Consider using in-memory database for tests',
        suggestion: 'Use DATABASE_URL="file::memory:?cache=shared" for faster tests',
      })
    }
  }

  /**
   * Utility: Check if URL is valid
   */
  isValidUrl(url) {
    try {
      new URL(url)
      return true
    } catch {
      return false
    }
  }

  /**
   * Utility: Check if email is valid
   */
  isValidEmail(email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    return emailRegex.test(email)
  }

  /**
   * Utility: Check if secret is insecure
   */
  isInsecureSecret(secret) {
    const insecurePatterns = [
      'your-',
      'change-me',
      'replace-me',
      'example',
      'test-secret',
      '123456',
    ]

    const lowerSecret = secret.toLowerCase()
    
    // Check for obvious insecure patterns
    if (insecurePatterns.some(pattern => lowerSecret.includes(pattern))) {
      return true
    }
    
    // Check for repeated characters (like 'aaaaaaa...')
    const repeatedPattern = /(.)\1{7,}/  // 8 or more of the same character
    if (repeatedPattern.test(secret)) {
      return true
    }
    
    // Check for common weak patterns
    if (secret.length < 8 || lowerSecret === 'password' || lowerSecret === 'admin' || lowerSecret === 'secret') {
      return true
    }
    
    return false
  }
}

/**
 * Create a default instance
 */
export const envConfig = new EnvironmentConfigManager()

/**
 * Quick validation function
 */
export function validateEnvironment() {
  return envConfig.validate()
}

/**
 * Get environment-specific template path
 */
export function getEnvironmentTemplate(environment) {
  return resolve(`.env.${environment}`)
}

/**
 * Check if environment template exists
 */
export function hasEnvironmentTemplate(environment) {
  return existsSync(getEnvironmentTemplate(environment))
}