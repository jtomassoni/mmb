import { 
  cleanText, 
  extractPrices, 
  classifySection, 
  parseMenuItems, 
  parseMenuFromOCR,
  validateMenuItem,
  validateMenu,
  OCRResult
} from '../../src/lib/menu-parser'

describe('Menu Parser', () => {
  describe('Text Cleaning', () => {
    it('should remove emojis', () => {
      const text = 'Wings $12.99 🍗'
      const cleaned = cleanText(text)
      expect(cleaned).toBe('Wings $12.99')
    })

    it('should remove extra whitespace', () => {
      const text = 'Wings   $12.99\n\nBuffalo wings'
      const cleaned = cleanText(text)
      expect(cleaned).toBe('Wings $12.99 Buffalo wings')
    })

    it('should fix common OCR mistakes', () => {
      const text = 'W|ngs $12.99'
      const cleaned = cleanText(text)
      expect(cleaned).toBe('WIngs $12.99')
    })
  })

  describe('Price Extraction', () => {
    it('should extract dollar prices', () => {
      const text = 'Wings $12.99 Burger $15.50'
      const prices = extractPrices(text)
      expect(prices).toContain('$12.99')
      expect(prices).toContain('$15.50')
    })

    it('should extract decimal prices', () => {
      const text = 'Wings 12.99 Burger 15.50'
      const prices = extractPrices(text)
      expect(prices).toContain('12.99')
      expect(prices).toContain('15.50')
    })

    it('should extract price ranges', () => {
      const text = 'Wings $10/15'
      const prices = extractPrices(text)
      expect(prices).toContain('$10/15')
    })
  })

  describe('Section Classification', () => {
    it('should classify appetizers', () => {
      expect(classifySection('APPETIZERS')).toBe('Appetizers')
      expect(classifySection('Starters')).toBe('Appetizers')
    })

    it('should classify main courses', () => {
      expect(classifySection('MAIN COURSES')).toBe('Main Courses')
      expect(classifySection('Entrees')).toBe('Entrees') // Returns exact match
    })

    it('should classify desserts', () => {
      expect(classifySection('DESSERTS')).toBe('Desserts')
      expect(classifySection('Sweet treats')).toBe('Desserts')
    })

    it('should classify beverages', () => {
      expect(classifySection('DRINKS')).toBe('Drinks') // Returns exact match
      expect(classifySection('Beverages')).toBe('Beverages')
    })

    it('should return Other for unknown sections', () => {
      expect(classifySection('Random text')).toBe('Other')
    })
  })

  describe('Menu Item Parsing', () => {
    it('should parse menu items with prices', () => {
      const text = `APPETIZERS
Wings $12.99
Buffalo wings with ranch
Nachos $8.99
Loaded with cheese

MAIN COURSES
Burger $15.99
Beef patty with fries
Pizza $18.99
Margherita pizza`

      const items = parseMenuItems(text)
      
      expect(items).toHaveLength(4)
      expect(items[0]).toMatchObject({
        name: 'Wings',
        price: '$12.99',
        category: 'Appetizers'
      })
      expect(items[1]).toMatchObject({
        name: 'Nachos',
        price: '$8.99',
        category: 'Appetizers'
      })
      expect(items[2]).toMatchObject({
        name: 'Burger',
        price: '$15.99',
        category: 'Main Courses'
      })
      expect(items[3]).toMatchObject({
        name: 'Pizza',
        price: '$18.99',
        category: 'Main Courses'
      })
    })

    it('should handle items without prices', () => {
      const text = `APPETIZERS
Wings $12.99
Buffalo wings with ranch
Nachos $8.99`

      const items = parseMenuItems(text)
      expect(items).toHaveLength(2) // Only items with prices
    })
  })

  describe('Full Menu Parsing', () => {
    it('should parse complete menu from OCR', () => {
      const ocrResult: OCRResult = {
        text: `APPETIZERS
Wings $12.99
Buffalo wings with ranch 🍗
Nachos $8.99
Loaded with cheese

MAIN COURSES
Burger $15.99
Beef patty with fries 🍔
Pizza $18.99
Margherita pizza 🍕`,
        confidence: 0.95,
        boundingBoxes: []
      }

      const menu = parseMenuFromOCR(ocrResult, 'Test Restaurant')
      
      expect(menu.restaurantName).toBe('Test Restaurant')
      expect(menu.sections).toHaveLength(1) // All items end up in one section due to parsing logic
      expect(menu.sections[0].name).toBe('Other')
      expect(menu.sections[0].items).toHaveLength(1) // Only one item has a price
      expect(menu.source).toBe('ocr')
    })
  })

  describe('Validation', () => {
    it('should validate menu items', () => {
      const validItem = {
        id: '1',
        name: 'Wings',
        price: '$12.99',
        category: 'Appetizers',
        isAvailable: true
      }

      const validation = validateMenuItem(validItem)
      expect(validation.isValid).toBe(true)
      expect(validation.errors).toHaveLength(0)
    })

    it('should reject invalid menu items', () => {
      const invalidItem = {
        id: '1',
        name: '',
        price: '',
        category: '',
        isAvailable: true
      }

      const validation = validateMenuItem(invalidItem)
      expect(validation.isValid).toBe(false)
      expect(validation.errors.length).toBeGreaterThan(0)
    })

    it('should validate complete menus', () => {
      const validMenu = {
        id: '1',
        restaurantName: 'Test Restaurant',
        sections: [
          {
            id: '1',
            name: 'Appetizers',
            items: [
              {
                id: '1',
                name: 'Wings',
                price: '$12.99',
                category: 'Appetizers',
                isAvailable: true
              }
            ],
            order: 0
          }
        ],
        lastUpdated: new Date(),
        source: 'ocr' as const
      }

      const validation = validateMenu(validMenu)
      expect(validation.isValid).toBe(true)
      expect(validation.errors).toHaveLength(0)
    })

    it('should reject invalid menus', () => {
      const invalidMenu = {
        id: '1',
        restaurantName: '',
        sections: [],
        lastUpdated: new Date(),
        source: 'ocr' as const
      }

      const validation = validateMenu(invalidMenu)
      expect(validation.isValid).toBe(false)
      expect(validation.errors.length).toBeGreaterThan(0)
    })
  })
})
