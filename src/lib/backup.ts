// src/lib/backup.ts
import { S3Client, PutObjectCommand, ListObjectsV2Command, GetObjectCommand } from '@aws-sdk/client-s3'
import { getSignedUrl } from '@aws-sdk/s3-request-presigner'
import fs from 'fs'
import path from 'path'
import { execSync } from 'child_process'
import { prisma } from './prisma'

export interface BackupConfig {
  provider: 's3' | 'backblaze'
  bucket: string
  region: string
  accessKeyId: string
  secretAccessKey: string
  endpoint?: string // For Backblaze B2
}

export interface BackupResult {
  success: boolean
  backupId: string
  timestamp: Date
  size: number
  location: string
  error?: string
}

export interface RestoreResult {
  success: boolean
  restoredAt: Date
  backupId: string
  error?: string
}

export class BackupService {
  private config: BackupConfig
  private s3Client: S3Client

  constructor(config: BackupConfig) {
    this.config = config
    this.s3Client = new S3Client({
      region: config.region,
      credentials: {
        accessKeyId: config.accessKeyId,
        secretAccessKey: config.secretAccessKey,
      },
      endpoint: config.endpoint, // For Backblaze B2
      forcePathStyle: config.provider === 'backblaze', // B2 requires path-style URLs
    })
  }

  /**
   * Create a full backup of database and media files
   */
  async createBackup(): Promise<BackupResult> {
    const timestamp = new Date()
    const backupId = `backup-${timestamp.toISOString().replace(/[:.]/g, '-')}`
    
    try {
      console.log(`Starting backup: ${backupId}`)
      
      // Create temporary backup directory
      const tempDir = path.join(process.cwd(), 'backups', backupId)
      await fs.promises.mkdir(tempDir, { recursive: true })
      
      // Backup database
      const dbBackupPath = await this.backupDatabase(tempDir)
      
      // Backup media files
      const mediaBackupPath = await this.backupMediaFiles(tempDir)
      
      // Create backup manifest
      const manifest = {
        backupId,
        timestamp: timestamp.toISOString(),
        database: path.basename(dbBackupPath),
        media: path.basename(mediaBackupPath),
        version: '1.0'
      }
      
      const manifestPath = path.join(tempDir, 'manifest.json')
      await fs.promises.writeFile(manifestPath, JSON.stringify(manifest, null, 2))
      
      // Upload to cloud storage
      const uploadResult = await this.uploadBackup(tempDir, backupId)
      
      // Clean up temporary files
      await fs.promises.rm(tempDir, { recursive: true, force: true })
      
      console.log(`Backup completed: ${backupId}`)
      
      return {
        success: true,
        backupId,
        timestamp,
        size: uploadResult.size,
        location: uploadResult.location
      }
      
    } catch (error) {
      console.error(`Backup failed: ${backupId}`, error)
      return {
        success: false,
        backupId,
        timestamp,
        size: 0,
        location: '',
        error: error instanceof Error ? error.message : 'Unknown error'
      }
    }
  }

  /**
   * Backup SQLite database
   */
  private async backupDatabase(tempDir: string): Promise<string> {
    const dbPath = path.join(process.cwd(), 'prisma', 'dev.db')
    const backupPath = path.join(tempDir, 'database.sqlite')
    
    if (!fs.existsSync(dbPath)) {
      throw new Error('Database file not found')
    }
    
    // Copy database file
    await fs.promises.copyFile(dbPath, backupPath)
    
    // Also create SQL dump for better portability
    const sqlDumpPath = path.join(tempDir, 'database.sql')
    try {
      execSync(`sqlite3 "${dbPath}" .dump > "${sqlDumpPath}"`, { stdio: 'pipe' })
    } catch (error) {
      console.warn('SQL dump creation failed, continuing with binary backup only')
    }
    
    return backupPath
  }

