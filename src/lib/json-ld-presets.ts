/**
 * JSON-LD Structured Data Presets for Restaurant Variants
 * 
 * Defines schema.org structured data templates tailored to each business type
 * for improved SEO and rich snippets in search results.
 */

import { BusinessVariant } from './design-tokens'

export interface BusinessInfo {
  name: string
  description: string
  url: string
  logo?: string
  image?: string
  telephone?: string
  email?: string
  address: {
    streetAddress: string
    addressLocality: string
    addressRegion: string
    postalCode: string
    addressCountry: string
  }
  geo?: {
    latitude: number
    longitude: number
  }
  openingHours?: string[]
  priceRange?: string
  servesCuisine?: string[]
  acceptsReservations?: boolean
  hasMenu?: string
  paymentAccepted?: string[]
  currenciesAccepted?: string[]
}

export interface JsonLdPreset {
  variant: BusinessVariant
  schemaType: string
  baseSchema: any
  additionalSchemas: any[]
  requiredFields: string[]
  optionalFields: string[]
  variantSpecificFields: Record<string, any>
}

// Dive Bar JSON-LD Preset - Focus on bar services, entertainment, local community
const diveBarJsonLd: JsonLdPreset = {
  variant: 'dive_bar',
  schemaType: 'BarOrPub',
  baseSchema: {
    '@context': 'https://schema.org',
    '@type': 'BarOrPub',
    'name': '',
    'description': '',
    'url': '',
    'address': {
      '@type': 'PostalAddress',
      'streetAddress': '',
      'addressLocality': '',
      'addressRegion': '',
      'postalCode': '',
      'addressCountry': ''
    },
    'telephone': '',
    'openingHours': [],
    'priceRange': '$',
    'servesCuisine': ['American', 'Bar Food'],
    'acceptsReservations': false,
    'paymentAccepted': ['Cash', 'Credit Card'],
    'currenciesAccepted': 'USD',
    'amenityFeature': [
      {
        '@type': 'LocationFeatureSpecification',
        'name': 'Pool Tables',
        'value': true
      },
      {
        '@type': 'LocationFeatureSpecification',
        'name': 'Dart Boards',
        'value': true
      },
      {
        '@type': 'LocationFeatureSpecification',
        'name': 'Live Music',
        'value': true
      },
      {
        '@type': 'LocationFeatureSpecification',
        'name': 'Late Night Kitchen',
        'value': true
      }
    ],
    'hasMenu': '',
    'aggregateRating': {
      '@type': 'AggregateRating',
      'ratingValue': '4.5',
      'reviewCount': '150',
      'bestRating': '5',
      'worstRating': '1'
    }
  },
  additionalSchemas: [
    {
      '@context': 'https://schema.org',
      '@type': 'Event',
      'name': 'Live Music Night',
      'description': 'Weekly live music performances',
      'startDate': '2024-01-01T21:00:00',
      'endDate': '2024-01-01T23:00:00',
      'location': {
        '@type': 'Place',
        'name': '',
        'address': {
          '@type': 'PostalAddress',
          'streetAddress': '',
          'addressLocality': '',
          'addressRegion': '',
          'postalCode': '',
          'addressCountry': ''
        }
      },
      'organizer': {
        '@type': 'Organization',
        'name': ''
      },
      'offers': {
        '@type': 'Offer',
        'price': '0',
        'priceCurrency': 'USD',
        'availability': 'https://schema.org/InStock'
      }
    }
  ],
  requiredFields: ['name', 'description', 'url', 'address', 'telephone'],
  optionalFields: ['logo', 'image', 'email', 'geo', 'openingHours', 'hasMenu'],
  variantSpecificFields: {
    'barType': 'Dive Bar',
    'atmosphere': 'Casual',
    'targetAudience': 'Local Community',
    'specialFeatures': ['Pool Tables', 'Dart Boards', 'Live Music', 'Late Night Food'],
    'typicalHours': '4:00 PM - 2:00 AM',
    'dressCode': 'Casual',
    'ageRestriction': '21+',
    'groupFriendly': true,
    'sportsViewing': false,
    'familyFriendly': false
  }
}

