#!/usr/bin/env tsx
// scripts/backup-cli.ts
import { createBackupService } from '../src/lib/backup'
import { Command } from 'commander'

const program = new Command()

program
  .name('backup-cli')
  .description('CLI tool for managing backups')
  .version('1.0.0')

program
  .command('create')
  .description('Create a new backup')
  .action(async () => {
    try {
      console.log('Creating backup...')
      const backupService = createBackupService()
      const result = await backupService.createBackup()
      
      if (result.success) {
        console.log('✅ Backup created successfully!')
        console.log(`   Backup ID: ${result.backupId}`)
        console.log(`   Timestamp: ${result.timestamp.toISOString()}`)
        console.log(`   Size: ${formatFileSize(result.size)}`)
        console.log(`   Location: ${result.location}`)
      } else {
        console.error('❌ Backup failed!')
        console.error(`   Error: ${result.error}`)
        process.exit(1)
      }
    } catch (error) {
      console.error('❌ Backup failed!')
      console.error(`   Error: ${error instanceof Error ? error.message : 'Unknown error'}`)
      process.exit(1)
    }
  })

program
  .command('list')
  .description('List available backups')
  .action(async () => {
    try {
      console.log('Fetching backups...')
      const backupService = createBackupService()
      const backups = await backupService.listBackups()
      
      if (backups.length === 0) {
        console.log('No backups found.')
        return
      }
      
      console.log(`Found ${backups.length} backup(s):`)
      console.log('')
      
      backups.forEach((backup, index) => {
        console.log(`${index + 1}. ${backup.backupId}`)
        console.log(`   Created: ${backup.timestamp.toISOString()}`)
        console.log(`   Size: ${formatFileSize(backup.size)}`)
        console.log('')
      })
    } catch (error) {
      console.error('❌ Failed to list backups!')
      console.error(`   Error: ${error instanceof Error ? error.message : 'Unknown error'}`)
      process.exit(1)
    }
  })

program
  .command('restore')
  .description('Restore from a backup')
  .argument('<backup-id>', 'Backup ID to restore from')
  .option('-f, --force', 'Skip confirmation prompt')
  .action(async (backupId, options) => {
    try {
      if (!options.force) {
        console.log(`⚠️  WARNING: This will replace all current data with backup: ${backupId}`)
        console.log('   This action cannot be undone!')
        console.log('   Use --force flag to skip this confirmation.')
        return
      }
      
      console.log(`Restoring from backup: ${backupId}`)
      const backupService = createBackupService()
      const result = await backupService.restoreBackup(backupId)
      
      if (result.success) {
        console.log('✅ Backup restored successfully!')
        console.log(`   Restored from: ${result.backupId}`)
        console.log(`   Restored at: ${result.restoredAt.toISOString()}`)
      } else {
        console.error('❌ Restore failed!')
        console.error(`   Error: ${result.error}`)
        process.exit(1)
      }
    } catch (error) {
      console.error('❌ Restore failed!')
      console.error(`   Error: ${error instanceof Error ? error.message : 'Unknown error'}`)
      process.exit(1)
    }
  })

program
  .command('latest')
  .description('Restore from the latest backup')
  .option('-f, --force', 'Skip confirmation prompt')
  .action(async (options) => {
    try {
      console.log('Finding latest backup...')
      const backupService = createBackupService()
      const backups = await backupService.listBackups()
      
      if (backups.length === 0) {
        console.log('No backups found.')
        return
      }
      
      const latestBackup = backups[0]
      console.log(`Latest backup: ${latestBackup.backupId}`)
      
      if (!options.force) {
        console.log(`⚠️  WARNING: This will replace all current data with backup: ${latestBackup.backupId}`)
        console.log('   This action cannot be undone!')
        console.log('   Use --force flag to skip this confirmation.')
        return
      }
      
      console.log(`Restoring from latest backup: ${latestBackup.backupId}`)
      const result = await backupService.restoreBackup(latestBackup.backupId)
      
      if (result.success) {
        console.log('✅ Backup restored successfully!')
        console.log(`   Restored from: ${result.backupId}`)
        console.log(`   Restored at: ${result.restoredAt.toISOString()}`)
      } else {
        console.error('❌ Restore failed!')
        console.error(`   Error: ${result.error}`)
        process.exit(1)
      }
    } catch (error) {
      console.error('❌ Restore failed!')
      console.error(`   Error: ${error instanceof Error ? error.message : 'Unknown error'}`)
      process.exit(1)
    }
  })

function formatFileSize(bytes: number): string {
  if (bytes === 0) return '0 Bytes'
  const k = 1024
  const sizes = ['Bytes', 'KB', 'MB', 'GB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
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
  await program.parseAsync()
}

main().catch(error => {
  console.error('❌ Unexpected error:', error)
  process.exit(1)
})
