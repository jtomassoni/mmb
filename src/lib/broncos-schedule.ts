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
    id: 'week5-eagles',
    week: 5,
    opponent: 'Philadelphia Eagles',
    date: '2025-10-05', // Sunday - Eagles game happened on the 5th
    time: '13:00',
    homeAway: 'away',
    potluckFood: 'Slider Sunday! Mini burgers with all the toppings',
    description: 'Week 5 - Broncos vs Eagles. Slider Sunday! We\'re making mini burgers with all the toppings. Bring a side or dessert to share.'
  },
  {
    id: 'week6-jets',
    week: 6,
    opponent: 'New York Jets',
    date: '2025-10-12', // Sunday - Next game is against Jets
    time: '07:30', // 7:30 AM per schedule
    homeAway: 'home',
    potluckFood: 'Pizza party! Multiple pizza varieties',
    description: 'Week 6 - Broncos vs Jets. Pizza party! We\'ll have multiple pizza varieties. Bring a side or dessert to complete the feast.'
  },
  {
    id: 'week7-giants',
    week: 7,
    opponent: 'New York Giants',
    date: '2025-10-19', // Sunday
    time: '14:05', // 2:05 PM per schedule
    homeAway: 'home',
    potluckFood: 'Loaded nachos with all the works',
    description: 'Week 7 - Broncos vs Giants. Loaded nachos for everyone! We\'re serving up the works. Bring a side or dessert to share.'
  },
  {
    id: 'week8-cowboys',
    week: 8,
    opponent: 'Dallas Cowboys',
    date: '2025-10-26', // Sunday
    time: '14:25', // 2:25 PM per schedule
    homeAway: 'home',
    potluckFood: 'Breakfast bar with eggs, bacon, and more',
    description: 'Week 8 - Broncos vs Cowboys. Brunch game! We\'re doing a breakfast bar with eggs, bacon, and more. Bring a side or dessert.'
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
