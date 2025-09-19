import { NextRequest, NextResponse } from 'next/server'
import { AnalyticsService } from '../../../lib/analytics'
import { prisma } from '../../../lib/prisma'

export async function POST(request: NextRequest) {
  try {
    // Verify this is a cron request (you might want to add authentication)
    const authHeader = request.headers.get('authorization')
    if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Get all sites
    const sites = await prisma.site.findMany({
      select: { id: true }
    })

    const results = []

    for (const site of sites) {
      try {
        // Generate summary for yesterday
        const yesterday = new Date()
        yesterday.setDate(yesterday.getDate() - 1)
        yesterday.setHours(0, 0, 0, 0)

        await AnalyticsService.generateDailySummary(site.id, yesterday)
        
        results.push({
          siteId: site.id,
          date: yesterday.toISOString().split('T')[0],
          status: 'success'
        })
      } catch (error) {
        console.error(`Failed to generate summary for site ${site.id}:`, error)
        results.push({
          siteId: site.id,
          date: yesterday.toISOString().split('T')[0],
          status: 'error',
          error: error instanceof Error ? error.message : 'Unknown error'
        })
      }
    }

    return NextResponse.json({
      success: true,
      message: `Generated summaries for ${results.length} sites`,
      results
    })

  } catch (error) {
    console.error('Analytics summary cron error:', error)
    return NextResponse.json({
      error: 'Failed to generate analytics summaries',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}

// Handle GET requests for health checks
export async function GET(request: NextRequest) {
  return NextResponse.json({
    success: true,
    message: 'Analytics summary cron endpoint is healthy',
    timestamp: new Date().toISOString()
  })
}
