import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '../../../../../lib/auth'
import { getTelemetryStats, getFailureSummary, getDomainEvents, resolveTelemetryEvent, resolveDomainEvents } from '../../../../../lib/domain-telemetry'

export async function GET(request: NextRequest) {
  const session = await getServerSession(authOptions)
  
  if (!session?.user || session.user.role !== 'SUPERADMIN') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const { searchParams } = new URL(request.url)
    const domainId = searchParams.get('domainId')
    const action = searchParams.get('action')

    if (action === 'stats') {
      // Get overall telemetry statistics
      const stats = await getTelemetryStats()
      return NextResponse.json({
        success: true,
        stats
      })
    }

    if (action === 'failure-summary' && domainId) {
      // Get failure summary for specific domain
      const summary = await getFailureSummary(domainId)
      return NextResponse.json({
        success: true,
        summary
      })
    }

    if (action === 'events' && domainId) {
      // Get all events for specific domain
      const events = await getDomainEvents(domainId)
      return NextResponse.json({
        success: true,
        events
      })
    }

    return NextResponse.json({ error: 'Invalid action or missing domainId' }, { status: 400 })
  } catch (error) {
    console.error('Error getting telemetry data:', error)
    return NextResponse.json({ error: 'Failed to get telemetry data' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  const session = await getServerSession(authOptions)
  
  if (!session?.user || session.user.role !== 'SUPERADMIN') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const { action, eventId, domainId } = await request.json()

    if (action === 'resolve-event' && eventId) {
      await resolveTelemetryEvent(eventId, session.user.email || 'unknown')
      return NextResponse.json({
        success: true,
        message: 'Event resolved successfully'
      })
    }

    if (action === 'resolve-domain-events' && domainId) {
      await resolveDomainEvents(domainId, session.user.email || 'unknown')
      return NextResponse.json({
        success: true,
        message: 'All domain events resolved successfully'
      })
    }

    return NextResponse.json({ error: 'Invalid action or missing parameters' }, { status: 400 })
  } catch (error) {
    console.error('Error resolving telemetry events:', error)
    return NextResponse.json({ error: 'Failed to resolve telemetry events' }, { status: 500 })
  }
}
