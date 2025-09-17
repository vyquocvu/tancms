#!/usr/bin/env node

/**
 * TanCMS Environment Configuration Validator
 * Comprehensive validation of environment configuration using the env-config system
 */

import { resolve } from 'path'

const colors = {
  reset: '\x1b[0m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  bold: '\x1b[1m',
  magenta: '\x1b[35m',
  cyan: '\x1b[36m',
}

function log(message, color = '') {
  console.log(`${color}${message}${colors.reset}`)
}

async function main() {
  const command = process.argv[2]

  try {
    // Import the environment configuration manager
    const { EnvironmentConfigManager, hasEnvironmentTemplate, getEnvironmentTemplate } = await import('./env-config.js')

    switch (command) {
      case 'validate':
      case undefined:
        await validateConfiguration()
        break

      case 'templates':
        await showTemplates()
        break

      case 'init':
        const env = process.argv[3] || 'development'
        await initializeEnvironment(env)
        break

      case 'compare':
        const env1 = process.argv[3] || 'development'
        const env2 = process.argv[4] || 'production'
        await compareEnvironments(env1, env2)
        break

      default:
        showHelp()
        break
    }
  } catch (error) {
    log(`❌ Error: ${error.message}`, colors.red)
    log(`\nThis might happen if you haven't built the TypeScript files yet.`, colors.yellow)
    log(`Try running: npm run build`, colors.blue)
    process.exit(1)
  }
}

async function validateConfiguration() {
  log(`${colors.bold}🔍 TanCMS Environment Configuration Validation${colors.reset}\n`)

  const { EnvironmentConfigManager } = await import('./env-config.js')
  const envManager = new EnvironmentConfigManager()
  const validation = envManager.validate()
  const environment = envManager.getEnvironment()

  log(`🌍 Current Environment: ${environment}`, colors.cyan)
  log(`📁 Configuration Sources:`, colors.blue)
  log(`   • Process environment variables`, colors.blue)
  log(`   • .env file`, colors.blue)
  log(`   • .env.${environment} file (if exists)`, colors.blue)

  // Display critical errors first
  const criticalErrors = validation.errors.filter(e => e.severity === 'critical')
  if (criticalErrors.length > 0) {
    log(`\n${colors.bold}🚨 CRITICAL SECURITY ISSUES (${criticalErrors.length}):${colors.reset}`)
    criticalErrors.forEach((error, index) => {
      log(`${index + 1}. ${error.key}`, colors.bold)
      log(`   ❌ ${error.message}`, colors.red)
      if (error.suggestion) {
        log(`   💡 ${error.suggestion}`, colors.yellow)
      }
      log('')
    })
  }

  // Display regular errors
  const regularErrors = validation.errors.filter(e => e.severity === 'error')
  if (regularErrors.length > 0) {
    log(`\n${colors.bold}❌ CONFIGURATION ERRORS (${regularErrors.length}):${colors.reset}`)
    regularErrors.forEach((error, index) => {
      log(`${index + 1}. ${error.key}`, colors.bold)
      log(`   ❌ ${error.message}`, colors.red)
      if (error.suggestion) {
        log(`   💡 ${error.suggestion}`, colors.blue)
      }
      log('')
    })
  }

  // Display warnings
  if (validation.warnings.length > 0) {
    log(`\n${colors.bold}⚠️  CONFIGURATION WARNINGS (${validation.warnings.length}):${colors.reset}`)
    validation.warnings.forEach((warning, index) => {
      log(`${index + 1}. ${warning.key}`, colors.bold)
      log(`   ⚠️  ${warning.message}`, colors.yellow)
      if (warning.suggestion) {
        log(`   💡 ${warning.suggestion}`, colors.blue)
      }
      log('')
    })
  }

  // Display suggestions
  if (validation.suggestions.length > 0) {
    log(`\n${colors.bold}💡 OPTIMIZATION SUGGESTIONS:${colors.reset}`)
    validation.suggestions.forEach((suggestion, index) => {
      log(`${index + 1}. ${suggestion}`, colors.magenta)
    })
    log('')
  }

  // Overall status
  const totalIssues = validation.errors.length + validation.warnings.length
  if (validation.isValid && totalIssues === 0) {
    log(`${colors.bold}🎉 CONFIGURATION STATUS: EXCELLENT${colors.reset}`, colors.green)
    log(`Your environment configuration is properly set up and secure!`, colors.green)
  } else if (validation.isValid) {
    log(`${colors.bold}✅ CONFIGURATION STATUS: GOOD${colors.reset}`, colors.yellow)
    log(`Configuration is functional but has some warnings to address.`, colors.yellow)
  } else {
    log(`${colors.bold}❌ CONFIGURATION STATUS: NEEDS ATTENTION${colors.reset}`, colors.red)
    log(`Please fix the errors above before proceeding.`, colors.red)
  }

  // Environment-specific advice
  log(`\n${colors.bold}🎯 Environment-Specific Advice:${colors.reset}`)
  switch (environment) {
    case 'production':
      log(`• Ensure all secrets are properly configured and secure`, colors.red)
      log(`• Verify HTTPS is enforced and security headers are enabled`, colors.red)
      log(`• Use connection pooling for database in production`, colors.blue)
      break
    case 'staging':
      log(`• Use production-like configuration for accurate testing`, colors.yellow)
      log(`• Consider using separate S3 buckets for staging`, colors.blue)
      break
    case 'development':
      log(`• Use 'npm run dev:fix-env' to auto-fix common issues`, colors.green)
      log(`• SQLite is fine for development, PostgreSQL for production`, colors.blue)
      break
    case 'test':
      log(`• In-memory database recommended for faster tests`, colors.blue)
      log(`• Mock external services when possible`, colors.blue)
      break
  }

  // Exit with appropriate code
  process.exit(validation.isValid ? 0 : 1)
}

async function showTemplates() {
  log(`${colors.bold}📋 Available Environment Templates${colors.reset}\n`)

  const { hasEnvironmentTemplate, getEnvironmentTemplate } = await import('./env-config.js')
  const environments = ['development', 'staging', 'production', 'test']

  environments.forEach(env => {
    const hasTemplate = hasEnvironmentTemplate(env)
    const status = hasTemplate ? '✅' : '❌'
    const color = hasTemplate ? colors.green : colors.red
    log(`${status} .env.${env}`, color)
    
    if (hasTemplate) {
      log(`   📍 ${getEnvironmentTemplate(env)}`, colors.blue)
    }
  })

  log(`\n${colors.bold}Usage:${colors.reset}`)
  log(`• npm run env:init development  - Initialize development environment`, colors.blue)
  log(`• npm run env:init production   - Initialize production environment`, colors.blue)
  log(`• cp .env.development .env      - Copy template manually`, colors.blue)
}

async function initializeEnvironment(environment) {
  log(`${colors.bold}🚀 Initializing ${environment} environment${colors.reset}\n`)

  const { hasEnvironmentTemplate, getEnvironmentTemplate } = await import('./env-config.js')

  if (!hasEnvironmentTemplate(environment)) {
    log(`❌ No template found for environment: ${environment}`, colors.red)
    log(`Available environments: development, staging, production, test`, colors.blue)
    process.exit(1)
  }

  const { existsSync, readFileSync, writeFileSync } = await import('fs')
  const templatePath = getEnvironmentTemplate(environment)

  if (existsSync('.env')) {
    log(`⚠️  .env file already exists`, colors.yellow)
    log(`Would you like to backup the existing file? (manually copy if needed)`, colors.blue)
  }

  try {
    const templateContent = readFileSync(templatePath, 'utf8')
    writeFileSync('.env', templateContent)
    log(`✅ Created .env from ${templatePath}`, colors.green)

    // Auto-generate AUTH_SECRET for development
    if (environment === 'development') {
      const crypto = await import('crypto')
      const newSecret = crypto.randomBytes(32).toString('hex')
      let envContent = readFileSync('.env', 'utf8')
      envContent = envContent.replace('your-32-character-secret-key-here-change-me', newSecret)
      writeFileSync('.env', envContent)
      log(`✅ Generated secure AUTH_SECRET`, colors.green)
    }

    log(`\n${colors.bold}Next steps:${colors.reset}`)
    log(`1. Review and update configuration values in .env`, colors.blue)
    log(`2. Run 'npm run env:validate' to check configuration`, colors.blue)
    log(`3. Start development with 'npm run dev'`, colors.blue)

    if (environment === 'production') {
      log(`\n${colors.bold}⚠️  Production Setup Reminders:${colors.reset}`)
      log(`• Generate a secure AUTH_SECRET (64+ characters)`, colors.red)
      log(`• Configure production database URL`, colors.red)
      log(`• Set up S3 storage credentials`, colors.red)
      log(`• Configure SMTP for email notifications`, colors.yellow)
    }

  } catch (error) {
    log(`❌ Error creating .env file: ${error.message}`, colors.red)
    process.exit(1)
  }
}

async function compareEnvironments(env1, env2) {
  log(`${colors.bold}🔄 Comparing ${env1} vs ${env2} configurations${colors.reset}\n`)

  const { hasEnvironmentTemplate, getEnvironmentTemplate } = await import('./env-config.js')
  const { existsSync, readFileSync } = await import('fs')

  // Check if templates exist
  if (!hasEnvironmentTemplate(env1)) {
    log(`❌ Template not found: .env.${env1}`, colors.red)
    return
  }
  if (!hasEnvironmentTemplate(env2)) {
    log(`❌ Template not found: .env.${env2}`, colors.red)
    return
  }

  // Parse both files
  const parseEnv = (content) => {
    const vars = {}
    const lines = content.split('\n').filter(line => line.trim() && !line.startsWith('#'))
    lines.forEach(line => {
      const [key, ...valueParts] = line.split('=')
      if (key && valueParts.length > 0) {
        vars[key.trim()] = valueParts.join('=').trim()
      }
    })
    return vars
  }

  const content1 = readFileSync(getEnvironmentTemplate(env1), 'utf8')
  const content2 = readFileSync(getEnvironmentTemplate(env2), 'utf8')
  const vars1 = parseEnv(content1)
  const vars2 = parseEnv(content2)

  const allKeys = new Set([...Object.keys(vars1), ...Object.keys(vars2)])

  log(`📊 Configuration comparison:`)
  log(`${colors.cyan}${env1.padEnd(20)} | ${env2}${colors.reset}`)
  log(`${'─'.repeat(42)}`)

  Array.from(allKeys).sort().forEach(key => {
    const val1 = vars1[key] || '(not set)'
    const val2 = vars2[key] || '(not set)'
    
    let status = '='
    let color = colors.blue
    
    if (!vars1[key]) {
      status = '←'
      color = colors.yellow
    } else if (!vars2[key]) {
      status = '→'
      color = colors.yellow
    } else if (val1 !== val2) {
      status = '≠'
      color = colors.magenta
    }

    log(`${color}${status} ${key}${colors.reset}`)
    
    if (status !== '=') {
      log(`   ${env1}: ${val1.length > 40 ? val1.substring(0, 40) + '...' : val1}`, colors.blue)
      log(`   ${env2}: ${val2.length > 40 ? val2.substring(0, 40) + '...' : val2}`, colors.blue)
    }
  })

  log(`\n${colors.bold}Legend:${colors.reset}`)
  log(`= Same value in both environments`, colors.blue)
  log(`≠ Different values`, colors.magenta)
  log(`← Only in ${env2}`, colors.yellow)
  log(`→ Only in ${env1}`, colors.yellow)
}

function showHelp() {
  log(`${colors.bold}TanCMS Environment Configuration Manager${colors.reset}\n`)
  log(`Usage: npm run env:<command> [options]\n`)
  log(`Commands:`)
  log(`  validate                  - Validate current configuration (default)`)
  log(`  templates                 - Show available environment templates`)
  log(`  init <environment>        - Initialize environment from template`)
  log(`  compare <env1> <env2>     - Compare two environment configurations`)
  log(``)
  log(`Examples:`)
  log(`  npm run env:validate      - Check current configuration`)
  log(`  npm run env:init staging  - Set up staging environment`)
  log(`  npm run env:compare development production`)
  log(``)
  log(`Available environments: development, staging, production, test`)
}

// Run if called directly
if (import.meta.url === `file://${resolve(process.argv[1])}`) {
  main().catch(error => {
    log(`❌ Error: ${error.message}`, colors.red)
    process.exit(1)
  })
}