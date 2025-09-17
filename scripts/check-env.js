#!/usr/bin/env node

/**
 * Environment Configuration Validator
 * Validates required environment variables and setup for TanCMS development
 */

import { existsSync, readFileSync } from 'fs'
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

async function checkEnvironment() {
  log(`${colors.bold}🔍 TanCMS Environment Check${colors.reset}\n`)

  let errors = 0
  let warnings = 0

  // Check Node.js version
  const nodeVersion = process.version
  const majorVersion = parseInt(nodeVersion.slice(1).split('.')[0])

  if (majorVersion >= 18) {
    log(`✅ Node.js ${nodeVersion} (required: 18+)`, colors.green)
  } else {
    log(`❌ Node.js ${nodeVersion} - requires 18+ (current: ${majorVersion})`, colors.red)
    errors++
  }

  // Check if package.json exists
  if (existsSync('package.json')) {
    log(`✅ package.json found`, colors.green)
  } else {
    log(`❌ package.json not found`, colors.red)
    errors++
    return { errors, warnings }
  }

  // Check if node_modules exists
  if (existsSync('node_modules')) {
    log(`✅ Dependencies installed`, colors.green)
  } else {
    log(`⚠️  Dependencies not installed - run 'npm install'`, colors.yellow)
    warnings++
  }

  // Environment detection and validation
  const currentEnv = process.env.NODE_ENV || 'development'
  log(`🌍 Environment: ${currentEnv}`, colors.cyan)

  // Check for environment-specific template
  const envTemplate = `.env.${currentEnv}`
  if (existsSync(envTemplate)) {
    log(`✅ Environment template found: ${envTemplate}`, colors.green)
  } else {
    log(`ℹ️  No environment template: ${envTemplate}`, colors.blue)
  }

  // Check environment file
  if (existsSync('.env')) {
    log(`✅ .env file found`, colors.green)
    const envResult = checkEnvVariables()
    errors += envResult.errors
    warnings += envResult.warnings
  } else if (existsSync('.env.example')) {
    log(`⚠️  .env file missing - copy from .env.example`, colors.yellow)
    log(`   Run: cp .env.example .env`, colors.blue)
    warnings++
  } else {
    log(`❌ .env.example file missing`, colors.red)
    errors++
  }

  // Advanced configuration validation using the new env-config system
  try {
    await checkAdvancedConfiguration()
  } catch (error) {
    log(`ℹ️  Advanced configuration check skipped (${error.message})`, colors.blue)
  }

  // Check database setup
  if (existsSync('prisma/schema.prisma')) {
    log(`✅ Prisma schema found`, colors.green)
    
    // Check if Prisma client is generated
    if (existsSync('node_modules/.prisma/client')) {
      log(`✅ Prisma client generated`, colors.green)
    } else {
      log(`⚠️  Prisma client not generated - may require network access`, colors.yellow)
      log(`   Note: This is normal in restricted environments (CI/sandboxes)`, colors.blue)
      warnings++
    }

    if (existsSync('prisma/dev.db')) {
      log(`✅ SQLite database exists`, colors.green)
    } else {
      log(`⚠️  Database not initialized - run 'npm run db:migrate'`, colors.yellow)
      log(`   Note: Database operations may be limited without Prisma client`, colors.blue)
      warnings++
    }
  } else {
    log(`❌ Prisma schema missing`, colors.red)
    errors++
  }

  // Check TypeScript config
  if (existsSync('tsconfig.json')) {
    log(`✅ TypeScript configuration found`, colors.green)
  } else {
    log(`❌ tsconfig.json missing`, colors.red)
    errors++
  }

  // Check build output
  if (existsSync('dist')) {
    log(`✅ Previous build found`, colors.green)
  } else {
    log(`ℹ️  No build output - run 'npm run build' if needed`, colors.blue)
  }

  // Summary
  log(`\n${colors.bold}Summary:${colors.reset}`)

  if (errors === 0 && warnings === 0) {
    log(`🎉 Environment is ready for development!`, colors.green)
    log(`Run 'npm run dev' to start the development server`, colors.blue)
  } else {
    if (errors > 0) {
      log(`❌ ${errors} error(s) found - please fix before continuing`, colors.red)
    }
    if (warnings > 0) {
      log(`⚠️  ${warnings} warning(s) found - consider addressing`, colors.yellow)
    }

    log(`\n${colors.bold}Quick fixes:${colors.reset}`)
    if (!existsSync('node_modules')) {
      log(`• npm install`, colors.blue)
    }
    if (!existsSync('.env') && existsSync('.env.example')) {
      log(`• cp .env.example .env`, colors.blue)
    }
    if (!existsSync('prisma/dev.db')) {
      log(`• npm run db:migrate`, colors.blue)
      log(`• npm run db:seed`, colors.blue)
    }
    
    // Add note about network restrictions
    if (!existsSync('node_modules/.prisma/client')) {
      log(`\n${colors.bold}Note about Prisma:${colors.reset}`)
      log(`If you see "binaries.prisma.sh" errors, this is due to network restrictions`, colors.blue)
      log(`in sandboxed/CI environments. The application will still work for most`, colors.blue)
      log(`development tasks. Database operations may be limited but tests and build`, colors.blue)
      log(`will continue to function normally.`, colors.blue)
    }

    // Environment-specific suggestions
    log(`\n${colors.bold}Environment Configuration Tips:${colors.reset}`)
    log(`• Use 'npm run env:validate' for comprehensive configuration validation`, colors.magenta)
    log(`• Check '.env.${currentEnv}' for environment-specific configuration`, colors.magenta)
    log(`• Run 'npm run dev:fix-env' to auto-fix common configuration issues`, colors.magenta)
  }

  return { errors, warnings }
}

