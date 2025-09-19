import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '../../../../lib/prisma'
import { hasPermission } from '../../../../lib/rbac'
import { RollbackOptions } from '../../../../lib/audit-log'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const options: RollbackOptions = body

    // Validate required fields
    if (!options.auditLogId || !options.userId || !options.userRole || !options.reason) {
      return NextResponse.json(
        { error: 'Missing required fields: auditLogId, userId, userRole, reason' },
        { status: 400 }
      )
    }

    // Check permissions
    if (!hasPermission(options.userRole, 'audit', 'update')) {
      return NextResponse.json(
        { error: 'Insufficient permissions to rollback actions' },
        { status: 403 }
      )
    }

    // Get the original audit log entry
    const originalEntry = await prisma.auditLog.findUnique({
      where: { id: options.auditLogId }
    }) as any

    if (!originalEntry) {
      return NextResponse.json(
        { error: 'Audit log entry not found' },
        { status: 404 }
      )
    }

    if (!originalEntry.canRollback) {
      return NextResponse.json(
        { error: 'This action cannot be rolled back' },
        { status: 400 }
      )
    }

    if (!originalEntry.rollbackData) {
      return NextResponse.json(
        { error: 'No rollback data available' },
        { status: 400 }
      )
    }

    // Check if rollback is within 20-minute window
    const now = new Date()
    const entryTime = new Date(originalEntry.timestamp)
    const timeDiffMs = now.getTime() - entryTime.getTime()
    const timeDiffMinutes = timeDiffMs / (1000 * 60)

    if (timeDiffMinutes > 20) {
      return NextResponse.json(
        { 
          error: 'Rollback window expired',
          details: `Changes can only be rolled back within 20 minutes. This change was made ${Math.round(timeDiffMinutes)} minutes ago.`,
          timeElapsed: Math.round(timeDiffMinutes),
          maxWindow: 20
        },
        { status: 400 }
      )
    }

    // Parse rollback data
    const rollbackData = JSON.parse(originalEntry.rollbackData)

    // Perform rollback based on resource type
    let rollbackResult: any = null

    switch (originalEntry.resource) {
      case 'events':
        rollbackResult = await rollbackEvent(originalEntry.resourceId!, rollbackData)
        break
      case 'specials':
        rollbackResult = await rollbackSpecial(originalEntry.resourceId!, rollbackData)
        break
      case 'menu':
        rollbackResult = await rollbackMenuItem(originalEntry.resourceId!, rollbackData)
        break
      case 'hours':
        rollbackResult = await rollbackHours(originalEntry.siteId!, rollbackData)
        break
      case 'profile':
        rollbackResult = await rollbackProfile(originalEntry.siteId!, rollbackData)
        break
      default:
        return NextResponse.json(
          { error: `Rollback not supported for resource: ${originalEntry.resource}` },
          { status: 400 }
        )
    }

    if (!rollbackResult.success) {
      return NextResponse.json(
        { error: rollbackResult.error || 'Rollback failed' },
        { status: 500 }
      )
    }

    // Create rollback audit entry
    const rollbackEntry = await prisma.auditLog.create({
      data: {
        id: `audit_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        userId: options.userId,
        userRole: options.userRole,
        action: 'rollback',
        resource: originalEntry.resource,
        resourceId: originalEntry.resourceId,
        siteId: originalEntry.siteId,
        siteName: originalEntry.siteName,
        oldValue: originalEntry.newValue, // Current state
        newValue: originalEntry.oldValue, // Rolled back state
        changes: JSON.stringify({
          rollback: {
            originalAction: originalEntry.action,
            originalTimestamp: originalEntry.timestamp,
            reason: options.reason
          }
        }),
        success: true,
        ipAddress: request.headers.get('x-forwarded-for') || request.headers.get('x-real-ip') || null,
        userAgent: request.headers.get('user-agent') || null,
        timestamp: new Date(),
        metadata: JSON.stringify({
          rollbackReason: options.reason,
          originalAuditId: options.auditLogId,
          notifyUsers: options.notifyUsers
        }),
        canRollback: false // Rollbacks cannot be rolled back
      } as any
    })

    // Notify users if requested
    if (options.notifyUsers) {
      await notifyUsersOfRollback(originalEntry, options)
    }

    return NextResponse.json({
      success: true,
      rollbackEntry: {
        id: rollbackEntry.id,
        timestamp: rollbackEntry.timestamp,
        resource: rollbackEntry.resource,
        resourceId: rollbackEntry.resourceId
      }
    })

  } catch (error) {
    console.error('Rollback error:', error)
    return NextResponse.json(
      { error: 'Failed to rollback action' },
      { status: 500 }
    )
  }
}

// Rollback functions for different resources
async function rollbackEvent(eventId: string, rollbackData: any) {
  try {
    await prisma.event.update({
      where: { id: eventId },
      data: {
        title: rollbackData.title,
        description: rollbackData.description,
        startDate: rollbackData.startDate ? new Date(rollbackData.startDate) : undefined,
        endDate: rollbackData.endDate ? new Date(rollbackData.endDate) : undefined,
        isRecurring: rollbackData.isRecurring,
        dayOfWeek: rollbackData.dayOfWeek,
        time: rollbackData.time
      }
    })
    return { success: true }
  } catch (error) {
    return { success: false, error: error instanceof Error ? error.message : 'Unknown error' }
  }
}

async function rollbackSpecial(specialId: string, rollbackData: any) {
  try {
    await prisma.special.update({
      where: { id: specialId },
      data: {
        title: rollbackData.title,
        description: rollbackData.description,
        price: rollbackData.price,
        isActive: rollbackData.isActive
      }
    })
    return { success: true }
  } catch (error) {
    return { success: false, error: error instanceof Error ? error.message : 'Unknown error' }
  }
}

async function rollbackMenuItem(itemId: string, rollbackData: any) {
  try {
    await prisma.special.update({
      where: { id: itemId },
      data: {
        title: rollbackData.title,
        description: rollbackData.description,
        price: rollbackData.price,
        isActive: rollbackData.isActive
      }
    })
    return { success: true }
  } catch (error) {
    return { success: false, error: error instanceof Error ? error.message : 'Unknown error' }
  }
}

async function rollbackHours(siteId: string, rollbackData: any) {
  try {
    // This would depend on how hours are stored in your schema
    // For now, we'll assume they're stored in the Site model
    await prisma.site.update({
      where: { id: siteId },
      data: {
        // Add hours fields as they exist in your schema
        // openingHours: rollbackData.openingHours,
        // closingHours: rollbackData.closingHours,
      }
    })
    return { success: true }
  } catch (error) {
    return { success: false, error: error instanceof Error ? error.message : 'Unknown error' }
  }
}

async function rollbackProfile(siteId: string, rollbackData: any) {
  try {
    await prisma.site.update({
      where: { id: siteId },
      data: {
        name: rollbackData.name,
        description: rollbackData.description,
        address: rollbackData.address,
        phone: rollbackData.phone,
        email: rollbackData.email
      }
    })
    return { success: true }
  } catch (error) {
    return { success: false, error: error instanceof Error ? error.message : 'Unknown error' }
  }
}

async function notifyUsersOfRollback(originalEntry: any, options: RollbackOptions) {
  try {
    // This would integrate with your notification system
    // For now, we'll just log the notification
    console.log('Rollback notification:', {
      originalEntry: originalEntry.id,
      rollbackReason: options.reason,
      resource: originalEntry.resource,
      resourceId: originalEntry.resourceId,
      siteId: originalEntry.siteId
    })

    // In a real implementation, you might:
    // 1. Send email notifications to relevant users
    // 2. Create in-app notifications
    // 3. Send webhook notifications to external systems
    // 4. Update user activity feeds

  } catch (error) {
    console.error('Failed to send rollback notifications:', error)
  }
}
