import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { Role } from '@prisma/client'
import { hasPermission, RESOURCES, ACTIONS } from '@/lib/rbac'

// Get all users (superadmin only)
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Check if user has permission to manage users
    if (!hasPermission(session.user.role as any, RESOURCES.USERS, ACTIONS.READ)) {
      return NextResponse.json({ error: 'Insufficient permissions' }, { status: 403 })
    }

    const users = await prisma.user.findMany({
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
        updatedAt: true,
        memberships: {
          select: {
            site: {
              select: {
                name: true,
                slug: true
              }
            }
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      }
    })

    return NextResponse.json({ users })
  } catch (error) {
    console.error('Error fetching users:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

// Create a new user (superadmin only)
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Check if user has permission to create users
    if (!hasPermission(session.user.role as any, RESOURCES.USERS, ACTIONS.CREATE)) {
      return NextResponse.json({ error: 'Insufficient permissions' }, { status: 403 })
    }

    const body = await request.json()
    const { email, name, password, role } = body

    if (!email || !password || !role) {
      return NextResponse.json({ 
        error: 'Missing required fields: email, password, role' 
      }, { status: 400 })
    }

    // Validate role
    if (!['SUPERADMIN', 'OWNER', 'MANAGER', 'STAFF'].includes(role)) {
      return NextResponse.json({ 
        error: 'Invalid role. Must be SUPERADMIN, OWNER, MANAGER, or STAFF' 
      }, { status: 400 })
    }

    // Check if email already exists
    const existingUser = await prisma.user.findUnique({
      where: { email }
    })

    if (existingUser) {
      return NextResponse.json({ 
        error: 'User with this email already exists' 
      }, { status: 409 })
    }

    const user = await prisma.user.create({
      data: {
        email,
        name: name || null,
        password, // Store plain text for MVP
        role: role as Role,
        isActive: true
      },
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        isActive: true,
        createdAt: true
      }
    })

    // Log the action
    await prisma.auditLog.create({
      data: {
        userId: session.user.id,
        userRole: session.user.role as Role,
        userEmail: session.user.email,
        userName: session.user.name,
        action: 'create',
        resource: 'users',
        resourceId: user.id,
        newValue: JSON.stringify(user),
        success: true
      }
    })

    return NextResponse.json({ user }, { status: 201 })
  } catch (error) {
    console.error('Error creating user:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
