#!/usr/bin/env node

/**
 * TanCMS Development Utilities
 * Helper tools for development and debugging
 */

import { existsSync, writeFileSync, readFileSync } from 'fs'
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

// Generate secure AUTH_SECRET
async function generateAuthSecret() {
  const crypto = await import('crypto')
  return crypto.randomBytes(32).toString('hex')
}

// Fix common .env issues
async function fixEnvFile() {
  log(`${colors.bold}🔧 Fixing .env configuration...${colors.reset}`)

  if (!existsSync('.env')) {
    if (existsSync('.env.example')) {
      const exampleContent = readFileSync('.env.example', 'utf8')
      writeFileSync('.env', exampleContent)
      log(`✅ Created .env from .env.example`, colors.green)
    } else {
      log(`❌ No .env.example found`, colors.red)
      return
    }
  }

  let envContent = readFileSync('.env', 'utf8')
  let modified = false

  // Replace default AUTH_SECRET
  if (envContent.includes('your-32-character-secret-key-here-change-me')) {
    const newSecret = await generateAuthSecret()
    envContent = envContent.replace('your-32-character-secret-key-here-change-me', newSecret)
    modified = true
    log(`✅ Generated secure AUTH_SECRET`, colors.green)
  }

  // Ensure NODE_ENV is set for development
  if (!envContent.includes('NODE_ENV=')) {
    envContent += '\nNODE_ENV="development"\n'
    modified = true
    log(`✅ Added NODE_ENV=development`, colors.green)
  }

  if (modified) {
    writeFileSync('.env', envContent)
    log(`💾 Updated .env file`, colors.blue)
  } else {
    log(`ℹ️  .env file looks good`, colors.blue)
  }
}

// Create development database with sample data
async function setupDevDatabase() {
  log(`${colors.bold}🗃️  Setting up development database...${colors.reset}`)

  try {
    const { execSync } = await import('child_process')

    // Generate Prisma client (may fail in restricted environments)
    try {
      execSync('npm run db:generate', { stdio: 'inherit' })
      log(`✅ Generated Prisma client`, colors.green)
    } catch (error) {
      log(`⚠️  Prisma client generation skipped (network restrictions)`, colors.yellow)
    }

    // Run migrations
    try {
      execSync('npm run db:migrate', { stdio: 'inherit' })
      log(`✅ Database migrations completed`, colors.green)
    } catch (error) {
      log(`⚠️  Database migration skipped`, colors.yellow)
    }

    // Seed database
    try {
      execSync('npm run db:seed', { stdio: 'inherit' })
      log(`✅ Database seeded with sample data`, colors.green)
    } catch (error) {
      log(`⚠️  Database seeding skipped`, colors.yellow)
    }
  } catch (error) {
    log(`❌ Database setup failed: ${error.message}`, colors.red)
  }
}

// Show development status
function showDevStatus() {
  log(`${colors.bold}📊 TanCMS Development Status${colors.reset}\n`)

  const checks = [
    { name: 'Node.js version', check: () => process.version, status: 'info' },
    {
      name: '.env file',
      check: () => (existsSync('.env') ? '✅ Exists' : '❌ Missing'),
      status: existsSync('.env') ? 'success' : 'error',
    },
    {
      name: 'Dependencies',
      check: () => (existsSync('node_modules') ? '✅ Installed' : '❌ Missing'),
      status: existsSync('node_modules') ? 'success' : 'error',
    },
    {
      name: 'Database',
      check: () => (existsSync('prisma/dev.db') ? '✅ Initialized' : '⚠️  Not initialized'),
      status: existsSync('prisma/dev.db') ? 'success' : 'warning',
    },
    {
      name: 'Build output',
      check: () => (existsSync('dist') ? '✅ Available' : 'ℹ️  Not built'),
      status: 'info',
    },
  ]

  checks.forEach(({ name, check, status }) => {
    const result = check()
    const color =
      status === 'error'
        ? colors.red
        : status === 'warning'
          ? colors.yellow
          : status === 'success'
            ? colors.green
            : colors.blue
    log(`${name.padEnd(20)}: ${result}`, color)
  })

  log(`\n${colors.bold}Quick commands:${colors.reset}`)
  log(`• npm run dev          - Start development server`, colors.blue)
  log(`• npm run build        - Build for production`, colors.blue)
  log(`• npm run test         - Run tests`, colors.blue)
  log(`• npm run lint         - Check code quality`, colors.blue)
  log(`• npm run format       - Format code`, colors.blue)
  log(`• npm run check-env    - Validate environment`, colors.blue)
}

// Main CLI interface
async function main() {
  const command = process.argv[2]

  switch (command) {
    case 'fix-env':
      await fixEnvFile()
      break

    case 'setup-db':
      await setupDevDatabase()
      break

    case 'status':
      showDevStatus()
      break

    case 'full-setup':
      log(`${colors.bold}🚀 Running full development setup...${colors.reset}\n`)
      await fixEnvFile()
      await setupDevDatabase()
      showDevStatus()
      log(`\n🎉 Setup complete! Run 'npm run dev' to start development.`, colors.green)
      break

    default:
      log(`${colors.bold}TanCMS Development Utilities${colors.reset}\n`)
      log(`Usage: node scripts/dev-tools.js <command>\n`)
      log(`Commands:`)
      log(`  fix-env     - Fix .env configuration issues`)
      log(`  setup-db    - Initialize development database`)
      log(`  status      - Show development environment status`)
      log(`  full-setup  - Run complete development setup`)
      log(`\nFor basic environment checks, use: npm run check-env`)
  }
}

// Run if called directly
if (import.meta.url === `file://${resolve(process.argv[1])}`) {
  main().catch(error => {
    log(`❌ Error: ${error.message}`, colors.red)
    process.exit(1)
  })
}
