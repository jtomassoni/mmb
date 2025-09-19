import { 
  getImageAlt, 
  generateFallbackAlt, 
  validateImageAlt, 
  IMAGE_ALT_MAPPINGS,
  hasImageMapping 
} from '../../src/lib/image-alt'

describe('Image Alt Text System', () => {
  describe('IMAGE_ALT_MAPPINGS', () => {
    it('should have mappings for all known images', () => {
      const expectedImages = [
        'hero.png',
        'favicon.ico',
        'monaghans-fish-n-chips.jpg',
        'monaghans-taco-platter.jpg',
        'monaghans-quesadilla.jpg',
        'monaghans-breakfast-biscut.jpg',
        'monaghans-billiards.jpg',
        'monaghans-billiard-room.jpg',
        'monaghans-patio.jpg',
        'monaghans-beer-and-shot.jpg',
        'monaghans-kareoke.jpg',
        'monaghans-menu-breakfast.jpg',
        'monaghans-menu-dinner.jpg'
      ]

      expectedImages.forEach(filename => {
        expect(IMAGE_ALT_MAPPINGS[filename]).toBeDefined()
        expect(IMAGE_ALT_MAPPINGS[filename].length).toBeGreaterThan(10)
      })
    })

    it('should have descriptive alt text for all mapped images', () => {
      Object.entries(IMAGE_ALT_MAPPINGS).forEach(([filename, altText]) => {
        const validation = validateImageAlt(filename, altText)
        expect(validation.isValid).toBe(true)
        expect(validation.issues).toHaveLength(0)
      })
    })
  })

  describe('getImageAlt', () => {
    it('should return mapped alt text for known images', () => {
      expect(getImageAlt('hero.png')).toBe("Monaghan's Bar & Grill - Interior view showing bar and dining area")
      expect(getImageAlt('monaghans-fish-n-chips.jpg')).toBe("Fish & Chips - Beer-battered cod with crispy fries")
    })

    it('should generate fallback alt text for unknown images', () => {
      const alt = getImageAlt('unknown-image.jpg')
      expect(alt).toContain('Unknown Image')
      expect(alt).toContain("Monaghan's Bar & Grill")
    })

    it('should use context when provided', () => {
      const alt = getImageAlt('unknown-food.jpg', 'delicious meal')
      expect(alt).toContain('Unknown Food')
      expect(alt).toContain('delicious meal')
    })
  })

  describe('generateFallbackAlt', () => {
    it('should convert kebab-case to readable format', () => {
      expect(generateFallbackAlt('monaghans-beer-and-shot.jpg')).toBe("Beer And Shot at Monaghan's Bar & Grill")
      expect(generateFallbackAlt('menu-breakfast.jpg')).toBe("Menu Breakfast at Monaghan's Bar & Grill")
    })

    it('should handle special cases', () => {
      expect(generateFallbackAlt('monaghans-billiard-room.jpg')).toBe("Billiard Room at Monaghan's Bar & Grill")
      expect(generateFallbackAlt('monaghans-kareoke.jpg')).toBe("Kareoke area at Monaghan's Bar & Grill")
    })

    it('should add context when provided', () => {
      expect(generateFallbackAlt('food-item.jpg', 'delicious meal')).toBe("Food Item - delicious meal")
    })
  })

  describe('validateImageAlt', () => {
    it('should validate good alt text', () => {
      const validation = validateImageAlt('test.jpg', "Delicious fish and chips with crispy fries")
      expect(validation.isValid).toBe(true)
      expect(validation.issues).toHaveLength(0)
    })

    it('should catch empty alt text', () => {
      const validation = validateImageAlt('test.jpg', '')
      expect(validation.isValid).toBe(false)
      expect(validation.issues).toContain('Alt text is empty')
    })

    it('should catch generic alt text', () => {
      const validation = validateImageAlt('test.jpg', 'image of food')
      expect(validation.isValid).toBe(false)
      expect(validation.issues).toContain('Alt text is too generic')
    })

    it('should catch filename-based alt text', () => {
      const validation = validateImageAlt('my-photo.jpg', 'my-photo')
      expect(validation.isValid).toBe(false)
      expect(validation.issues).toContain('Alt text appears to be filename-based')
    })

    it('should catch too short alt text', () => {
      const validation = validateImageAlt('test.jpg', 'food')
      expect(validation.isValid).toBe(false)
      expect(validation.issues).toContain('Alt text is too short')
    })

    it('should catch too long alt text', () => {
      const longAlt = 'This is an extremely long alt text that exceeds the recommended 125 character limit for screen readers and should be flagged as too long for accessibility purposes'
      const validation = validateImageAlt('test.jpg', longAlt)
      expect(validation.isValid).toBe(false)
      expect(validation.issues).toContain('Alt text is too long for screen readers')
    })
  })

  describe('hasImageMapping', () => {
    it('should return true for mapped images', () => {
      expect(hasImageMapping('hero.png')).toBe(true)
      expect(hasImageMapping('monaghans-fish-n-chips.jpg')).toBe(true)
    })

    it('should return false for unmapped images', () => {
      expect(hasImageMapping('unknown-image.jpg')).toBe(false)
      expect(hasImageMapping('new-photo.png')).toBe(false)
    })
  })
})
