/**
 * Today Section Presets for Restaurant Variants
 * 
 * Defines daily highlights, specials, and events
 * tailored to each business type's rhythm and audience.
 */

import { BusinessVariant } from './design-tokens'

export interface TodayHighlight {
  title: string
  description: string
  time?: string
  price?: string
  image?: string
  category: 'special' | 'event' | 'feature' | 'announcement'
  urgency: 'low' | 'medium' | 'high'
}

export interface TodaySection {
  variant: BusinessVariant
  greeting: string
  highlights: TodayHighlight[]
  layout: {
    style: 'grid' | 'list' | 'carousel' | 'featured'
    maxItems: number
    showTime: boolean
    showPrice: boolean
  }
  messaging: {
    noHighlights: string
    comingSoon: string
    callToAction: string
  }
}

// Dive Bar Today Preset - Night-focused, drink specials, live events
const diveBarToday: TodaySection = {
  variant: 'dive_bar',
  greeting: "What's Happening Tonight",
  highlights: [
    {
      title: "Happy Hour All Night",
      description: "Half-price drinks until 9pm, then $2 off everything until close",
      time: "5:00 PM - Close",
      price: "50% off drinks",
      category: 'special',
      urgency: 'high'
    },
    {
      title: "Live Music: The Local Legends",
      description: "Rock covers and original songs from Denver's favorite bar band",
      time: "9:00 PM",
      price: "No cover charge",
      category: 'event',
      urgency: 'medium'
    },
    {
      title: "Wing Wednesday",
      description: "Our famous buffalo wings - 50¢ each with any drink purchase",
      time: "All day",
      price: "50¢ per wing",
      category: 'special',
      urgency: 'medium'
    },
    {
      title: "Pool Tournament",
      description: "Weekly 8-ball tournament with $100 prize pool",
      time: "8:00 PM",
      price: "$10 entry",
      category: 'event',
      urgency: 'low'
    }
  ],
  layout: {
    style: 'featured',
    maxItems: 4,
    showTime: true,
    showPrice: true
  },
  messaging: {
    noHighlights: "Come on in anyway - we always have cold beer and good company!",
    comingSoon: "Check back later for tonight's specials",
    callToAction: "See Full Menu"
  }
}

// Fine Dining Today Preset - Elegant, reservation-focused, wine events
const fineDiningToday: TodaySection = {
  variant: 'fine_dining',
  greeting: "Today's Culinary Offerings",
  highlights: [
    {
      title: "Chef's Tasting Menu",
      description: "Five-course seasonal menu featuring tonight's fresh catch and local produce",
      time: "6:00 PM - 10:00 PM",
      price: "$85 per person",
      category: 'special',
      urgency: 'high'
    },
    {
      title: "Wine Wednesday",
      description: "Sommelier-guided wine pairing with our signature dishes",
      time: "7:00 PM",
      price: "$45 wine pairing",
      category: 'event',
      urgency: 'medium'
    },
    {
      title: "Private Dining Available",
      description: "Intimate dining room available for special occasions",
      time: "By reservation",
      price: "Contact for pricing",
      category: 'feature',
      urgency: 'low'
    },
    {
      title: "Fresh Oysters",
      description: "Daily selection of East and West Coast oysters",
      time: "While supplies last",
      price: "$3 each",
      category: 'special',
      urgency: 'medium'
    }
  ],
  layout: {
    style: 'list',
    maxItems: 4,
    showTime: true,
    showPrice: true
  },
  messaging: {
    noHighlights: "Our full menu is always available with advance reservations",
    comingSoon: "Please call ahead for today's special preparations",
    callToAction: "Make Reservation"
  }
}

// Café Today Preset - Morning-focused, coffee specials, community events
const cafeToday: TodaySection = {
  variant: 'cafe',
  greeting: "Good Morning! Here's What's Fresh",
  highlights: [
    {
      title: "Morning Brew Special",
      description: "Any espresso drink with a fresh pastry for just $8",
      time: "7:00 AM - 11:00 AM",
      price: "$8 combo",
      category: 'special',
      urgency: 'high'
    },
    {
      title: "Fresh-Baked Croissants",
      description: "Buttery, flaky croissants made fresh this morning",
      time: "Available now",
      price: "$3.50 each",
      category: 'feature',
      urgency: 'medium'
    },
    {
      title: "Coffee Cupping Session",
      description: "Join us for a guided coffee tasting of our new single-origin beans",
      time: "10:00 AM",
      price: "Free with purchase",
      category: 'event',
      urgency: 'low'
    },
    {
      title: "Remote Work Special",
      description: "Unlimited coffee refills and WiFi for remote workers",
      time: "9:00 AM - 3:00 PM",
      price: "$12 all day",
      category: 'special',
      urgency: 'medium'
    }
  ],
  layout: {
    style: 'grid',
    maxItems: 4,
    showTime: true,
    showPrice: true
  },
  messaging: {
    noHighlights: "Our regular menu is always fresh and delicious!",
    comingSoon: "Check back for afternoon specials",
    callToAction: "Order Online"
  }
}

