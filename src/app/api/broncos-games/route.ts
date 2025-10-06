import { NextRequest, NextResponse } from 'next/server'
import { getUpcomingBroncosGames, broncosSchedule2025 } from '@/lib/broncos-schedule'

// GET - Fetch upcoming Broncos games
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const limit = parseInt(searchParams.get('limit') || '3')
    
    const upcomingGames = getUpcomingBroncosGames(limit)
    
    return NextResponse.json({
      success: true,
      games: upcomingGames,
      total: upcomingGames.length
    })
  } catch (error) {
    console.error('Error fetching Broncos games:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to fetch Broncos games' },
      { status: 500 }
    )
  }
}