// Fine Dining JSON-LD Preset - Focus on culinary excellence, reservations, wine
const fineDiningJsonLd: JsonLdPreset = {
  variant: 'fine_dining',
  schemaType: 'Restaurant',
  baseSchema: {
    '@context': 'https://schema.org',
    '@type': 'Restaurant',
    'name': '',
    'description': '',
    'url': '',
    'address': {
      '@type': 'PostalAddress',
      'streetAddress': '',
      'addressLocality': '',
      'addressRegion': '',
      'postalCode': '',
      'addressCountry': ''
    },
    'telephone': '',
    'openingHours': [],
    'priceRange': '$$$$',
    'servesCuisine': ['Contemporary', 'Fine Dining'],
    'acceptsReservations': true,
    'paymentAccepted': ['Credit Card', 'Debit Card'],
    'currenciesAccepted': 'USD',
    'amenityFeature': [
      {
        '@type': 'LocationFeatureSpecification',
        'name': 'Private Dining Rooms',
        'value': true
      },
      {
        '@type': 'LocationFeatureSpecification',
        'name': 'Wine Cellar',
        'value': true
      },
      {
        '@type': 'LocationFeatureSpecification',
        'name': 'Sommelier Service',
        'value': true
      },
      {
        '@type': 'LocationFeatureSpecification',
        'name': 'Chef\'s Table',
        'value': true
      }
    ],
    'hasMenu': '',
    'aggregateRating': {
      '@type': 'AggregateRating',
      'ratingValue': '4.8',
      'reviewCount': '200',
      'bestRating': '5',
      'worstRating': '1'
    },
    'makesOffer': [
      {
        '@type': 'Offer',
        'name': 'Chef\'s Tasting Menu',
        'description': 'Five-course seasonal menu',
        'price': '85',
        'priceCurrency': 'USD'
      },
      {
        '@type': 'Offer',
        'name': 'Wine Pairing',
        'description': 'Sommelier-guided wine pairing',
        'price': '45',
        'priceCurrency': 'USD'
      }
    ]
  },
  additionalSchemas: [
    {
      '@context': 'https://schema.org',
      '@type': 'Person',
      'name': 'Executive Chef',
      'jobTitle': 'Chef',
      'worksFor': {
        '@type': 'Restaurant',
        'name': ''
      },
      'description': 'Award-winning chef with expertise in contemporary cuisine'
    },
    {
      '@context': 'https://schema.org',
      '@type': 'Person',
      'name': 'Head Sommelier',
      'jobTitle': 'Sommelier',
      'worksFor': {
        '@type': 'Restaurant',
        'name': ''
      },
      'description': 'Certified sommelier with extensive wine knowledge'
    }
  ],
  requiredFields: ['name', 'description', 'url', 'address', 'telephone', 'acceptsReservations'],
  optionalFields: ['logo', 'image', 'email', 'geo', 'openingHours', 'hasMenu', 'makesOffer'],
  variantSpecificFields: {
    'restaurantType': 'Fine Dining',
    'atmosphere': 'Elegant',
    'targetAudience': 'Upscale Diners',
    'specialFeatures': ['Private Dining', 'Wine Cellar', 'Sommelier', 'Chef\'s Table'],
    'typicalHours': '5:00 PM - 10:00 PM',
    'dressCode': 'Business Casual to Formal',
    'ageRestriction': 'All Ages',
    'groupFriendly': true,
    'sportsViewing': false,
    'familyFriendly': false,
    'reservationRequired': true,
    'averageMealDuration': '2-3 hours'
  }
}

