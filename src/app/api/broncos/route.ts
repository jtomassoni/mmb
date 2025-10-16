import { NextRequest, NextResponse } from 'next/server'
import { espnService } from '@/lib/espn-api'
import { broncosSchedule2025 } from '@/lib/broncos-schedule'

// In-memory cache (in production, you'd want Redis or similar)
let broncosCache = {
  games: null as any[] | null,
  stats: null as any | null,
  liveGame: null as any | null,
  lastUpdated: null as Date | null,
  season: 2024
}

const CACHE_DURATION = 30 * 60 * 1000 // 30 minutes in milliseconds

/**
 * Check if cache is stale and needs refresh
 */
function isCacheStale(): boolean {
  if (!broncosCache.lastUpdated) return true
  
  const now = new Date()
  const timeDiff = now.getTime() - broncosCache.lastUpdated.getTime()
  return timeDiff > CACHE_DURATION
}

/**
 * Update Broncos data from ESPN API
 */
async function updateBroncosCache(): Promise<void> {
  try {
    console.log('🔄 Updating Broncos cache from ESPN...')
    
    // Fetch data from ESPN
    const [games, liveGame, todaysGame] = await Promise.all([
      espnService.getBroncosGames(),
      espnService.getLiveBroncosGame(),
      espnService.getTodaysBroncosGame()
    ])

    // Update cache
    broncosCache.games = games
    broncosCache.stats = null // ESPN doesn't provide team stats in this endpoint
    broncosCache.liveGame = liveGame
    broncosCache.lastUpdated = new Date()

    console.log(`✅ Broncos cache updated from ESPN: ${games.length} games, live: ${liveGame ? 'Yes' : 'No'}`)
    
  } catch (error) {
    console.error('❌ Failed to update Broncos cache from ESPN:', error)
    
    // Fallback to hardcoded data if ESPN fails
    if (!broncosCache.games) {
      broncosCache.games = broncosSchedule2025.map(game => ({
        id: game.id,
        date: game.date,
        time: game.time,
        opponent: game.opponent,
        homeAway: game.homeAway,
        venue: game.homeAway === 'home' ? 'Empower Field at Mile High' : `${game.opponent} Stadium`,
        status: 'scheduled' as const,
        week: game.week,
        description: game.description
      }))
      broncosCache.lastUpdated = new Date()
      console.log('📋 Using fallback Broncos data')
    }
  }
}

/**
 * Get cached Broncos data, updating if stale
 */
async function getBroncosData(type: string): Promise<any> {
  // Update cache if stale
  if (isCacheStale()) {
    await updateBroncosCache()
  }

  switch (type) {
    case 'games':
      return broncosCache.games || []
    case 'stats':
      return broncosCache.stats
    case 'live':
      return broncosCache.liveGame
    case 'today':
      if (!broncosCache.games) return null
      const today = new Date().toISOString().split('T')[0]
      return broncosCache.games.find(game => game.date === today) || null
    default:
      return null
  }
}

/**
 * Broncos API endpoint with caching
 * GET /api/broncos/games - Get Broncos schedule
 * GET /api/broncos/stats - Get Broncos team stats  
 * GET /api/broncos/live - Get live Broncos game
 * GET /api/broncos/today - Get today's Broncos game
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const type = searchParams.get('type') || 'games'
    const season = parseInt(searchParams.get('season') || '2024')

    // Update season if different
    if (season !== broncosCache.season) {
      broncosCache.season = season
      broncosCache.lastUpdated = null // Force refresh
    }

    const data = await getBroncosData(type)
    const source = broncosCache.lastUpdated ? 'cache' : 'fallback'

    return NextResponse.json({
      success: true,
      data,
      total: Array.isArray(data) ? data.length : (data ? 1 : 0),
      source,
      lastUpdated: broncosCache.lastUpdated?.toISOString(),
      cacheAge: broncosCache.lastUpdated ? 
        Math.round((Date.now() - broncosCache.lastUpdated.getTime()) / 1000 / 60) : null
    })

  } catch (error) {
    console.error('Broncos API error:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to fetch Broncos data' },
      { status: 500 }
    )
  }
}

/**
 * Manual cache refresh endpoint (for testing)
 * POST /api/broncos/refresh
 */
export async function POST(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const action = searchParams.get('action')

    if (action === 'refresh') {
      broncosCache.lastUpdated = null // Force refresh
      await updateBroncosCache()
      
      return NextResponse.json({
        success: true,
        message: 'Broncos cache refreshed',
        lastUpdated: broncosCache.lastUpdated?.toISOString()
      })
    }

    return NextResponse.json(
      { success: false, error: 'Invalid action' },
      { status: 400 }
    )
  } catch (error) {
    console.error('Cache refresh error:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to refresh cache' },
      { status: 500 }
    )
  }
}