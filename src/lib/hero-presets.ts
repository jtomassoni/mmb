/**
 * Hero Section Presets for Restaurant Variants
 * 
 * Defines content templates, layouts, and messaging
 * for Hero sections tailored to each business type.
 */

import { BusinessVariant } from './design-tokens'

export interface HeroContent {
  headline: string
  subheadline: string
  callToAction: {
    primary: string
    secondary?: string
  }
  description: string
  features: string[]
  socialProof?: string
}

export interface HeroLayout {
  imagePosition: 'left' | 'right' | 'center' | 'background'
  textAlignment: 'left' | 'center' | 'right'
  imageStyle: 'rounded' | 'square' | 'full-width' | 'overlay'
  buttonStyle: 'primary' | 'secondary' | 'outline' | 'ghost'
  spacing: 'compact' | 'comfortable' | 'spacious'
}

export interface HeroPreset {
  variant: BusinessVariant
  content: HeroContent
  layout: HeroLayout
  imageSuggestions: string[]
  colorScheme: {
    primary: string
    secondary: string
    accent: string
    background: string
  }
  typography: {
    headlineSize: 'sm' | 'md' | 'lg' | 'xl'
    subheadlineSize: 'xs' | 'sm' | 'md' | 'lg'
    bodySize: 'xs' | 'sm' | 'md'
  }
}

// Dive Bar Hero Preset - Bold, energetic, local focus
const diveBarHero: HeroPreset = {
  variant: 'dive_bar',
  content: {
    headline: "Where Locals Come to Unwind",
    subheadline: "Cold Beer • Hot Food • Great Times",
    callToAction: {
      primary: "See What's On Tap",
      secondary: "Check Out Our Specials"
    },
    description: "Your neighborhood's favorite spot for cold drinks, hot food, and unforgettable nights. We've been serving the community for years with the coldest beer, hottest wings, and the friendliest faces in town.",
    features: [
      "Ice-cold beer on tap",
      "Best wings in the neighborhood", 
      "Pool tables & dart boards",
      "Live music every weekend",
      "Late night kitchen until 2am"
    ],
    socialProof: "Join 500+ locals who call this place home"
  },
  layout: {
    imagePosition: 'right',
    textAlignment: 'left',
    imageStyle: 'rounded',
    buttonStyle: 'primary',
    spacing: 'comfortable'
  },
  imageSuggestions: [
    "crowded-bar-interior-with-pool-tables",
    "beer-taps-and-bar-counter",
    "group-of-friends-laughing-at-bar",
    "wings-and-beer-on-table",
    "live-music-performance"
  ],
  colorScheme: {
    primary: '#dc2626',
    secondary: '#64748b',
    accent: '#d97706',
    background: '#fef2f2'
  },
  typography: {
    headlineSize: 'xl',
    subheadlineSize: 'lg',
    bodySize: 'md'
  }
}

// Fine Dining Hero Preset - Elegant, sophisticated, premium
const fineDiningHero: HeroPreset = {
  variant: 'fine_dining',
  content: {
    headline: "An Exquisite Culinary Experience",
    subheadline: "Artisanal Cuisine • Curated Wine • Impeccable Service",
    callToAction: {
      primary: "Reserve Your Table",
      secondary: "View Our Menu"
    },
    description: "Indulge in a world-class dining experience where culinary artistry meets exceptional service. Our chef-driven menu features locally sourced ingredients, expertly prepared and beautifully presented in an elegant atmosphere.",
    features: [
      "Chef-driven seasonal menu",
      "Extensive wine collection",
      "Private dining rooms available",
      "Sommelier-guided wine pairings",
      "Farm-to-table ingredients"
    ],
    socialProof: "Awarded Best Fine Dining 2024"
  },
  layout: {
    imagePosition: 'left',
    textAlignment: 'left',
    imageStyle: 'square',
    buttonStyle: 'primary',
    spacing: 'spacious'
  },
  imageSuggestions: [
    "elegant-dining-room-with-chandeliers",
    "artfully-plated-gourmet-dish",
    "wine-sommelier-pouring-glass",
    "chef-in-kitchen-preparing-food",
    "couple-enjoying-romantic-dinner"
  ],
  colorScheme: {
    primary: '#64748b',
    secondary: '#eab308',
    accent: '#d946ef',
    background: '#f8fafc'
  },
  typography: {
    headlineSize: 'lg',
    subheadlineSize: 'md',
    bodySize: 'sm'
  }
}

