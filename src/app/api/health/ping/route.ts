import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '../../../../lib/prisma'

export async function POST(request: NextRequest) {
  try {
    const { siteId, url } = await request.json()

    if (!siteId || !url) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
    }

    // Perform health check
    const startTime = Date.now()
    let status = 200
    let responseTime = null

    try {
      const response = await fetch(url, {
        method: 'HEAD',
      })
      status = response.status
      responseTime = Date.now() - startTime
    } catch {
      status = 500
      responseTime = Date.now() - startTime
    }

    // Store health ping in database
    await prisma.healthPing.create({
      data: {
        siteId,
        url,
        status,
        responseTime,
      }
    })

    return NextResponse.json({
      success: true,
      status,
      responseTime,
      timestamp: new Date().toISOString()
    })
  } catch (error) {
    console.error('Health ping error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function GET() {
  try {
    // Get recent health pings for all sites
    const recentPings = await prisma.healthPing.findMany({
      take: 100,
      orderBy: { createdAt: 'desc' },
      include: {
        site: {
          select: {
            name: true,
            slug: true,
          }
        }
      }
    })

    // Calculate uptime statistics
    const siteStats = await prisma.healthPing.groupBy({
      by: ['siteId'],
      _count: {
        id: true,
      },
      _avg: {
        status: true,
        responseTime: true,
      },
      where: {
        createdAt: {
          gte: new Date(Date.now() - 24 * 60 * 60 * 1000) // Last 24 hours
        }
      }
    })

    return NextResponse.json({
      recentPings,
      siteStats,
      timestamp: new Date().toISOString()
    })
  } catch (error) {
    console.error('Health stats error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
