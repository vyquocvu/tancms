#!/usr/bin/env node
/**
 * Database Connection Test Utility
 * Tests database connection and displays provider information
 */

import { databaseManager } from '../app/server/database-manager.js'

async function testDatabaseConnection() {
  console.log('🔗 Testing database connection...\n')

  try {
    // Initialize database
    await databaseManager.initialize()
    
    // Get configuration
    const config = databaseManager.getConfig()
    console.log('📋 Database Configuration:')
    console.log(`   Provider: ${config?.provider}`)
    console.log(`   URL: ${config?.url?.replace(/:[^:@]*@/, ':***@')}`) // Hide password
    console.log(`   Pool Size: ${config?.poolSize || 'default'}`)
    console.log(`   SSL: ${config?.ssl ? 'enabled' : 'disabled'}`)
    console.log()

    // Test connection
    const connected = await databaseManager.testConnection()
    console.log(`🔌 Connection Status: ${connected ? '✅ Connected' : '❌ Failed'}`)

    if (connected) {
      // Get detailed status
      const status = await databaseManager.getConnectionStatus()
      console.log('📊 Connection Details:')
      console.log(`   Active Connections: ${status.activeConnections || 'unknown'}`)
      console.log(`   Pool Size: ${status.poolSize || 'N/A'}`)
      console.log()

      // Get statistics
      const stats = await databaseManager.getStatistics()
      console.log('📈 Database Statistics:')
      console.log(JSON.stringify(stats, null, 2))
    }

    // Health check
    console.log('\n🏥 Health Check:')
    const health = await databaseManager.healthCheck()
    console.log(`   Status: ${health.status === 'healthy' ? '✅ Healthy' : '❌ Unhealthy'}`)
    if (health.error) {
      console.log(`   Error: ${health.error}`)
    }

    console.log('\n✅ Database test completed successfully!')
    
  } catch (error) {
    console.error('❌ Database test failed:', error.message)
    if (error.code) {
      console.error(`   Error Code: ${error.code}`)
    }
    process.exit(1)
  } finally {
    // Clean up
    await databaseManager.close()
  }
}

// Handle unhandled rejections
process.on('unhandledRejection', (reason, promise) => {
  console.error('Unhandled Rejection at:', promise, 'reason:', reason)
  process.exit(1)
})

// Run the test
testDatabaseConnection().catch(console.error)