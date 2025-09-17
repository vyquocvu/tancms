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
}

function log(message, color = '') {
  console.log(`${color}${message}${colors.reset}`)
}

function checkEnvironment() {
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

  // Check environment file
  if (existsSync('.env')) {
    log(`✅ .env file found`, colors.green)
    checkEnvVariables()
  } else if (existsSync('.env.example')) {
    log(`⚠️  .env file missing - copy from .env.example`, colors.yellow)
    log(`   Run: cp .env.example .env`, colors.blue)
    warnings++
  } else {
    log(`❌ .env.example file missing`, colors.red)
    errors++
  }

  // Check database setup
  if (existsSync('prisma/schema.prisma')) {
    log(`✅ Prisma schema found`, colors.green)

    if (existsSync('prisma/dev.db')) {
      log(`✅ SQLite database exists`, colors.green)
    } else {
      log(`⚠️  Database not initialized - run 'npm run db:migrate'`, colors.yellow)
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
  }

  return { errors, warnings }
}

function checkEnvVariables() {
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
        } else {
          log(`✅ ${varName} configured`, colors.green)
        }
      } else {
        log(`❌ ${varName} missing from .env`, colors.red)
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
  } catch (error) {
    log(`❌ Error reading .env file: ${error.message}`, colors.red)
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

// Main execution
if (import.meta.url === `file://${resolve(process.argv[1])}`) {
  ;(async () => {
    await checkSystemRequirements()
    const result = checkEnvironment()

    // Exit with error code if there are errors
    process.exit(result.errors > 0 ? 1 : 0)
  })()
}

export { checkEnvironment, checkEnvVariables }
