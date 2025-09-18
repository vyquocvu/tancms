#!/usr/bin/env node

/**
 * TanCMS Demo Workflow Script
 * 
 * This script demonstrates the complete workflow capabilities of TanCMS including:
 * - Database operations
 * - Content management
 * - User management
 * - System health checks
 * 
 * Usage:
 *   npm run demo:workflow
 *   node scripts/demo-workflow.js
 *   node scripts/demo-workflow.js --verbose
 *   node scripts/demo-workflow.js --environment=staging
 */

const { PrismaClient } = require('@prisma/client')

const prisma = new PrismaClient()

// Parse command line arguments
const args = process.argv.slice(2)
const verbose = args.includes('--verbose') || args.includes('-v')
const environment = args.find(arg => arg.startsWith('--environment='))?.split('=')[1] || 'development'

console.log('🚀 TanCMS Demo Workflow')
console.log('=' .repeat(50))
console.log(`Environment: ${environment}`)
console.log(`Verbose mode: ${verbose ? 'ON' : 'OFF'}`)
console.log(`Started at: ${new Date().toISOString()}`)
console.log('=' .repeat(50))

// Import demo workflow functions dynamically
async function loadDemoFunctions() {
  try {
    // Try to load the TypeScript module
    const { exampleWorkflow } = await import('../app/server/db-examples.js')
    return { exampleWorkflow }
  } catch (error) {
    console.warn('Could not load TypeScript module, trying CommonJS...')
    // Fallback for different module systems
    const dbExamples = require('../app/server/db-examples.ts')
    return { exampleWorkflow: dbExamples.exampleWorkflow }
  }
}

async function runDemoWorkflow() {
  try {
    // Connect to database
    await prisma.$connect()
    console.log('📡 Database connected successfully')

    // Load demo functions
    const { exampleWorkflow } = await loadDemoFunctions()

    if (!exampleWorkflow) {
      throw new Error('Could not load demo workflow functions')
    }

    // Run the complete demo workflow
    const result = await exampleWorkflow()

    // Display results
    console.log('\n🎉 Demo Workflow Results:')
    console.log(`  Status: ${result.success ? '✅ SUCCESS' : '❌ FAILED'}`)
    console.log(`  Tags created: ${result.stats.tagsCreated}`)
    console.log(`  Sessions cleaned: ${result.stats.sessionsCleaned}`)
    console.log(`  Completed at: ${result.stats.timestamp}`)

    if (verbose) {
      console.log('\n📊 Detailed Statistics:')
      console.log(JSON.stringify(result.stats, null, 2))
    }

    // Generate demo report
    await generateDemoReport(result)

    console.log('\n✨ Demo workflow completed successfully!')
    process.exit(0)

  } catch (error) {
    console.error('\n❌ Demo workflow failed:')
    console.error(error.message || error)
    
    if (verbose) {
      console.error('\nStack trace:')
      console.error(error.stack)
    }
    
    process.exit(1)
  } finally {
    await prisma.$disconnect()
  }
}

async function generateDemoReport(workflowResult) {
  const report = {
    title: 'TanCMS Demo Workflow Report',
    timestamp: new Date().toISOString(),
    environment: environment,
    workflow: workflowResult,
    system: {
      nodeVersion: process.version,
      platform: process.platform,
      arch: process.arch
    }
  }

  // Write report to file if in staging/production
  if (environment !== 'development') {
    const fs = require('fs').promises
    const reportPath = `demo-report-${Date.now()}.json`
    
    try {
      await fs.writeFile(reportPath, JSON.stringify(report, null, 2))
      console.log(`📄 Demo report saved: ${reportPath}`)
    } catch (error) {
      console.warn(`⚠️  Could not save demo report: ${error.message}`)
    }
  }

  return report
}

// Handle process signals
process.on('SIGINT', async () => {
  console.log('\n⚠️  Demo workflow interrupted by user')
  await prisma.$disconnect()
  process.exit(130)
})

process.on('SIGTERM', async () => {
  console.log('\n⚠️  Demo workflow terminated')
  await prisma.$disconnect()
  process.exit(143)
})

// Run the workflow
runDemoWorkflow()