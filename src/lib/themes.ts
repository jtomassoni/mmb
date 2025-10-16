export interface Theme {
  id: string
  name: string
  description: string
  category: 'classic' | 'modern' | 'rustic' | 'elegant' | 'vibrant'
  colors: {
    primary: string
    secondary: string
    accent: string
    background: string
    surface: string
    text: string
    textSecondary: string
    border: string
    hover: string
    success: string
    warning: string
    error: string
  }
  fonts: {
    heading: string
    body: string
  }
  borderRadius: string
  shadows: string
}

export const themes: Theme[] = [
  // Irish Pub - The current default
  {
    id: 'irish-pub',
    name: 'Irish Pub',
    description: 'Classic green and gold Irish pub atmosphere',
    category: 'classic',
    colors: {
      primary: '#8B4513', // Saddle brown
      secondary: '#2F5233', // Dark forest green  
      accent: '#D4AF37', // Gold
      background: '#FAF9F6', // Off-white/cream
      surface: '#FFFFFF', // White
      text: '#1C1C1C', // Near black
      textSecondary: '#4A5568', // Gray
      border: '#D4C5B9', // Light tan
      hover: '#A0DAA0', // Light green
      success: '#2F5233', // Forest green
      warning: '#D4AF37', // Gold
      error: '#C41E3A', // Irish red
    },
    fonts: {
      heading: 'Georgia, serif',
      body: 'system-ui, sans-serif',
    },
    borderRadius: '0.375rem',
    shadows: '0 2px 4px rgba(0, 0, 0, 0.1)',
  },

  // Modern Steakhouse
  {
    id: 'modern-steakhouse',
    name: 'Modern Steakhouse',
    description: 'Sophisticated dark tones with warm accents',
    category: 'elegant',
    colors: {
      primary: '#2C1810', // Dark brown/charcoal
      secondary: '#4A3428', // Medium brown
      accent: '#C87941', // Copper/burnt orange
      background: '#F5F3F0', // Warm off-white
      surface: '#FFFFFF', // White
      text: '#2C1810', // Dark brown
      textSecondary: '#6B5D52', // Medium brown-gray
      border: '#D4C5B9', // Tan
      hover: '#E8D5C4', // Light tan
      success: '#5D7052', // Sage green
      warning: '#C87941', // Copper
      error: '#8B3A3A', // Dark red
    },
    fonts: {
      heading: 'Playfair Display, serif',
      body: 'Inter, system-ui, sans-serif',
    },
    borderRadius: '0.25rem',
    shadows: '0 4px 6px rgba(0, 0, 0, 0.15)',
  },

  // Beach Bar
  {
    id: 'beach-bar',
    name: 'Beach Bar',
    description: 'Bright coastal blues with sandy neutrals',
    category: 'vibrant',
    colors: {
      primary: '#0077BE', // Ocean blue
      secondary: '#00A8E8', // Sky blue
      accent: '#FF6B35', // Coral/sunset orange
      background: '#F9F7F4', // Sand/cream
      surface: '#FFFFFF', // White
      text: '#2C3E50', // Navy
      textSecondary: '#7F8C8D', // Gray-blue
      border: '#BDC3C7', // Light gray
      hover: '#D6EAF8', // Light blue
      success: '#27AE60', // Teal-green
      warning: '#F39C12', // Sunset gold
      error: '#E74C3C', // Coral red
    },
    fonts: {
      heading: 'Montserrat, sans-serif',
      body: 'system-ui, sans-serif',
    },
    borderRadius: '0.5rem',
    shadows: '0 2px 8px rgba(0, 119, 190, 0.15)',
  },

  // Rustic Farmhouse
  {
    id: 'rustic-farmhouse',
    name: 'Rustic Farmhouse',
    description: 'Warm barn wood and vintage whites',
    category: 'rustic',
    colors: {
      primary: '#8B7355', // Weathered wood brown
      secondary: '#A0826D', // Light wood
      accent: '#C84630', // Barn red
      background: '#FDFBF7', // Antique white
      surface: '#FFFFFF', // White
      text: '#3E2723', // Dark brown
      textSecondary: '#6D4C41', // Medium brown
      border: '#D7CCC8', // Light gray-brown
      hover: '#EFE4D7', // Cream
      success: '#7D8471', // Sage green
      warning: '#C84630', // Barn red
      error: '#A52A2A', // Brown-red
    },
    fonts: {
      heading: 'Merriweather, serif',
      body: 'system-ui, sans-serif',
    },
    borderRadius: '0.25rem',
    shadows: '0 1px 3px rgba(0, 0, 0, 0.12)',
  },

  // Sports Bar
  {
    id: 'sports-bar',
    name: 'Sports Bar',
    description: 'Bold team colors with high energy',
    category: 'modern',
    colors: {
      primary: '#1A1A2E', // Deep navy (almost black)
      secondary: '#0F3460', // Royal blue
      accent: '#E94560', // Hot red/pink
      background: '#F8F9FA', // Light gray
      surface: '#FFFFFF', // White
      text: '#1A1A2E', // Navy
      textSecondary: '#6C757D', // Gray
      border: '#DEE2E6', // Light gray
      hover: '#E3F2FD', // Very light blue
      success: '#16C79A', // Bright green
      warning: '#F77F00', // Orange
      error: '#E94560', // Hot red
    },
    fonts: {
      heading: 'Roboto Condensed, sans-serif',
      body: 'system-ui, sans-serif',
    },
    borderRadius: '0.5rem',
    shadows: '0 3px 6px rgba(0, 0, 0, 0.16)',
  },
]

export function getThemeById(id: string): Theme | undefined {
  return themes.find(theme => theme.id === id)
}

export function getThemesByCategory(category: Theme['category']): Theme[] {
  return themes.filter(theme => theme.category === category)
}

export function getDefaultTheme(): Theme {
  return themes[0] // Classic Green
}

export function applyThemeToDocument(theme: Theme) {
  const root = document.documentElement
  
  // Apply CSS custom properties
  root.style.setProperty('--color-primary', theme.colors.primary)
  root.style.setProperty('--color-secondary', theme.colors.secondary)
  root.style.setProperty('--color-accent', theme.colors.accent)
  root.style.setProperty('--color-background', theme.colors.background)
  root.style.setProperty('--color-surface', theme.colors.surface)
  root.style.setProperty('--color-text', theme.colors.text)
  root.style.setProperty('--color-text-secondary', theme.colors.textSecondary)
  root.style.setProperty('--color-border', theme.colors.border)
  root.style.setProperty('--color-hover', theme.colors.hover)
  root.style.setProperty('--color-success', theme.colors.success)
  root.style.setProperty('--color-warning', theme.colors.warning)
  root.style.setProperty('--color-error', theme.colors.error)
  
  // Apply fonts
  root.style.setProperty('--font-heading', theme.fonts.heading)
  root.style.setProperty('--font-body', theme.fonts.body)
  
  // Apply other properties
  root.style.setProperty('--border-radius', theme.borderRadius)
  root.style.setProperty('--shadow', theme.shadows)
  
  // Store theme in localStorage
  localStorage.setItem('selected-theme', theme.id)
}

export function getStoredTheme(): Theme {
  if (typeof window === 'undefined') return getDefaultTheme()
  
  const storedThemeId = localStorage.getItem('selected-theme')
  if (storedThemeId) {
    const theme = getThemeById(storedThemeId)
    if (theme) return theme
  }
  
  return getDefaultTheme()
}