// Café Hero Preset - Warm, welcoming, community-focused
const cafeHero: HeroPreset = {
  variant: 'cafe',
  content: {
    headline: "Your Daily Dose of Comfort",
    subheadline: "Fresh Coffee • Homemade Pastries • Cozy Vibes",
    callToAction: {
      primary: "Order Online",
      secondary: "Visit Us Today"
    },
    description: "Start your day right with our freshly roasted coffee, homemade pastries, and warm atmosphere. Whether you're grabbing a quick cup or settling in for a leisurely morning, we're here to fuel your day.",
    features: [
      "Freshly roasted coffee beans",
      "Homemade pastries daily",
      "Free WiFi for remote work",
      "Outdoor seating available",
      "Local art on display"
    ],
    socialProof: "Rated 4.9/5 by 200+ coffee lovers"
  },
  layout: {
    imagePosition: 'center',
    textAlignment: 'center',
    imageStyle: 'rounded',
    buttonStyle: 'primary',
    spacing: 'comfortable'
  },
  imageSuggestions: [
    "cozy-cafe-interior-with-wooden-tables",
    "barista-pouring-latte-art",
    "fresh-pastries-on-display",
    "person-working-on-laptop-in-cafe",
    "outdoor-cafe-seating"
  ],
  colorScheme: {
    primary: '#0ea5e9',
    secondary: '#f97316',
    accent: '#22c55e',
    background: '#f0f9ff'
  },
  typography: {
    headlineSize: 'lg',
    subheadlineSize: 'md',
    bodySize: 'md'
  }
}

// Sports Bar Hero Preset - Energetic, game-focused, group-friendly
const sportsBarHero: HeroPreset = {
  variant: 'sports_bar',
  content: {
    headline: "Game Day Headquarters",
    subheadline: "Big Screens • Cold Beer • Winning Food",
    callToAction: {
      primary: "Book Your Table",
      secondary: "See Game Schedule"
    },
    description: "The ultimate destination for sports fans! Catch every game on our massive screens while enjoying ice-cold beer, mouthwatering wings, and the electric atmosphere that makes every game feel like a championship.",
    features: [
      "20+ HD screens showing all games",
      "Ice-cold beer on tap",
      "Game day specials",
      "Private party rooms",
      "Fantasy sports leagues"
    ],
    socialProof: "Home of the Broncos Fan Club"
  },
  layout: {
    imagePosition: 'background',
    textAlignment: 'center',
    imageStyle: 'full-width',
    buttonStyle: 'primary',
    spacing: 'spacious'
  },
  imageSuggestions: [
    "crowded-sports-bar-with-tv-screens",
    "fans-cheering-at-big-screen",
    "beer-and-wings-on-table",
    "sports-jerseys-on-wall",
    "group-watching-game-together"
  ],
  colorScheme: {
    primary: '#3b82f6',
    secondary: '#ef4444',
    accent: '#eab308',
    background: '#eff6ff'
  },
  typography: {
    headlineSize: 'xl',
    subheadlineSize: 'lg',
    bodySize: 'md'
  }
}

