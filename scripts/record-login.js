#!/usr/bin/env node

/**
 * Script to record login interactions using Playwright codegen
 * Usage: npm run record:login [url]
 */

const { spawn } = require('child_process')
const path = require('path')

const baseUrl = process.argv[2] || 'http://localhost:4173/login'

console.log('🎬 Recording login interactions...')
console.log(`📍 Target URL: ${baseUrl}`)
console.log('🔧 Instructions:')
console.log('   1. Perform login actions in the browser')
console.log('   2. Close the browser when done recording')
console.log('   3. Generated code will be saved to playwright/generated-login.spec.ts')
console.log('')

const outputFile = path.join(__dirname, '../playwright/generated-login.spec.ts')

const codegen = spawn('npx', [
  'playwright',
  'codegen',
  '--output', outputFile,
  '--target', 'playwright-test',
  '--browser', 'chromium',
  baseUrl
], {
  stdio: 'inherit',
  cwd: path.join(__dirname, '..')
})

codegen.on('close', (code) => {
  if (code === 0) {
    console.log('✅ Recording completed!')
    console.log(`📁 Generated test saved to: ${outputFile}`)
    console.log('🔍 You can now review and customize the generated test')
  } else {
    console.log('❌ Recording failed with exit code:', code)
  }
})

codegen.on('error', (error) => {
  console.error('❌ Error starting recorder:', error.message)
  console.log('💡 Make sure Playwright is installed: npm install')
})