// Café JSON-LD Preset - Focus on coffee, pastries, community, remote work
const cafeJsonLd: JsonLdPreset = {
  variant: 'cafe',
  schemaType: 'CafeOrCoffeeShop',
  baseSchema: {
    '@context': 'https://schema.org',
    '@type': 'CafeOrCoffeeShop',
    'name': '',
    'description': '',
    'url': '',
    'address': {
      '@type': 'PostalAddress',
      'streetAddress': '',
      'addressLocality': '',
      'addressRegion': '',
      'postalCode': '',
      'addressCountry': ''
    },
    'telephone': '',
    'openingHours': [],
    'priceRange': '$$',
    'servesCuisine': ['Coffee', 'Pastries', 'Light Meals'],
    'acceptsReservations': false,
    'paymentAccepted': ['Cash', 'Credit Card', 'Mobile Payment'],
    'currenciesAccepted': 'USD',
    'amenityFeature': [
      {
        '@type': 'LocationFeatureSpecification',
        'name': 'Free WiFi',
        'value': true
      },
      {
        '@type': 'LocationFeatureSpecification',
        'name': 'Outdoor Seating',
        'value': true
      },
      {
        '@type': 'LocationFeatureSpecification',
        'name': 'Pet Friendly',
        'value': true
      },
      {
        '@type': 'LocationFeatureSpecification',
        'name': 'Remote Work Friendly',
        'value': true
      }
    ],
    'hasMenu': '',
    'aggregateRating': {
      '@type': 'AggregateRating',
      'ratingValue': '4.6',
      'reviewCount': '180',
      'bestRating': '5',
      'worstRating': '1'
    },
    'makesOffer': [
      {
        '@type': 'Offer',
        'name': 'Coffee and Pastry Combo',
        'description': 'Any espresso drink with a fresh pastry',
        'price': '8',
        'priceCurrency': 'USD'
      },
      {
        '@type': 'Offer',
        'name': 'Remote Work Special',
        'description': 'Unlimited coffee refills and WiFi',
        'price': '12',
        'priceCurrency': 'USD'
      }
    ]
  },
  additionalSchemas: [
    {
      '@context': 'https://schema.org',
      '@type': 'Event',
      'name': 'Coffee Cupping Session',
      'description': 'Guided coffee tasting of single-origin beans',
      'startDate': '2024-01-01T10:00:00',
      'endDate': '2024-01-01T11:00:00',
      'location': {
        '@type': 'Place',
        'name': '',
        'address': {
          '@type': 'PostalAddress',
          'streetAddress': '',
          'addressLocality': '',
          'addressRegion': '',
          'postalCode': '',
          'addressCountry': ''
        }
      },
      'organizer': {
        '@type': 'Organization',
        'name': ''
      },
      'offers': {
        '@type': 'Offer',
        'price': '0',
        'priceCurrency': 'USD',
        'availability': 'https://schema.org/InStock'
      }
    }
  ],
  requiredFields: ['name', 'description', 'url', 'address', 'telephone'],
  optionalFields: ['logo', 'image', 'email', 'geo', 'openingHours', 'hasMenu', 'makesOffer'],
  variantSpecificFields: {
    'cafeType': 'Coffee Shop',
    'atmosphere': 'Cozy',
    'targetAudience': 'Coffee Lovers, Remote Workers',
    'specialFeatures': ['Free WiFi', 'Outdoor Seating', 'Pet Friendly', 'Remote Work'],
    'typicalHours': '6:00 AM - 6:00 PM',
    'dressCode': 'Casual',
    'ageRestriction': 'All Ages',
    'groupFriendly': true,
    'sportsViewing': false,
    'familyFriendly': true,
    'reservationRequired': false,
    'averageMealDuration': '30-60 minutes',
    'wifiAvailable': true,
    'outdoorSeating': true
  }
}

