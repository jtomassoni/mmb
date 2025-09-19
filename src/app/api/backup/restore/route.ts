import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '../../../../lib/auth'
import { hasPermission } from '../../../../lib/rbac'
import { createBackupService } from '../../../../lib/backup'

export async function POST(request: NextRequest) {
  const session = await getServerSession(authOptions)

  if (!session?.user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  // Check permissions - only SUPERADMIN can restore backups
  if (!hasPermission((session.user as any).role, 'backup', 'restore')) {
    return NextResponse.json({ error: 'Insufficient permissions' }, { status: 403 })
  }

  try {
    const { backupId } = await request.json()

    if (!backupId) {
      return NextResponse.json({ error: 'Backup ID is required' }, { status: 400 })
    }

    const backupService = createBackupService()
    const result = await backupService.restoreBackup(backupId)

    if (result.success) {
      return NextResponse.json({
        success: true,
        restoredAt: result.restoredAt.toISOString(),
        backupId: result.backupId
      })
    } else {
      return NextResponse.json({
        error: 'Restore failed',
        details: result.error
      }, { status: 500 })
    }

  } catch (error) {
    console.error('Error restoring backup:', error)
    return NextResponse.json({
      error: 'Failed to restore backup',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}
