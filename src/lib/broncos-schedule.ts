// Broncos Schedule Service
// This should be updated with the real Broncos schedule each season

export interface BroncosGame {
  id: string
  week: number
  opponent: string
  date: string // YYYY-MM-DD format
  time: string // HH:MM format
  homeAway: 'home' | 'away'
  potluckFood: string
  description: string
}

// 2025 Broncos Schedule - Update this with real schedule
export const broncosSchedule2025: BroncosGame[] = [
  {
    id: 'week6-jets',
    week: 6,
    opponent: 'New York Jets',
    date: '2024-10-12', // Sunday - Jets game
    time: '06:30', // 6:30 AM PDT
    homeAway: 'away',
    potluckFood: 'Pizza party! Multiple pizza varieties',
    description: 'Week 6 - Broncos @ Jets. Pizza party! We\'ll have multiple pizza varieties. Bring a side or dessert to complete the feast.'
  },
  {
    id: 'week7-giants',
    week: 7,
    opponent: 'New York Giants',
    date: '2024-10-19', // Sunday
    time: '13:05', // 1:05 PM PDT
    homeAway: 'home',
    potluckFood: 'Loaded nachos with all the works',
    description: 'Week 7 - Giants @ Broncos. Loaded nachos for everyone! We\'re serving up the works. Bring a side or dessert to share.'
  },
  {
    id: 'week8-cowboys',
    week: 8,
    opponent: 'Dallas Cowboys',
    date: '2024-10-26', // Sunday
    time: '13:25', // 1:25 PM PDT
    homeAway: 'home',
    potluckFood: 'Breakfast bar with eggs, bacon, and more',
    description: 'Week 8 - Cowboys @ Broncos. Brunch game! We\'re doing a breakfast bar with eggs, bacon, and more. Bring a side or dessert.'
  },
  {
    id: 'week9-texans',
    week: 9,
    opponent: 'Houston Texans',
    date: '2024-11-02', // Sunday
    time: '10:00', // 10:00 AM PST
    homeAway: 'away',
    potluckFood: 'BBQ feast with pulled pork and brisket',
    description: 'Week 9 - Broncos @ Texans. BBQ feast! We\'re bringing pulled pork and brisket. Bring a side or dessert to complete the meal.'
  }
]

// Helper functions
export function getBroncosGamesForDate(date: string): BroncosGame[] {
  return broncosSchedule2025.filter(game => game.date === date)
}

export function getUpcomingBroncosGames(limit: number = 3): BroncosGame[] {
  const today = new Date().toISOString().split('T')[0]
  return broncosSchedule2025
    .filter(game => game.date >= today)
    .slice(0, limit)
}

export function getBroncosGameToday(): BroncosGame | null {
  const today = new Date().toISOString().split('T')[0]
  return broncosSchedule2025.find(game => game.date === today) || null
}

export function getBroncosGamesForWeek(startDate: string, endDate: string): BroncosGame[] {
  return broncosSchedule2025.filter(game => 
    game.date >= startDate && game.date <= endDate
  )
}
