import {
  getDesignTokens,
  getCSSVariables,
  getTailwindClasses,
  validateContrastRatios,
  getVariantInfo,
  BusinessVariant
} from '../../src/lib/design-tokens'
import {
  generateComponentTokens,
  tokensToCSS,
  generateCSSCustomProperties,
  generateVariantClasses,
  generateResponsiveTypography,
  generateDarkModeTokens,
  generateAccessibleTokens
} from '../../src/lib/apply-tokens'

describe('Design Tokens', () => {
  const variants: BusinessVariant[] = ['dive_bar', 'fine_dining', 'cafe', 'sports_bar', 'family_restaurant']

  describe('getDesignTokens', () => {
    it('should return tokens for all variants', () => {
      variants.forEach(variant => {
        const tokens = getDesignTokens(variant)
        
        expect(tokens).toBeDefined()
        expect(tokens.typography).toBeDefined()
        expect(tokens.spacing).toBeDefined()
        expect(tokens.colors).toBeDefined()
        expect(tokens.contrast).toBeDefined()
        expect(tokens.borderRadius).toBeDefined()
        expect(tokens.shadows).toBeDefined()
      })
    })

    it('should return different tokens for different variants', () => {
      const diveBarTokens = getDesignTokens('dive_bar')
      const fineDiningTokens = getDesignTokens('fine_dining')
      
      expect(diveBarTokens.typography.fontFamily.heading).not.toBe(fineDiningTokens.typography.fontFamily.heading)
      expect(diveBarTokens.colors.primary[500]).not.toBe(fineDiningTokens.colors.primary[500])
    })

    it('should return café tokens as default for unknown variant', () => {
      const unknownTokens = getDesignTokens('unknown' as BusinessVariant)
      const cafeTokens = getDesignTokens('cafe')
      
      expect(unknownTokens.typography.fontFamily.heading).toBe(cafeTokens.typography.fontFamily.heading)
    })

    it('should have proper typography structure', () => {
      variants.forEach(variant => {
        const tokens = getDesignTokens(variant)
        
        expect(tokens.typography.fontFamily).toHaveProperty('heading')
        expect(tokens.typography.fontFamily).toHaveProperty('body')
        expect(tokens.typography.fontFamily).toHaveProperty('accent')
        
        expect(tokens.typography.fontSize).toHaveProperty('xs')
        expect(tokens.typography.fontSize).toHaveProperty('sm')
        expect(tokens.typography.fontSize).toHaveProperty('base')
        expect(tokens.typography.fontSize).toHaveProperty('lg')
        expect(tokens.typography.fontSize).toHaveProperty('xl')
        expect(tokens.typography.fontSize).toHaveProperty('2xl')
        expect(tokens.typography.fontSize).toHaveProperty('3xl')
        expect(tokens.typography.fontSize).toHaveProperty('4xl')
        expect(tokens.typography.fontSize).toHaveProperty('5xl')
        expect(tokens.typography.fontSize).toHaveProperty('6xl')
        
        expect(tokens.typography.fontWeight).toHaveProperty('light')
        expect(tokens.typography.fontWeight).toHaveProperty('normal')
        expect(tokens.typography.fontWeight).toHaveProperty('medium')
        expect(tokens.typography.fontWeight).toHaveProperty('semibold')
        expect(tokens.typography.fontWeight).toHaveProperty('bold')
        expect(tokens.typography.fontWeight).toHaveProperty('extrabold')
      })
    })

    it('should have proper color structure', () => {
      variants.forEach(variant => {
        const tokens = getDesignTokens(variant)
        
        expect(tokens.colors).toHaveProperty('primary')
        expect(tokens.colors).toHaveProperty('secondary')
        expect(tokens.colors).toHaveProperty('neutral')
        expect(tokens.colors).toHaveProperty('accent')
        
        // Check color scales
        Object.values(tokens.colors).forEach(colorScale => {
          expect(colorScale).toHaveProperty('50')
          expect(colorScale).toHaveProperty('100')
          expect(colorScale).toHaveProperty('200')
          expect(colorScale).toHaveProperty('300')
          expect(colorScale).toHaveProperty('400')
          expect(colorScale).toHaveProperty('500')
          expect(colorScale).toHaveProperty('600')
          expect(colorScale).toHaveProperty('700')
          expect(colorScale).toHaveProperty('800')
          expect(colorScale).toHaveProperty('900')
        })
      })
    })
  })

  describe('getCSSVariables', () => {
    it('should generate CSS variables for all variants', () => {
      variants.forEach(variant => {
        const variables = getCSSVariables(variant)
        
        expect(variables).toBeDefined()
        expect(Object.keys(variables).length).toBeGreaterThan(0)
        
        // Check for key CSS variables
        expect(variables).toHaveProperty('--font-heading')
        expect(variables).toHaveProperty('--font-body')
        expect(variables).toHaveProperty('--font-accent')
        expect(variables).toHaveProperty('--color-primary-500')
        expect(variables).toHaveProperty('--color-secondary-500')
        expect(variables).toHaveProperty('--color-neutral-500')
        expect(variables).toHaveProperty('--color-accent-500')
      })
    })

    it('should have valid CSS values', () => {
      variants.forEach(variant => {
        const variables = getCSSVariables(variant)
        
        Object.entries(variables).forEach(([key, value]) => {
          expect(value).toBeDefined()
          expect(typeof value).toBe('string')
          expect(value.length).toBeGreaterThan(0)
        })
      })
    })
  })

  describe('getTailwindClasses', () => {
    it('should generate Tailwind classes for all variants', () => {
      variants.forEach(variant => {
        const classes = getTailwindClasses(variant)
        
        expect(classes).toBeDefined()
        expect(classes.fontFamily).toBeDefined()
        expect(classes.colors).toBeDefined()
        expect(classes.spacing).toBeDefined()
        expect(classes.borderRadius).toBeDefined()
        expect(classes.shadows).toBeDefined()
      })
    })
  })

  describe('validateContrastRatios', () => {
    it('should validate contrast ratios for all variants', () => {
      variants.forEach(variant => {
        const validation = validateContrastRatios(variant)
        
        expect(validation).toBeDefined()
        expect(validation.isValid).toBeDefined()
        expect(validation.violations).toBeDefined()
        expect(Array.isArray(validation.violations)).toBe(true)
        
        validation.violations.forEach(violation => {
          expect(violation).toHaveProperty('element')
          expect(violation).toHaveProperty('ratio')
          expect(violation).toHaveProperty('required')
          expect(violation).toHaveProperty('status')
          expect(['pass', 'fail']).toContain(violation.status)
        })
      })
    })

    it('should have proper contrast ratios for dive bar (high contrast)', () => {
      const validation = validateContrastRatios('dive_bar')
      
      const primaryTextViolation = validation.violations.find(v => v.element === 'text-primary')
      expect(primaryTextViolation).toBeDefined()
      expect(primaryTextViolation!.ratio).toBeGreaterThanOrEqual(7.0)
    })

    it('should have proper contrast ratios for fine dining (subtle contrast)', () => {
      const validation = validateContrastRatios('fine_dining')
      
      const primaryTextViolation = validation.violations.find(v => v.element === 'text-primary')
      expect(primaryTextViolation).toBeDefined()
      expect(primaryTextViolation!.ratio).toBeGreaterThanOrEqual(4.5)
    })
  })

  describe('getVariantInfo', () => {
    it('should return variant info for all variants', () => {
      variants.forEach(variant => {
        const info = getVariantInfo(variant)
        
        expect(info).toBeDefined()
        expect(info.name).toBeDefined()
        expect(info.description).toBeDefined()
        expect(info.characteristics).toBeDefined()
        expect(info.targetAudience).toBeDefined()
        expect(info.mood).toBeDefined()
        
        expect(Array.isArray(info.characteristics)).toBe(true)
        expect(info.characteristics.length).toBeGreaterThan(0)
      })
    })

    it('should have unique characteristics for each variant', () => {
      const diveBarInfo = getVariantInfo('dive_bar')
      const fineDiningInfo = getVariantInfo('fine_dining')
      
      expect(diveBarInfo.characteristics).not.toEqual(fineDiningInfo.characteristics)
      expect(diveBarInfo.mood).not.toBe(fineDiningInfo.mood)
    })
  })

  describe('generateComponentTokens', () => {
    it('should generate component tokens for all variants', () => {
      variants.forEach(variant => {
        const tokens = generateComponentTokens(variant)
        
        expect(tokens).toBeDefined()
        expect(tokens.heading).toBeDefined()
        expect(tokens.subheading).toBeDefined()
        expect(tokens.body).toBeDefined()
        expect(tokens.caption).toBeDefined()
        expect(tokens.button).toBeDefined()
        expect(tokens.card).toBeDefined()
        expect(tokens.input).toBeDefined()
      })
    })

    it('should have proper component token structure', () => {
      const tokens = generateComponentTokens('cafe')
      
      Object.values(tokens).forEach(component => {
        expect(component).toHaveProperty('fontFamily')
        expect(component).toHaveProperty('fontSize')
        expect(component).toHaveProperty('fontWeight')
        expect(component).toHaveProperty('lineHeight')
        expect(component).toHaveProperty('letterSpacing')
        expect(component).toHaveProperty('color')
        expect(component).toHaveProperty('backgroundColor')
        expect(component).toHaveProperty('padding')
        expect(component).toHaveProperty('margin')
        expect(component).toHaveProperty('borderRadius')
        expect(component).toHaveProperty('boxShadow')
      })
    })
  })

  describe('tokensToCSS', () => {
    it('should convert tokens to CSS properties', () => {
      const tokens = generateComponentTokens('cafe')
      const css = tokensToCSS(tokens.heading)
      
      expect(css).toBeDefined()
      expect(css.fontFamily).toBeDefined()
      expect(css.fontSize).toBeDefined()
      expect(css.fontWeight).toBeDefined()
      expect(css.color).toBeDefined()
      expect(css.backgroundColor).toBeDefined()
    })
  })

  describe('generateCSSCustomProperties', () => {
    it('should generate CSS custom properties string', () => {
      const cssString = generateCSSCustomProperties('cafe')
      
      expect(cssString).toBeDefined()
      expect(typeof cssString).toBe('string')
      expect(cssString).toContain('--font-heading:')
      expect(cssString).toContain('--color-primary-500:')
    })
  })

  describe('generateVariantClasses', () => {
    it('should generate variant class names', () => {
      const classes = generateVariantClasses('cafe')
      
      expect(classes).toBeDefined()
      expect(classes.container).toBeDefined()
      expect(classes.heading).toBeDefined()
      expect(classes.subheading).toBeDefined()
      expect(classes.body).toBeDefined()
      expect(classes.button).toBeDefined()
      expect(classes.card).toBeDefined()
      expect(classes.input).toBeDefined()
      
      expect(classes.container).toContain('cafe')
      expect(classes.heading).toContain('cafe')
    })
  })

  describe('generateResponsiveTypography', () => {
    it('should generate responsive typography', () => {
      const responsiveTokens = generateResponsiveTypography('cafe')
      
      expect(responsiveTokens).toBeDefined()
      expect(responsiveTokens.mobile).toBeDefined()
      expect(responsiveTokens.tablet).toBeDefined()
      expect(responsiveTokens.desktop).toBeDefined()
      
      // Mobile should have smaller heading
      expect(responsiveTokens.mobile.heading.fontSize).toContain('1.875rem')
      expect(responsiveTokens.desktop.heading.fontSize).toContain('3rem')
    })
  })

  describe('generateDarkModeTokens', () => {
    it('should generate dark mode tokens', () => {
      const darkTokens = generateDarkModeTokens('cafe')
      
      expect(darkTokens).toBeDefined()
      expect(darkTokens.heading.color).toBeDefined() // Light text
      expect(darkTokens.card.backgroundColor).toBeDefined() // Dark background
      expect(darkTokens.heading.color).not.toBe('#0369a1') // Should be different from light mode
    })
  })

  describe('generateAccessibleTokens', () => {
    it('should generate accessible tokens', () => {
      const accessibleTokens = generateAccessibleTokens('cafe')
      
      expect(accessibleTokens).toBeDefined()
      expect(accessibleTokens.heading.color).toBeDefined() // Darker for better contrast
      expect(accessibleTokens.button.backgroundColor).toBeDefined() // Darker for better contrast
      expect(accessibleTokens.heading.color).toBe('#0369a1') // Should use darker primary color
    })
  })

  describe('Variant-specific tests', () => {
    it('should have bold fonts for dive bar', () => {
      const tokens = getDesignTokens('dive_bar')
      expect(tokens.typography.fontFamily.heading).toContain('Bebas Neue')
      expect(tokens.typography.fontFamily.accent).toContain('Oswald')
    })

    it('should have elegant fonts for fine dining', () => {
      const tokens = getDesignTokens('fine_dining')
      expect(tokens.typography.fontFamily.heading).toContain('Playfair Display')
      expect(tokens.typography.fontFamily.accent).toContain('Cormorant Garamond')
    })

    it('should have friendly fonts for café', () => {
      const tokens = getDesignTokens('cafe')
      expect(tokens.typography.fontFamily.heading).toContain('Poppins')
      expect(tokens.typography.fontFamily.accent).toContain('Nunito')
    })

    it('should have energetic fonts for sports bar', () => {
      const tokens = getDesignTokens('sports_bar')
      expect(tokens.typography.fontFamily.heading).toContain('Roboto Condensed')
      expect(tokens.typography.fontFamily.accent).toContain('Barlow Condensed')
    })

    it('should have welcoming fonts for family restaurant', () => {
      const tokens = getDesignTokens('family_restaurant')
      expect(tokens.typography.fontFamily.heading).toContain('Merriweather')
      expect(tokens.typography.fontFamily.accent).toContain('Lato')
    })
  })
})