// Sports Bar JSON-LD Preset - Focus on sports viewing, group events, game day specials
const sportsBarJsonLd: JsonLdPreset = {
  variant: 'sports_bar',
  schemaType: 'BarOrPub',
  baseSchema: {
    '@context': 'https://schema.org',
    '@type': 'BarOrPub',
    'name': '',
    'description': '',
    'url': '',
    'address': {
      '@type': 'PostalAddress',
      'streetAddress': '',
      'addressLocality': '',
      'addressRegion': '',
      'postalCode': '',
      'addressCountry': ''
    },
    'telephone': '',
    'openingHours': [],
    'priceRange': '$$',
    'servesCuisine': ['American', 'Sports Bar Food'],
    'acceptsReservations': true,
    'paymentAccepted': ['Cash', 'Credit Card'],
    'currenciesAccepted': 'USD',
    'amenityFeature': [
      {
        '@type': 'LocationFeatureSpecification',
        'name': 'HD TV Screens',
        'value': true
      },
      {
        '@type': 'LocationFeatureSpecification',
        'name': 'Sports Viewing',
        'value': true
      },
      {
        '@type': 'LocationFeatureSpecification',
        'name': 'Group Packages',
        'value': true
      },
      {
        '@type': 'LocationFeatureSpecification',
        'name': 'Fantasy Sports',
        'value': true
      }
    ],
    'hasMenu': '',
    'aggregateRating': {
      '@type': 'AggregateRating',
      'ratingValue': '4.4',
      'reviewCount': '120',
      'bestRating': '5',
      'worstRating': '1'
    },
    'makesOffer': [
      {
        '@type': 'Offer',
        'name': 'Game Day Specials',
        'description': 'Wings, nachos, and beer buckets',
        'price': '25',
        'priceCurrency': 'USD'
      },
      {
        '@type': 'Offer',
        'name': 'Group Packages',
        'description': 'Reserve a section for your group',
        'price': '150',
        'priceCurrency': 'USD'
      }
    ]
  },
  additionalSchemas: [
    {
      '@context': 'https://schema.org',
      '@type': 'Event',
      'name': 'Fantasy Football League',
      'description': 'Weekly fantasy football league',
      'startDate': '2024-01-01T19:00:00',
      'endDate': '2024-01-01T21:00:00',
      'location': {
        '@type': 'Place',
        'name': '',
        'address': {
          '@type': 'PostalAddress',
          'streetAddress': '',
          'addressLocality': '',
          'addressRegion': '',
          'postalCode': '',
          'addressCountry': ''
        }
      },
      'organizer': {
        '@type': 'Organization',
        'name': ''
      },
      'offers': {
        '@type': 'Offer',
        'price': '25',
        'priceCurrency': 'USD',
        'availability': 'https://schema.org/InStock'
      }
    }
  ],
  requiredFields: ['name', 'description', 'url', 'address', 'telephone'],
  optionalFields: ['logo', 'image', 'email', 'geo', 'openingHours', 'hasMenu', 'makesOffer'],
  variantSpecificFields: {
    'barType': 'Sports Bar',
    'atmosphere': 'Energetic',
    'targetAudience': 'Sports Fans',
    'specialFeatures': ['HD TV Screens', 'Sports Viewing', 'Group Packages', 'Fantasy Sports'],
    'typicalHours': '11:00 AM - 1:00 AM',
    'dressCode': 'Casual',
    'ageRestriction': '21+',
    'groupFriendly': true,
    'sportsViewing': true,
    'familyFriendly': false,
    'reservationRequired': false,
    'averageMealDuration': '1-2 hours',
    'tvScreens': '20+',
    'sportsChannels': 'All Major Networks'
  }
}

