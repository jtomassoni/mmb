import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '../../../../lib/prisma'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const siteId = searchParams.get('siteId')
    const limit = searchParams.get('limit')

    // Build where clause - only show active specials
    const where: any = {
      isActive: true
    }

    // If siteId is provided, filter by site
    if (siteId) {
      where.siteId = siteId
    }

    // Get specials from database
    const specials = await prisma.special.findMany({
      where,
      orderBy: [
        { createdAt: 'desc' }
      ],
      take: limit ? parseInt(limit) : undefined,
      include: {
        site: {
          select: {
            name: true,
            slug: true
          }
        }
      }
    })

    return NextResponse.json({
      specials,
      count: specials.length
    })
  } catch (error) {
    console.error('Public specials API error:', error)
    return NextResponse.json({ 
      error: 'Failed to fetch specials',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}
