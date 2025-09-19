import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '../../../lib/auth'
import { hasPermission } from '../../../lib/rbac'
import { createBackupService } from '../../../lib/backup'

export async function GET(request: NextRequest) {
  const session = await getServerSession(authOptions)

  if (!session?.user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  // Check permissions - only SUPERADMIN can manage backups
  if (!hasPermission((session.user as any).role, 'backup', 'read')) {
    return NextResponse.json({ error: 'Insufficient permissions' }, { status: 403 })
  }

  try {
    const backupService = createBackupService()
    const backups = await backupService.listBackups()

    return NextResponse.json({
      success: true,
      backups: backups.map(backup => ({
        backupId: backup.backupId,
        timestamp: backup.timestamp.toISOString(),
        size: backup.size
      }))
    })

  } catch (error) {
    console.error('Error listing backups:', error)
    return NextResponse.json({
      error: 'Failed to list backups',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  const session = await getServerSession(authOptions)

  if (!session?.user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  // Check permissions - only SUPERADMIN can create backups
  if (!hasPermission((session.user as any).role, 'backup', 'create')) {
    return NextResponse.json({ error: 'Insufficient permissions' }, { status: 403 })
  }

  try {
    const backupService = createBackupService()
    const result = await backupService.createBackup()

    if (result.success) {
      return NextResponse.json({
        success: true,
        backupId: result.backupId,
        timestamp: result.timestamp.toISOString(),
        size: result.size,
        location: result.location
      })
    } else {
      return NextResponse.json({
        error: 'Backup failed',
        details: result.error
      }, { status: 500 })
    }

  } catch (error) {
    console.error('Error creating backup:', error)
    return NextResponse.json({
      error: 'Failed to create backup',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}
