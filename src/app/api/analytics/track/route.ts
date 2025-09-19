import { NextRequest, NextResponse } from 'next/server'
// import { AnalyticsService } from '../../../lib/analytics'
// import { getSiteIdFromHost } from '../../../lib/site'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { eventType, eventName, page, element, elementId, elementText, metadata } = body

    // Get site ID from host
    const siteId = await getSiteIdFromHost(request.headers.get('host') || '')
    if (!siteId) {
      return NextResponse.json({ error: 'Site not found' }, { status: 404 })
    }

    // Extract request info
    const url = request.url
    const userAgent = request.headers.get('user-agent') || undefined
    const ipAddress = request.headers.get('x-forwarded-for') || 
                     request.headers.get('x-real-ip') || 
                     request.ip || 
                     undefined
    const referrer = request.headers.get('referer') || undefined

    // Generate session ID from IP + User Agent (simplified)
    const sessionId = ipAddress && userAgent ? 
      Buffer.from(ipAddress + userAgent).toString('base64').substring(0, 16) : 
      undefined

    // Track the event
    await AnalyticsService.trackEvent(siteId, {
      eventType,
      eventName,
      page,
      element,
      elementId,
      elementText,
      url,
      userAgent,
      ipAddress,
      sessionId,
      referrer,
      metadata
    })

    return NextResponse.json({ success: true })

  } catch (error) {
    console.error('Analytics tracking error:', error)
    return NextResponse.json({
      error: 'Failed to track event',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}

// Handle preflight requests
export async function OPTIONS(request: NextRequest) {
  return new NextResponse(null, {
    status: 200,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
    },
  })
}
