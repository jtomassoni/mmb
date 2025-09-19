import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '../../../../lib/auth'
import { hasPermission, validateSiteAccess } from '../../../../lib/rbac'
import { AnalyticsService } from '../../../../lib/analytics'
import { prisma } from '../../../../lib/prisma'

export async function GET(request: NextRequest) {
  const session = await getServerSession(authOptions)

  if (!session?.user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const { searchParams } = new URL(request.url)
    const siteId = searchParams.get('siteId')
    const startDate = searchParams.get('startDate')
    const endDate = searchParams.get('endDate')
    const period = searchParams.get('period') || 'daily'

    if (!siteId || !startDate || !endDate) {
      return NextResponse.json({ 
        error: 'Missing required parameters: siteId, startDate, endDate' 
      }, { status: 400 })
    }

    // Get user's site access
    let userSiteId: string | null = null
    if ((session.user as any).role !== 'SUPERADMIN') {
      const membership = await prisma.membership.findFirst({
        where: { userId: (session.user as any).id }
      })
      userSiteId = membership?.siteId || null
    }

    // Validate site access
    if (!validateSiteAccess((session.user as any).role, userSiteId || '', siteId, 'read')) {
      return NextResponse.json({ error: 'Access denied to this site' }, { status: 403 })
    }

    // Check permissions
    if (!hasPermission((session.user as any).role, 'analytics', 'read')) {
      return NextResponse.json({ error: 'Insufficient permissions' }, { status: 403 })
    }

    const start = new Date(startDate)
    const end = new Date(endDate)

    // Get analytics data
    const analytics = await AnalyticsService.getAnalytics(
      siteId,
      start,
      end,
      period as 'daily' | 'weekly' | 'monthly'
    )

    // Get real-time data (last 24 hours)
    const realtime = await AnalyticsService.getRealtimeAnalytics(siteId, 24)

    return NextResponse.json({
      success: true,
      analytics,
      realtime,
      period,
      dateRange: {
        start: start.toISOString(),
        end: end.toISOString()
      }
    })

  } catch (error) {
    console.error('Error fetching analytics:', error)
    return NextResponse.json({
      error: 'Failed to fetch analytics',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}
