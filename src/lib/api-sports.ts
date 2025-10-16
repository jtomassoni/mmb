/**
 * API-SPORTS integration for NFL data
 * Documentation: https://api-sports.io/documentation/nfl-api
 */

const API_BASE_URL = 'https://api-sports.io/api/v1'
const BRONCOS_TEAM_ID = 7 // Denver Broncos team ID
const NFL_LEAGUE_ID = 1

interface ApiSportsGame {
  id: number
  date: string
  time: string
  timestamp: number
  timezone: string
  week: string
  status: {
    long: string
    short: string
    elapsed?: number
  }
  teams: {
    home: {
      id: number
      name: string
      logo: string
    }
    away: {
      id: number
      name: string
      logo: string
    }
  }
  scores: {
    home: {
      quarter_1?: number
      quarter_2?: number
      quarter_3?: number
      quarter_4?: number
      overtime?: number
      total?: number
    }
    away: {
      quarter_1?: number
      quarter_2?: number
      quarter_3?: number
      quarter_4?: number
      overtime?: number
      total?: number
    }
  }
  venue: {
    id: number
    name: string
    city: string
  }
}

interface ApiSportsResponse<T> {
  get: string
  parameters: Record<string, any>
  errors: any[]
  results: number
  paging: {
    current: number
    total: number
  }
  response: T[]
}

interface BroncosGame {
  id: string
  date: string
  time: string
  opponent: string
  homeAway: 'home' | 'away'
  venue: string
  status: 'scheduled' | 'live' | 'finished'
  broncosScore?: number
  opponentScore?: number
  week: string
  description: string
}

interface TeamStats {
  team: {
    id: number
    name: string
    logo: string
  }
  league: {
    id: number
    name: string
    season: number
  }
  games: {
    played: number
    win: {
      total: number
      percentage: string
    }
    lose: {
      total: number
      percentage: string
    }
  }
  points: {
    for: {
      total: number
      average: string
    }
    against: {
      total: number
      average: string
    }
  }
}

class ApiSportsService {
  private apiKey: string

  constructor() {
    this.apiKey = process.env.API_SPORTS_KEY || ''
    console.log('API-SPORTS Key loaded:', this.apiKey ? 'Yes' : 'No')
    if (!this.apiKey) {
      console.warn('API_SPORTS_KEY not found in environment variables')
    }
  }

  private async makeRequest<T>(endpoint: string, params: Record<string, any> = {}): Promise<T> {
    if (!this.apiKey) {
      throw new Error('API key not configured')
    }

    const url = new URL(`${API_BASE_URL}${endpoint}`)
    Object.entries(params).forEach(([key, value]) => {
      url.searchParams.append(key, value.toString())
    })

    console.log('🔗 API-SPORTS Request:', url.toString())
    console.log('🔑 Using API Key:', this.apiKey.substring(0, 10) + '...')

    const response = await fetch(url.toString(), {
      headers: {
        'X-RapidAPI-Key': this.apiKey,
        'X-RapidAPI-Host': 'api-sports.io'
      }
    })

    console.log('📡 API-SPORTS Response:', response.status, response.statusText)

    if (!response.ok) {
      const errorText = await response.text()
      console.error(`API request failed: ${response.status} ${response.statusText}`, errorText)
      throw new Error(`API request failed: ${response.status} ${response.statusText}`)
    }

    const data = await response.json()
    console.log('📊 API-SPORTS Data:', JSON.stringify(data, null, 2))
    return data
  }

  /**
   * Get Broncos games for a specific season
   */
  async getBroncosGames(season: number = 2024): Promise<BroncosGame[]> {
    try {
      const response = await this.makeRequest<ApiSportsResponse<ApiSportsGame>>('/games', {
        league: NFL_LEAGUE_ID,
        season: season,
        team: BRONCOS_TEAM_ID
      })

      return response.response.map(game => {
        const isHome = game.teams.home.id === BRONCOS_TEAM_ID
        const opponent = isHome ? game.teams.away : game.teams.home
        const broncosScore = isHome ? game.scores.home.total : game.scores.away.total
        const opponentScore = isHome ? game.scores.away.total : game.scores.home.total

        return {
          id: `broncos-${game.id}`,
          date: game.date.split('T')[0], // YYYY-MM-DD format
          time: game.time,
          opponent: opponent.name,
          homeAway: isHome ? 'home' : 'away',
          venue: game.venue.name,
          status: this.mapGameStatus(game.status.short),
          broncosScore,
          opponentScore,
          week: game.week,
          description: this.generateGameDescription(game, isHome, opponent.name)
        }
      })
    } catch (error) {
      console.error('Failed to fetch Broncos games:', error)
      return []
    }
  }

  /**
   * Get Broncos team statistics for a season
   */
  async getBroncosStats(season: number = 2024): Promise<TeamStats | null> {
    try {
      const response = await this.makeRequest<ApiSportsResponse<TeamStats>>('/teams/statistics', {
        league: NFL_LEAGUE_ID,
        season: season,
        team: BRONCOS_TEAM_ID
      })

      return response.response[0] || null
    } catch (error) {
      console.error('Failed to fetch Broncos stats:', error)
      return null
    }
  }

  /**
   * Get live Broncos game (if currently playing)
   */
  async getLiveBroncosGame(): Promise<BroncosGame | null> {
    try {
      const response = await this.makeRequest<ApiSportsResponse<ApiSportsGame>>('/games', {
        league: NFL_LEAGUE_ID,
        season: 2024,
        team: BRONCOS_TEAM_ID,
        status: 'live'
      })

      if (response.response.length === 0) {
        return null
      }

      const game = response.response[0]
      const isHome = game.teams.home.id === BRONCOS_TEAM_ID
      const opponent = isHome ? game.teams.away : game.teams.home

      return {
        id: `broncos-${game.id}`,
        date: game.date.split('T')[0],
        time: game.time,
        opponent: opponent.name,
        homeAway: isHome ? 'home' : 'away',
        venue: game.venue.name,
        status: 'live',
        broncosScore: isHome ? game.scores.home.total : game.scores.away.total,
        opponentScore: isHome ? game.scores.away.total : game.scores.home.total,
        week: game.week,
        description: `Live: Broncos vs ${opponent.name}`
      }
    } catch (error) {
      console.error('Failed to fetch live Broncos game:', error)
      return null
    }
  }

  /**
   * Get today's Broncos game (if any)
   */
  async getTodaysBroncosGame(): Promise<BroncosGame | null> {
    const today = new Date().toISOString().split('T')[0]
    const games = await this.getBroncosGames()
    
    return games.find(game => game.date === today) || null
  }

  private mapGameStatus(apiStatus: string): 'scheduled' | 'live' | 'finished' {
    switch (apiStatus.toLowerCase()) {
      case 'live':
      case '1h':
      case '2h':
      case '3h':
      case '4h':
      case 'ht':
        return 'live'
      case 'ft':
      case 'aet':
      case 'pen':
        return 'finished'
      default:
        return 'scheduled'
    }
  }

  private generateGameDescription(game: ApiSportsGame, isHome: boolean, opponentName: string): string {
    const venue = isHome ? 'at Empower Field at Mile High' : `at ${game.venue.name}`
    const week = game.week ? `Week ${game.week}` : 'Game'
    
    return `${week} - Broncos vs ${opponentName} ${venue}`
  }
}

// Export singleton instance
export const apiSportsService = new ApiSportsService()

// Export types for use in other files
export type { BroncosGame, TeamStats }
