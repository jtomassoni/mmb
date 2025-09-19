import {
  getJsonLdPreset,
  getAllJsonLdPresets,
  generateJsonLd,
  validateJsonLd,
  generateContentJsonLd,
  getJsonLdRecommendations,
  BusinessInfo
} from '../../src/lib/json-ld-presets'
import { BusinessVariant } from '../../src/lib/design-tokens'

describe('JSON-LD Presets', () => {
  const variants: BusinessVariant[] = ['dive_bar', 'fine_dining', 'cafe', 'sports_bar', 'family_restaurant']
  
  const sampleBusinessInfo: BusinessInfo = {
    name: 'Test Restaurant',
    description: 'A test restaurant for unit testing',
    url: 'https://testrestaurant.com',
    address: {
      streetAddress: '123 Test St',
      addressLocality: 'Test City',
      addressRegion: 'Test State',
      postalCode: '12345',
      addressCountry: 'US'
    },
    telephone: '+1-555-123-4567',
    email: 'test@testrestaurant.com',
    openingHours: ['Mo-Fr 11:00-22:00', 'Sa-Su 10:00-23:00'],
    priceRange: '$$',
    servesCuisine: ['American'],
    acceptsReservations: true,
    hasMenu: 'https://testrestaurant.com/menu',
    paymentAccepted: ['Cash', 'Credit Card'],
    currenciesAccepted: 'USD'
  }

  describe('getJsonLdPreset', () => {
    it('should return JSON-LD preset for all variants', () => {
      variants.forEach(variant => {
        const preset = getJsonLdPreset(variant)
        
        expect(preset).toBeDefined()
        expect(preset.variant).toBe(variant)
        expect(preset.schemaType).toBeDefined()
        expect(preset.baseSchema).toBeDefined()
        expect(preset.additionalSchemas).toBeDefined()
        expect(preset.requiredFields).toBeDefined()
        expect(preset.optionalFields).toBeDefined()
        expect(preset.variantSpecificFields).toBeDefined()
      })
    })

    it('should return different presets for different variants', () => {
      const diveBarPreset = getJsonLdPreset('dive_bar')
      const fineDiningPreset = getJsonLdPreset('fine_dining')
      
      expect(diveBarPreset.schemaType).toBe('BarOrPub')
      expect(fineDiningPreset.schemaType).toBe('Restaurant')
      expect(diveBarPreset.variantSpecificFields.barType).toBe('Dive Bar')
      expect(fineDiningPreset.variantSpecificFields.restaurantType).toBe('Fine Dining')
    })

    it('should return café preset as default for unknown variant', () => {
      const unknownPreset = getJsonLdPreset('unknown' as BusinessVariant)
      const cafePreset = getJsonLdPreset('cafe')
      
      expect(unknownPreset.variant).toBe('cafe')
      expect(unknownPreset.schemaType).toBe(cafePreset.schemaType)
    })

    it('should have proper base schema structure', () => {
      variants.forEach(variant => {
        const preset = getJsonLdPreset(variant)
        
        expect(preset.baseSchema['@context']).toBe('https://schema.org')
        expect(preset.baseSchema['@type']).toBeDefined()
        expect(preset.baseSchema.name).toBe('')
        expect(preset.baseSchema.description).toBe('')
        expect(preset.baseSchema.url).toBe('')
        expect(preset.baseSchema.address).toBeDefined()
        expect(preset.baseSchema.address['@type']).toBe('PostalAddress')
      })
    })

    it('should have variant-specific amenity features', () => {
      const diveBarPreset = getJsonLdPreset('dive_bar')
      const fineDiningPreset = getJsonLdPreset('fine_dining')
      const cafePreset = getJsonLdPreset('cafe')
      const sportsBarPreset = getJsonLdPreset('sports_bar')
      const familyRestaurantPreset = getJsonLdPreset('family_restaurant')
      
      expect(diveBarPreset.baseSchema.amenityFeature.some((f: any) => f.name === 'Pool Tables')).toBe(true)
      expect(fineDiningPreset.baseSchema.amenityFeature.some((f: any) => f.name === 'Wine Cellar')).toBe(true)
      expect(cafePreset.baseSchema.amenityFeature.some((f: any) => f.name === 'Free WiFi')).toBe(true)
      expect(sportsBarPreset.baseSchema.amenityFeature.some((f: any) => f.name === 'HD TV Screens')).toBe(true)
      expect(familyRestaurantPreset.baseSchema.amenityFeature.some((f: any) => f.name === 'Kids Menu')).toBe(true)
    })
  })

  describe('getAllJsonLdPresets', () => {
    it('should return all JSON-LD presets', () => {
      const presets = getAllJsonLdPresets()
      
      expect(presets).toBeDefined()
      expect(Array.isArray(presets)).toBe(true)
      expect(presets.length).toBe(5)
      
      const variants = presets.map(p => p.variant)
      expect(variants).toContain('dive_bar')
      expect(variants).toContain('fine_dining')
      expect(variants).toContain('cafe')
      expect(variants).toContain('sports_bar')
      expect(variants).toContain('family_restaurant')
    })
  })

  describe('generateJsonLd', () => {
    it('should generate complete JSON-LD for all variants', () => {
      variants.forEach(variant => {
        const structuredData = generateJsonLd(variant, sampleBusinessInfo)
        
        expect(structuredData).toBeDefined()
        expect(Array.isArray(structuredData)).toBe(true)
        expect(structuredData.length).toBeGreaterThan(0)
        
        // Check base schema
        const baseSchema = structuredData[0]
        expect(baseSchema['@context']).toBe('https://schema.org')
        expect(baseSchema['@type']).toBeDefined()
        expect(baseSchema.name).toBe(sampleBusinessInfo.name)
        expect(baseSchema.description).toBe(sampleBusinessInfo.description)
        expect(baseSchema.url).toBe(sampleBusinessInfo.url)
        expect(baseSchema.address).toBeDefined()
        expect(baseSchema.address.streetAddress).toBe(sampleBusinessInfo.address.streetAddress)
      })
    })

    it('should include custom fields', () => {
      const customFields = {
        'customField': 'customValue',
        'anotherField': 123
      }
      
      const structuredData = generateJsonLd('cafe', sampleBusinessInfo, customFields)
      const baseSchema = structuredData[0]
      
      expect(baseSchema.customField).toBe('customValue')
      expect(baseSchema.anotherField).toBe(123)
    })

    it('should include variant-specific fields', () => {
      const structuredData = generateJsonLd('dive_bar', sampleBusinessInfo)
      const baseSchema = structuredData[0]
      
      expect(baseSchema.barType).toBe('Dive Bar')
      expect(baseSchema.atmosphere).toBe('Casual')
      expect(baseSchema.targetAudience).toBe('Local Community')
    })

    it('should include additional schemas', () => {
      const structuredData = generateJsonLd('dive_bar', sampleBusinessInfo)
      
      expect(structuredData.length).toBeGreaterThan(1)
      
      // Check that additional schemas have business name filled in
      structuredData.forEach(schema => {
        if (schema.organizer?.name === '') {
          expect(schema.organizer.name).toBe(sampleBusinessInfo.name)
        }
        if (schema.location?.name === '') {
          expect(schema.location.name).toBe(sampleBusinessInfo.name)
        }
        if (schema.worksFor?.name === '') {
          expect(schema.worksFor.name).toBe(sampleBusinessInfo.name)
        }
      })
    })
  })

  describe('validateJsonLd', () => {
    it('should validate complete JSON-LD data', () => {
      const structuredData = generateJsonLd('cafe', sampleBusinessInfo)
      const validation = validateJsonLd(structuredData)
      
      expect(validation).toBeDefined()
      expect(validation.isValid).toBe(true)
      expect(validation.issues).toBeDefined()
      expect(validation.suggestions).toBeDefined()
      expect(Array.isArray(validation.issues)).toBe(true)
      expect(Array.isArray(validation.suggestions)).toBe(true)
    })

    it('should detect invalid JSON-LD data', () => {
      const invalidData = [
        {
          '@type': 'Restaurant',
          'name': 'Test',
          'description': 'Test description'
          // Missing @context, url, address
        }
      ]
      
      const validation = validateJsonLd(invalidData)
      expect(validation.isValid).toBe(false)
      expect(validation.issues.length).toBeGreaterThan(0)
    })

    it('should validate address structure', () => {
      const incompleteData = [
        {
          '@context': 'https://schema.org',
          '@type': 'Restaurant',
          'name': 'Test',
          'description': 'Test description',
          'url': 'https://test.com',
          'address': {
            '@type': 'PostalAddress',
            'streetAddress': '123 Test St'
            // Missing other address fields
          }
        }
      ]
      
      const validation = validateJsonLd(incompleteData)
      expect(validation.isValid).toBe(false)
      expect(validation.issues.some(issue => issue.includes('addressLocality'))).toBe(true)
    })

    it('should validate contact information format', () => {
      const invalidContactData = [
        {
          '@context': 'https://schema.org',
          '@type': 'Restaurant',
          'name': 'Test',
          'description': 'Test description',
          'url': 'https://test.com',
          'address': {
            '@type': 'PostalAddress',
            'streetAddress': '123 Test St',
            'addressLocality': 'Test City',
            'addressRegion': 'Test State',
            'postalCode': '12345',
            'addressCountry': 'US'
          },
          'telephone': 'invalid-phone',
          'email': 'invalid-email'
        }
      ]
      
      const validation = validateJsonLd(invalidContactData)
      expect(validation.suggestions.some(suggestion => suggestion.includes('Telephone format'))).toBe(true)
      expect(validation.suggestions.some(suggestion => suggestion.includes('Email format'))).toBe(true)
    })
  })

  describe('generateContentJsonLd', () => {
    it('should generate menu JSON-LD', () => {
      const menuData = {
        sections: [
          {
            '@type': 'MenuSection',
            'name': 'Appetizers',
            'description': 'Start your meal right'
          }
        ],
        items: [
          {
            name: 'Wings',
            description: 'Buffalo wings',
            price: '12'
          }
        ]
      }
      
      const menuSchema = generateContentJsonLd('dive_bar', sampleBusinessInfo, 'menu', menuData)
      
      expect(menuSchema).toBeDefined()
      expect(menuSchema['@type']).toBe('Menu')
      expect(menuSchema.name).toBe('Test Restaurant Menu')
      expect(menuSchema.url).toBe('https://testrestaurant.com/menu')
      expect(menuSchema.hasMenuSection).toBeDefined()
      expect(menuSchema.offers).toBeDefined()
    })

    it('should generate event JSON-LD', () => {
      const eventData = {
        name: 'Live Music Night',
        description: 'Weekly live music performances',
        startDate: '2024-01-01T21:00:00',
        endDate: '2024-01-01T23:00:00',
        price: '0'
      }
      
      const eventSchema = generateContentJsonLd('dive_bar', sampleBusinessInfo, 'event', eventData)
      
      expect(eventSchema).toBeDefined()
      expect(eventSchema['@type']).toBe('Event')
      expect(eventSchema.name).toBe('Live Music Night')
      expect(eventSchema.location.name).toBe('Test Restaurant')
      expect(eventSchema.organizer.name).toBe('Test Restaurant')
      expect(eventSchema.offers.price).toBe('0')
    })

    it('should generate special JSON-LD', () => {
      const specialData = {
        name: 'Happy Hour',
        description: 'Half-price drinks',
        price: '5',
        startDate: '2024-01-01T17:00:00',
        endDate: '2024-01-01T19:00:00'
      }
      
      const specialSchema = generateContentJsonLd('dive_bar', sampleBusinessInfo, 'special', specialData)
      
      expect(specialSchema).toBeDefined()
      expect(specialSchema['@type']).toBe('Offer')
      expect(specialSchema.name).toBe('Happy Hour')
      expect(specialSchema.price).toBe('5')
      expect(specialSchema.seller.name).toBe('Test Restaurant')
    })

    it('should generate review JSON-LD', () => {
      const reviewData = {
        rating: '5',
        author: 'John Doe',
        text: 'Great food and atmosphere!',
        date: '2024-01-01'
      }
      
      const reviewSchema = generateContentJsonLd('dive_bar', sampleBusinessInfo, 'review', reviewData)
      
      expect(reviewSchema).toBeDefined()
      expect(reviewSchema['@type']).toBe('Review')
      expect(reviewSchema.itemReviewed.name).toBe('Test Restaurant')
      expect(reviewSchema.reviewRating.ratingValue).toBe('5')
      expect(reviewSchema.author.name).toBe('John Doe')
      expect(reviewSchema.reviewBody).toBe('Great food and atmosphere!')
    })

    it('should return null for unknown content type', () => {
      const result = generateContentJsonLd('cafe', sampleBusinessInfo, 'unknown' as any, {})
      expect(result).toBeNull()
    })
  })

  describe('getJsonLdRecommendations', () => {
    it('should recommend appropriate variants for business types', () => {
      const recommendations = getJsonLdRecommendations('bar', ['local', 'beer'])
      
      expect(recommendations).toBeDefined()
      expect(recommendations.recommendedVariant).toBeDefined()
      expect(recommendations.reasoning).toBeDefined()
      expect(recommendations.additionalSchemas).toBeDefined()
      expect(Array.isArray(recommendations.additionalSchemas)).toBe(true)
    })

    it('should recommend fine dining for elegant characteristics', () => {
      const recommendations = getJsonLdRecommendations('restaurant', ['elegant', 'upscale'])
      
      expect(recommendations.recommendedVariant).toBe('fine_dining')
      expect(recommendations.reasoning).toContain('Elegant')
      expect(recommendations.additionalSchemas).toContain('Person (Chef)')
    })

    it('should recommend family restaurant for family characteristics', () => {
      const recommendations = getJsonLdRecommendations('diner', ['family', 'kids'])
      
      expect(recommendations.recommendedVariant).toBe('family_restaurant')
      expect(recommendations.reasoning).toContain('family')
      expect(recommendations.additionalSchemas).toContain('Menu (Kids Menu)')
    })

    it('should recommend sports bar for sports characteristics', () => {
      const recommendations = getJsonLdRecommendations('bar', ['sports', 'games'])
      
      expect(recommendations.recommendedVariant).toBe('sports_bar')
      expect(recommendations.reasoning).toContain('sports')
      expect(recommendations.additionalSchemas).toContain('Event (Fantasy League)')
    })

    it('should recommend café for coffee characteristics', () => {
      const recommendations = getJsonLdRecommendations('cafe', ['coffee', 'wifi'])
      
      expect(recommendations.recommendedVariant).toBe('cafe')
      expect(recommendations.reasoning).toContain('Coffee')
      expect(recommendations.additionalSchemas).toContain('Event (Coffee Cupping)')
    })
  })

  describe('Variant-specific schema tests', () => {
    it('should have dive bar specific schema', () => {
      const preset = getJsonLdPreset('dive_bar')
      
      expect(preset.schemaType).toBe('BarOrPub')
      expect(preset.baseSchema.priceRange).toBe('$')
      expect(preset.baseSchema.acceptsReservations).toBe(false)
      expect(preset.variantSpecificFields.barType).toBe('Dive Bar')
      expect(preset.variantSpecificFields.sportsViewing).toBe(false)
    })

    it('should have fine dining specific schema', () => {
      const preset = getJsonLdPreset('fine_dining')
      
      expect(preset.schemaType).toBe('Restaurant')
      expect(preset.baseSchema.priceRange).toBe('$$$$')
      expect(preset.baseSchema.acceptsReservations).toBe(true)
      expect(preset.variantSpecificFields.restaurantType).toBe('Fine Dining')
      expect(preset.variantSpecificFields.reservationRequired).toBe(true)
    })

    it('should have café specific schema', () => {
      const preset = getJsonLdPreset('cafe')
      
      expect(preset.schemaType).toBe('CafeOrCoffeeShop')
      expect(preset.baseSchema.priceRange).toBe('$$')
      expect(preset.baseSchema.acceptsReservations).toBe(false)
      expect(preset.variantSpecificFields.cafeType).toBe('Coffee Shop')
      expect(preset.variantSpecificFields.wifiAvailable).toBe(true)
    })

    it('should have sports bar specific schema', () => {
      const preset = getJsonLdPreset('sports_bar')
      
      expect(preset.schemaType).toBe('BarOrPub')
      expect(preset.baseSchema.priceRange).toBe('$$')
      expect(preset.baseSchema.acceptsReservations).toBe(true)
      expect(preset.variantSpecificFields.barType).toBe('Sports Bar')
      expect(preset.variantSpecificFields.sportsViewing).toBe(true)
    })

    it('should have family restaurant specific schema', () => {
      const preset = getJsonLdPreset('family_restaurant')
      
      expect(preset.schemaType).toBe('Restaurant')
      expect(preset.baseSchema.priceRange).toBe('$$')
      expect(preset.baseSchema.acceptsReservations).toBe(true)
      expect(preset.variantSpecificFields.restaurantType).toBe('Family Restaurant')
      expect(preset.variantSpecificFields.familyFriendly).toBe(true)
    })
  })

  describe('Required and optional fields', () => {
    it('should have proper required fields for all variants', () => {
      variants.forEach(variant => {
        const preset = getJsonLdPreset(variant)
        
        expect(preset.requiredFields).toContain('name')
        expect(preset.requiredFields).toContain('description')
        expect(preset.requiredFields).toContain('url')
        expect(preset.requiredFields).toContain('address')
        expect(preset.requiredFields).toContain('telephone')
      })
    })

    it('should have proper optional fields for all variants', () => {
      variants.forEach(variant => {
        const preset = getJsonLdPreset(variant)
        
        expect(preset.optionalFields).toContain('logo')
        expect(preset.optionalFields).toContain('image')
        expect(preset.optionalFields).toContain('email')
        expect(preset.optionalFields).toContain('geo')
        expect(preset.optionalFields).toContain('openingHours')
        expect(preset.optionalFields).toContain('hasMenu')
      })
    })

    it('should have variant-specific required fields', () => {
      const fineDiningPreset = getJsonLdPreset('fine_dining')
      expect(fineDiningPreset.requiredFields).toContain('acceptsReservations')
    })
  })
})
