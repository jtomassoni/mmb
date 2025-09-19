// src/lib/ai-intake.ts
export type BusinessType = 'dive_bar' | 'cafe' | 'fine_dining' | 'sports_bar' | 'family_restaurant' | 'brewery' | 'pizzeria' | 'food_truck'

export interface QuestionSet {
  id: string
  businessType: BusinessType
  title: string
  description: string
  questions: Question[]
  followUpQuestions: Question[]
}

export interface Question {
  id: string
  type: 'text' | 'select' | 'multiselect' | 'time' | 'boolean' | 'number'
  label: string
  placeholder?: string
  required: boolean
  options?: string[]
  validation?: {
    min?: number
    max?: number
    pattern?: string
  }
  aiPrompt?: string // How to ask this question in natural language
}

export interface IntakeSession {
  id: string
  businessType: BusinessType
  answers: Record<string, any>
  currentStep: number
  completed: boolean
  createdAt: Date
  updatedAt: Date
}

// Business type detection questions
export const BUSINESS_TYPE_QUESTIONS: Question[] = [
  {
    id: 'business_type',
    type: 'select',
    label: 'What type of business are you?',
    required: true,
    options: [
      'Dive Bar',
      'Café',
      'Fine Dining',
      'Sports Bar', 
      'Family Restaurant',
      'Brewery',
      'Pizzeria',
      'Food Truck'
    ],
    aiPrompt: 'What type of restaurant or bar are you? Are you a dive bar, café, fine dining, sports bar, family restaurant, brewery, pizzeria, or food truck?'
  }
]

// Dive Bar question set
export const DIVE_BAR_QUESTIONS: QuestionSet = {
  id: 'dive_bar',
  businessType: 'dive_bar',
  title: 'Dive Bar Setup',
  description: 'Let\'s set up your dive bar with the essentials',
  questions: [
    {
      id: 'name',
      type: 'text',
      label: 'Bar Name',
      placeholder: 'e.g., The Rusty Anchor',
      required: true,
      aiPrompt: 'What\'s the name of your bar?'
    },
    {
      id: 'description',
      type: 'text',
      label: 'Bar Description',
      placeholder: 'e.g., Where locals gather for cold beer and good times',
      required: true,
      aiPrompt: 'How would you describe your bar? What makes it special?'
    },
    {
      id: 'address',
      type: 'text',
      label: 'Address',
      placeholder: 'e.g., 123 Main St, Denver, CO 80202',
      required: true,
      aiPrompt: 'What\'s your bar\'s address?'
    },
    {
      id: 'phone',
      type: 'text',
      label: 'Phone Number',
      placeholder: '(303) 555-0123',
      required: true,
      validation: { pattern: '^\\(\\d{3}\\) \\d{3}-\\d{4}$' },
      aiPrompt: 'What\'s your bar\'s phone number?'
    },
    {
      id: 'email',
      type: 'text',
      label: 'Email',
      placeholder: 'info@rustyanchor.com',
      required: true,
      validation: { pattern: '^[^@]+@[^@]+\\.[^@]+$' },
      aiPrompt: 'What\'s your bar\'s email address?'
    },
    {
      id: 'pool_tables',
      type: 'boolean',
      label: 'Do you have pool tables?',
      required: false,
      aiPrompt: 'Do you have pool tables for your customers?'
    },
    {
      id: 'dart_boards',
      type: 'boolean',
      label: 'Do you have dart boards?',
      required: false,
      aiPrompt: 'Do you have dart boards?'
    },
    {
      id: 'jukebox',
      type: 'boolean',
      label: 'Do you have a jukebox?',
      required: false,
      aiPrompt: 'Do you have a jukebox or music system?'
    },
    {
      id: 'happy_hour',
      type: 'boolean',
      label: 'Do you have happy hour specials?',
      required: false,
      aiPrompt: 'Do you offer happy hour specials?'
    },
    {
      id: 'live_music',
      type: 'boolean',
      label: 'Do you have live music?',
      required: false,
      aiPrompt: 'Do you have live music or entertainment?'
    }
  ],
  followUpQuestions: [
    {
      id: 'pool_table_count',
      type: 'number',
      label: 'How many pool tables?',
      required: false,
      validation: { min: 1, max: 10 },
      aiPrompt: 'How many pool tables do you have?'
    },
    {
      id: 'happy_hour_times',
      type: 'text',
      label: 'Happy hour times',
      placeholder: 'e.g., 4-6 PM Monday-Friday',
      required: false,
      aiPrompt: 'What are your happy hour times?'
    },
    {
      id: 'signature_drink',
      type: 'text',
      label: 'Signature drink',
      placeholder: 'e.g., The Rusty Anchor (whiskey + cola)',
      required: false,
      aiPrompt: 'Do you have a signature drink or cocktail?'
    }
  ]
}

