// src/lib/menu-parser.ts
export interface MenuItem {
  id: string
  name: string
  description?: string
  price: string
  category: string
  isAvailable: boolean
  allergens?: string[]
  calories?: number
  imageUrl?: string
}

export interface MenuSection {
  id: string
  name: string
  description?: string
  items: MenuItem[]
  order: number
}

export interface ParsedMenu {
  id: string
  restaurantName: string
  sections: MenuSection[]
  lastUpdated: Date
  source: 'ocr' | 'manual' | 'import'
}

export interface OCRResult {
  text: string
  confidence: number
  boundingBoxes: BoundingBox[]
}

export interface BoundingBox {
  x: number
  y: number
  width: number
  height: number
  text: string
  confidence: number
}

// Menu section classifiers
export const MENU_SECTIONS = [
  'Appetizers',
  'Salads',
  'Soups',
  'Breakfast',
  'Lunch',
  'Dinner',
  'Main Courses',
  'Entrees',
  'Sandwiches',
  'Burgers',
  'Pizza',
  'Pasta',
  'Seafood',
  'Steak',
  'Chicken',
  'Vegetarian',
  'Vegan',
  'Desserts',
  'Beverages',
  'Drinks',
  'Cocktails',
  'Wine',
  'Beer',
  'Coffee',
  'Tea',
  'Kids Menu',
  'Specials',
  'Daily Specials',
  'Happy Hour',
  'Sides',
  'Extras'
]

// Price patterns
export const PRICE_PATTERNS = [
  /\$\d+\.?\d*/g,           // $10, $10.50
  /\d+\.\d{2}/g,            // 10.50
  /\$\d+\/\d+/g,            // $10/15 (price range)
  /price\s*:\s*\$\d+\.?\d*/gi, // Price: $10
  /cost\s*:\s*\$\d+\.?\d*/gi,  // Cost: $10
]

// Common emoji patterns to remove
export const EMOJI_PATTERNS = [
  /[\u{1F600}-\u{1F64F}]/gu, // Emoticons
  /[\u{1F300}-\u{1F5FF}]/gu, // Misc Symbols
  /[\u{1F680}-\u{1F6FF}]/gu, // Transport
  /[\u{1F1E0}-\u{1F1FF}]/gu, // Flags
  /[\u{2600}-\u{26FF}]/gu,   // Misc symbols
  /[\u{2700}-\u{27BF}]/gu,   // Dingbats
  /[\u{1F900}-\u{1F9FF}]/gu, // Supplemental Symbols
  /[\u{1FA70}-\u{1FAFF}]/gu, // Symbols and Pictographs
]

// Common allergens
export const ALLERGENS = [
  'gluten', 'wheat', 'dairy', 'milk', 'eggs', 'soy', 'nuts', 'peanuts',
  'tree nuts', 'fish', 'shellfish', 'sesame', 'mustard', 'sulfites'
]

export function extractTextFromImage(imageData: string | Buffer): Promise<OCRResult> {
  // This would integrate with a real OCR service like:
  // - Google Cloud Vision API
  // - AWS Textract
  // - Azure Computer Vision
  // - Tesseract.js (client-side)
  
  // For now, return mock data
  return Promise.resolve({
    text: `APPETIZERS
Wings $12.99
Buffalo wings with ranch 🍗
Nachos $8.99
Loaded with cheese and jalapeños

MAIN COURSES
Burger $15.99
Beef patty with fries 🍔
Pizza $18.99
Margherita pizza 🍕

DESSERTS
Cheesecake $6.99
New York style 🍰`,
    confidence: 0.95,
    boundingBoxes: []
  })
}

export function cleanText(text: string): string {
  let cleaned = text
  
  // Remove emojis
  EMOJI_PATTERNS.forEach(pattern => {
    cleaned = cleaned.replace(pattern, '')
  })
  
  // Remove extra whitespace
  cleaned = cleaned.replace(/\s+/g, ' ').trim()
  
  // Remove common OCR artifacts
  cleaned = cleaned.replace(/[|]/g, 'I') // Common OCR mistake
  cleaned = cleaned.replace(/[0O]/g, 'O') // Common OCR mistake
  
  return cleaned
}

export function extractPrices(text: string): string[] {
  const prices: string[] = []
  
  PRICE_PATTERNS.forEach(pattern => {
    const matches = text.match(pattern)
    if (matches) {
      prices.push(...matches)
    }
  })
  
  return [...new Set(prices)] // Remove duplicates
}

