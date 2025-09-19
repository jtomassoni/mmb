import {
  getHeroPreset,
  getAllHeroPresets,
  customizeHeroPreset,
  generateHeroVariations,
  validateHeroPreset,
  getHeroRecommendations,
  HeroPreset
} from '../../src/lib/hero-presets'
import {
  getTodayPreset,
  getAllTodayPresets,
  customizeTodayPreset,
  generateTimeBasedHighlights,
  generateSeasonalHighlights,
  validateTodayPreset,
  TodaySection
} from '../../src/lib/today-presets'
import { BusinessVariant } from '../../src/lib/design-tokens'

describe('Hero Presets', () => {
  const variants: BusinessVariant[] = ['dive_bar', 'fine_dining', 'cafe', 'sports_bar', 'family_restaurant']

  describe('getHeroPreset', () => {
    it('should return hero preset for all variants', () => {
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

    it('should return different presets for different variants', () => {
      const diveBarPreset = getHeroPreset('dive_bar')
      const fineDiningPreset = getHeroPreset('fine_dining')
      
      expect(diveBarPreset.content.headline).not.toBe(fineDiningPreset.content.headline)
      expect(diveBarPreset.layout.imagePosition).not.toBe(fineDiningPreset.layout.imagePosition)
    })

    it('should return café preset as default for unknown variant', () => {
      const unknownPreset = getHeroPreset('unknown' as BusinessVariant)
      const cafePreset = getHeroPreset('cafe')
      
      expect(unknownPreset.variant).toBe('cafe')
      expect(unknownPreset.content.headline).toBe(cafePreset.content.headline)
    })

    it('should have proper content structure', () => {
      variants.forEach(variant => {
        const preset = getHeroPreset(variant)
        
        expect(preset.content.headline).toBeDefined()
        expect(preset.content.subheadline).toBeDefined()
        expect(preset.content.callToAction.primary).toBeDefined()
        expect(preset.content.description).toBeDefined()
        expect(preset.content.features).toBeDefined()
        expect(Array.isArray(preset.content.features)).toBe(true)
        expect(preset.content.features.length).toBeGreaterThan(0)
      })
    })

    it('should have proper layout structure', () => {
      variants.forEach(variant => {
        const preset = getHeroPreset(variant)
        
        expect(preset.layout.imagePosition).toBeDefined()
        expect(preset.layout.textAlignment).toBeDefined()
        expect(preset.layout.imageStyle).toBeDefined()
        expect(preset.layout.buttonStyle).toBeDefined()
        expect(preset.layout.spacing).toBeDefined()
      })
    })
  })

  describe('getAllHeroPresets', () => {
    it('should return all hero presets', () => {
      const presets = getAllHeroPresets()
      
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

  describe('customizeHeroPreset', () => {
    it('should customize preset with business name', () => {
      const preset = getHeroPreset('cafe')
      const customized = customizeHeroPreset(preset, {
        businessName: 'Joe\'s Coffee'
      })
      
      expect(customized.content.headline).toContain('Joe\'s Coffee')
    })

    it('should customize preset with location', () => {
      const preset = getHeroPreset('dive_bar')
      const customized = customizeHeroPreset(preset, {
        location: 'Downtown Denver'
      })
      
      expect(customized.content.description).toContain('Downtown Denver')
    })

    it('should customize preset with specialties', () => {
      const preset = getHeroPreset('fine_dining')
      const customized = customizeHeroPreset(preset, {
        specialties: ['Fresh Seafood', 'Wine Pairings']
      })
      
      expect(customized.content.features[0]).toBe('Fresh Seafood')
      expect(customized.content.features[1]).toBe('Wine Pairings')
    })
  })

  describe('generateHeroVariations', () => {
    it('should generate variations for all variants', () => {
      variants.forEach(variant => {
        const preset = getHeroPreset(variant)
        const variations = generateHeroVariations(preset)
        
        expect(variations).toBeDefined()
        expect(Array.isArray(variations)).toBe(true)
        expect(variations.length).toBeGreaterThan(0)
        
        // Check that variations are different from original
        variations.forEach(variation => {
          expect(variation.variant).toBe(preset.variant)
        })
      })
    })
  })

  describe('validateHeroPreset', () => {
    it('should validate all default presets', () => {
      variants.forEach(variant => {
        const preset = getHeroPreset(variant)
        const validation = validateHeroPreset(preset)
        
        expect(validation).toBeDefined()
        expect(validation.isValid).toBe(true)
        expect(validation.issues).toBeDefined()
        expect(validation.suggestions).toBeDefined()
        expect(Array.isArray(validation.issues)).toBe(true)
        expect(Array.isArray(validation.suggestions)).toBe(true)
      })
    })

    it('should detect invalid presets', () => {
      const invalidPreset: HeroPreset = {
        variant: 'cafe',
        content: {
          headline: 'Short',
          subheadline: 'Hi',
          callToAction: { primary: '' },
          description: 'Too short',
          features: ['One']
        },
        layout: {
          imagePosition: 'left',
          textAlignment: 'left',
          imageStyle: 'rounded',
          buttonStyle: 'primary',
          spacing: 'comfortable'
        },
        imageSuggestions: [],
        colorScheme: {
          primary: '#000',
          secondary: '#000',
          accent: '#000',
          background: '#000'
        },
        typography: {
          headlineSize: 'md',
          subheadlineSize: 'sm',
          bodySize: 'sm'
        }
      }
      
      const validation = validateHeroPreset(invalidPreset)
      expect(validation.isValid).toBe(false)
      expect(validation.issues.length).toBeGreaterThan(0)
    })
  })

  describe('getHeroRecommendations', () => {
    it('should recommend appropriate variants for business types', () => {
      const recommendations = getHeroRecommendations('bar', ['local', 'beer'])
      
      expect(recommendations).toBeDefined()
      expect(recommendations.recommendedVariant).toBeDefined()
      expect(recommendations.reasoning).toBeDefined()
      expect(recommendations.alternatives).toBeDefined()
      expect(Array.isArray(recommendations.alternatives)).toBe(true)
    })

    it('should recommend fine dining for elegant characteristics', () => {
      const recommendations = getHeroRecommendations('restaurant', ['elegant', 'upscale'])
      
      expect(recommendations.recommendedVariant).toBe('fine_dining')
      expect(recommendations.reasoning).toContain('Elegant')
    })

    it('should recommend family restaurant for family characteristics', () => {
      const recommendations = getHeroRecommendations('diner', ['family', 'kids'])
      
      expect(recommendations.recommendedVariant).toBe('family_restaurant')
      expect(recommendations.reasoning).toContain('family')
    })
  })
})

describe('Today Presets', () => {
  const variants: BusinessVariant[] = ['dive_bar', 'fine_dining', 'cafe', 'sports_bar', 'family_restaurant']

  describe('getTodayPreset', () => {
    it('should return today preset for all variants', () => {
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

    it('should return different presets for different variants', () => {
      const diveBarPreset = getTodayPreset('dive_bar')
      const cafePreset = getTodayPreset('cafe')
      
      expect(diveBarPreset.greeting).not.toBe(cafePreset.greeting)
      expect(diveBarPreset.layout.style).not.toBe(cafePreset.layout.style)
    })

    it('should return café preset as default for unknown variant', () => {
      const unknownPreset = getTodayPreset('unknown' as BusinessVariant)
      const cafePreset = getTodayPreset('cafe')
      
      expect(unknownPreset.variant).toBe('cafe')
      expect(unknownPreset.greeting).toBe(cafePreset.greeting)
    })

    it('should have proper highlights structure', () => {
      variants.forEach(variant => {
        const preset = getTodayPreset(variant)
        
        expect(preset.highlights).toBeDefined()
        expect(Array.isArray(preset.highlights)).toBe(true)
        expect(preset.highlights.length).toBeGreaterThan(0)
        
        preset.highlights.forEach(highlight => {
          expect(highlight.title).toBeDefined()
          expect(highlight.description).toBeDefined()
          expect(highlight.category).toBeDefined()
          expect(highlight.urgency).toBeDefined()
        })
      })
    })
  })

  describe('getAllTodayPresets', () => {
    it('should return all today presets', () => {
      const presets = getAllTodayPresets()
      
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

  describe('customizeTodayPreset', () => {
    it('should customize preset with business name', () => {
      const preset = getTodayPreset('cafe')
      const customized = customizeTodayPreset(preset, {
        businessName: 'Joe\'s Coffee'
      })
      
      expect(customized.greeting).toContain('Joe\'s Coffee')
    })

    it('should customize preset with specialties', () => {
      const preset = getTodayPreset('fine_dining')
      const customized = customizeTodayPreset(preset, {
        specialties: ['Fresh Seafood', 'Wine Pairings']
      })
      
      expect(customized.highlights[0].title).toBe('Fresh Seafood')
      expect(customized.highlights[1].title).toBe('Wine Pairings')
    })
  })

  describe('generateTimeBasedHighlights', () => {
    it('should generate time-based highlights for all variants', () => {
      const timeOfDays = ['morning', 'afternoon', 'evening', 'night'] as const
      
      variants.forEach(variant => {
        timeOfDays.forEach(timeOfDay => {
          const highlights = generateTimeBasedHighlights(variant, timeOfDay)
          
          expect(highlights).toBeDefined()
          expect(Array.isArray(highlights)).toBe(true)
          
          highlights.forEach(highlight => {
            expect(highlight.title).toBeDefined()
            expect(highlight.description).toBeDefined()
            expect(highlight.category).toBeDefined()
            expect(highlight.urgency).toBeDefined()
          })
        })
      })
    })
  })

  describe('generateSeasonalHighlights', () => {
    it('should generate seasonal highlights for all variants', () => {
      const seasons = ['spring', 'summer', 'fall', 'winter'] as const
      
      variants.forEach(variant => {
        seasons.forEach(season => {
          const highlights = generateSeasonalHighlights(variant, season)
          
          expect(highlights).toBeDefined()
          expect(Array.isArray(highlights)).toBe(true)
          
          highlights.forEach(highlight => {
            expect(highlight.title).toBeDefined()
            expect(highlight.description).toBeDefined()
            expect(highlight.category).toBeDefined()
            expect(highlight.urgency).toBeDefined()
          })
        })
      })
    })
  })

  describe('validateTodayPreset', () => {
    it('should validate all default presets', () => {
      variants.forEach(variant => {
        const preset = getTodayPreset(variant)
        const validation = validateTodayPreset(preset)
        
        expect(validation).toBeDefined()
        expect(validation.isValid).toBe(true)
        expect(validation.issues).toBeDefined()
        expect(validation.suggestions).toBeDefined()
        expect(Array.isArray(validation.issues)).toBe(true)
        expect(Array.isArray(validation.suggestions)).toBe(true)
      })
    })

    it('should detect invalid presets', () => {
      const invalidPreset: TodaySection = {
        variant: 'cafe',
        greeting: 'Hi',
        highlights: [],
        layout: {
          style: 'grid',
          maxItems: 4,
          showTime: true,
          showPrice: true
        },
        messaging: {
          noHighlights: 'Nothing today',
          comingSoon: 'Check back',
          callToAction: 'View Menu'
        }
      }
      
      const validation = validateTodayPreset(invalidPreset)
      expect(validation.isValid).toBe(false)
      expect(validation.issues.length).toBeGreaterThan(0)
    })
  })

  describe('Variant-specific content tests', () => {
    it('should have dive bar specific content', () => {
      const preset = getTodayPreset('dive_bar')
      
      expect(preset.greeting).toContain('Tonight')
      expect(preset.highlights.some(h => h.title.includes('Happy Hour'))).toBe(true)
      expect(preset.highlights.some(h => h.category === 'special')).toBe(true)
    })

    it('should have fine dining specific content', () => {
      const preset = getTodayPreset('fine_dining')
      
      expect(preset.greeting).toContain('Culinary')
      expect(preset.highlights.some(h => h.title.includes('Chef'))).toBe(true)
      expect(preset.highlights.some(h => h.category === 'special')).toBe(true)
    })

    it('should have café specific content', () => {
      const preset = getTodayPreset('cafe')
      
      expect(preset.greeting).toContain('Morning')
      expect(preset.highlights.some(h => h.title.includes('Coffee'))).toBe(true)
      expect(preset.highlights.some(h => h.category === 'special')).toBe(true)
    })

    it('should have sports bar specific content', () => {
      const preset = getTodayPreset('sports_bar')
      
      expect(preset.greeting).toContain('Game Day')
      expect(preset.highlights.some(h => h.title.includes('Game'))).toBe(true)
      expect(preset.highlights.some(h => h.category === 'event')).toBe(true)
    })

    it('should have family restaurant specific content', () => {
      const preset = getTodayPreset('family_restaurant')
      
      expect(preset.greeting).toContain('Welcome')
      expect(preset.highlights.some(h => h.title.includes('Kids'))).toBe(true)
      expect(preset.highlights.some(h => h.category === 'special')).toBe(true)
    })
  })
})