// Sports Bar Today Preset - Game-focused, group specials, sports events
const sportsBarToday: TodaySection = {
  variant: 'sports_bar',
  greeting: "Game Day Central - What's On Today",
  highlights: [
    {
      title: "Broncos vs Raiders",
      description: "Watch the game on our 20+ HD screens with sound",
      time: "1:00 PM",
      price: "No cover",
      category: 'event',
      urgency: 'high'
    },
    {
      title: "Game Day Specials",
      description: "Wings, nachos, and beer buckets at game-time prices",
      time: "12:00 PM - 6:00 PM",
      price: "20% off",
      category: 'special',
      urgency: 'high'
    },
    {
      title: "Fantasy Football League",
      description: "Join our weekly fantasy league - draft tonight at 7pm",
      time: "7:00 PM",
      price: "$25 entry",
      category: 'event',
      urgency: 'medium'
    },
    {
      title: "Group Packages",
      description: "Reserve a section for your group - includes appetizers and drinks",
      time: "Any time",
      price: "Contact for pricing",
      category: 'feature',
      urgency: 'low'
    }
  ],
  layout: {
    style: 'carousel',
    maxItems: 4,
    showTime: true,
    showPrice: true
  },
  messaging: {
    noHighlights: "All games are always on - come watch with us!",
    comingSoon: "Check back for tonight's game schedule",
    callToAction: "Book Your Table"
  }
}

// Family Restaurant Today Preset - Family-focused, meal deals, kid-friendly
const familyRestaurantToday: TodaySection = {
  variant: 'family_restaurant',
  greeting: "Welcome! Here's What's Special Today",
  highlights: [
    {
      title: "Kids Eat Free",
      description: "One free kids meal with each adult entrée purchase",
      time: "4:00 PM - 8:00 PM",
      price: "Free with adult meal",
      category: 'special',
      urgency: 'high'
    },
    {
      title: "Homestyle Breakfast All Day",
      description: "Our famous pancakes, eggs, and bacon served anytime",
      time: "All day",
      price: "Regular menu prices",
      category: 'feature',
      urgency: 'medium'
    },
    {
      title: "Senior Discount Tuesday",
      description: "15% off for seniors 65+ on all menu items",
      time: "All day",
      price: "15% off",
      category: 'special',
      urgency: 'medium'
    },
    {
      title: "Birthday Party Packages",
      description: "Celebrate your child's birthday with our special party menu",
      time: "By reservation",
      price: "Contact for pricing",
      category: 'feature',
      urgency: 'low'
    }
  ],
  layout: {
    style: 'grid',
    maxItems: 4,
    showTime: true,
    showPrice: true
  },
  messaging: {
    noHighlights: "Our full menu is always available - something for everyone!",
    comingSoon: "Check back for tomorrow's specials",
    callToAction: "View Our Menu"
  }
}

const todayPresets: Record<BusinessVariant, TodaySection> = {
  dive_bar: diveBarToday,
  fine_dining: fineDiningToday,
  cafe: cafeToday,
  sports_bar: sportsBarToday,
  family_restaurant: familyRestaurantToday
}

/**
 * Get today preset for a specific business variant
 */
export function getTodayPreset(variant: BusinessVariant): TodaySection {
  return todayPresets[variant] || cafeToday // Default to café if variant not found
}

/**
 * Get all available today presets
 */
export function getAllTodayPresets(): TodaySection[] {
  return Object.values(todayPresets)
}

/**
 * Generate time-based highlights for different times of day
 */
export function generateTimeBasedHighlights(
  variant: BusinessVariant,
  timeOfDay: 'morning' | 'afternoon' | 'evening' | 'night'
): TodayHighlight[] {
  const preset = getTodayPreset(variant)
  const timeBasedHighlights: TodayHighlight[] = []
  
  switch (variant) {
    case 'dive_bar':
      if (timeOfDay === 'evening' || timeOfDay === 'night') {
        timeBasedHighlights.push(
          {
            title: "Happy Hour Extended",
            description: "Late night specials until closing",
            time: "9:00 PM - Close",
            price: "$2 off everything",
            category: 'special',
            urgency: 'high'
          }
        )
      }
      break
      
    case 'fine_dining':
      if (timeOfDay === 'evening') {
        timeBasedHighlights.push(
          {
            title: "Sunset Wine Hour",
            description: "Complimentary wine tasting with dinner reservations",
            time: "6:00 PM - 7:00 PM",
            price: "Complimentary",
            category: 'special',
            urgency: 'medium'
          }
        )
      }
      break
      
    case 'cafe':
      if (timeOfDay === 'morning') {
        timeBasedHighlights.push(
          {
            title: "Early Bird Special",
            description: "First 20 customers get free pastry with coffee",
            time: "6:00 AM - 7:00 AM",
            price: "Free pastry",
            category: 'special',
            urgency: 'high'
          }
        )
      }
      break
      
    case 'sports_bar':
      if (timeOfDay === 'afternoon' || timeOfDay === 'evening') {
        timeBasedHighlights.push(
          {
            title: "Pre-Game Specials",
            description: "Get ready for the game with discounted apps and drinks",
            time: "2 hours before game",
            price: "25% off",
            category: 'special',
            urgency: 'high'
          }
        )
      }
      break
      
    case 'family_restaurant':
      if (timeOfDay === 'morning') {
        timeBasedHighlights.push(
          {
            title: "Breakfast Club",
            description: "Join our morning regulars for coffee and conversation",
            time: "7:00 AM - 9:00 AM",
            price: "Regular prices",
            category: 'event',
            urgency: 'low'
          }
        )
      }
      break
  }
  
  return timeBasedHighlights
}

