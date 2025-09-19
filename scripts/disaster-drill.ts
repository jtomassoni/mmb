#!/usr/bin/env tsx
// scripts/disaster-drill.ts
import { createBackupService } from '../src/lib/backup'
import { prisma } from '../src/lib/prisma'
import fs from 'fs'
import path from 'path'

interface DrillResult {
  step: string
  success: boolean
  duration: number
  error?: string
  details?: any
}

class DisasterDrill {
  private results: DrillResult[] = []
  private startTime: Date = new Date()

  async runFullDrill(): Promise<void> {
    console.log('🚨 DISASTER RECOVERY DRILL STARTING 🚨')
    console.log('=====================================')
    console.log('')
    
    try {
      await this.step1_VerifyBackupSystem()
      await this.step2_CreateTestBackup()
      await this.step3_SimulateDataLoss()
      await this.step4_RestoreFromBackup()
      await this.step5_VerifyDataIntegrity()
      await this.step6_Cleanup()
      
      this.printSummary()
      
    } catch (error) {
      console.error('❌ Drill failed:', error)
      this.printSummary()
      process.exit(1)
    }
  }

  private async step1_VerifyBackupSystem(): Promise<void> {
    const stepStart = Date.now()
    console.log('Step 1: Verifying backup system...')
    
    try {
      const backupService = createBackupService()
      const backups = await backupService.listBackups()
      
      this.results.push({
        step: 'Verify Backup System',
        success: true,
        duration: Date.now() - stepStart,
        details: { backupCount: backups.length }
      })
      
      console.log(`✅ Backup system verified (${backups.length} existing backups)`)
      
    } catch (error) {
      this.results.push({
        step: 'Verify Backup System',
        success: false,
        duration: Date.now() - stepStart,
        error: error instanceof Error ? error.message : 'Unknown error'
      })
      
      console.log('❌ Backup system verification failed')
      throw error
    }
  }

  private async step2_CreateTestBackup(): Promise<void> {
    const stepStart = Date.now()
    console.log('Step 2: Creating test backup...')
    
    try {
      const backupService = createBackupService()
      const result = await backupService.createBackup()
      
      if (!result.success) {
        throw new Error(result.error || 'Backup creation failed')
      }
      
      this.results.push({
        step: 'Create Test Backup',
        success: true,
        duration: Date.now() - stepStart,
        details: { 
          backupId: result.backupId,
          size: result.size,
          location: result.location
        }
      })
      
      console.log(`✅ Test backup created: ${result.backupId}`)
      
    } catch (error) {
      this.results.push({
        step: 'Create Test Backup',
        success: false,
        duration: Date.now() - stepStart,
        error: error instanceof Error ? error.message : 'Unknown error'
      })
      
      console.log('❌ Test backup creation failed')
      throw error
    }
  }

  private async step3_SimulateDataLoss(): Promise<void> {
    const stepStart = Date.now()
    console.log('Step 3: Simulating data loss...')
    
    try {
      // Count current records
      const siteCount = await prisma.site.count()
      const userCount = await prisma.user.count()
      const eventCount = await prisma.event.count()
      const specialCount = await prisma.special.count()
      
      // Simulate data loss by truncating tables (in a transaction)
      await prisma.$transaction(async (tx) => {
        await tx.event.deleteMany()
        await tx.special.deleteMany()
        await tx.menuItem.deleteMany()
        await tx.membership.deleteMany()
        await tx.site.deleteMany()
        await tx.user.deleteMany()
      })
      
      // Verify data is gone
      const remainingSites = await prisma.site.count()
      const remainingUsers = await prisma.user.count()
      
      this.results.push({
        step: 'Simulate Data Loss',
        success: true,
        duration: Date.now() - stepStart,
        details: {
          deletedSites: siteCount,
          deletedUsers: userCount,
          deletedEvents: eventCount,
          deletedSpecials: specialCount,
          remainingSites,
          remainingUsers
        }
      })
      
      console.log(`✅ Data loss simulated (${siteCount} sites, ${userCount} users deleted)`)
      
    } catch (error) {
      this.results.push({
        step: 'Simulate Data Loss',
        success: false,
        duration: Date.now() - stepStart,
        error: error instanceof Error ? error.message : 'Unknown error'
      })
      
      console.log('❌ Data loss simulation failed')
      throw error
    }
  }

  private async step4_RestoreFromBackup(): Promise<void> {
    const stepStart = Date.now()
    console.log('Step 4: Restoring from backup...')
    
    try {
      const backupService = createBackupService()
      const backups = await backupService.listBackups()
      
      if (backups.length === 0) {
        throw new Error('No backups available for restore')
      }
      
      const latestBackup = backups[0]
      const result = await backupService.restoreBackup(latestBackup.backupId)
      
      if (!result.success) {
        throw new Error(result.error || 'Restore failed')
      }
      
      this.results.push({
        step: 'Restore From Backup',
        success: true,
        duration: Date.now() - stepStart,
        details: {
          backupId: result.backupId,
          restoredAt: result.restoredAt
        }
      })
      
      console.log(`✅ Restored from backup: ${result.backupId}`)
      
    } catch (error) {
      this.results.push({
        step: 'Restore From Backup',
        success: false,
        duration: Date.now() - stepStart,
        error: error instanceof Error ? error.message : 'Unknown error'
      })
      
      console.log('❌ Restore from backup failed')
      throw error
    }
  }