export function classifySection(text: string): string {
  const lowerText = text.toLowerCase()
  
  // Look for exact section headers first
  for (const section of MENU_SECTIONS) {
    if (lowerText === section.toLowerCase() || lowerText.includes(section.toLowerCase())) {
      return section
    }
  }
  
  // Look for common patterns with more specific matching
  if (lowerText.includes('appetizer') || lowerText.includes('starter') || lowerText.includes('small plates')) {
    return 'Appetizers'
  }
  
  if (lowerText.includes('main course') || lowerText.includes('entree') || lowerText.includes('mains')) {
    return 'Main Courses'
  }
  
  if (lowerText.includes('dessert') || lowerText.includes('sweet') || lowerText.includes('treats')) {
    return 'Desserts'
  }
  
  if (lowerText.includes('drink') || lowerText.includes('beverage') || lowerText.includes('bar')) {
    return 'Beverages'
  }
  
  if (lowerText.includes('breakfast') || lowerText.includes('morning')) {
    return 'Breakfast'
  }
  
  if (lowerText.includes('lunch') || lowerText.includes('midday')) {
    return 'Lunch'
  }
  
  if (lowerText.includes('dinner') || lowerText.includes('evening')) {
    return 'Dinner'
  }
  
  if (lowerText.includes('burger') || lowerText.includes('sandwich')) {
    return 'Burgers'
  }
  
  if (lowerText.includes('pizza') || lowerText.includes('pie')) {
    return 'Pizza'
  }
  
  if (lowerText.includes('pasta') || lowerText.includes('noodle')) {
    return 'Pasta'
  }
  
  if (lowerText.includes('salad') || lowerText.includes('greens')) {
    return 'Salads'
  }
  
  if (lowerText.includes('soup') || lowerText.includes('broth')) {
    return 'Soups'
  }
  
  if (lowerText.includes('kids') || lowerText.includes('children')) {
    return 'Kids Menu'
  }
  
  if (lowerText.includes('special') || lowerText.includes('featured')) {
    return 'Specials'
  }
  
  return 'Other'
}

export function parseMenuItems(text: string): MenuItem[] {
  const items: MenuItem[] = []
  const lines = text.split('\n').filter(line => line.trim())
  
  let currentSection = 'Other'
  let itemId = 1
  let currentItem = ''
  let currentDescription = ''
  
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i]
    const trimmedLine = line.trim()
    
    // Check if this is a section header
    const section = classifySection(trimmedLine)
    if (section !== 'Other' && !trimmedLine.includes('$')) {
      currentSection = section
      continue
    }
    
    // Check if this line contains a price
    const prices = extractPrices(trimmedLine)
    if (prices.length > 0) {
      // This is likely a menu item
      const price = prices[0]
      const name = trimmedLine.replace(price, '').trim()
      
      if (name.length > 0) {
        // Check if the next line is a description (no price, shorter)
        let description = ''
        if (i + 1 < lines.length) {
          const nextLine = lines[i + 1].trim()
          const nextLinePrices = extractPrices(nextLine)
          if (nextLinePrices.length === 0 && nextLine.length > 0 && nextLine.length < 100) {
            description = nextLine
            i++ // Skip the description line
          }
        }
        
        items.push({
          id: `item-${itemId++}`,
          name: cleanText(name),
          description: description || undefined,
          price: price,
          category: currentSection,
          isAvailable: true
        })
      }
    } else if (trimmedLine.length > 0 && trimmedLine.length < 100 && !trimmedLine.includes('$')) {
      // This might be a description for the previous item
      if (items.length > 0 && !items[items.length - 1].description) {
        items[items.length - 1].description = trimmedLine
      }
    }
  }
  
  return items
}

export function parseMenuFromOCR(ocrResult: OCRResult, restaurantName: string): ParsedMenu {
  const cleanedText = cleanText(ocrResult.text)
  const items = parseMenuItems(cleanedText)
  
  // Group items by category
  const sectionsMap = new Map<string, MenuItem[]>()
  
  items.forEach(item => {
    if (!sectionsMap.has(item.category)) {
      sectionsMap.set(item.category, [])
    }
    sectionsMap.get(item.category)!.push(item)
  })
  
  // Convert to sections
  const sections: MenuSection[] = Array.from(sectionsMap.entries()).map(([name, items], index) => ({
    id: `section-${index + 1}`,
    name,
    items,
    order: index
  }))
  
  return {
    id: `menu-${Date.now()}`,
    restaurantName,
    sections,
    lastUpdated: new Date(),
    source: 'ocr'
  }
}

export function validateMenuItem(item: MenuItem): { isValid: boolean; errors: string[] } {
  const errors: string[] = []
  
  if (!item.name || item.name.trim().length === 0) {
    errors.push('Item name is required')
  }
  
  if (!item.price || item.price.trim().length === 0) {
    errors.push('Item price is required')
  }
  
  if (!item.category || item.category.trim().length === 0) {
    errors.push('Item category is required')
  }
  
  // Validate price format
  if (item.price && !PRICE_PATTERNS.some(pattern => pattern.test(item.price))) {
    errors.push('Invalid price format')
  }
  
  return {
    isValid: errors.length === 0,
    errors
  }
}

export function validateMenu(menu: ParsedMenu): { isValid: boolean; errors: string[] } {
  const errors: string[] = []
  
  if (!menu.restaurantName || menu.restaurantName.trim().length === 0) {
    errors.push('Restaurant name is required')
  }
  
  if (!menu.sections || menu.sections.length === 0) {
    errors.push('At least one menu section is required')
  }
  
  // Validate each section
  menu.sections.forEach((section, sectionIndex) => {
    if (!section.name || section.name.trim().length === 0) {
      errors.push(`Section ${sectionIndex + 1} name is required`)
    }
    
    if (!section.items || section.items.length === 0) {
      errors.push(`Section ${sectionIndex + 1} must have at least one item`)
    }
    
    // Validate each item
    section.items.forEach((item, itemIndex) => {
      const itemValidation = validateMenuItem(item)
      if (!itemValidation.isValid) {
        errors.push(`Section ${sectionIndex + 1}, Item ${itemIndex + 1}: ${itemValidation.errors.join(', ')}`)
      }
    })
  })
  
  return {
    isValid: errors.length === 0,
    errors
  }
}