  /**
   * Backup media files (public/pics, public/uploads, public/media)
   */
  private async backupMediaFiles(tempDir: string): Promise<string> {
    const mediaDir = path.join(tempDir, 'media')
    await fs.promises.mkdir(mediaDir, { recursive: true })
    
    const publicDir = path.join(process.cwd(), 'public')
    const mediaSubdirs = ['pics', 'uploads', 'media']
    
    for (const subdir of mediaSubdirs) {
      const sourceDir = path.join(publicDir, subdir)
      const targetDir = path.join(mediaDir, subdir)
      
      if (fs.existsSync(sourceDir)) {
        await this.copyDirectory(sourceDir, targetDir)
      }
    }
    
    return mediaDir
  }

  /**
   * Recursively copy directory
   */
  private async copyDirectory(source: string, target: string): Promise<void> {
    await fs.promises.mkdir(target, { recursive: true })
    
    const entries = await fs.promises.readdir(source, { withFileTypes: true })
    
    for (const entry of entries) {
      const sourcePath = path.join(source, entry.name)
      const targetPath = path.join(target, entry.name)
      
      if (entry.isDirectory()) {
        await this.copyDirectory(sourcePath, targetPath)
      } else {
        await fs.promises.copyFile(sourcePath, targetPath)
      }
    }
  }

  /**
   * Upload backup to cloud storage
   */
  private async uploadBackup(tempDir: string, backupId: string): Promise<{ size: number; location: string }> {
    const files = await this.getAllFiles(tempDir)
    let totalSize = 0
    
    for (const filePath of files) {
      const relativePath = path.relative(tempDir, filePath)
      const key = `backups/${backupId}/${relativePath.replace(/\\/g, '/')}`
      
      const fileContent = await fs.promises.readFile(filePath)
      const stats = await fs.promises.stat(filePath)
      totalSize += stats.size
      
      const command = new PutObjectCommand({
        Bucket: this.config.bucket,
        Key: key,
        Body: fileContent,
        Metadata: {
          'backup-id': backupId,
          'original-path': relativePath,
          'backup-timestamp': new Date().toISOString()
        }
      })
      
      await this.s3Client.send(command)
    }
    
    return {
      size: totalSize,
      location: `${this.config.provider}://${this.config.bucket}/backups/${backupId}/`
    }
  }

  /**
   * Get all files in directory recursively
   */
  private async getAllFiles(dir: string): Promise<string[]> {
    const files: string[] = []
    const entries = await fs.promises.readdir(dir, { withFileTypes: true })
    
    for (const entry of entries) {
      const fullPath = path.join(dir, entry.name)
      
      if (entry.isDirectory()) {
        const subFiles = await this.getAllFiles(fullPath)
        files.push(...subFiles)
      } else {
        files.push(fullPath)
      }
    }
    
    return files
  }

