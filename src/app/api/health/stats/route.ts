import { NextResponse } from 'next/server'
import { prisma } from '../../../../lib/prisma'

export async function GET() {
  try {
    // Get all sites count
    const activeSites = await prisma.site.count()

    // Get last 7 days of audit logs (edits)
    const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)
    const last7dEdits = await prisma.auditLog.count({
      where: {
        createdAt: {
          gte: sevenDaysAgo
        }
      }
    })

    // Get events this week
    const startOfWeek = new Date()
    startOfWeek.setDate(startOfWeek.getDate() - startOfWeek.getDay()) // Start of current week
    startOfWeek.setHours(0, 0, 0, 0)
    
    const endOfWeek = new Date(startOfWeek)
    endOfWeek.setDate(endOfWeek.getDate() + 7)
    
    const eventsThisWeek = await prisma.event.count({
      where: {
        OR: [
          // Events that start this week
          {
            startDate: {
              gte: startOfWeek,
              lt: endOfWeek
            }
          },
          // Recurring events that happen this week
          {
            isRecurring: true,
            dayOfWeek: {
              gte: startOfWeek.getDay(),
              lte: endOfWeek.getDay()
            }
          }
        ]
      }
    })

    // Get active specials count
    const specialsCount = await prisma.special.count({
      where: {
        isActive: true
      }
    })

    // Get uptime ping statistics for last 24 hours
    const twentyFourHoursAgo = new Date(Date.now() - 24 * 60 * 60 * 1000)
    
    const uptimeStats = await prisma.healthPing.aggregate({
      where: {
        createdAt: {
          gte: twentyFourHoursAgo
        }
      },
      _count: {
        id: true
      },
      _avg: {
        responseTime: true
      }
    })

    const successfulPings = await prisma.healthPing.count({
      where: {
        createdAt: {
          gte: twentyFourHoursAgo
        },
        status: {
          lt: 400 // HTTP status codes < 400 are considered successful
        }
      }
    })

    const totalPings = uptimeStats._count.id
    const averageResponseTime = uptimeStats._avg.responseTime ? Math.round(uptimeStats._avg.responseTime) : 0

    return NextResponse.json({
      activeSites,
      last7dEdits,
      eventsThisWeek,
      specialsCount,
      uptimePings: {
        total: totalPings,
        successful: successfulPings,
        averageResponseTime
      },
      timestamp: new Date().toISOString()
    })
  } catch (error) {
    console.error('Health stats error:', error)
    return NextResponse.json({ 
      error: 'Failed to fetch health stats',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}