// Café question set
export const CAFE_QUESTIONS: QuestionSet = {
  id: 'cafe',
  businessType: 'cafe',
  title: 'Café Setup',
  description: 'Let\'s set up your café with the essentials',
  questions: [
    {
      id: 'name',
      type: 'text',
      label: 'Café Name',
      placeholder: 'e.g., The Cozy Corner Café',
      required: true,
      aiPrompt: 'What\'s the name of your café?'
    },
    {
      id: 'description',
      type: 'text',
      label: 'Café Description',
      placeholder: 'e.g., Fresh coffee, homemade pastries, and friendly service',
      required: true,
      aiPrompt: 'How would you describe your café? What makes it special?'
    },
    {
      id: 'address',
      type: 'text',
      label: 'Address',
      placeholder: 'e.g., 456 Oak St, Denver, CO 80203',
      required: true,
      aiPrompt: 'What\'s your café\'s address?'
    },
    {
      id: 'phone',
      type: 'text',
      label: 'Phone Number',
      placeholder: '(303) 555-0456',
      required: true,
      validation: { pattern: '^\\(\\d{3}\\) \\d{3}-\\d{4}$' },
      aiPrompt: 'What\'s your café\'s phone number?'
    },
    {
      id: 'email',
      type: 'text',
      label: 'Email',
      placeholder: 'hello@cozycorner.com',
      required: true,
      validation: { pattern: '^[^@]+@[^@]+\\.[^@]+$' },
      aiPrompt: 'What\'s your café\'s email address?'
    },
    {
      id: 'wifi',
      type: 'boolean',
      label: 'Do you offer free WiFi?',
      required: false,
      aiPrompt: 'Do you offer free WiFi for customers?'
    },
    {
      id: 'outdoor_seating',
      type: 'boolean',
      label: 'Do you have outdoor seating?',
      required: false,
      aiPrompt: 'Do you have outdoor seating or a patio?'
    },
    {
      id: 'pastries',
      type: 'boolean',
      label: 'Do you serve pastries?',
      required: false,
      aiPrompt: 'Do you serve pastries or baked goods?'
    },
    {
      id: 'lunch_menu',
      type: 'boolean',
      label: 'Do you serve lunch?',
      required: false,
      aiPrompt: 'Do you serve lunch or light meals?'
    },
    {
      id: 'coffee_roasting',
      type: 'boolean',
      label: 'Do you roast your own coffee?',
      required: false,
      aiPrompt: 'Do you roast your own coffee beans?'
    }
  ],
  followUpQuestions: [
    {
      id: 'wifi_password',
      type: 'text',
      label: 'WiFi password',
      placeholder: 'e.g., cozycoffee2024',
      required: false,
      aiPrompt: 'What\'s your WiFi password?'
    },
    {
      id: 'signature_drink',
      type: 'text',
      label: 'Signature coffee drink',
      placeholder: 'e.g., The Cozy Latte (vanilla + cinnamon)',
      required: false,
      aiPrompt: 'Do you have a signature coffee drink?'
    },
    {
      id: 'breakfast_hours',
      type: 'text',
      label: 'Breakfast hours',
      placeholder: 'e.g., 7 AM - 11 AM daily',
      required: false,
      aiPrompt: 'What are your breakfast hours?'
    }
  ]
}

