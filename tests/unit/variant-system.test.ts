import { BusinessVariant, getDesignTokens } from '../../src/lib/design-tokens'
import { getHeroPreset } from '../../src/lib/hero-presets'
import { getTodayPreset } from '../../src/lib/today-presets'
import { getJsonLdPreset } from '../../src/lib/json-ld-presets'

describe('Variant System Integration', () => {
  const variants: BusinessVariant[] = ['dive_bar', 'fine_dining', 'cafe', 'sports_bar', 'family_restaurant']

  describe('Design Tokens Integration', () => {
    it('should have consistent token structure across all variants', () => {
      variants.forEach(variant => {
        const tokens = getDesignTokens(variant)
        
        expect(tokens).toBeDefined()
        expect(tokens.typography).toBeDefined()
        expect(tokens.colors).toBeDefined()
        expect(tokens.spacing).toBeDefined()
        expect(tokens.borderRadius).toBeDefined()
        expect(tokens.shadows).toBeDefined()
        expect(tokens.contrast).toBeDefined()
      })
    })

    it('should have variant-specific color schemes', () => {
      const diveBarTokens = getDesignTokens('dive_bar')
      const fineDiningTokens = getDesignTokens('fine_dining')
      const cafeTokens = getDesignTokens('cafe')
      
      expect(diveBarTokens.colors.primary).not.toEqual(fineDiningTokens.colors.primary)
      expect(diveBarTokens.colors.primary).not.toEqual(cafeTokens.colors.primary)
      expect(fineDiningTokens.colors.primary).not.toEqual(cafeTokens.colors.primary)
    })

    it('should have variant-specific typography', () => {
      const diveBarTokens = getDesignTokens('dive_bar')
      const fineDiningTokens = getDesignTokens('fine_dining')
      
      expect(diveBarTokens.typography.fontWeight.bold).toBeDefined()
      expect(fineDiningTokens.typography.fontWeight.normal).toBeDefined()
    })
  })

  describe('Hero Presets Integration', () => {
    it('should have consistent hero preset structure across all variants', () => {
      variants.forEach(variant => {
        const preset = getHeroPreset(variant)
        
        expect(preset).toBeDefined()
        expect(preset.variant).toBe(variant)
        expect(preset.content).toBeDefined()
        expect(preset.layout).toBeDefined()
        expect(preset.imageSuggestions).toBeDefined()
        expect(preset.colorScheme).toBeDefined()
        expect(preset.typography).toBeDefined()
      })
    })

    it('should have variant-specific hero content', () => {
      const diveBarPreset = getHeroPreset('dive_bar')
      const fineDiningPreset = getHeroPreset('fine_dining')
      const cafePreset = getHeroPreset('cafe')
      
      expect(diveBarPreset.content.headline).toContain('Locals')
      expect(fineDiningPreset.content.headline).toContain('Exquisite')
      expect(cafePreset.content.headline).toContain('Comfort')
    })

    it('should have variant-specific hero layouts', () => {
      const diveBarPreset = getHeroPreset('dive_bar')
      const sportsBarPreset = getHeroPreset('sports_bar')
      
      expect(diveBarPreset.layout.imagePosition).toBe('right')
      expect(sportsBarPreset.layout.imagePosition).toBe('background')
    })
  })

  describe('Today Presets Integration', () => {
    it('should have consistent today preset structure across all variants', () => {
      variants.forEach(variant => {
        const preset = getTodayPreset(variant)
        
        expect(preset).toBeDefined()
        expect(preset.variant).toBe(variant)
        expect(preset.greeting).toBeDefined()
        expect(preset.highlights).toBeDefined()
        expect(preset.layout).toBeDefined()
        expect(preset.messaging).toBeDefined()
      })
    })

    it('should have variant-specific today content', () => {
      const diveBarPreset = getTodayPreset('dive_bar')
      const cafePreset = getTodayPreset('cafe')
      const sportsBarPreset = getTodayPreset('sports_bar')
      
      expect(diveBarPreset.greeting).toContain('Tonight')
      expect(cafePreset.greeting).toContain('Morning')
      expect(sportsBarPreset.greeting).toContain('Game Day')
    })

    it('should have variant-specific highlight categories', () => {
      const diveBarPreset = getTodayPreset('dive_bar')
      const fineDiningPreset = getTodayPreset('fine_dining')
      
      const diveBarSpecials = diveBarPreset.highlights.filter(h => h.category === 'special')
      const fineDiningSpecials = fineDiningPreset.highlights.filter(h => h.category === 'special')
      
      expect(diveBarSpecials.length).toBeGreaterThan(0)
      expect(fineDiningSpecials.length).toBeGreaterThan(0)
      expect(diveBarSpecials[0].title).toContain('Happy Hour')
      expect(fineDiningSpecials[0].title).toContain('Chef')
    })
  })

  describe('JSON-LD Presets Integration', () => {
    it('should have consistent JSON-LD preset structure across all variants', () => {
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

    it('should have variant-specific schema types', () => {
      const diveBarPreset = getJsonLdPreset('dive_bar')
      const fineDiningPreset = getJsonLdPreset('fine_dining')
      const cafePreset = getJsonLdPreset('cafe')
      
      expect(diveBarPreset.schemaType).toBe('BarOrPub')
      expect(fineDiningPreset.schemaType).toBe('Restaurant')
      expect(cafePreset.schemaType).toBe('CafeOrCoffeeShop')
    })

    it('should have variant-specific amenity features', () => {
      const diveBarPreset = getJsonLdPreset('dive_bar')
      const cafePreset = getJsonLdPreset('cafe')
      const sportsBarPreset = getJsonLdPreset('sports_bar')
      
      const diveBarAmenities = diveBarPreset.baseSchema.amenityFeature.map((a: any) => a.name)
      const cafeAmenities = cafePreset.baseSchema.amenityFeature.map((a: any) => a.name)
      const sportsBarAmenities = sportsBarPreset.baseSchema.amenityFeature.map((a: any) => a.name)
      
      expect(diveBarAmenities).toContain('Pool Tables')
      expect(cafeAmenities).toContain('Free WiFi')
      expect(sportsBarAmenities).toContain('HD TV Screens')
    })
  })

  describe('Cross-System Consistency', () => {
    it('should have consistent variant identifiers across all systems', () => {
      variants.forEach(variant => {
        const designTokens = getDesignTokens(variant)
        const heroPreset = getHeroPreset(variant)
        const todayPreset = getTodayPreset(variant)
        const jsonLdPreset = getJsonLdPreset(variant)
        
        // Design tokens don't have variant property, they're identified by the function parameter
        expect(heroPreset.variant).toBe(variant)
        expect(todayPreset.variant).toBe(variant)
        expect(jsonLdPreset.variant).toBe(variant)
      })
    })

    it('should have consistent business characteristics across systems', () => {
      const diveBarHero = getHeroPreset('dive_bar')
      const diveBarToday = getTodayPreset('dive_bar')
      const diveBarJsonLd = getJsonLdPreset('dive_bar')
      
      // All systems should reflect dive bar characteristics
      expect(diveBarHero.content.features.some(f => f.includes('Pool'))).toBe(true)
      expect(diveBarToday.highlights.some(h => h.title.includes('Happy Hour'))).toBe(true)
      expect(diveBarJsonLd.variantSpecificFields.barType).toBe('Dive Bar')
    })

    it('should have consistent fine dining characteristics across systems', () => {
      const fineDiningHero = getHeroPreset('fine_dining')
      const fineDiningToday = getTodayPreset('fine_dining')
      const fineDiningJsonLd = getJsonLdPreset('fine_dining')
      
      // All systems should reflect fine dining characteristics
      expect(fineDiningHero.content.features.some(f => f.includes('Wine') || f.includes('Sommelier'))).toBe(true)
      expect(fineDiningToday.highlights.some(h => h.title.includes('Chef'))).toBe(true)
      expect(fineDiningJsonLd.variantSpecificFields.restaurantType).toBe('Fine Dining')
    })

    it('should have consistent café characteristics across systems', () => {
      const cafeHero = getHeroPreset('cafe')
      const cafeToday = getTodayPreset('cafe')
      const cafeJsonLd = getJsonLdPreset('cafe')
      
      // All systems should reflect café characteristics
      expect(cafeHero.content.features.some(f => f.includes('coffee') || f.includes('pastries'))).toBe(true)
      expect(cafeToday.highlights.some(h => h.title.includes('Coffee'))).toBe(true)
      expect(cafeJsonLd.variantSpecificFields.cafeType).toBe('Coffee Shop')
    })
  })

  describe('Variant-Specific Validation', () => {
    it('should validate dive bar variant characteristics', () => {
      const diveBarTokens = getDesignTokens('dive_bar')
      const diveBarHero = getHeroPreset('dive_bar')
      const diveBarToday = getTodayPreset('dive_bar')
      const diveBarJsonLd = getJsonLdPreset('dive_bar')
      
      // Dive bar should be casual and energetic
      expect(diveBarTokens.colors.primary['500']).toBe('#dc2626') // Red
      expect(diveBarHero.layout.spacing).toBe('comfortable')
      expect(diveBarToday.layout.style).toBe('featured')
      expect(diveBarJsonLd.baseSchema.priceRange).toBe('$')
      expect(diveBarJsonLd.baseSchema.acceptsReservations).toBe(false)
    })

    it('should validate fine dining variant characteristics', () => {
      const fineDiningTokens = getDesignTokens('fine_dining')
      const fineDiningHero = getHeroPreset('fine_dining')
      const fineDiningToday = getTodayPreset('fine_dining')
      const fineDiningJsonLd = getJsonLdPreset('fine_dining')
      
      // Fine dining should be elegant and sophisticated
      expect(fineDiningTokens.colors.primary['500']).toBe('#64748b') // Slate
      expect(fineDiningHero.layout.spacing).toBe('spacious')
      expect(fineDiningToday.layout.style).toBe('list')
      expect(fineDiningJsonLd.baseSchema.priceRange).toBe('$$$$')
      expect(fineDiningJsonLd.baseSchema.acceptsReservations).toBe(true)
    })

    it('should validate café variant characteristics', () => {
      const cafeTokens = getDesignTokens('cafe')
      const cafeHero = getHeroPreset('cafe')
      const cafeToday = getTodayPreset('cafe')
      const cafeJsonLd = getJsonLdPreset('cafe')
      
      // Café should be warm and welcoming
      expect(cafeTokens.colors.primary['500']).toBe('#0ea5e9') // Sky blue
      expect(cafeHero.layout.imagePosition).toBe('center')
      expect(cafeToday.layout.style).toBe('grid')
      expect(cafeJsonLd.baseSchema.priceRange).toBe('$$')
      expect(cafeJsonLd.baseSchema.acceptsReservations).toBe(false)
    })

    it('should validate sports bar variant characteristics', () => {
      const sportsBarTokens = getDesignTokens('sports_bar')
      const sportsBarHero = getHeroPreset('sports_bar')
      const sportsBarToday = getTodayPreset('sports_bar')
      const sportsBarJsonLd = getJsonLdPreset('sports_bar')
      
      // Sports bar should be energetic and game-focused
      expect(sportsBarTokens.colors.primary['500']).toBe('#3b82f6') // Blue
      expect(sportsBarHero.layout.imagePosition).toBe('background')
      expect(sportsBarToday.layout.style).toBe('carousel')
      expect(sportsBarJsonLd.baseSchema.priceRange).toBe('$$')
      expect(sportsBarJsonLd.baseSchema.acceptsReservations).toBe(true)
    })

    it('should validate family restaurant variant characteristics', () => {
      const familyRestaurantTokens = getDesignTokens('family_restaurant')
      const familyRestaurantHero = getHeroPreset('family_restaurant')
      const familyRestaurantToday = getTodayPreset('family_restaurant')
      const familyRestaurantJsonLd = getJsonLdPreset('family_restaurant')
      
      // Family restaurant should be welcoming and inclusive
      expect(familyRestaurantTokens.colors.primary['500']).toBe('#22c55e') // Green
      expect(familyRestaurantHero.layout.imagePosition).toBe('left')
      expect(familyRestaurantToday.layout.style).toBe('grid')
      expect(familyRestaurantJsonLd.baseSchema.priceRange).toBe('$$')
      expect(familyRestaurantJsonLd.baseSchema.acceptsReservations).toBe(true)
    })
  })

  describe('Performance and Scalability', () => {
    it('should generate all variants quickly', () => {
      const startTime = Date.now()
      
      variants.forEach(variant => {
        getDesignTokens(variant)
        getHeroPreset(variant)
        getTodayPreset(variant)
        getJsonLdPreset(variant)
      })
      
      const endTime = Date.now()
      const duration = endTime - startTime
      
      // Should generate all variants in less than 100ms
      expect(duration).toBeLessThan(100)
    })

    it('should handle unknown variants gracefully', () => {
      const unknownVariant = 'unknown_variant' as BusinessVariant
      
      expect(() => getDesignTokens(unknownVariant)).not.toThrow()
      expect(() => getHeroPreset(unknownVariant)).not.toThrow()
      expect(() => getTodayPreset(unknownVariant)).not.toThrow()
      expect(() => getJsonLdPreset(unknownVariant)).not.toThrow()
      
      // Should default to café variant (design tokens don't have variant property)
      const defaultTokens = getDesignTokens(unknownVariant)
      expect(defaultTokens).toBeDefined()
      expect(getHeroPreset(unknownVariant).variant).toBe('cafe')
      expect(getTodayPreset(unknownVariant).variant).toBe('cafe')
      expect(getJsonLdPreset(unknownVariant).variant).toBe('cafe')
    })
  })
})