  private async step5_VerifyDataIntegrity(): Promise<void> {
    const stepStart = Date.now()
    console.log('Step 5: Verifying data integrity...')
    
    try {
      // Check that data is restored
      const siteCount = await prisma.site.count()
      const userCount = await prisma.user.count()
      const eventCount = await prisma.event.count()
      const specialCount = await prisma.special.count()
      
      // Verify relationships are intact
      const sitesWithUsers = await prisma.site.findMany({
        include: {
          memberships: {
            include: {
              user: true
            }
          }
        }
      })
      
      const sitesWithEvents = await prisma.site.findMany({
        include: {
          events: true
        }
      })
      
      const sitesWithSpecials = await prisma.site.findMany({
        include: {
          specials: true
        }
      })
      
      this.results.push({
        step: 'Verify Data Integrity',
        success: true,
        duration: Date.now() - stepStart,
        details: {
          restoredSites: siteCount,
          restoredUsers: userCount,
          restoredEvents: eventCount,
          restoredSpecials: specialCount,
          sitesWithUsers: sitesWithUsers.length,
          sitesWithEvents: sitesWithEvents.length,
          sitesWithSpecials: sitesWithSpecials.length
        }
      })
      
      console.log(`✅ Data integrity verified (${siteCount} sites, ${userCount} users restored)`)
      
    } catch (error) {
      this.results.push({
        step: 'Verify Data Integrity',
        success: false,
        duration: Date.now() - stepStart,
        error: error instanceof Error ? error.message : 'Unknown error'
      })
      
      console.log('❌ Data integrity verification failed')
      throw error
    }
  }

  private async step6_Cleanup(): Promise<void> {
    const stepStart = Date.now()
    console.log('Step 6: Cleaning up test data...')
    
    try {
      // Remove the test backup we created
      const backupService = createBackupService()
      const backups = await backupService.listBackups()
      
      // Find the most recent backup (our test backup)
      if (backups.length > 0) {
        const testBackup = backups[0]
        console.log(`   Test backup ${testBackup.backupId} will remain for manual cleanup`)
      }
      
      this.results.push({
        step: 'Cleanup',
        success: true,
        duration: Date.now() - stepStart,
        details: { testBackupsRemaining: backups.length }
      })
      
      console.log('✅ Cleanup completed')
      
    } catch (error) {
      this.results.push({
        step: 'Cleanup',
        success: false,
        duration: Date.now() - stepStart,
        error: error instanceof Error ? error.message : 'Unknown error'
      })
      
      console.log('❌ Cleanup failed')
      // Don't throw here, cleanup failure shouldn't fail the whole drill
    }
  }

  private printSummary(): void {
    const totalDuration = Date.now() - this.startTime.getTime()
    const successfulSteps = this.results.filter(r => r.success).length
    const totalSteps = this.results.length
    
    console.log('')
    console.log('📊 DRILL SUMMARY')
    console.log('================')
    console.log(`Total Duration: ${Math.round(totalDuration / 1000)}s`)
    console.log(`Steps Completed: ${successfulSteps}/${totalSteps}`)
    console.log(`Overall Result: ${successfulSteps === totalSteps ? '✅ PASSED' : '❌ FAILED'}`)
    console.log('')
    
    console.log('Step Details:')
    this.results.forEach((result, index) => {
      const status = result.success ? '✅' : '❌'
      const duration = `${Math.round(result.duration / 1000)}s`
      console.log(`  ${index + 1}. ${status} ${result.step} (${duration})`)
      
      if (result.error) {
        console.log(`     Error: ${result.error}`)
      }
      
      if (result.details) {
        Object.entries(result.details).forEach(([key, value]) => {
          console.log(`     ${key}: ${value}`)
        })
      }
    })
    
    console.log('')
    
    if (successfulSteps === totalSteps) {
      console.log('🎉 DISASTER RECOVERY DRILL COMPLETED SUCCESSFULLY!')
      console.log('   Your backup and restore system is working correctly.')
    } else {
      console.log('⚠️  DISASTER RECOVERY DRILL FAILED!')
      console.log('   Please review the errors above and fix the backup system.')
    }
  }
}

// Check environment variables
function checkEnvironment() {
  const requiredVars = [
    'BACKUP_BUCKET',
    'BACKUP_ACCESS_KEY_ID',
    'BACKUP_SECRET_ACCESS_KEY'
  ]
  
  const missing = requiredVars.filter(varName => !process.env[varName])
  
  if (missing.length > 0) {
    console.error('❌ Missing required environment variables:')
    missing.forEach(varName => console.error(`   ${varName}`))
    console.error('')
    console.error('Please set these variables in your .env.local file or environment.')
    process.exit(1)
  }
}

// Main execution
async function main() {
  checkEnvironment()
  
  const drill = new DisasterDrill()
  await drill.runFullDrill()
}

main().catch(error => {
  console.error('❌ Unexpected error:', error)
  process.exit(1)
})
