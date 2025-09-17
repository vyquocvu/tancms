/**
 * Tests for Environment Configuration Management
 */

import { describe, it, expect, beforeEach, afterEach } from 'vitest'
import { existsSync, writeFileSync, unlinkSync, mkdirSync, rmSync } from 'fs'
import { EnvironmentConfigManager, validateEnvironment, hasEnvironmentTemplate } from '../scripts/env-config.js'

describe('Environment Configuration Management', () => {
  const testDir = '/tmp/tancms-env-test'
  const originalCwd = process.cwd()
  const originalEnv = { ...process.env }

  beforeEach(() => {
    // Create test directory
    if (existsSync(testDir)) {
      rmSync(testDir, { recursive: true })
    }
    mkdirSync(testDir, { recursive: true })
    process.chdir(testDir)

    // Clean up environment
    delete process.env.NODE_ENV
    delete process.env.DATABASE_URL
    delete process.env.AUTH_SECRET
    delete process.env.APP_URL
  })

  afterEach(() => {
    // Restore original directory and environment
    process.chdir(originalCwd)
    process.env = originalEnv
    
    // Clean up test directory
    if (existsSync(testDir)) {
      rmSync(testDir, { recursive: true })
    }
  })

  describe('EnvironmentConfigManager', () => {
    it('should detect development environment by default', () => {
      const manager = new EnvironmentConfigManager()
      expect(manager.getEnvironment()).toBe('development')
    })

    it('should respect NODE_ENV environment variable', () => {
      process.env.NODE_ENV = 'production'
      const manager = new EnvironmentConfigManager()
      expect(manager.getEnvironment()).toBe('production')
    })

    it('should load configuration from .env file', () => {
      writeFileSync('.env', 'TEST_VAR="test_value"\nANOTHER_VAR=another_value')
      
      const manager = new EnvironmentConfigManager()
      expect(manager.get('TEST_VAR')).toBe('test_value')
      expect(manager.get('ANOTHER_VAR')).toBe('another_value')
    })

    it('should prioritize process.env over .env file', () => {
      process.env.TEST_VAR = 'env_value'
      writeFileSync('.env', 'TEST_VAR="file_value"')
      
      const manager = new EnvironmentConfigManager()
      expect(manager.get('TEST_VAR')).toBe('env_value')
    })

    it('should load environment-specific configuration', () => {
      process.env.NODE_ENV = 'staging'
      writeFileSync('.env', 'COMMON_VAR="common"')
      writeFileSync('.env.staging', 'STAGING_VAR="staging_value"')
      
      const manager = new EnvironmentConfigManager()
      expect(manager.get('COMMON_VAR')).toBe('common')
      expect(manager.get('STAGING_VAR')).toBe('staging_value')
    })

    it('should handle quoted values correctly', () => {
      writeFileSync('.env', `QUOTED_DOUBLE="double quoted"
QUOTED_SINGLE='single quoted'
UNQUOTED=unquoted_value`)
      
      const manager = new EnvironmentConfigManager()
      expect(manager.get('QUOTED_DOUBLE')).toBe('double quoted')
      expect(manager.get('QUOTED_SINGLE')).toBe('single quoted')
      expect(manager.get('UNQUOTED')).toBe('unquoted_value')
    })

    it('should ignore comments and empty lines', () => {
      writeFileSync('.env', `# This is a comment
VALID_VAR="valid"

# Another comment
ANOTHER_VAR=another`)
      
      const manager = new EnvironmentConfigManager()
      expect(manager.get('VALID_VAR')).toBe('valid')
      expect(manager.get('ANOTHER_VAR')).toBe('another')
    })
  })

  describe('Configuration Validation', () => {
    it('should validate required variables', () => {
      const authSecret = "secure-test-key-" + "x".repeat(16)  // Mixed characters, not repeated
      writeFileSync('.env', `NODE_ENV="development"
DATABASE_URL="file:./test.db"
AUTH_SECRET="${authSecret}"
APP_URL="http://localhost:3000"`)
      
      const manager = new EnvironmentConfigManager()
      const validation = manager.validate()
      
      expect(validation.isValid).toBe(true)
      expect(validation.errors.length).toBe(0)
    })

    it('should detect missing required variables', () => {
      writeFileSync('.env', 'NODE_ENV="development"')
      
      const manager = new EnvironmentConfigManager()
      const validation = manager.validate()
      
      expect(validation.isValid).toBe(false)
      expect(validation.errors.some(e => e.key === 'DATABASE_URL')).toBe(true)
      expect(validation.errors.some(e => e.key === 'AUTH_SECRET')).toBe(true)
      expect(validation.errors.some(e => e.key === 'APP_URL')).toBe(true)
    })

    it('should detect insecure AUTH_SECRET', () => {
      writeFileSync('.env', `NODE_ENV="development"
DATABASE_URL="file:./test.db"
AUTH_SECRET="your-32-character-secret-key-here-change-me"
APP_URL="http://localhost:3000"`)
      
      const manager = new EnvironmentConfigManager()
      const validation = manager.validate()
      
      expect(validation.isValid).toBe(false)
      expect(validation.errors.some(e => e.key === 'AUTH_SECRET' && e.severity === 'critical')).toBe(true)
    })

    it('should validate URL format', () => {
      writeFileSync('.env', `NODE_ENV="development"
DATABASE_URL="file:./test.db"
AUTH_SECRET="${'a'.repeat(32)}"
APP_URL="not-a-url"`)
      
      const manager = new EnvironmentConfigManager()
      const validation = manager.validate()
      
      expect(validation.isValid).toBe(false)
      expect(validation.errors.some(e => e.key === 'APP_URL')).toBe(true)
    })

    it('should validate email format', () => {
      writeFileSync('.env', `NODE_ENV="development"
DATABASE_URL="file:./test.db"
AUTH_SECRET="${'a'.repeat(32)}"
APP_URL="http://localhost:3000"
SMTP_USER="not-an-email"`)
      
      const manager = new EnvironmentConfigManager()
      const validation = manager.validate()
      
      expect(validation.isValid).toBe(false)
      expect(validation.errors.some(e => e.key === 'SMTP_USER')).toBe(true)
    })

    it('should validate number format', () => {
      writeFileSync('.env', `NODE_ENV="development"
DATABASE_URL="file:./test.db"
AUTH_SECRET="${'a'.repeat(32)}"
APP_URL="http://localhost:3000"
PORT="not-a-number"`)
      
      const manager = new EnvironmentConfigManager()
      const validation = manager.validate()
      
      expect(validation.isValid).toBe(false)
      expect(validation.errors.some(e => e.key === 'PORT')).toBe(true)
    })

    it('should validate boolean format', () => {
      writeFileSync('.env', `NODE_ENV="development"
DATABASE_URL="file:./test.db"
AUTH_SECRET="${'a'.repeat(32)}"
APP_URL="http://localhost:3000"
SECURE_HEADERS="maybe"`)
      
      const manager = new EnvironmentConfigManager()
      const validation = manager.validate()
      
      expect(validation.isValid).toBe(false)
      expect(validation.errors.some(e => e.key === 'SECURE_HEADERS')).toBe(true)
    })
  })

  describe('Environment-Specific Validation', () => {
    it('should enforce HTTPS for production APP_URL', () => {
      process.env.NODE_ENV = 'production'
      writeFileSync('.env', `NODE_ENV="production"
DATABASE_URL="postgresql://user:pass@host:5432/db"
AUTH_SECRET="${'a'.repeat(64)}"
APP_URL="http://example.com"`)
      
      const manager = new EnvironmentConfigManager()
      const validation = manager.validate()
      
      expect(validation.isValid).toBe(false)
      expect(validation.errors.some(e => e.key === 'APP_URL' && e.severity === 'critical')).toBe(true)
    })

    it('should warn about SQLite in production', () => {
      process.env.NODE_ENV = 'production'
      writeFileSync('.env', `NODE_ENV="production"
DATABASE_URL="file:./prod.db"
AUTH_SECRET="${'a'.repeat(64)}"
APP_URL="https://example.com"`)
      
      const manager = new EnvironmentConfigManager()
      const validation = manager.validate()
      
      expect(validation.warnings.some(w => w.key === 'DATABASE_URL')).toBe(true)
    })

    it('should suggest longer AUTH_SECRET for production', () => {
      process.env.NODE_ENV = 'production'
      writeFileSync('.env', `NODE_ENV="production"
DATABASE_URL="postgresql://user:pass@host:5432/db"
AUTH_SECRET="${'a'.repeat(32)}"
APP_URL="https://example.com"`)
      
      const manager = new EnvironmentConfigManager()
      const validation = manager.validate()
      
      expect(validation.warnings.some(w => w.key === 'AUTH_SECRET')).toBe(true)
    })

    it('should suggest in-memory database for tests', () => {
      process.env.NODE_ENV = 'test'
      writeFileSync('.env', `NODE_ENV="test"
DATABASE_URL="file:./test.db"
AUTH_SECRET="test-secret"
APP_URL="http://localhost:3001"`)
      
      const manager = new EnvironmentConfigManager()
      const validation = manager.validate()
      
      expect(validation.warnings.some(w => w.key === 'DATABASE_URL')).toBe(true)
    })

    it('should suggest fixing default values in development', () => {
      process.env.NODE_ENV = 'development'
      writeFileSync('.env', `NODE_ENV="development"
DATABASE_URL="file:./dev.db"
AUTH_SECRET="your-32-character-secret-key-here-change-me"
APP_URL="http://localhost:3000"`)
      
      const manager = new EnvironmentConfigManager()
      const validation = manager.validate()
      
      expect(validation.suggestions.some(s => s.includes('npm run dev:fix-env'))).toBe(true)
    })
  })

  describe('Template System', () => {
    beforeEach(() => {
      // Switch back to main project directory for template tests
      process.chdir(originalCwd)
    })

    it('should detect available environment templates', () => {
      expect(hasEnvironmentTemplate('development')).toBe(true)
      expect(hasEnvironmentTemplate('staging')).toBe(true)
      expect(hasEnvironmentTemplate('production')).toBe(true)
      expect(hasEnvironmentTemplate('test')).toBe(true)
      expect(hasEnvironmentTemplate('nonexistent')).toBe(false)
    })
  })

  describe('Utility Functions', () => {
    it('should validate URLs correctly', () => {
      const manager = new EnvironmentConfigManager()
      
      expect(manager.isValidUrl('http://localhost:3000')).toBe(true)
      expect(manager.isValidUrl('https://example.com')).toBe(true)
      expect(manager.isValidUrl('ftp://ftp.example.com')).toBe(true)
      expect(manager.isValidUrl('not-a-url')).toBe(false)
      expect(manager.isValidUrl('http://')).toBe(false)
    })

    it('should validate emails correctly', () => {
      const manager = new EnvironmentConfigManager()
      
      expect(manager.isValidEmail('user@example.com')).toBe(true)
      expect(manager.isValidEmail('test.email+tag@domain.co.uk')).toBe(true)
      expect(manager.isValidEmail('not-an-email')).toBe(false)
      expect(manager.isValidEmail('@example.com')).toBe(false)
      expect(manager.isValidEmail('user@')).toBe(false)
    })

    it('should detect insecure secrets correctly', () => {
      const manager = new EnvironmentConfigManager()
      
      expect(manager.isInsecureSecret('your-secret-here')).toBe(true)
      expect(manager.isInsecureSecret('change-me-please')).toBe(true)
      expect(manager.isInsecureSecret('password123')).toBe(true)
      expect(manager.isInsecureSecret('admin')).toBe(true)
      expect(manager.isInsecureSecret('aaaaaaaa')).toBe(true)  // Repeated characters
      expect(manager.isInsecureSecret('secure-random-key-with-mixed-chars-123')).toBe(false)
      expect(manager.isInsecureSecret('a1b2c3d4e5f6g7h8i9j0k1l2m3n4o5p6')).toBe(false)
    })
  })
})

describe('Integration Tests', () => {
  it('should work with the main validateEnvironment function', () => {
    // Clear any existing .env file and clean environment
    if (existsSync('.env')) {
      unlinkSync('.env')
    }
    
    // Clear all environment variables that could interfere
    const envVarsToClean = Object.keys(process.env).filter(key => 
      key.startsWith('S3_') || key.startsWith('SMTP_') || key.startsWith('PRISMA_') || 
      key.startsWith('VERCEL_') || key.startsWith('DATABASE_') || key.startsWith('AUTH_')
    )
    envVarsToClean.forEach(key => delete process.env[key])
    
    // Set only the required variables
    process.env.NODE_ENV = 'development'
    process.env.DATABASE_URL = 'file:./test.db'
    process.env.AUTH_SECRET = 'secure-random-test-key-12345678901234567890'  // More secure test key
    process.env.APP_URL = 'http://localhost:3000'
    
    const validation = validateEnvironment()
    
    // Debug logging
    if (!validation.isValid) {
      console.log('Integration test validation failed:', validation.errors)
    }
    
    expect(validation.isValid).toBe(true)
  })
})