// Family Restaurant JSON-LD Preset - Focus on family-friendly dining, kids menu, homestyle cooking
const familyRestaurantJsonLd: JsonLdPreset = {
  variant: 'family_restaurant',
  schemaType: 'Restaurant',
  baseSchema: {
    '@context': 'https://schema.org',
    '@type': 'Restaurant',
    'name': '',
    'description': '',
    'url': '',
    'address': {
      '@type': 'PostalAddress',
      'streetAddress': '',
      'addressLocality': '',
      'addressRegion': '',
      'postalCode': '',
      'addressCountry': ''
    },
    'telephone': '',
    'openingHours': [],
    'priceRange': '$$',
    'servesCuisine': ['American', 'Homestyle', 'Family'],
    'acceptsReservations': true,
    'paymentAccepted': ['Cash', 'Credit Card'],
    'currenciesAccepted': 'USD',
    'amenityFeature': [
      {
        '@type': 'LocationFeatureSpecification',
        'name': 'Kids Menu',
        'value': true
      },
      {
        '@type': 'LocationFeatureSpecification',
        'name': 'High Chairs',
        'value': true
      },
      {
        '@type': 'LocationFeatureSpecification',
        'name': 'Birthday Parties',
        'value': true
      },
      {
        '@type': 'LocationFeatureSpecification',
        'name': 'Gluten-Free Options',
        'value': true
      }
    ],
    'hasMenu': '',
    'aggregateRating': {
      '@type': 'AggregateRating',
      'ratingValue': '4.3',
      'reviewCount': '250',
      'bestRating': '5',
      'worstRating': '1'
    },
    'makesOffer': [
      {
        '@type': 'Offer',
        'name': 'Kids Eat Free',
        'description': 'One free kids meal with adult entrée',
        'price': '0',
        'priceCurrency': 'USD'
      },
      {
        '@type': 'Offer',
        'name': 'Birthday Party Package',
        'description': 'Special birthday celebration package',
        'price': '50',
        'priceCurrency': 'USD'
      }
    ]
  },
  additionalSchemas: [
    {
      '@context': 'https://schema.org',
      '@type': 'Menu',
      'name': 'Kids Menu',
      'description': 'Child-friendly menu options',
      'hasMenuSection': [
        {
          '@type': 'MenuSection',
          'name': 'Kids Entrees',
          'description': 'Main courses for children'
        },
        {
          '@type': 'MenuSection',
          'name': 'Kids Desserts',
          'description': 'Sweet treats for children'
        }
      ]
    }
  ],
  requiredFields: ['name', 'description', 'url', 'address', 'telephone'],
  optionalFields: ['logo', 'image', 'email', 'geo', 'openingHours', 'hasMenu', 'makesOffer'],
  variantSpecificFields: {
    'restaurantType': 'Family Restaurant',
    'atmosphere': 'Welcoming',
    'targetAudience': 'Families',
    'specialFeatures': ['Kids Menu', 'High Chairs', 'Birthday Parties', 'Gluten-Free'],
    'typicalHours': '7:00 AM - 9:00 PM',
    'dressCode': 'Casual',
    'ageRestriction': 'All Ages',
    'groupFriendly': true,
    'sportsViewing': false,
    'familyFriendly': true,
    'reservationRequired': false,
    'averageMealDuration': '45-90 minutes',
    'kidsMenu': true,
    'highChairs': true,
    'birthdayParties': true
  }
}

const jsonLdPresets: Record<BusinessVariant, JsonLdPreset> = {
  dive_bar: diveBarJsonLd,
  fine_dining: fineDiningJsonLd,
  cafe: cafeJsonLd,
  sports_bar: sportsBarJsonLd,
  family_restaurant: familyRestaurantJsonLd
}

/**
 * Get JSON-LD preset for a specific business variant
 */
export function getJsonLdPreset(variant: BusinessVariant): JsonLdPreset {
  return jsonLdPresets[variant] || cafeJsonLd // Default to café if variant not found
}

/**
 * Get all available JSON-LD presets
 */
export function getAllJsonLdPresets(): JsonLdPreset[] {
  return Object.values(jsonLdPresets)
}

/**
 * Generate complete JSON-LD structured data for a business
 */
export function generateJsonLd(
  variant: BusinessVariant,
  businessInfo: BusinessInfo,
  customFields?: Record<string, any>
): any[] {
  const preset = getJsonLdPreset(variant)
  const structuredData: any[] = []
  
  // Generate base schema
  const baseSchema = { ...preset.baseSchema }
  
  // Fill in business information
  Object.keys(businessInfo).forEach(key => {
    if (businessInfo[key as keyof BusinessInfo] !== undefined) {
      if (key === 'address') {
        baseSchema.address = {
          '@type': 'PostalAddress',
          ...businessInfo.address
        }
      } else if (key === 'geo') {
        baseSchema.geo = {
          '@type': 'GeoCoordinates',
          ...businessInfo.geo
        }
      } else {
        baseSchema[key] = businessInfo[key as keyof BusinessInfo]
      }
    }
  })
  
  // Add custom fields
  if (customFields) {
    Object.assign(baseSchema, customFields)
  }
  
  // Add variant-specific fields
  Object.assign(baseSchema, preset.variantSpecificFields)
  
  structuredData.push(baseSchema)
  
  // Add additional schemas
  preset.additionalSchemas.forEach(schema => {
    const additionalSchema = { ...schema }
    
    // Fill in business name where needed
    if (additionalSchema.organizer?.name === '') {
      additionalSchema.organizer.name = businessInfo.name
    }
    if (additionalSchema.location?.name === '') {
      additionalSchema.location.name = businessInfo.name
    }
    if (additionalSchema.worksFor?.name === '') {
      additionalSchema.worksFor.name = businessInfo.name
    }
    
    structuredData.push(additionalSchema)
  })
  
  return structuredData
}