// Family Restaurant Hero Preset - Welcoming, inclusive, family-friendly
const familyRestaurantHero: HeroPreset = {
  variant: 'family_restaurant',
  content: {
    headline: "Where Families Come Together",
    subheadline: "Homestyle Cooking • Kid-Friendly • Always Welcoming",
    callToAction: {
      primary: "View Our Menu",
      secondary: "Make a Reservation"
    },
    description: "Welcome to your home away from home! We serve up hearty, homestyle meals that bring families together. From our famous breakfast to our comforting dinners, every dish is made with love and served with a smile.",
    features: [
      "Homestyle breakfast all day",
      "Kid-friendly menu options",
      "Gluten-free and vegetarian choices",
      "Large portions, fair prices",
      "Birthday party packages"
    ],
    socialProof: "Serving families for over 20 years"
  },
  layout: {
    imagePosition: 'left',
    textAlignment: 'left',
    imageStyle: 'rounded',
    buttonStyle: 'primary',
    spacing: 'comfortable'
  },
  imageSuggestions: [
    "family-enjoying-meal-together",
    "homestyle-breakfast-plate",
    "kids-menu-items",
    "cozy-restaurant-interior",
    "birthday-party-celebration"
  ],
  colorScheme: {
    primary: '#22c55e',
    secondary: '#d97706',
    accent: '#ef4444',
    background: '#f0fdf4'
  },
  typography: {
    headlineSize: 'lg',
    subheadlineSize: 'md',
    bodySize: 'md'
  }
}

const heroPresets: Record<BusinessVariant, HeroPreset> = {
  dive_bar: diveBarHero,
  fine_dining: fineDiningHero,
  cafe: cafeHero,
  sports_bar: sportsBarHero,
  family_restaurant: familyRestaurantHero
}

/**
 * Get hero preset for a specific business variant
 */
export function getHeroPreset(variant: BusinessVariant): HeroPreset {
  return heroPresets[variant] || cafeHero // Default to café if variant not found
}

/**
 * Get all available hero presets
 */
export function getAllHeroPresets(): HeroPreset[] {
  return Object.values(heroPresets)
}

/**
 * Customize hero preset with business-specific information
 */
export function customizeHeroPreset(
  preset: HeroPreset,
  customizations: {
    businessName?: string
    location?: string
    specialties?: string[]
    hours?: string
    phone?: string
  }
): HeroPreset {
  const customized = { ...preset }
  
  if (customizations.businessName) {
    // Replace generic headlines with business name
    customized.content.headline = customized.content.headline.replace(
      /Where Locals Come to Unwind|An Exquisite Culinary Experience|Your Daily Dose of Comfort|Game Day Headquarters|Where Families Come Together/,
      `${customizations.businessName}`
    )
  }
  
  if (customizations.location) {
    customized.content.description = customized.content.description.replace(
      /the community|the neighborhood|your day|every game|families/,
      `${customizations.location}`
    )
  }
  
  if (customizations.specialties && customizations.specialties.length > 0) {
    customized.content.features = [
      ...customizations.specialties.slice(0, 3),
      ...customized.content.features.slice(3)
    ]
  }
  
  return customized
}

/**
 * Generate hero content variations for A/B testing
 */
export function generateHeroVariations(preset: HeroPreset): HeroPreset[] {
  const variations: HeroPreset[] = []
  
  // Variation 1: Different headline focus
  const variation1 = { ...preset }
  switch (preset.variant) {
    case 'dive_bar':
      variation1.content.headline = "The Neighborhood's Best Kept Secret"
      break
    case 'fine_dining':
      variation1.content.headline = "Culinary Excellence Awaits"
      break
    case 'cafe':
      variation1.content.headline = "Coffee That Makes Your Morning"
      break
    case 'sports_bar':
      variation1.content.headline = "Every Game, Every Win, Every Cheer"
      break
    case 'family_restaurant':
      variation1.content.headline = "Memories Made Over Meals"
      break
  }
  variations.push(variation1)
  
  // Variation 2: Different call-to-action
  const variation2 = { ...preset }
  switch (preset.variant) {
    case 'dive_bar':
      variation2.content.callToAction.primary = "Join Us Tonight"
      break
    case 'fine_dining':
      variation2.content.callToAction.primary = "Experience Excellence"
      break
    case 'cafe':
      variation2.content.callToAction.primary = "Start Your Day Here"
      break
    case 'sports_bar':
      variation2.content.callToAction.primary = "Watch the Game"
      break
    case 'family_restaurant':
      variation2.content.callToAction.primary = "Bring the Family"
      break
  }
  variations.push(variation2)
  
  // Variation 3: Different layout
  const variation3 = { ...preset }
  variation3.layout.imagePosition = preset.layout.imagePosition === 'left' ? 'right' : 'left'
  variations.push(variation3)
  
  return variations
}