function checkEnvVariables() {
  let errors = 0
  let warnings = 0

  try {
    const envContent = readFileSync('.env', 'utf8')
    const lines = envContent.split('\n').filter(line => line.trim() && !line.startsWith('#'))

    const requiredVars = ['DATABASE_URL', 'AUTH_SECRET', 'APP_URL']
    const recommendedVars = ['NODE_ENV']

    let foundVars = {}

    lines.forEach(line => {
      const [key, value] = line.split('=', 2)
      if (key && value) {
        foundVars[key.trim()] = value.trim()
      }
    })

    // Check required variables
    requiredVars.forEach(varName => {
      if (foundVars[varName]) {
        if (
          foundVars[varName] === 'your-32-character-secret-key-here-change-me' ||
          foundVars[varName].includes('your-') ||
          foundVars[varName].includes('change-me')
        ) {
          log(`⚠️  ${varName} needs to be updated from default value`, colors.yellow)
          warnings++
        } else {
          log(`✅ ${varName} configured`, colors.green)
        }
      } else {
        log(`❌ ${varName} missing from .env`, colors.red)
        errors++
      }
    })

    // Check recommended variables
    recommendedVars.forEach(varName => {
      if (foundVars[varName]) {
        log(`✅ ${varName} configured`, colors.green)
      } else {
        log(`ℹ️  ${varName} not set (recommended for development)`, colors.blue)
      }
    })

    return { errors, warnings }
  } catch (error) {
    log(`❌ Error reading .env file: ${error.message}`, colors.red)
    return { errors: 1, warnings: 0 }
  }
}

// Additional system checks
async function checkSystemRequirements() {
  log(`\n${colors.bold}System Requirements:${colors.reset}`)

  // Check Git
  try {
    const { execSync } = await import('child_process')
    const gitVersion = execSync('git --version', { encoding: 'utf8' }).trim()
    log(`✅ ${gitVersion}`, colors.green)
  } catch (error) {
    log(`ℹ️  Git check skipped (likely in CI environment)`, colors.blue)
  }

  // Check npm (npm is available since we're running through npm)
  log(`✅ npm available (running through npm scripts)`, colors.green)
}

// Advanced configuration validation using env-config
async function checkAdvancedConfiguration() {
  log(`\n${colors.bold}🔧 Advanced Configuration Validation${colors.reset}`)

  try {
    // Import the environment configuration manager
    const { EnvironmentConfigManager } = await import('./env-config.js')
    const envManager = new EnvironmentConfigManager()
    const validation = envManager.validate()

    // Display critical errors
    const criticalErrors = validation.errors.filter(e => e.severity === 'critical')
    if (criticalErrors.length > 0) {
      log(`\n${colors.bold}🚨 Critical Security Issues:${colors.reset}`)
      criticalErrors.forEach(error => {
        log(`❌ ${error.key}: ${error.message}`, colors.red)
        if (error.suggestion) {
          log(`   💡 ${error.suggestion}`, colors.yellow)
        }
      })
    }

    // Display regular errors
    const regularErrors = validation.errors.filter(e => e.severity === 'error')
    if (regularErrors.length > 0) {
      log(`\n${colors.bold}❌ Configuration Errors:${colors.reset}`)
      regularErrors.forEach(error => {
        log(`❌ ${error.key}: ${error.message}`, colors.red)
        if (error.suggestion) {
          log(`   💡 ${error.suggestion}`, colors.blue)
        }
      })
    }

    // Display warnings
    if (validation.warnings.length > 0) {
      log(`\n${colors.bold}⚠️  Configuration Warnings:${colors.reset}`)
      validation.warnings.forEach(warning => {
        log(`⚠️  ${warning.key}: ${warning.message}`, colors.yellow)
        if (warning.suggestion) {
          log(`   💡 ${warning.suggestion}`, colors.blue)
        }
      })
    }

    // Display suggestions
    if (validation.suggestions.length > 0) {
      log(`\n${colors.bold}💡 Suggestions:${colors.reset}`)
      validation.suggestions.forEach(suggestion => {
        log(`• ${suggestion}`, colors.magenta)
      })
    }

    // Overall status
    if (validation.isValid) {
      log(`\n✅ Configuration validation passed!`, colors.green)
    } else {
      log(`\n❌ Configuration validation failed`, colors.red)
      log(`   Use 'npm run env:validate' for detailed validation`, colors.blue)
    }

    return validation
  } catch (error) {
    // Gracefully handle if the env-config module is not available
    throw new Error(`env-config module not available: ${error.message}`)
  }
}

// Main execution
if (import.meta.url === `file://${resolve(process.argv[1])}`) {
  ;(async () => {
    await checkSystemRequirements()
    const result = await checkEnvironment()

    // Exit with error code if there are errors
    process.exit(result.errors > 0 ? 1 : 0)
  })()
}

export { checkEnvironment, checkEnvVariables }
