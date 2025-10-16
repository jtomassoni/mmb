import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function GET() {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Get the site data with theme
    const site = await prisma.site.findFirst({
      where: {
        memberships: {
          some: {
            userId: session.user.id
          }
        }
      }
    })

    return NextResponse.json({ 
      themeId: site?.themeId || 'classic-green' 
    })
  } catch (error) {
    console.error('Error fetching theme:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function PUT(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { themeId } = await request.json()

    if (!themeId) {
      return NextResponse.json({ error: 'Theme ID is required' }, { status: 400 })
    }

    // Update the site's theme
    const site = await prisma.site.findFirst({
      where: {
        memberships: {
          some: {
            userId: session.user.id
          }
        }
      }
    })

    if (!site) {
      return NextResponse.json({ error: 'Site not found' }, { status: 404 })
    }

    await prisma.site.update({
      where: { id: site.id },
      data: { themeId }
    })

    return NextResponse.json({ success: true, themeId })
  } catch (error) {
    console.error('Error updating theme:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
