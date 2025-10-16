/**
 * ESPN API integration for NFL data
 * ESPN provides free public APIs for sports data
 */

const ESPN_BASE_URL = 'https://site.api.espn.com/apis/site/v2/sports'

interface EspnGame {
  id: string
  date: string
  name: string
  shortName: string
  competitions: Array<{
    id: string
    date: string
    competitors: Array<{
      id: string
      homeAway: 'home' | 'away'
      team: {
        id: string
        name: string
        abbreviation: string
        displayName: string
        logo: string
      }
      score?: string
    }>
    status: {
      type: {
        name: string
        completed: boolean
      }
      displayClock?: string
      period: number
    }
    venue: {
      fullName: string
      address: {
        city: string
        state: string
      }
    }
  }>
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

class EspnService {
  private broncosTeamId = '7' // Denver Broncos ESPN team ID

  /**
   * Get Broncos games for current season
   */
  async getBroncosGames(): Promise<BroncosGame[]> {
    try {
      console.log('🏈 Fetching Broncos games from ESPN...')
      
      // ESPN API endpoint for NFL schedule
      const url = `${ESPN_BASE_URL}/football/nfl/teams/${this.broncosTeamId}/schedule`
      
      const response = await fetch(url)
      
      if (!response.ok) {
        throw new Error(`ESPN API request failed: ${response.status} ${response.statusText}`)
      }

      const data = await response.json()
      console.log('📊 ESPN Response:', data.events?.length || 0, 'games found')

      if (!data.events) {
        return []
      }

      return data.events.map((event: EspnGame) => {
        const competition = event.competitions[0]
        const broncosTeam = competition.competitors.find(comp => comp.team.id === this.broncosTeamId)
        const opponentTeam = competition.competitors.find(comp => comp.team.id !== this.broncosTeamId)
        
        if (!broncosTeam || !opponentTeam) {
          return null
        }

        const gameDate = new Date(competition.date)
        const isHome = broncosTeam.homeAway === 'home'
        
        return {
          id: `espn-${event.id}`,
          date: gameDate.toISOString().split('T')[0],
          time: gameDate.toLocaleTimeString('en-US', { 
            hour: 'numeric', 
            minute: '2-digit',
            hour12: true 
          }),
          opponent: opponentTeam.team.displayName,
          homeAway: broncosTeam.homeAway,
          venue: competition.venue?.fullName || (isHome ? 'Empower Field at Mile High' : `${opponentTeam.team.displayName} Stadium`),
          status: this.mapGameStatus(competition.status.type.name),
          broncosScore: broncosTeam.score ? parseInt(broncosTeam.score) : undefined,
          opponentScore: opponentTeam.score ? parseInt(opponentTeam.score) : undefined,
          week: this.extractWeekFromName(event.name),
          description: `${isHome ? 'vs' : '@'} ${opponentTeam.team.displayName}`
        }
      }).filter(Boolean)

    } catch (error) {
      console.error('❌ Failed to fetch Broncos games from ESPN:', error)
      return []
    }
  }

  /**
   * Get today's Broncos game
   */
  async getTodaysBroncosGame(): Promise<BroncosGame | null> {
    const games = await this.getBroncosGames()
    const today = new Date().toISOString().split('T')[0]
    
    return games.find(game => game.date === today) || null
  }

  /**
   * Get live Broncos game
   */
  async getLiveBroncosGame(): Promise<BroncosGame | null> {
    const games = await this.getBroncosGames()
    
    return games.find(game => game.status === 'live') || null
  }

  private mapGameStatus(espnStatus: string): 'scheduled' | 'live' | 'finished' {
    switch (espnStatus.toLowerCase()) {
      case 'in':
      case 'live':
        return 'live'
      case 'final':
      case 'post':
        return 'finished'
      default:
        return 'scheduled'
    }
  }

  private extractWeekFromName(gameName: string): string {
    // Extract week number from game name like "Broncos vs Jets - Week 6"
    const weekMatch = gameName.match(/week\s+(\d+)/i)
    if (weekMatch) {
      return weekMatch[1]
    }
    
    // If no week in name, try to calculate from date
    // This is a fallback - ESPN should include week info
    return 'TBD'
  }
}

// Export singleton instance
export const espnService = new EspnService()
export type { BroncosGame }