/**
 * Validate JSON-LD structured data
 */
export function validateJsonLd(structuredData: any[]): {
  isValid: boolean
  issues: string[]
  suggestions: string[]
} {
  const issues: string[] = []
  const suggestions: string[] = []
  
  structuredData.forEach((schema, index) => {
    // Check basic required fields for all schemas
    if (!schema['@context']) {
      issues.push(`Schema ${index + 1}: Missing @context`)
    }
    
    if (!schema['@type']) {
      issues.push(`Schema ${index + 1}: Missing @type`)
    }
    
    // Check schema-specific required fields
    const schemaType = schema['@type']
    
    if (['Restaurant', 'BarOrPub', 'CafeOrCoffeeShop'].includes(schemaType)) {
      // Business entity schemas require these fields
      if (!schema.name) {
        issues.push(`Schema ${index + 1}: Missing name`)
      }
      
      if (!schema.description) {
        issues.push(`Schema ${index + 1}: Missing description`)
      }
      
      if (!schema.url) {
        issues.push(`Schema ${index + 1}: Missing url`)
      }
      
      if (!schema.address) {
        issues.push(`Schema ${index + 1}: Missing address`)
      } else {
        const address = schema.address
        if (!address.streetAddress) {
          issues.push(`Schema ${index + 1}: Missing streetAddress`)
        }
        if (!address.addressLocality) {
          issues.push(`Schema ${index + 1}: Missing addressLocality`)
        }
        if (!address.addressRegion) {
          issues.push(`Schema ${index + 1}: Missing addressRegion`)
        }
        if (!address.postalCode) {
          issues.push(`Schema ${index + 1}: Missing postalCode`)
        }
      }
    } else if (schemaType === 'Event') {
      // Event schemas require these fields
      if (!schema.name) {
        issues.push(`Schema ${index + 1}: Missing name`)
      }
      
      if (!schema.description) {
        issues.push(`Schema ${index + 1}: Missing description`)
      }
      
      if (!schema.startDate) {
        issues.push(`Schema ${index + 1}: Missing startDate`)
      }
      
      if (!schema.location) {
        issues.push(`Schema ${index + 1}: Missing location`)
      }
    } else if (schemaType === 'Person') {
      // Person schemas require these fields
      if (!schema.name) {
        issues.push(`Schema ${index + 1}: Missing name`)
      }
      
      if (!schema.jobTitle) {
        issues.push(`Schema ${index + 1}: Missing jobTitle`)
      }
    } else if (schemaType === 'Menu') {
      // Menu schemas require these fields
      if (!schema.name) {
        issues.push(`Schema ${index + 1}: Missing name`)
      }
      
      if (!schema.url) {
        issues.push(`Schema ${index + 1}: Missing url`)
      }
    } else if (schemaType === 'Offer') {
      // Offer schemas require these fields
      if (!schema.name) {
        issues.push(`Schema ${index + 1}: Missing name`)
      }
      
      if (!schema.description) {
        issues.push(`Schema ${index + 1}: Missing description`)
      }
      
      if (!schema.price) {
        issues.push(`Schema ${index + 1}: Missing price`)
      }
    } else if (schemaType === 'Review') {
      // Review schemas require these fields
      if (!schema.itemReviewed) {
        issues.push(`Schema ${index + 1}: Missing itemReviewed`)
      }
      
      if (!schema.reviewRating) {
        issues.push(`Schema ${index + 1}: Missing reviewRating`)
      }
      
      if (!schema.author) {
        issues.push(`Schema ${index + 1}: Missing author`)
      }
    }
    
    // Check for common issues
    if (schema.telephone && !/^\+?[\d\s\-\(\)]+$/.test(schema.telephone)) {
      suggestions.push(`Schema ${index + 1}: Telephone format may be invalid`)
    }
    
    if (schema.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(schema.email)) {
      suggestions.push(`Schema ${index + 1}: Email format may be invalid`)
    }
    
    if (schema.url && !/^https?:\/\//.test(schema.url)) {
      suggestions.push(`Schema ${index + 1}: URL should start with http:// or https://`)
    }
  })
  
  return {
    isValid: issues.length === 0,
    issues,
    suggestions
  }
}

