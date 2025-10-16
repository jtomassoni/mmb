import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { newPassword } = await request.json()

    if (!newPassword) {
      return NextResponse.json({ error: 'New password is required' }, { status: 400 })
    }

    // Validate password requirements
    if (newPassword.length < 8) {
      return NextResponse.json({ error: 'Password must be at least 8 characters' }, { status: 400 })
    }
    if (!/[A-Z]/.test(newPassword)) {
      return NextResponse.json({ error: 'Password must contain at least one uppercase letter' }, { status: 400 })
    }
    if (!/[0-9]/.test(newPassword)) {
      return NextResponse.json({ error: 'Password must contain at least one number' }, { status: 400 })
    }
    if (!/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(newPassword)) {
      return NextResponse.json({ error: 'Password must contain at least one special character' }, { status: 400 })
    }

    // Don't allow the temporary password
    if (newPassword === 'foobar') {
      return NextResponse.json({ error: 'Please choose a different password' }, { status: 400 })
    }

    // Update the user's password and clear the mustResetPassword flag
    await prisma.user.update({
      where: { id: session.user.id },
      data: {
        password: newPassword, // In production, this should be hashed
        mustResetPassword: false
      }
    })

    console.log(`✅ Password reset successful for user: ${session.user.email}`)

    return NextResponse.json({ success: true, message: 'Password updated successfully' })
  } catch (error) {
    console.error('Error resetting password:', error)
    return NextResponse.json({ error: 'Failed to update password' }, { status: 500 })
  }
}