// Fine Dining question set
export const FINE_DINING_QUESTIONS: QuestionSet = {
  id: 'fine_dining',
  businessType: 'fine_dining',
  title: 'Fine Dining Setup',
  description: 'Let\'s set up your fine dining restaurant',
  questions: [
    {
      id: 'name',
      type: 'text',
      label: 'Restaurant Name',
      placeholder: 'e.g., The Elegant Table',
      required: true,
      aiPrompt: 'What\'s the name of your restaurant?'
    },
    {
      id: 'description',
      type: 'text',
      label: 'Restaurant Description',
      placeholder: 'e.g., Upscale dining with locally sourced ingredients',
      required: true,
      aiPrompt: 'How would you describe your restaurant? What makes it special?'
    },
    {
      id: 'address',
      type: 'text',
      label: 'Address',
      placeholder: 'e.g., 789 Fine Ave, Denver, CO 80204',
      required: true,
      aiPrompt: 'What\'s your restaurant\'s address?'
    },
    {
      id: 'phone',
      type: 'text',
      label: 'Phone Number',
      placeholder: '(303) 555-0789',
      required: true,
      validation: { pattern: '^\\(\\d{3}\\) \\d{3}-\\d{4}$' },
      aiPrompt: 'What\'s your restaurant\'s phone number?'
    },
    {
      id: 'email',
      type: 'text',
      label: 'Email',
      placeholder: 'reservations@eleganttable.com',
      required: true,
      validation: { pattern: '^[^@]+@[^@]+\\.[^@]+$' },
      aiPrompt: 'What\'s your restaurant\'s email address?'
    },
    {
      id: 'reservations',
      type: 'boolean',
      label: 'Do you take reservations?',
      required: false,
      aiPrompt: 'Do you take reservations?'
    },
    {
      id: 'wine_list',
      type: 'boolean',
      label: 'Do you have a wine list?',
      required: false,
      aiPrompt: 'Do you have a wine list or sommelier?'
    },
    {
      id: 'private_dining',
      type: 'boolean',
      label: 'Do you have private dining rooms?',
      required: false,
      aiPrompt: 'Do you have private dining rooms for events?'
    },
    {
      id: 'chef_special',
      type: 'boolean',
      label: 'Do you have chef\'s specials?',
      required: false,
      aiPrompt: 'Do you offer chef\'s specials or tasting menus?'
    },
    {
      id: 'dress_code',
      type: 'boolean',
      label: 'Do you have a dress code?',
      required: false,
      aiPrompt: 'Do you have a dress code?'
    }
  ],
  followUpQuestions: [
    {
      id: 'reservation_phone',
      type: 'text',
      label: 'Reservation phone',
      placeholder: '(303) 555-0789',
      required: false,
      aiPrompt: 'What phone number should customers call for reservations?'
    },
    {
      id: 'dress_code_details',
      type: 'text',
      label: 'Dress code details',
      placeholder: 'e.g., Business casual, no shorts or flip-flops',
      required: false,
      aiPrompt: 'What are the details of your dress code?'
    },
    {
      id: 'signature_dish',
      type: 'text',
      label: 'Signature dish',
      placeholder: 'e.g., Pan-seared salmon with seasonal vegetables',
      required: false,
      aiPrompt: 'What\'s your signature dish?'
    }
  ]
}

