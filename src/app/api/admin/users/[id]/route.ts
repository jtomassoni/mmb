import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { Role } from '@prisma/client'
import { hasPermission, RESOURCES, ACTIONS } from '@/lib/rbac'
import { validateText } from '@/lib/input-validation'

// Update user (superadmin only)
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Check if user has permission to update users
    if (!hasPermission(session.user.role as any, RESOURCES.USERS, ACTIONS.UPDATE)) {
      return NextResponse.json({ error: 'Insufficient permissions' }, { status: 403 })
    }

    const { id: userId } = await params
    const body = await request.json()
    const { name, role, isActive, disabledReason } = body

    // Validate inputs
    const nameValidation = validateText(name || '', { 
      maxLength: 100, 
      allowEmojis: false,
      customValidator: (value) => {
        if (value.length > 0 && !/^[a-zA-Z\s\-'.]+$/.test(value)) {
          return 'Name contains invalid characters'
        }
        return null
      }
    })

    const disabledReasonValidation = validateText(disabledReason || '', { 
      maxLength: 200, 
      allowEmojis: false 
    })

    // Check for validation errors
    const validationErrors: string[] = []
    if (!nameValidation.isValid) validationErrors.push(`Name: ${nameValidation.errors.join(', ')}`)
    if (!disabledReasonValidation.isValid) validationErrors.push(`Disabled reason: ${disabledReasonValidation.errors.join(', ')}`)

    // Get current user data for audit log
    const currentUser = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        isActive: true,
        disabledAt: true,
        disabledBy: true,
        disabledReason: true
      }
    })

    if (!currentUser) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    // Validate role if provided
    if (role && !['SUPERADMIN', 'OWNER', 'MANAGER', 'STAFF'].includes(role)) {
      return NextResponse.json({ 
        error: 'Invalid role. Must be SUPERADMIN, OWNER, MANAGER, or STAFF' 
      }, { status: 400 })
    }

    if (validationErrors.length > 0) {
      return NextResponse.json({ 
        error: 'Validation failed', 
        details: validationErrors 
      }, { status: 400 })
    }

    // Prepare update data
    const updateData: any = {}
    if (name !== undefined) updateData.name = nameValidation.sanitizedValue
    if (role !== undefined) updateData.role = role as Role
    if (isActive !== undefined) {
      updateData.isActive = isActive
      if (!isActive) {
        // User is being disabled
        updateData.disabledAt = new Date()
        updateData.disabledBy = session.user.id
        updateData.disabledReason = disabledReasonValidation.sanitizedValue || 'Disabled by admin'
      } else {
        // User is being enabled
        updateData.disabledAt = null
        updateData.disabledBy = null
        updateData.disabledReason = null
      }
    }

    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data: updateData,
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        isActive: true,
        disabledAt: true,
        disabledBy: true,
        disabledReason: true,
        createdAt: true,
        updatedAt: true
      }
    })

    // Log the action
    await prisma.auditLog.create({
      data: {
        userId: session.user.id,
        userRole: session.user.role as Role,
        userEmail: session.user.email,
        userName: session.user.name,
        action: 'update',
        resource: 'users',
        resourceId: userId,
        oldValue: JSON.stringify(currentUser),
        newValue: JSON.stringify(updatedUser),
        changes: JSON.stringify(updateData),
        success: true
      }
    })

    return NextResponse.json({ user: updatedUser })
  } catch (error) {
    console.error('Error updating user:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

// Delete user (superadmin only)
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Check if user has permission to delete users
    if (!hasPermission(session.user.role as any, RESOURCES.USERS, ACTIONS.DELETE)) {
      return NextResponse.json({ error: 'Insufficient permissions' }, { status: 403 })
    }

    const { id: userId } = await params

    // Prevent self-deletion
    if (userId === session.user.id) {
      return NextResponse.json({ 
        error: 'Cannot delete your own account' 
      }, { status: 400 })
    }

    // Get user data for audit log
    const userToDelete = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        isActive: true
      }
    })

    if (!userToDelete) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    // Delete the user (cascade will handle related records)
    await prisma.user.delete({
      where: { id: userId }
    })

    // Log the action
    await prisma.auditLog.create({
      data: {
        userId: session.user.id,
        userRole: session.user.role as Role,
        userEmail: session.user.email,
        userName: session.user.name,
        action: 'delete',
        resource: 'users',
        resourceId: userId,
        oldValue: JSON.stringify(userToDelete),
        success: true
      }
    })

    return NextResponse.json({ message: 'User deleted successfully' })
  } catch (error) {
    console.error('Error deleting user:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
