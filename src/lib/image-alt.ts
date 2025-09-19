// src/lib/image-alt.ts
// Centralized alt text mapping for all images

export interface ImageAltMapping {
  [filename: string]: string
}

// Fixed alt text mappings for known images
export const IMAGE_ALT_MAPPINGS: ImageAltMapping = {
  // Hero and branding
  'hero.png': "Monaghan's Bar & Grill - Interior view showing bar and dining area",
  'favicon.ico': "Monaghan's Bar & Grill logo",
  
  // Food items
  'monaghans-fish-n-chips.jpg': "Fish & Chips - Beer-battered cod with crispy fries",
  'monaghans-taco-platter.jpg': "Taco Platter - Fresh tacos with rice and beans",
  'monaghans-quesadilla.jpg': "Chicken Quesadilla - Grilled cheese and chicken quesadilla",
  'monaghans-breakfast-biscut.jpg': "Breakfast Biscuit - Fresh biscuit with eggs and bacon",
  
  // Interior spaces
  'monaghans-billiards.jpg': "Pool tables at Monaghan's Bar & Grill",
  'monaghans-billiard-room.jpg': "Bar area with pool tables and seating",
  'monaghans-patio.jpg': "Outdoor patio seating area",
  'monaghans-beer-and-shot.jpg': "Bar area with beer taps and drinks",
  'monaghans-kareoke.jpg': "Karaoke area with stage and microphones",
  
  // Menus
  'monaghans-menu-breakfast.jpg': "Breakfast menu at Monaghan's Bar & Grill",
  'monaghans-menu-dinner.jpg': "Dinner menu at Monaghan's Bar & Grill",
}

// Fallback alt text generation rules
export function generateFallbackAlt(filename: string, context?: string): string {
  // Remove file extension
  const nameWithoutExt = filename.replace(/\.[^/.]+$/, '')
  
  // Remove 'monaghans-' prefix if present
  const cleanName = nameWithoutExt.replace(/^monaghans-/, '')
  
  // Convert kebab-case to readable format
  const readableName = cleanName
    .split('-')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ')
  
  // Add context if provided
  if (context) {
    return `${readableName} - ${context}`
  }
  
  // Default context based on filename patterns
  if (cleanName.includes('menu')) {
    return `${readableName} at Monaghan's Bar & Grill`
  }
  
  if (cleanName.includes('billiard') || cleanName.includes('pool')) {
    return `${readableName} at Monaghan's Bar & Grill`
  }
  
  if (cleanName.includes('patio') || cleanName.includes('outdoor')) {
    return `${readableName} at Monaghan's Bar & Grill`
  }
  
  if (cleanName.includes('beer') || cleanName.includes('bar')) {
    return `${readableName} at Monaghan's Bar & Grill`
  }
  
  if (cleanName.includes('kareoke') || cleanName.includes('karaoke')) {
    return `${readableName} area at Monaghan's Bar & Grill`
  }
  
  // Default fallback
  return `${readableName} at Monaghan's Bar & Grill`
}

// Get alt text for an image, using mapping or fallback
export function getImageAlt(filename: string, context?: string): string {
  // Check if we have a fixed mapping
  if (IMAGE_ALT_MAPPINGS[filename]) {
    return IMAGE_ALT_MAPPINGS[filename]
  }
  
  // Use fallback generation
  return generateFallbackAlt(filename, context)
}

// Validate that all images have appropriate alt text
export function validateImageAlt(filename: string, altText: string): {
  isValid: boolean
  issues: string[]
} {
  const issues: string[] = []
  
  // Check for empty alt text
  if (!altText || altText.trim() === '') {
    issues.push('Alt text is empty')
  }
  
  // Check for generic alt text
  const genericTerms = ['image', 'picture', 'photo', 'img']
  if (genericTerms.some(term => altText.toLowerCase().includes(term))) {
    issues.push('Alt text is too generic')
  }
  
  // Check for filename-based alt text (not descriptive)
  const filenameWithoutExt = filename.replace(/\.[^/.]+$/, '')
  const altLower = altText.toLowerCase()
  const filenameLower = filenameWithoutExt.toLowerCase()
  
  // Check if alt text is just the filename with minimal changes
  if (altLower === filenameLower || 
      altLower === filenameLower.replace(/-/g, ' ') ||
      altLower === filenameLower.replace(/-/g, '') ||
      (altLower.includes(filenameLower) && altLower.length < filenameLower.length + 10)) {
    issues.push('Alt text appears to be filename-based')
  }
  
  // Check minimum length
  if (altText.length < 10) {
    issues.push('Alt text is too short')
  }
  
  // Check maximum length (screen readers typically limit to 125 characters)
  if (altText.length > 125) {
    issues.push('Alt text is too long for screen readers')
  }
  
  return {
    isValid: issues.length === 0,
    issues
  }
}

// Get all image files that need alt text
export function getAllImageFiles(): string[] {
  return Object.keys(IMAGE_ALT_MAPPINGS)
}

// Check if an image has a predefined alt text mapping
export function hasImageMapping(filename: string): boolean {
  return filename in IMAGE_ALT_MAPPINGS
}
