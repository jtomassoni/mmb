import { NextRequest, NextResponse } from 'next/server'
import { createBackupService } from '../../../../lib/backup'
import { prisma } from '../../../../lib/prisma'

export async function POST(request: NextRequest) {
  // Verify this is a legitimate cron request
  const authHeader = request.headers.get('authorization')
  const cronSecret = process.env.CRON_SECRET
  
  if (!cronSecret || authHeader !== `Bearer ${cronSecret}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    console.log('Starting scheduled backup...')
    
    const backupService = createBackupService()
    const result = await backupService.createBackup()

    if (result.success) {
      // Log the backup in the database
      await prisma.auditLog.create({
        data: {
          userId: 'system',
          userRole: 'SUPERADMIN',
          userEmail: 'system@backup',
          userName: 'Backup System',
          action: 'backup_created',
          resource: 'backup',
          resourceId: result.backupId,
          siteId: null,
          siteName: 'System',
          oldValue: null,
          newValue: JSON.stringify({
            backupId: result.backupId,
            size: result.size,
            location: result.location
          }),
          changes: JSON.stringify({
            type: 'scheduled_backup',
            timestamp: result.timestamp.toISOString()
          }),
          success: true,
          ipAddress: request.headers.get('x-forwarded-for') || request.headers.get('x-real-ip') || null,
          userAgent: request.headers.get('user-agent') || null,
          metadata: JSON.stringify({
            cron: true,
            scheduled: true
          }),
          rollbackData: null,
          canRollback: false
        } as any
      })

      console.log(`Scheduled backup completed: ${result.backupId}`)
      
      return NextResponse.json({
        success: true,
        backupId: result.backupId,
        timestamp: result.timestamp.toISOString(),
        size: result.size,
        location: result.location
      })
    } else {
      // Log the failure
      await prisma.auditLog.create({
        data: {
          userId: 'system',
          userRole: 'SUPERADMIN',
          userEmail: 'system@backup',
          userName: 'Backup System',
          action: 'backup_failed',
          resource: 'backup',
          resourceId: result.backupId,
          siteId: null,
          siteName: 'System',
          oldValue: null,
          newValue: null,
          changes: JSON.stringify({
            type: 'scheduled_backup_failed',
            timestamp: result.timestamp.toISOString(),
            error: result.error
          }),
          success: false,
          errorMessage: result.error || 'Unknown error',
          ipAddress: request.headers.get('x-forwarded-for') || request.headers.get('x-real-ip') || null,
          userAgent: request.headers.get('user-agent') || null,
          metadata: JSON.stringify({
            cron: true,
            scheduled: true,
            failed: true
          }),
          rollbackData: null,
          canRollback: false
        } as any
      })

      console.error(`Scheduled backup failed: ${result.backupId}`, result.error)
      
      return NextResponse.json({
        error: 'Backup failed',
        details: result.error
      }, { status: 500 })
    }

  } catch (error) {
    console.error('Error in scheduled backup:', error)
    
    // Log the error
    try {
      await prisma.auditLog.create({
        data: {
          userId: 'system',
          userRole: 'SUPERADMIN',
          userEmail: 'system@backup',
          userName: 'Backup System',
          action: 'backup_error',
          resource: 'backup',
          resourceId: null,
          siteId: null,
          siteName: 'System',
          oldValue: null,
          newValue: null,
          changes: JSON.stringify({
            type: 'scheduled_backup_error',
            timestamp: new Date().toISOString(),
            error: error instanceof Error ? error.message : 'Unknown error'
          }),
          success: false,
          errorMessage: error instanceof Error ? error.message : 'Unknown error',
          ipAddress: request.headers.get('x-forwarded-for') || request.headers.get('x-real-ip') || null,
          userAgent: request.headers.get('user-agent') || null,
          metadata: JSON.stringify({
            cron: true,
            scheduled: true,
            error: true
          }),
          rollbackData: null,
          canRollback: false
        } as any
      })
    } catch (logError) {
      console.error('Failed to log backup error:', logError)
    }
    
    return NextResponse.json({
      error: 'Failed to create backup',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}
