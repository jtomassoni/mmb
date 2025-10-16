import { NextRequest, NextResponse } from 'next/server'

/**
 * Cron job endpoint to refresh Broncos cache every 30 minutes
 * This endpoint should be called by Vercel Cron Jobs or similar
 * 
 * Usage:
 * - Set up Vercel Cron Job: */30 * * * * (every 30 minutes)
 * - Or call manually: POST /api/cron/broncos-refresh
 */
export async function POST(request: NextRequest) {
  try {
    // Verify this is a legitimate cron request
    const authHeader = request.headers.get('authorization')
    const cronSecret = process.env.CRON_SECRET
    
    if (cronSecret && authHeader !== `Bearer ${cronSecret}`) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      )
    }

    console.log('🕐 Broncos cache refresh cron job started')

    // Call the Broncos API refresh endpoint
    const refreshResponse = await fetch(`${request.nextUrl.origin}/api/broncos?action=refresh`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      }
    })

    if (!refreshResponse.ok) {
      throw new Error(`Refresh failed: ${refreshResponse.status}`)
    }

    const result = await refreshResponse.json()

    console.log('✅ Broncos cache refresh cron job completed')

    return NextResponse.json({
      success: true,
      message: 'Broncos cache refreshed successfully',
      timestamp: new Date().toISOString(),
      result
    })

  } catch (error) {
    console.error('❌ Broncos cache refresh cron job failed:', error)
    
    return NextResponse.json(
      { 
        success: false, 
        error: 'Failed to refresh Broncos cache',
        timestamp: new Date().toISOString()
      },
      { status: 500 }
    )
  }
}

/**
 * GET endpoint for health check
 */
export async function GET() {
  return NextResponse.json({
    success: true,
    message: 'Broncos cache refresh cron endpoint is healthy',
    timestamp: new Date().toISOString()
  })
}