/**
 * Generate JSON-LD for specific content types
 */
export function generateContentJsonLd(
  variant: BusinessVariant,
  businessInfo: BusinessInfo,
  contentType: 'menu' | 'event' | 'special' | 'review',
  contentData: any
): any {
  const preset = getJsonLdPreset(variant)
  
  switch (contentType) {
    case 'menu':
      return {
        '@context': 'https://schema.org',
        '@type': 'Menu',
        'name': `${businessInfo.name} Menu`,
        'description': `Complete menu for ${businessInfo.name}`,
        'url': `${businessInfo.url}/menu`,
        'hasMenuSection': contentData.sections || [],
        'offers': contentData.items?.map((item: any) => ({
          '@type': 'Offer',
          'name': item.name,
          'description': item.description,
          'price': item.price,
          'priceCurrency': 'USD'
        })) || []
      }
      
    case 'event':
      return {
        '@context': 'https://schema.org',
        '@type': 'Event',
        'name': contentData.name,
        'description': contentData.description,
        'startDate': contentData.startDate,
        'endDate': contentData.endDate,
        'location': {
          '@type': 'Place',
          'name': businessInfo.name,
          'address': {
            '@type': 'PostalAddress',
            ...businessInfo.address
          }
        },
        'organizer': {
          '@type': 'Organization',
          'name': businessInfo.name
        },
        'offers': contentData.price ? {
          '@type': 'Offer',
          'price': contentData.price,
          'priceCurrency': 'USD',
          'availability': 'https://schema.org/InStock'
        } : undefined
      }
      
    case 'special':
      return {
        '@context': 'https://schema.org',
        '@type': 'Offer',
        'name': contentData.name,
        'description': contentData.description,
        'price': contentData.price,
        'priceCurrency': 'USD',
        'availability': 'https://schema.org/InStock',
        'validFrom': contentData.startDate,
        'validThrough': contentData.endDate,
        'seller': {
          '@type': 'Restaurant',
          'name': businessInfo.name
        }
      }
      
    case 'review':
      return {
        '@context': 'https://schema.org',
        '@type': 'Review',
        'itemReviewed': {
          '@type': 'Restaurant',
          'name': businessInfo.name
        },
        'reviewRating': {
          '@type': 'Rating',
          'ratingValue': contentData.rating,
          'bestRating': '5',
          'worstRating': '1'
        },
        'author': {
          '@type': 'Person',
          'name': contentData.author
        },
        'reviewBody': contentData.text,
        'datePublished': contentData.date
      }
      
    default:
      return null
  }
}

/**
 * Get JSON-LD recommendations based on business characteristics
 */
export function getJsonLdRecommendations(
  businessType: string,
  characteristics: string[]
): {
  recommendedVariant: BusinessVariant
  reasoning: string
  additionalSchemas: string[]
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
  let reasoning = 'General café schema suitable for most businesses'
  let additionalSchemas: string[] = []
  
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
    reasoning = 'Elegant characteristics suggest fine dining schema'
    additionalSchemas = ['Person (Chef)', 'Person (Sommelier)', 'Offer (Tasting Menu)']
  } else if (characteristics.some(c => c.includes('family') || c.includes('kids'))) {
    recommendedVariant = 'family_restaurant'
    reasoning = 'Family-focused characteristics suggest family restaurant schema'
    additionalSchemas = ['Menu (Kids Menu)', 'Offer (Kids Eat Free)']
  } else if (characteristics.some(c => c.includes('sports') || c.includes('games'))) {
    recommendedVariant = 'sports_bar'
    reasoning = 'Sports-focused characteristics suggest sports bar schema'
    additionalSchemas = ['Event (Fantasy League)', 'Offer (Game Day Specials)']
  } else if (characteristics.some(c => c.includes('coffee') || c.includes('wifi'))) {
    recommendedVariant = 'cafe'
    reasoning = 'Coffee-focused characteristics suggest café schema'
    additionalSchemas = ['Event (Coffee Cupping)', 'Offer (Remote Work Special)']
  }
  
  return {
    recommendedVariant,
    reasoning,
    additionalSchemas
  }
}
