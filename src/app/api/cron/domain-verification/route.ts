import { NextRequest, NextResponse } from 'next/server'
import { processPendingVerifications } from '../../../../lib/domain-verification-service'

export async function POST(request: NextRequest) {
  try {
    // Verify this is a cron request (you might want to add authentication)
    const authHeader = request.headers.get('authorization')
    if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    console.log('Starting domain verification processing...')
    
    const result = await processPendingVerifications()
    
    console.log('Domain verification processing completed:', result)
    
    return NextResponse.json({
      success: true,
      timestamp: new Date().toISOString(),
      result
    })
  } catch (error) {
    console.error('Error processing domain verifications:', error)
    return NextResponse.json(
      { 
        error: 'Failed to process domain verifications',
        message: error instanceof Error ? error.message : 'Unknown error'
      }, 
      { status: 500 }
    )
  }
}

// Also support GET for manual testing
export async function GET(request: NextRequest) {
  try {
    console.log('Manual domain verification processing...')
    
    const result = await processPendingVerifications()
    
    return NextResponse.json({
      success: true,
      timestamp: new Date().toISOString(),
      result,
      message: 'Manual verification processing completed'
    })
  } catch (error) {
    console.error('Error processing domain verifications:', error)
    return NextResponse.json(
      { 
        error: 'Failed to process domain verifications',
        message: error instanceof Error ? error.message : 'Unknown error'
      }, 
      { status: 500 }
    )
  }
}