/**
 * Customize today preset with business-specific information
 */
export function customizeTodayPreset(
  preset: TodaySection,
  customizations: {
    businessName?: string
    specialties?: string[]
    hours?: string
    location?: string
  }
): TodaySection {
  const customized = { ...preset }
  
  if (customizations.businessName) {
    customized.greeting = customized.greeting.replace(
      /What's Happening Tonight|Today's Culinary Offerings|Good Morning! Here's What's Fresh|Game Day Central - What's On Today|Welcome! Here's What's Special Today/,
      `Welcome to ${customizations.businessName}`
    )
  }
  
  if (customizations.specialties && customizations.specialties.length > 0) {
    // Add custom specialties as highlights
    const customHighlights: TodayHighlight[] = customizations.specialties.map(specialty => ({
      title: specialty,
      description: `Our signature ${specialty.toLowerCase()} - always fresh and delicious`,
      category: 'feature' as const,
      urgency: 'medium' as const
    }))
    
    customized.highlights = [...customHighlights, ...customized.highlights.slice(customHighlights.length)]
  }
  
  return customized
}

/**
 * Generate seasonal highlights based on time of year
 */
export function generateSeasonalHighlights(
  variant: BusinessVariant,
  season: 'spring' | 'summer' | 'fall' | 'winter'
): TodayHighlight[] {
  const seasonalHighlights: TodayHighlight[] = []
  
  switch (variant) {
    case 'dive_bar':
      if (season === 'summer') {
        seasonalHighlights.push({
          title: "Summer Patio Specials",
          description: "Cold beer and refreshing cocktails on our outdoor patio",
          time: "All day",
          price: "Happy hour prices",
          category: 'special',
          urgency: 'medium'
        })
      }
      break
      
    case 'fine_dining':
      if (season === 'fall') {
        seasonalHighlights.push({
          title: "Autumn Harvest Menu",
          description: "Seasonal ingredients from local farms",
          time: "Limited time",
          price: "Market price",
          category: 'special',
          urgency: 'high'
        })
      }
      break
      
    case 'cafe':
      if (season === 'winter') {
        seasonalHighlights.push({
          title: "Winter Warmers",
          description: "Hot chocolate, spiced lattes, and warm pastries",
          time: "All day",
          price: "Regular prices",
          category: 'special',
          urgency: 'medium'
        })
      }
      break
      
    case 'sports_bar':
      if (season === 'fall') {
        seasonalHighlights.push({
          title: "Football Season Specials",
          description: "Game day packages for every NFL game",
          time: "Game days",
          price: "Group rates available",
          category: 'special',
          urgency: 'high'
        })
      }
      break
      
    case 'family_restaurant':
      if (season === 'summer') {
        seasonalHighlights.push({
          title: "Summer Family Fun",
          description: "Kids' activities and family-friendly specials",
          time: "Weekends",
          price: "Family packages",
          category: 'special',
          urgency: 'medium'
        })
      }
      break
  }
  
  return seasonalHighlights
}

/**
 * Validate today preset for completeness and quality
 */
export function validateTodayPreset(preset: TodaySection): {
  isValid: boolean
  issues: string[]
  suggestions: string[]
} {
  const issues: string[] = []
  const suggestions: string[] = []
  
  // Check content completeness
  if (!preset.greeting || preset.greeting.length < 5) {
    issues.push('Greeting is too short or missing')
  }
  
  if (!preset.highlights || preset.highlights.length === 0) {
    issues.push('No highlights provided')
  }
  
  if (preset.highlights.length < 2) {
    suggestions.push('Consider adding more highlights for better engagement')
  }
  
  // Check highlight quality
  preset.highlights.forEach((highlight, index) => {
    if (!highlight.title || highlight.title.length < 3) {
      issues.push(`Highlight ${index + 1}: Title is too short`)
    }
    
    if (!highlight.description || highlight.description.length < 10) {
      issues.push(`Highlight ${index + 1}: Description is too short`)
    }
    
    if (preset.layout.showTime && !highlight.time) {
      suggestions.push(`Highlight ${index + 1}: Consider adding time information`)
    }
    
    if (preset.layout.showPrice && !highlight.price) {
      suggestions.push(`Highlight ${index + 1}: Consider adding price information`)
    }
  })
  
  // Check layout consistency
  if (preset.layout.maxItems < preset.highlights.length) {
    suggestions.push('Consider increasing maxItems or reducing highlights')
  }
  
  return {
    isValid: issues.length === 0,
    issues,
    suggestions
  }
}