  /**
   * List available backups
   */
  async listBackups(): Promise<Array<{ backupId: string; timestamp: Date; size: number }>> {
    try {
      const command = new ListObjectsV2Command({
        Bucket: this.config.bucket,
        Prefix: 'backups/',
        Delimiter: '/'
      })
      
      const response = await this.s3Client.send(command)
      const backups: Array<{ backupId: string; timestamp: Date; size: number }> = []
      
      if (response.CommonPrefixes) {
        for (const prefix of response.CommonPrefixes) {
          const backupId = prefix.Prefix?.replace('backups/', '').replace('/', '')
          if (backupId) {
            // Get manifest to get timestamp and size
            try {
              const manifestCommand = new GetObjectCommand({
                Bucket: this.config.bucket,
                Key: `backups/${backupId}/manifest.json`
              })
              
              const manifestResponse = await this.s3Client.send(manifestCommand)
              const manifestBody = await manifestResponse.Body?.transformToString()
              
              if (manifestBody) {
                const manifest = JSON.parse(manifestBody)
                backups.push({
                  backupId,
                  timestamp: new Date(manifest.timestamp),
                  size: 0 // We'd need to calculate this from all files
                })
              }
            } catch (error) {
              console.warn(`Could not read manifest for backup ${backupId}`)
            }
          }
        }
      }
      
      return backups.sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime())
      
    } catch (error) {
      console.error('Failed to list backups:', error)
      return []
    }
  }

  /**
   * Restore from backup
   */
  async restoreBackup(backupId: string): Promise<RestoreResult> {
    try {
      console.log(`Starting restore from backup: ${backupId}`)
      
      // Download backup
      const tempDir = await this.downloadBackup(backupId)
      
      // Restore database
      await this.restoreDatabase(tempDir)
      
      // Restore media files
      await this.restoreMediaFiles(tempDir)
      
      // Clean up
      await fs.promises.rm(tempDir, { recursive: true, force: true })
      
      console.log(`Restore completed from backup: ${backupId}`)
      
      return {
        success: true,
        restoredAt: new Date(),
        backupId
      }
      
    } catch (error) {
      console.error(`Restore failed from backup: ${backupId}`, error)
      return {
        success: false,
        restoredAt: new Date(),
        backupId,
        error: error instanceof Error ? error.message : 'Unknown error'
      }
    }
  }

  /**
   * Download backup from cloud storage
   */
  private async downloadBackup(backupId: string): Promise<string> {
    const tempDir = path.join(process.cwd(), 'backups', `restore-${backupId}`)
    await fs.promises.mkdir(tempDir, { recursive: true })
    
    // List all files in backup
    const command = new ListObjectsV2Command({
      Bucket: this.config.bucket,
      Prefix: `backups/${backupId}/`
    })
    
    const response = await this.s3Client.send(command)
    
    if (response.Contents) {
      for (const object of response.Contents) {
        if (object.Key) {
          const getCommand = new GetObjectCommand({
            Bucket: this.config.bucket,
            Key: object.Key
          })
          
          const getResponse = await this.s3Client.send(getCommand)
          const body = await getResponse.Body?.transformToByteArray()
          
          if (body) {
            const relativePath = object.Key.replace(`backups/${backupId}/`, '')
            const filePath = path.join(tempDir, relativePath)
            
            await fs.promises.mkdir(path.dirname(filePath), { recursive: true })
            await fs.promises.writeFile(filePath, Buffer.from(body))
          }
        }
      }
    }
    
    return tempDir
  }

  /**
   * Restore database from backup
   */
  private async restoreDatabase(tempDir: string): Promise<void> {
    const dbBackupPath = path.join(tempDir, 'database.sqlite')
    const dbPath = path.join(process.cwd(), 'prisma', 'dev.db')
    
    if (fs.existsSync(dbBackupPath)) {
      // Stop any running processes that might be using the database
      // Copy the backup over the current database
      await fs.promises.copyFile(dbBackupPath, dbPath)
    } else {
      throw new Error('Database backup file not found')
    }
  }

  /**
   * Restore media files from backup
   */
  private async restoreMediaFiles(tempDir: string): Promise<void> {
    const mediaBackupDir = path.join(tempDir, 'media')
    const publicDir = path.join(process.cwd(), 'public')
    
    if (fs.existsSync(mediaBackupDir)) {
      const mediaSubdirs = ['pics', 'uploads', 'media']
      
      for (const subdir of mediaSubdirs) {
        const sourceDir = path.join(mediaBackupDir, subdir)
        const targetDir = path.join(publicDir, subdir)
        
        if (fs.existsSync(sourceDir)) {
          // Remove existing directory and copy backup
          await fs.promises.rm(targetDir, { recursive: true, force: true })
          await this.copyDirectory(sourceDir, targetDir)
        }
      }
    }
  }
}

/**
 * Create backup service from environment variables
 */
export function createBackupService(): BackupService {
  const config: BackupConfig = {
    provider: (process.env.BACKUP_PROVIDER as 's3' | 'backblaze') || 's3',
    bucket: process.env.BACKUP_BUCKET || '',
    region: process.env.BACKUP_REGION || 'us-east-1',
    accessKeyId: process.env.BACKUP_ACCESS_KEY_ID || '',
    secretAccessKey: process.env.BACKUP_SECRET_ACCESS_KEY || '',
    endpoint: process.env.BACKUP_ENDPOINT
  }
  
  if (!config.bucket || !config.accessKeyId || !config.secretAccessKey) {
    throw new Error('Backup configuration is incomplete. Please set BACKUP_BUCKET, BACKUP_ACCESS_KEY_ID, and BACKUP_SECRET_ACCESS_KEY environment variables.')
  }
  
  return new BackupService(config)
}