// Sports Bar question set
export const SPORTS_BAR_QUESTIONS: QuestionSet = {
  id: 'sports_bar',
  businessType: 'sports_bar',
  title: 'Sports Bar Setup',
  description: 'Let\'s set up your sports bar',
  questions: [
    {
      id: 'name',
      type: 'text',
      label: 'Sports Bar Name',
      placeholder: 'e.g., The Victory Sports Bar',
      required: true,
      aiPrompt: 'What\'s the name of your sports bar?'
    },
    {
      id: 'description',
      type: 'text',
      label: 'Sports Bar Description',
      placeholder: 'e.g., Where sports fans gather for the big game',
      required: true,
      aiPrompt: 'How would you describe your sports bar? What makes it special?'
    },
    {
      id: 'address',
      type: 'text',
      label: 'Address',
      placeholder: 'e.g., 321 Sports Blvd, Denver, CO 80205',
      required: true,
      aiPrompt: 'What\'s your sports bar\'s address?'
    },
    {
      id: 'phone',
      type: 'text',
      label: 'Phone Number',
      placeholder: '(303) 555-0321',
      required: true,
      validation: { pattern: '^\\(\\d{3}\\) \\d{3}-\\d{4}$' },
      aiPrompt: 'What\'s your sports bar\'s phone number?'
    },
    {
      id: 'email',
      type: 'text',
      label: 'Email',
      placeholder: 'info@victorysports.com',
      required: true,
      validation: { pattern: '^[^@]+@[^@]+\\.[^@]+$' },
      aiPrompt: 'What\'s your sports bar\'s email address?'
    },
    {
      id: 'tvs',
      type: 'boolean',
      label: 'Do you have TVs for sports?',
      required: false,
      aiPrompt: 'Do you have TVs for watching sports?'
    },
    {
      id: 'pool_tables',
      type: 'boolean',
      label: 'Do you have pool tables?',
      required: false,
      aiPrompt: 'Do you have pool tables?'
    },
    {
      id: 'dart_boards',
      type: 'boolean',
      label: 'Do you have dart boards?',
      required: false,
      aiPrompt: 'Do you have dart boards?'
    },
    {
      id: 'game_specials',
      type: 'boolean',
      label: 'Do you have game day specials?',
      required: false,
      aiPrompt: 'Do you have specials during games?'
    },
    {
      id: 'outdoor_seating',
      type: 'boolean',
      label: 'Do you have outdoor seating?',
      required: false,
      aiPrompt: 'Do you have outdoor seating or a patio?'
    }
  ],
  followUpQuestions: [
    {
      id: 'tv_count',
      type: 'number',
      label: 'How many TVs?',
      required: false,
      validation: { min: 1, max: 20 },
      aiPrompt: 'How many TVs do you have?'
    },
    {
      id: 'favorite_teams',
      type: 'multiselect',
      label: 'Favorite teams to show',
      options: ['Broncos', 'Nuggets', 'Avalanche', 'Rockies', 'CU Buffs', 'CSU Rams'],
      required: false,
      aiPrompt: 'Which local teams do you show games for?'
    },
    {
      id: 'game_specials_details',
      type: 'text',
      label: 'Game day specials',
      placeholder: 'e.g., $2 beers during Broncos games',
      required: false,
      aiPrompt: 'What are your game day specials?'
    }
  ]
}

// All question sets
export const QUESTION_SETS: Record<BusinessType, QuestionSet> = {
  dive_bar: DIVE_BAR_QUESTIONS,
  cafe: CAFE_QUESTIONS,
  fine_dining: FINE_DINING_QUESTIONS,
  sports_bar: SPORTS_BAR_QUESTIONS,
  family_restaurant: DIVE_BAR_QUESTIONS, // Reuse dive bar for now
  brewery: DIVE_BAR_QUESTIONS, // Reuse dive bar for now
  pizzeria: DIVE_BAR_QUESTIONS, // Reuse dive bar for now
  food_truck: DIVE_BAR_QUESTIONS // Reuse dive bar for now
}

// Helper functions
export function getQuestionSet(businessType: BusinessType): QuestionSet {
  if (!businessType || typeof businessType !== 'string') {
    throw new Error('Invalid business type: must be a valid BusinessType string')
  }
  
  if (!QUESTION_SETS[businessType]) {
    throw new Error(`Invalid business type: ${businessType} is not supported`)
  }
  
  return QUESTION_SETS[businessType]
}

export function getBusinessTypeFromString(type: string): BusinessType {
  const normalized = type.toLowerCase().replace(/\s+/g, '_')
  return normalized as BusinessType
}

export function getBusinessTypeDisplayName(businessType: BusinessType): string {
  const displayNames: Record<BusinessType, string> = {
    dive_bar: 'Dive Bar',
    cafe: 'Café',
    fine_dining: 'Fine Dining',
    sports_bar: 'Sports Bar',
    family_restaurant: 'Family Restaurant',
    brewery: 'Brewery',
    pizzeria: 'Pizzeria',
    food_truck: 'Food Truck'
  }
  return displayNames[businessType]
}
