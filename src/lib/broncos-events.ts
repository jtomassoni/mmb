// src/lib/broncos-events.ts
export interface BroncosGame {
  id: string;
  date: string; // YYYY-MM-DD format
  time: string; // HH:MM format
  opponent: string;
  homeAway: 'home' | 'away' | 'neutral';
  mainDish: string;
  description: string;
  whatWeProvide: string; // What Monaghan's is providing
}

export const broncosGames2025: BroncosGame[] = [
  // Preseason Games (2024) - Saturdays
  {
    id: 'broncos-49ers-preseason1',
    date: '2024-08-09',
    time: '19:00',
    opponent: 'San Francisco 49ers',
    homeAway: 'away',
    mainDish: 'Taco Bar',
    description: 'Preseason Game 1\n• Broncos vs 49ers\n• Community potluck event\n• Bring a side or dessert',
    whatWeProvide: 'Taco Bar with all the fixings'
  },
  {
    id: 'broncos-cardinals-preseason2',
    date: '2024-08-16',
    time: '19:00',
    opponent: 'Arizona Cardinals',
    homeAway: 'home',
    mainDish: 'Pulled Pork',
    description: 'Preseason Game 2\n• Broncos vs Cardinals\n• Community potluck event\n• Bring your favorite side or dessert',
    whatWeProvide: 'Pulled pork sandwiches'
  },
  {
    id: 'broncos-saints-preseason3',
    date: '2024-08-23',
    time: '19:00',
    opponent: 'New Orleans Saints',
    homeAway: 'away',
    mainDish: 'Pasta Bar',
    description: 'Preseason Game 3\n• Broncos vs Saints\n• Community potluck event\n• Bring a side or dessert',
    whatWeProvide: 'Pasta with marinara and alfredo sauces'
  },

  // Regular Season Games (2024) - Sundays
  {
    id: 'broncos-titans-week1',
    date: '2024-09-07',
    time: '13:00',
    opponent: 'Tennessee Titans',
    homeAway: 'home',
    mainDish: 'Taco Bar',
    description: 'Week 1\n• Broncos vs Titans\n• Community potluck event\n• Bring a side or dessert',
    whatWeProvide: 'Taco Bar with all the fixings'
  },
  {
    id: 'broncos-colts-week2',
    date: '2024-09-14',
    time: '13:00',
    opponent: 'Indianapolis Colts',
    homeAway: 'away',
    mainDish: 'Pulled Pork',
    description: 'Week 2\n• Broncos vs Colts\n• Community potluck event\n• Bring your favorite side or dessert',
    whatWeProvide: 'Pulled pork sandwiches'
  },
  {
    id: 'broncos-chargers-week3',
    date: '2024-09-21',
    time: '13:00',
    opponent: 'Los Angeles Chargers',
    homeAway: 'away',
    mainDish: 'Pasta Bar',
    description: 'Week 3\n• Broncos vs Chargers\n• Community potluck event\n• Bring a side or dessert',
    whatWeProvide: 'Pasta with marinara and alfredo sauces'
  },
  {
    id: 'broncos-jets-week4',
    date: '2025-09-28',
    time: '13:00',
    opponent: 'New York Jets',
    homeAway: 'home',
    mainDish: 'Sliders',
    description: 'Week 4 - Broncos vs Jets. Slider Sunday! We\'re making mini burgers with all the toppings. Bring a side or dessert to share.'
  },
  {
    id: 'broncos-raiders-week5',
    date: '2025-10-05',
    time: '13:00',
    opponent: 'Las Vegas Raiders',
    homeAway: 'home',
    mainDish: 'Pizza',
    description: 'Week 5 - Broncos vs Raiders. Pizza party! We\'ll have multiple pizza varieties. Bring a side or dessert to complete the feast.'
  },
  {
    id: 'broncos-chargers-week6',
    date: '2025-10-12',
    time: '13:00',
    opponent: 'Los Angeles Chargers',
    homeAway: 'away',
    mainDish: 'Nachos',
    description: 'Week 6 - Broncos vs Chargers. Loaded nachos for everyone! We\'re serving up the works. Bring a side or dessert to share.'
  },
  {
    id: 'broncos-saints-week7',
    date: '2025-10-19',
    time: '13:00',
    opponent: 'New Orleans Saints',
    homeAway: 'home',
    mainDish: 'Breakfast Bar',
    description: 'Week 7 - Broncos vs Saints. Brunch game! We\'re doing a breakfast bar with eggs, bacon, and more. Bring a side or dessert.'
  },
  {
    id: 'broncos-browns-week8',
    date: '2025-10-26',
    time: '13:00',
    opponent: 'Cleveland Browns',
    homeAway: 'away',
    mainDish: 'Taco Bar',
    description: 'Week 8 - Broncos vs Browns. Taco time again! We\'re bringing back the taco bar. Bring your favorite side or dessert.'
  },
  {
    id: 'broncos-chiefs-week9',
    date: '2025-11-02',
    time: '13:00',
    opponent: 'Kansas City Chiefs',
    homeAway: 'home',
    mainDish: 'Pulled Pork',
    description: 'Week 9 - Broncos vs Chiefs. Rivalry game! Pulled pork sandwiches for the big game. Bring a side or dessert to share.'
  },
  {
    id: 'broncos-bills-week10',
    date: '2025-11-09',
    time: '13:00',
    opponent: 'Buffalo Bills',
    homeAway: 'away',
    mainDish: 'Pasta Bar',
    description: 'Week 10 - Broncos vs Bills. Pasta night! We\'ll have multiple pasta options. Bring a side or dessert to complete the meal.'
  },
  {
    id: 'broncos-dolphins-week11',
    date: '2025-11-16',
    time: '13:00',
    opponent: 'Miami Dolphins',
    homeAway: 'home',
    mainDish: 'Sliders',
    description: 'Week 11 - Broncos vs Dolphins. Slider Sunday! Mini burgers with all the fixings. Bring a side or dessert to share.'
  },
  {
    id: 'broncos-panthers-week12',
    date: '2025-11-23',
    time: '13:00',
    opponent: 'Carolina Panthers',
    homeAway: 'away',
    mainDish: 'Pizza',
    description: 'Week 12 - Broncos vs Panthers. Pizza party! Multiple pizza varieties for everyone. Bring a side or dessert to share.'
  },
  {
    id: 'broncos-texans-week13',
    date: '2025-11-30',
    time: '13:00',
    opponent: 'Houston Texans',
    homeAway: 'home',
    mainDish: 'Nachos',
    description: 'Week 13 - Broncos vs Texans. Loaded nachos! We\'re serving up the works. Bring a side or dessert to complete the spread.'
  },
  {
    id: 'broncos-jaguars-week14',
    date: '2025-12-07',
    time: '13:00',
    opponent: 'Jacksonville Jaguars',
    homeAway: 'away',
    mainDish: 'Breakfast Bar',
    description: 'Week 14 - Broncos vs Jaguars. Brunch game! Breakfast bar with eggs, bacon, and more. Bring a side or dessert to share.'
  },
  {
    id: 'broncos-colts-week15',
    date: '2025-12-14',
    time: '13:00',
    opponent: 'Indianapolis Colts',
    homeAway: 'home',
    mainDish: 'Taco Bar',
    description: 'Week 15 - Broncos vs Colts. Taco time! We\'re bringing back the taco bar. Bring your favorite side or dessert.'
  },
  {
    id: 'broncos-titans-week16',
    date: '2025-12-21',
    time: '13:00',
    opponent: 'Tennessee Titans',
    homeAway: 'away',
    mainDish: 'Pulled Pork',
    description: 'Week 16 - Broncos vs Titans. Pulled pork sandwiches for the holiday game! Bring a side or dessert to share.'
  },
  {
    id: 'broncos-chiefs-week17',
    date: '2025-12-28',
    time: '13:00',
    opponent: 'Kansas City Chiefs',
    homeAway: 'home',
    mainDish: 'Pasta Bar',
    description: 'Week 17 - Broncos vs Chiefs. Season finale! Pasta bar to celebrate the end of the season. Bring a side or dessert.'
  },

  // Playoff Games (2026)
  {
    id: 'broncos-wildcard',
    date: '2026-01-04',
    time: '13:00',
    opponent: 'TBD - Wild Card',
    homeAway: 'home',
    mainDish: 'BBQ Ribs',
    description: 'Wild Card Playoff - Broncos vs TBD. Playoff football! We\'re serving BBQ ribs for the big game. Bring a side or dessert to share.'
  },
  {
    id: 'broncos-divisional',
    date: '2026-01-11',
    time: '13:00',
    opponent: 'TBD - Divisional',
    homeAway: 'away',
    mainDish: 'Chili Bar',
    description: 'Divisional Playoff - Broncos vs TBD. Championship football! We\'re doing a chili bar with all the toppings. Bring a side or dessert.'
  },
  {
    id: 'broncos-conference',
    date: '2026-01-18',
    time: '13:00',
    opponent: 'TBD - Conference',
    homeAway: 'home',
    mainDish: 'Wing Bar',
    description: 'Conference Championship - Broncos vs TBD. AFC Championship! We\'re serving wings in multiple flavors. Bring a side or dessert to share.'
  },
  {
    id: 'broncos-superbowl',
    date: '2026-02-08',
    time: '18:30',
    opponent: 'TBD - Super Bowl',
    homeAway: 'neutral',
    mainDish: 'Burger Bar',
    description: 'Super Bowl - Broncos vs TBD. The Big Game! We\'re doing a burger bar with all the fixings. Bring a side or dessert to complete the feast.'
  }
];

export const mainDishOptions = [
  'Taco Bar',
  'Pulled Pork',
  'Pasta Bar',
  'Sliders',
  'Pizza',
  'Nachos',
  'Breakfast Bar',
  'BBQ Ribs',
  'Chili Bar',
  'Wing Bar',
  'Burger Bar',
  'Soup & Salad Bar'
];

export function getBroncosGameById(id: string): BroncosGame | undefined {
  return broncosGames2025.find(game => game.id === id);
}

export function getBroncosGamesByDateRange(startDate: string, endDate: string): BroncosGame[] {
  return broncosGames2025.filter(game => 
    game.date >= startDate && game.date <= endDate
  );
}

export function getUpcomingBroncosGames(): BroncosGame[] {
  const today = new Date().toISOString().split('T')[0];
  return broncosGames2025.filter(game => game.date >= today);
}