/**
 * Validate hero preset for completeness and quality
 */
export function validateHeroPreset(preset: HeroPreset): {
  isValid: boolean
  issues: string[]
  suggestions: string[]
} {
  const issues: string[] = []
  const suggestions: string[] = []
  
  // Check content completeness
  if (!preset.content.headline || preset.content.headline.length < 10) {
    issues.push('Headline is too short or missing')
  }
  
  if (!preset.content.subheadline || preset.content.subheadline.length < 5) {
    issues.push('Subheadline is too short or missing')
  }
  
  if (!preset.content.callToAction.primary) {
    issues.push('Primary call-to-action is missing')
  }
  
  if (!preset.content.description || preset.content.description.length < 50) {
    issues.push('Description is too short or missing')
  }
  
  if (!preset.content.features || preset.content.features.length < 3) {
    issues.push('Features list is too short')
  }
  
  // Check layout consistency
  if (preset.layout.imagePosition === 'background' && preset.layout.textAlignment !== 'center') {
    suggestions.push('Consider center alignment for background images')
  }
  
  if (preset.layout.spacing === 'compact' && preset.typography.headlineSize === 'xl') {
    suggestions.push('Consider smaller headline size for compact spacing')
  }
  
  // Check color scheme accessibility
  const contrastIssues = checkColorContrast(preset.colorScheme)
  issues.push(...contrastIssues)
  
  return {
    isValid: issues.length === 0,
    issues,
    suggestions
  }
}

/**
 * Check color contrast for accessibility
 */
function checkColorContrast(colorScheme: HeroPreset['colorScheme']): string[] {
  const issues: string[] = []
  
  // Basic contrast checks (simplified)
  if (colorScheme.primary === colorScheme.background) {
    issues.push('Primary color should contrast with background')
  }
  
  if (colorScheme.secondary === colorScheme.primary) {
    issues.push('Secondary color should differ from primary')
  }
  
  return issues
}

/**
 * Get hero preset recommendations based on business characteristics
 */
export function getHeroRecommendations(businessType: string, characteristics: string[]): {
  recommendedVariant: BusinessVariant
  reasoning: string
  alternatives: BusinessVariant[]
} {
  const typeMap: Record<string, BusinessVariant> = {
    'bar': 'dive_bar',
    'pub': 'dive_bar',
    'tavern': 'dive_bar',
    'restaurant': 'fine_dining',
    'bistro': 'fine_dining',
    'cafe': 'cafe',
    'coffee': 'cafe',
    'sports': 'sports_bar',
    'family': 'family_restaurant',
    'diner': 'family_restaurant'
  }
  
  let recommendedVariant: BusinessVariant = 'cafe' // Default
  let reasoning = 'General café style suitable for most businesses'
  
  // Check for exact matches
  for (const [type, variant] of Object.entries(typeMap)) {
    if (businessType.toLowerCase().includes(type)) {
      recommendedVariant = variant
      reasoning = `Matches ${type} business type`
      break
    }
  }
  
  // Check characteristics for refinement
  if (characteristics.some(c => c.includes('elegant') || c.includes('upscale'))) {
    recommendedVariant = 'fine_dining'
    reasoning = 'Elegant characteristics suggest fine dining style'
  } else if (characteristics.some(c => c.includes('family') || c.includes('kids'))) {
    recommendedVariant = 'family_restaurant'
    reasoning = 'Family-focused characteristics suggest family restaurant style'
  } else if (characteristics.some(c => c.includes('sports') || c.includes('games'))) {
    recommendedVariant = 'sports_bar'
    reasoning = 'Sports-focused characteristics suggest sports bar style'
  }
  
  const alternatives = Object.keys(heroPresets).filter(v => v !== recommendedVariant) as BusinessVariant[]
  
  return {
    recommendedVariant,
    reasoning,
    alternatives
  }
}
