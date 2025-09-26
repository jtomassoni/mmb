/**
 * Design Token System for Restaurant Variants
 * 
 * Defines typography scales, spacing systems, and contrast ratios
 * for different business types (dive bar, fine dining, café).
 */

export type BusinessVariant = 'dive_bar' | 'fine_dining' | 'cafe' | 'sports_bar' | 'family_restaurant'

export interface TypographyScale {
  fontFamily: {
    heading: string
    body: string
    accent: string
  }
  fontSize: {
    xs: string
    sm: string
    base: string
    lg: string
    xl: string
    '2xl': string
    '3xl': string
    '4xl': string
    '5xl': string
    '6xl': string
  }
  fontWeight: {
    light: number
    normal: number
    medium: number
    semibold: number
    bold: number
    extrabold: number
  }
  lineHeight: {
    tight: number
    snug: number
    normal: number
    relaxed: number
    loose: number
  }
  letterSpacing: {
    tighter: string
    tight: string
    normal: string
    wide: string
    wider: string
    widest: string
  }
}

export interface SpacingScale {
  xs: string
  sm: string
  md: string
  lg: string
  xl: string
  '2xl': string
  '3xl': string
  '4xl': string
  '5xl': string
  '6xl': string
}

export interface ColorPalette {
  primary: {
    50: string
    100: string
    200: string
    300: string
    400: string
    500: string
    600: string
    700: string
    800: string
    900: string
  }
  secondary: {
    50: string
    100: string
    200: string
    300: string
    400: string
    500: string
    600: string
    700: string
    800: string
    900: string
  }
  neutral: {
    50: string
    100: string
    200: string
    300: string
    400: string
    500: string
    600: string
    700: string
    800: string
    900: string
  }
  accent: {
    50: string
    100: string
    200: string
    300: string
    400: string
    500: string
    600: string
    700: string
    800: string
    900: string
  }
}

export interface ContrastRatios {
  text: {
    primary: number
    secondary: number
    tertiary: number
  }
  background: {
    primary: number
    secondary: number
    accent: number
  }
  interactive: {
    hover: number
    focus: number
    active: number
  }
}

export interface DesignTokens {
  typography: TypographyScale
  spacing: SpacingScale
  colors: ColorPalette
  contrast: ContrastRatios
  borderRadius: {
    none: string
    sm: string
    md: string
    lg: string
    xl: string
    '2xl': string
    full: string
  }
  shadows: {
    sm: string
    md: string
    lg: string
    xl: string
    '2xl': string
  }
}

// Dive Bar Variant - Bold, rustic, high contrast
const diveBarTokens: DesignTokens = {
  typography: {
    fontFamily: {
      heading: '"Bebas Neue", "Impact", sans-serif',
      body: '"Open Sans", "Arial", sans-serif',
      accent: '"Oswald", "Arial Black", sans-serif'
    },
    fontSize: {
      xs: '0.75rem',
      sm: '0.875rem',
      base: '1rem',
      lg: '1.125rem',
      xl: '1.25rem',
      '2xl': '1.5rem',
      '3xl': '1.875rem',
      '4xl': '2.25rem',
      '5xl': '3rem',
      '6xl': '3.75rem'
    },
    fontWeight: {
      light: 300,
      normal: 400,
      medium: 500,
      semibold: 600,
      bold: 700,
      extrabold: 800
    },
    lineHeight: {
      tight: 1.1,
      snug: 1.2,
      normal: 1.4,
      relaxed: 1.6,
      loose: 1.8
    },
    letterSpacing: {
      tighter: '-0.05em',
      tight: '-0.025em',
      normal: '0em',
      wide: '0.025em',
      wider: '0.05em',
      widest: '0.1em'
    }
  },
  spacing: {
    xs: '0.25rem',
    sm: '0.5rem',
    md: '1rem',
    lg: '1.5rem',
    xl: '2rem',
    '2xl': '3rem',
    '3xl': '4rem',
    '4xl': '6rem',
    '5xl': '8rem',
    '6xl': '12rem'
  },
  colors: {
    primary: {
      50: '#fef2f2',
      100: '#fee2e2',
      200: '#fecaca',
      300: '#fca5a5',
      400: '#f87171',
      500: '#dc2626',
      600: '#b91c1c',
      700: '#991b1b',
      800: '#7f1d1d',
      900: '#450a0a'
    },
    secondary: {
      50: '#f8fafc',
      100: '#f1f5f9',
      200: '#e2e8f0',
      300: '#cbd5e1',
      400: '#94a3b8',
      500: '#64748b',
      600: '#475569',
      700: '#334155',
      800: '#1e293b',
      900: '#0f172a'
    },
    neutral: {
      50: '#fafafa',
      100: '#f4f4f5',
      200: '#e4e4e7',
      300: '#d4d4d8',
      400: '#a1a1aa',
      500: '#71717a',
      600: '#52525b',
      700: '#3f3f46',
      800: '#27272a',
      900: '#18181b'
    },
    accent: {
      50: '#fef3c7',
      100: '#fde68a',
      200: '#fcd34d',
      300: '#fbbf24',
      400: '#f59e0b',
      500: '#d97706',
      600: '#b45309',
      700: '#92400e',
      800: '#78350f',
      900: '#451a03'
    }
  },
  contrast: {
    text: {
      primary: 7.0,
      secondary: 4.5,
      tertiary: 3.0
    },
    background: {
      primary: 4.5,
      secondary: 3.0,
      accent: 3.0
    },
    interactive: {
      hover: 2.0,
      focus: 3.0,
      active: 1.5
    }
  },
  borderRadius: {
    none: '0px',
    sm: '0.125rem',
    md: '0.375rem',
    lg: '0.5rem',
    xl: '0.75rem',
    '2xl': '1rem',
    full: '9999px'
  },
  shadows: {
    sm: '0 1px 2px 0 rgb(0 0 0 / 0.05)',
    md: '0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1)',
    lg: '0 10px 15px -3px rgb(0 0 0 / 0.1), 0 4px 6px -4px rgb(0 0 0 / 0.1)',
    xl: '0 20px 25px -5px rgb(0 0 0 / 0.1), 0 8px 10px -6px rgb(0 0 0 / 0.1)',
    '2xl': '0 25px 50px -12px rgb(0 0 0 / 0.25)'
  }
}

// Fine Dining Variant - Elegant, refined, subtle contrast
const fineDiningTokens: DesignTokens = {
  typography: {
    fontFamily: {
      heading: '"Playfair Display", "Times New Roman", serif',
      body: '"Source Sans Pro", "Helvetica", sans-serif',
      accent: '"Cormorant Garamond", "Times", serif'
    },
    fontSize: {
      xs: '0.75rem',
      sm: '0.875rem',
      base: '1rem',
      lg: '1.125rem',
      xl: '1.25rem',
      '2xl': '1.5rem',
      '3xl': '1.875rem',
      '4xl': '2.25rem',
      '5xl': '3rem',
      '6xl': '3.75rem'
    },
    fontWeight: {
      light: 300,
      normal: 400,
      medium: 500,
      semibold: 600,
      bold: 700,
      extrabold: 800
    },
    lineHeight: {
      tight: 1.2,
      snug: 1.3,
      normal: 1.5,
      relaxed: 1.7,
      loose: 2.0
    },
    letterSpacing: {
      tighter: '-0.02em',
      tight: '-0.01em',
      normal: '0em',
      wide: '0.01em',
      wider: '0.02em',
      widest: '0.05em'
    }
  },
  spacing: {
    xs: '0.25rem',
    sm: '0.5rem',
    md: '1rem',
    lg: '1.5rem',
    xl: '2rem',
    '2xl': '3rem',
    '3xl': '4rem',
    '4xl': '6rem',
    '5xl': '8rem',
    '6xl': '12rem'
  },
  colors: {
    primary: {
      50: '#f8fafc',
      100: '#f1f5f9',
      200: '#e2e8f0',
      300: '#cbd5e1',
      400: '#94a3b8',
      500: '#64748b',
      600: '#475569',
      700: '#334155',
      800: '#1e293b',
      900: '#0f172a'
    },
    secondary: {
      50: '#fefce8',
      100: '#fef9c3',
      200: '#fef08a',
      300: '#fde047',
      400: '#facc15',
      500: '#eab308',
      600: '#ca8a04',
      700: '#a16207',
      800: '#854d0e',
      900: '#713f12'
    },
    neutral: {
      50: '#fafafa',
      100: '#f5f5f5',
      200: '#e5e5e5',
      300: '#d4d4d4',
      400: '#a3a3a3',
      500: '#737373',
      600: '#525252',
      700: '#404040',
      800: '#262626',
      900: '#171717'
    },
    accent: {
      50: '#fdf4ff',
      100: '#fae8ff',
      200: '#f5d0fe',
      300: '#f0abfc',
      400: '#e879f9',
      500: '#d946ef',
      600: '#c026d3',
      700: '#a21caf',
      800: '#86198f',
      900: '#701a75'
    }
  },
  contrast: {
    text: {
      primary: 4.5,
      secondary: 3.0,
      tertiary: 2.0
    },
    background: {
      primary: 3.0,
      secondary: 2.0,
      accent: 2.0
    },
    interactive: {
      hover: 1.5,
      focus: 2.0,
      active: 1.2
    }
  },
  borderRadius: {
    none: '0px',
    sm: '0.125rem',
    md: '0.25rem',
    lg: '0.375rem',
    xl: '0.5rem',
    '2xl': '0.75rem',
    full: '9999px'
  },
  shadows: {
    sm: '0 1px 2px 0 rgb(0 0 0 / 0.05)',
    md: '0 2px 4px -1px rgb(0 0 0 / 0.06), 0 1px 2px -1px rgb(0 0 0 / 0.1)',
    lg: '0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -1px rgb(0 0 0 / 0.06)',
    xl: '0 10px 15px -3px rgb(0 0 0 / 0.1), 0 4px 6px -2px rgb(0 0 0 / 0.05)',
    '2xl': '0 20px 25px -5px rgb(0 0 0 / 0.1), 0 10px 10px -5px rgb(0 0 0 / 0.04)'
  }
}

// Café Variant - Warm, friendly, moderate contrast
const cafeTokens: DesignTokens = {
  typography: {
    fontFamily: {
      heading: '"Poppins", "Helvetica", sans-serif',
      body: '"Inter", "Arial", sans-serif',
      accent: '"Nunito", "Arial", sans-serif'
    },
    fontSize: {
      xs: '0.75rem',
      sm: '0.875rem',
      base: '1rem',
      lg: '1.125rem',
      xl: '1.25rem',
      '2xl': '1.5rem',
      '3xl': '1.875rem',
      '4xl': '2.25rem',
      '5xl': '3rem',
      '6xl': '3.75rem'
    },
    fontWeight: {
      light: 300,
      normal: 400,
      medium: 500,
      semibold: 600,
      bold: 700,
      extrabold: 800
    },
    lineHeight: {
      tight: 1.2,
      snug: 1.3,
      normal: 1.5,
      relaxed: 1.6,
      loose: 1.8
    },
    letterSpacing: {
      tighter: '-0.025em',
      tight: '-0.01em',
      normal: '0em',
      wide: '0.01em',
      wider: '0.025em',
      widest: '0.05em'
    }
  },
  spacing: {
    xs: '0.25rem',
    sm: '0.5rem',
    md: '1rem',
    lg: '1.5rem',
    xl: '2rem',
    '2xl': '3rem',
    '3xl': '4rem',
    '4xl': '6rem',
    '5xl': '8rem',
    '6xl': '12rem'
  },
  colors: {
    primary: {
      50: '#f0f9ff',
      100: '#e0f2fe',
      200: '#bae6fd',
      300: '#7dd3fc',
      400: '#38bdf8',
      500: '#0ea5e9',
      600: '#0284c7',
      700: '#0369a1',
      800: '#075985',
      900: '#0c4a6e'
    },
    secondary: {
      50: '#fef7ed',
      100: '#ffedd5',
      200: '#fed7aa',
      300: '#fdba74',
      400: '#fb923c',
      500: '#f97316',
      600: '#ea580c',
      700: '#c2410c',
      800: '#9a3412',
      900: '#7c2d12'
    },
    neutral: {
      50: '#fafafa',
      100: '#f4f4f5',
      200: '#e4e4e7',
      300: '#d4d4d8',
      400: '#a1a1aa',
      500: '#71717a',
      600: '#52525b',
      700: '#3f3f46',
      800: '#27272a',
      900: '#18181b'
    },
    accent: {
      50: '#f0fdf4',
      100: '#dcfce7',
      200: '#bbf7d0',
      300: '#86efac',
      400: '#4ade80',
      500: '#22c55e',
      600: '#16a34a',
      700: '#15803d',
      800: '#166534',
      900: '#14532d'
    }
  },
  contrast: {
    text: {
      primary: 5.5,
      secondary: 3.5,
      tertiary: 2.5
    },
    background: {
      primary: 3.5,
      secondary: 2.5,
      accent: 2.5
    },
    interactive: {
      hover: 1.8,
      focus: 2.5,
      active: 1.3
    }
  },
  borderRadius: {
    none: '0px',
    sm: '0.125rem',
    md: '0.375rem',
    lg: '0.5rem',
    xl: '0.75rem',
    '2xl': '1rem',
    full: '9999px'
  },
  shadows: {
    sm: '0 1px 2px 0 rgb(0 0 0 / 0.05)',
    md: '0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1)',
    lg: '0 10px 15px -3px rgb(0 0 0 / 0.1), 0 4px 6px -4px rgb(0 0 0 / 0.1)',
    xl: '0 20px 25px -5px rgb(0 0 0 / 0.1), 0 8px 10px -6px rgb(0 0 0 / 0.1)',
    '2xl': '0 25px 50px -12px rgb(0 0 0 / 0.25)'
  }
}

// Sports Bar Variant - Energetic, bold, high contrast
const sportsBarTokens: DesignTokens = {
  typography: {
    fontFamily: {
      heading: '"Roboto Condensed", "Arial Black", sans-serif',
      body: '"Roboto", "Arial", sans-serif',
      accent: '"Barlow Condensed", "Impact", sans-serif'
    },
    fontSize: {
      xs: '0.75rem',
      sm: '0.875rem',
      base: '1rem',
      lg: '1.125rem',
      xl: '1.25rem',
      '2xl': '1.5rem',
      '3xl': '1.875rem',
      '4xl': '2.25rem',
      '5xl': '3rem',
      '6xl': '3.75rem'
    },
    fontWeight: {
      light: 300,
      normal: 400,
      medium: 500,
      semibold: 600,
      bold: 700,
      extrabold: 800
    },
    lineHeight: {
      tight: 1.1,
      snug: 1.2,
      normal: 1.4,
      relaxed: 1.5,
      loose: 1.7
    },
    letterSpacing: {
      tighter: '-0.05em',
      tight: '-0.025em',
      normal: '0em',
      wide: '0.025em',
      wider: '0.05em',
      widest: '0.1em'
    }
  },
  spacing: {
    xs: '0.25rem',
    sm: '0.5rem',
    md: '1rem',
    lg: '1.5rem',
    xl: '2rem',
    '2xl': '3rem',
    '3xl': '4rem',
    '4xl': '6rem',
    '5xl': '8rem',
    '6xl': '12rem'
  },
  colors: {
    primary: {
      50: '#eff6ff',
      100: '#dbeafe',
      200: '#bfdbfe',
      300: '#93c5fd',
      400: '#60a5fa',
      500: '#3b82f6',
      600: '#2563eb',
      700: '#1d4ed8',
      800: '#1e40af',
      900: '#1e3a8a'
    },
    secondary: {
      50: '#fef2f2',
      100: '#fee2e2',
      200: '#fecaca',
      300: '#fca5a5',
      400: '#f87171',
      500: '#ef4444',
      600: '#dc2626',
      700: '#b91c1c',
      800: '#991b1b',
      900: '#7f1d1d'
    },
    neutral: {
      50: '#f8fafc',
      100: '#f1f5f9',
      200: '#e2e8f0',
      300: '#cbd5e1',
      400: '#94a3b8',
      500: '#64748b',
      600: '#475569',
      700: '#334155',
      800: '#1e293b',
      900: '#0f172a'
    },
    accent: {
      50: '#fefce8',
      100: '#fef9c3',
      200: '#fef08a',
      300: '#fde047',
      400: '#facc15',
      500: '#eab308',
      600: '#ca8a04',
      700: '#a16207',
      800: '#854d0e',
      900: '#713f12'
    }
  },
  contrast: {
    text: {
      primary: 6.5,
      secondary: 4.0,
      tertiary: 3.0
    },
    background: {
      primary: 4.0,
      secondary: 3.0,
      accent: 3.0
    },
    interactive: {
      hover: 2.0,
      focus: 3.0,
      active: 1.5
    }
  },
  borderRadius: {
    none: '0px',
    sm: '0.125rem',
    md: '0.375rem',
    lg: '0.5rem',
    xl: '0.75rem',
    '2xl': '1rem',
    full: '9999px'
  },
  shadows: {
    sm: '0 1px 2px 0 rgb(0 0 0 / 0.05)',
    md: '0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1)',
    lg: '0 10px 15px -3px rgb(0 0 0 / 0.1), 0 4px 6px -4px rgb(0 0 0 / 0.1)',
    xl: '0 20px 25px -5px rgb(0 0 0 / 0.1), 0 8px 10px -6px rgb(0 0 0 / 0.1)',
    '2xl': '0 25px 50px -12px rgb(0 0 0 / 0.25)'
  }
}

// Family Restaurant Variant - Welcoming, balanced, moderate contrast
const familyRestaurantTokens: DesignTokens = {
  typography: {
    fontFamily: {
      heading: '"Merriweather", "Times New Roman", serif',
      body: '"Source Sans Pro", "Helvetica", sans-serif',
      accent: '"Lato", "Arial", sans-serif'
    },
    fontSize: {
      xs: '0.75rem',
      sm: '0.875rem',
      base: '1rem',
      lg: '1.125rem',
      xl: '1.25rem',
      '2xl': '1.5rem',
      '3xl': '1.875rem',
      '4xl': '2.25rem',
      '5xl': '3rem',
      '6xl': '3.75rem'
    },
    fontWeight: {
      light: 300,
      normal: 400,
      medium: 500,
      semibold: 600,
      bold: 700,
      extrabold: 800
    },
    lineHeight: {
      tight: 1.2,
      snug: 1.3,
      normal: 1.5,
      relaxed: 1.6,
      loose: 1.8
    },
    letterSpacing: {
      tighter: '-0.02em',
      tight: '-0.01em',
      normal: '0em',
      wide: '0.01em',
      wider: '0.02em',
      widest: '0.05em'
    }
  },
  spacing: {
    xs: '0.25rem',
    sm: '0.5rem',
    md: '1rem',
    lg: '1.5rem',
    xl: '2rem',
    '2xl': '3rem',
    '3xl': '4rem',
    '4xl': '6rem',
    '5xl': '8rem',
    '6xl': '12rem'
  },
  colors: {
    primary: {
      50: '#f0fdf4',
      100: '#dcfce7',
      200: '#bbf7d0',
      300: '#86efac',
      400: '#4ade80',
      500: '#22c55e',
      600: '#16a34a',
      700: '#15803d',
      800: '#166534',
      900: '#14532d'
    },
    secondary: {
      50: '#fef3c7',
      100: '#fde68a',
      200: '#fcd34d',
      300: '#fbbf24',
      400: '#f59e0b',
      500: '#d97706',
      600: '#b45309',
      700: '#92400e',
      800: '#78350f',
      900: '#451a03'
    },
    neutral: {
      50: '#fafafa',
      100: '#f5f5f5',
      200: '#e5e5e5',
      300: '#d4d4d4',
      400: '#a3a3a3',
      500: '#737373',
      600: '#525252',
      700: '#404040',
      800: '#262626',
      900: '#171717'
    },
    accent: {
      50: '#fef2f2',
      100: '#fee2e2',
      200: '#fecaca',
      300: '#fca5a5',
      400: '#f87171',
      500: '#ef4444',
      600: '#dc2626',
      700: '#b91c1c',
      800: '#991b1b',
      900: '#7f1d1d'
    }
  },
  contrast: {
    text: {
      primary: 5.0,
      secondary: 3.5,
      tertiary: 2.5
    },
    background: {
      primary: 3.5,
      secondary: 2.5,
      accent: 2.5
    },
    interactive: {
      hover: 1.8,
      focus: 2.5,
      active: 1.3
    }
  },
  borderRadius: {
    none: '0px',
    sm: '0.125rem',
    md: '0.375rem',
    lg: '0.5rem',
    xl: '0.75rem',
    '2xl': '1rem',
    full: '9999px'
  },
  shadows: {
    sm: '0 1px 2px 0 rgb(0 0 0 / 0.05)',
    md: '0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1)',
    lg: '0 10px 15px -3px rgb(0 0 0 / 0.1), 0 4px 6px -4px rgb(0 0 0 / 0.1)',
    xl: '0 20px 25px -5px rgb(0 0 0 / 0.1), 0 8px 10px -6px rgb(0 0 0 / 0.1)',
    '2xl': '0 25px 50px -12px rgb(0 0 0 / 0.25)'
  }
}

const tokenMap: Record<BusinessVariant, DesignTokens> = {
  dive_bar: diveBarTokens,
  fine_dining: fineDiningTokens,
  cafe: cafeTokens,
  sports_bar: sportsBarTokens,
  family_restaurant: familyRestaurantTokens
}

/**
 * Get design tokens for a specific business variant
 */
export function getDesignTokens(variant: BusinessVariant): DesignTokens {
  return tokenMap[variant] || cafeTokens // Default to café if variant not found
}

/**
 * Get CSS custom properties for a variant
 */
export function getCSSVariables(variant: BusinessVariant): Record<string, string> {
  const tokens = getDesignTokens(variant)
  
  return {
    // Typography
    '--font-heading': tokens.typography.fontFamily.heading,
    '--font-body': tokens.typography.fontFamily.body,
    '--font-accent': tokens.typography.fontFamily.accent,
    
    // Font sizes
    '--text-xs': tokens.typography.fontSize.xs,
    '--text-sm': tokens.typography.fontSize.sm,
    '--text-base': tokens.typography.fontSize.base,
    '--text-lg': tokens.typography.fontSize.lg,
    '--text-xl': tokens.typography.fontSize.xl,
    '--text-2xl': tokens.typography.fontSize['2xl'],
    '--text-3xl': tokens.typography.fontSize['3xl'],
    '--text-4xl': tokens.typography.fontSize['4xl'],
    '--text-5xl': tokens.typography.fontSize['5xl'],
    '--text-6xl': tokens.typography.fontSize['6xl'],
    
    // Font weights
    '--font-light': tokens.typography.fontWeight.light.toString(),
    '--font-normal': tokens.typography.fontWeight.normal.toString(),
    '--font-medium': tokens.typography.fontWeight.medium.toString(),
    '--font-semibold': tokens.typography.fontWeight.semibold.toString(),
    '--font-bold': tokens.typography.fontWeight.bold.toString(),
    '--font-extrabold': tokens.typography.fontWeight.extrabold.toString(),
    
    // Line heights
    '--leading-tight': tokens.typography.lineHeight.tight.toString(),
    '--leading-snug': tokens.typography.lineHeight.snug.toString(),
    '--leading-normal': tokens.typography.lineHeight.normal.toString(),
    '--leading-relaxed': tokens.typography.lineHeight.relaxed.toString(),
    '--leading-loose': tokens.typography.lineHeight.loose.toString(),
    
    // Letter spacing
    '--tracking-tighter': tokens.typography.letterSpacing.tighter,
    '--tracking-tight': tokens.typography.letterSpacing.tight,
    '--tracking-normal': tokens.typography.letterSpacing.normal,
    '--tracking-wide': tokens.typography.letterSpacing.wide,
    '--tracking-wider': tokens.typography.letterSpacing.wider,
    '--tracking-widest': tokens.typography.letterSpacing.widest,
    
    // Spacing
    '--spacing-xs': tokens.spacing.xs,
    '--spacing-sm': tokens.spacing.sm,
    '--spacing-md': tokens.spacing.md,
    '--spacing-lg': tokens.spacing.lg,
    '--spacing-xl': tokens.spacing.xl,
    '--spacing-2xl': tokens.spacing['2xl'],
    '--spacing-3xl': tokens.spacing['3xl'],
    '--spacing-4xl': tokens.spacing['4xl'],
    '--spacing-5xl': tokens.spacing['5xl'],
    '--spacing-6xl': tokens.spacing['6xl'],
    
    // Colors - Primary
    '--color-primary-50': tokens.colors.primary[50],
    '--color-primary-100': tokens.colors.primary[100],
    '--color-primary-200': tokens.colors.primary[200],
    '--color-primary-300': tokens.colors.primary[300],
    '--color-primary-400': tokens.colors.primary[400],
    '--color-primary-500': tokens.colors.primary[500],
    '--color-primary-600': tokens.colors.primary[600],
    '--color-primary-700': tokens.colors.primary[700],
    '--color-primary-800': tokens.colors.primary[800],
    '--color-primary-900': tokens.colors.primary[900],
    
    // Colors - Secondary
    '--color-secondary-50': tokens.colors.secondary[50],
    '--color-secondary-100': tokens.colors.secondary[100],
    '--color-secondary-200': tokens.colors.secondary[200],
    '--color-secondary-300': tokens.colors.secondary[300],
    '--color-secondary-400': tokens.colors.secondary[400],
    '--color-secondary-500': tokens.colors.secondary[500],
    '--color-secondary-600': tokens.colors.secondary[600],
    '--color-secondary-700': tokens.colors.secondary[700],
    '--color-secondary-800': tokens.colors.secondary[800],
    '--color-secondary-900': tokens.colors.secondary[900],
    
    // Colors - Neutral
    '--color-neutral-50': tokens.colors.neutral[50],
    '--color-neutral-100': tokens.colors.neutral[100],
    '--color-neutral-200': tokens.colors.neutral[200],
    '--color-neutral-300': tokens.colors.neutral[300],
    '--color-neutral-400': tokens.colors.neutral[400],
    '--color-neutral-500': tokens.colors.neutral[500],
    '--color-neutral-600': tokens.colors.neutral[600],
    '--color-neutral-700': tokens.colors.neutral[700],
    '--color-neutral-800': tokens.colors.neutral[800],
    '--color-neutral-900': tokens.colors.neutral[900],
    
    // Colors - Accent
    '--color-accent-50': tokens.colors.accent[50],
    '--color-accent-100': tokens.colors.accent[100],
    '--color-accent-200': tokens.colors.accent[200],
    '--color-accent-300': tokens.colors.accent[300],
    '--color-accent-400': tokens.colors.accent[400],
    '--color-accent-500': tokens.colors.accent[500],
    '--color-accent-600': tokens.colors.accent[600],
    '--color-accent-700': tokens.colors.accent[700],
    '--color-accent-800': tokens.colors.accent[800],
    '--color-accent-900': tokens.colors.accent[900],
    
    // Border radius
    '--radius-none': tokens.borderRadius.none,
    '--radius-sm': tokens.borderRadius.sm,
    '--radius-md': tokens.borderRadius.md,
    '--radius-lg': tokens.borderRadius.lg,
    '--radius-xl': tokens.borderRadius.xl,
    '--radius-2xl': tokens.borderRadius['2xl'],
    '--radius-full': tokens.borderRadius.full,
    
    // Shadows
    '--shadow-sm': tokens.shadows.sm,
    '--shadow-md': tokens.shadows.md,
    '--shadow-lg': tokens.shadows.lg,
    '--shadow-xl': tokens.shadows.xl,
    '--shadow-2xl': tokens.shadows['2xl']
  }
}

/**
 * Get Tailwind CSS classes for a variant
 */
export function getTailwindClasses(variant: BusinessVariant): {
  fontFamily: string
  colors: string
  spacing: string
  borderRadius: string
  shadows: string
} {
  const tokens = getDesignTokens(variant)
  
  return {
    fontFamily: `font-heading-${variant} font-body-${variant} font-accent-${variant}`,
    colors: `text-primary-${variant} bg-secondary-${variant}`,
    spacing: `p-${variant} m-${variant}`,
    borderRadius: `rounded-${variant}`,
    shadows: `shadow-${variant}`
  }
}

/**
 * Validate contrast ratios for accessibility
 */
export function validateContrastRatios(variant: BusinessVariant): {
  isValid: boolean
  violations: Array<{
    element: string
    ratio: number
    required: number
    status: 'pass' | 'fail'
  }>
} {
  const tokens = getDesignTokens(variant)
  const violations: Array<{
    element: string
    ratio: number
    required: number
    status: 'pass' | 'fail'
  }> = []
  
  // Check text contrast ratios
  Object.entries(tokens.contrast.text).forEach(([level, ratio]) => {
    const required = level === 'primary' ? 4.5 : level === 'secondary' ? 3.0 : 2.0
    violations.push({
      element: `text-${level}`,
      ratio,
      required,
      status: ratio >= required ? 'pass' : 'fail'
    })
  })
  
  // Check background contrast ratios
  Object.entries(tokens.contrast.background).forEach(([level, ratio]) => {
    const required = level === 'primary' ? 3.0 : 2.0
    violations.push({
      element: `background-${level}`,
      ratio,
      required,
      status: ratio >= required ? 'pass' : 'fail'
    })
  })
  
  const isValid = violations.every(v => v.status === 'pass')
  
  return { isValid, violations }
}

/**
 * Get variant description and characteristics
 */
export function getVariantInfo(variant: BusinessVariant): {
  name: string
  description: string
  characteristics: string[]
  targetAudience: string
  mood: string
} {
  const variants = {
    dive_bar: {
      name: 'Dive Bar',
      description: 'Bold, rustic design with high contrast and strong typography',
      characteristics: ['High contrast', 'Bold fonts', 'Rustic colors', 'Strong shadows'],
      targetAudience: 'Local regulars, nightlife crowd',
      mood: 'Energetic, authentic, unpretentious'
    },
    fine_dining: {
      name: 'Fine Dining',
      description: 'Elegant, refined design with subtle contrast and sophisticated typography',
      characteristics: ['Low contrast', 'Elegant fonts', 'Sophisticated colors', 'Subtle shadows'],
      targetAudience: 'Upscale diners, special occasions',
      mood: 'Elegant, sophisticated, refined'
    },
    cafe: {
      name: 'Café',
      description: 'Warm, friendly design with moderate contrast and approachable typography',
      characteristics: ['Moderate contrast', 'Friendly fonts', 'Warm colors', 'Balanced shadows'],
      targetAudience: 'Casual diners, coffee lovers',
      mood: 'Warm, welcoming, approachable'
    },
    sports_bar: {
      name: 'Sports Bar',
      description: 'Energetic, bold design with high contrast and dynamic typography',
      characteristics: ['High contrast', 'Bold fonts', 'Energetic colors', 'Strong shadows'],
      targetAudience: 'Sports fans, groups',
      mood: 'Energetic, dynamic, exciting'
    },
    family_restaurant: {
      name: 'Family Restaurant',
      description: 'Welcoming, balanced design with moderate contrast and friendly typography',
      characteristics: ['Moderate contrast', 'Friendly fonts', 'Welcoming colors', 'Balanced shadows'],
      targetAudience: 'Families, all ages',
      mood: 'Welcoming, comfortable, inclusive'
    }
  }
  
  return variants[variant]
}

/**
 * Generate component-specific tokens
 */
export function generateComponentTokens(variant: BusinessVariant): Record<string, any> {
  const tokens = getDesignTokens(variant)
  
  return {
    button: {
      primary: {
        backgroundColor: tokens.colors.primary[600],
        color: tokens.colors.neutral[50],
        padding: `${tokens.spacing.sm} ${tokens.spacing.lg}`,
        borderRadius: tokens.spacing.md,
        fontSize: tokens.typography.fontSize.base,
        fontWeight: tokens.typography.fontWeight.semibold,
        fontFamily: tokens.typography.fontFamily.accent,
        letterSpacing: tokens.typography.letterSpacing.wide,
        boxShadow: tokens.shadows.md,
        border: 'none',
        cursor: 'pointer',
        transition: 'all 0.2s ease'
      },
      secondary: {
        backgroundColor: 'transparent',
        color: tokens.colors.primary[600],
        padding: `${tokens.spacing.sm} ${tokens.spacing.lg}`,
        borderRadius: tokens.spacing.md,
        fontSize: tokens.typography.fontSize.base,
        fontWeight: tokens.typography.fontWeight.semibold,
        fontFamily: tokens.typography.fontFamily.accent,
        letterSpacing: tokens.typography.letterSpacing.wide,
        border: `2px solid ${tokens.colors.primary[600]}`,
        cursor: 'pointer',
        transition: 'all 0.2s ease'
      }
    },
    card: {
      backgroundColor: tokens.colors.neutral[50],
      padding: tokens.spacing.lg,
      borderRadius: tokens.spacing.lg,
      boxShadow: tokens.shadows.lg,
      color: tokens.colors.neutral[700],
      fontFamily: tokens.typography.fontFamily.body
    },
    input: {
      backgroundColor: tokens.colors.neutral[50],
      padding: tokens.spacing.sm,
      borderRadius: tokens.spacing.md,
      fontSize: tokens.typography.fontSize.base,
      fontFamily: tokens.typography.fontFamily.body,
      border: `1px solid ${tokens.colors.neutral[300]}`,
      color: tokens.colors.neutral[700],
      boxShadow: tokens.shadows.sm
    },
    heading: {
      fontFamily: tokens.typography.fontFamily.heading,
      fontSize: tokens.typography.fontSize['4xl'],
      fontWeight: tokens.typography.fontWeight.bold,
      lineHeight: tokens.typography.lineHeight.tight,
      letterSpacing: tokens.typography.letterSpacing.tight,
      color: tokens.colors.primary[900]
    },
    subheading: {
      fontFamily: tokens.typography.fontFamily.heading,
      fontSize: tokens.typography.fontSize['2xl'],
      fontWeight: tokens.typography.fontWeight.semibold,
      lineHeight: tokens.typography.lineHeight.snug,
      color: tokens.colors.primary[800]
    },
    body: {
      fontFamily: tokens.typography.fontFamily.body,
      fontSize: tokens.typography.fontSize.base,
      fontWeight: tokens.typography.fontWeight.normal,
      lineHeight: tokens.typography.lineHeight.normal,
      color: tokens.colors.neutral[700]
    }
  }
}

/**
 * Generate responsive typography tokens
 */
export function generateResponsiveTypography(variant: BusinessVariant): Record<string, any> {
  const tokens = getDesignTokens(variant)
  
  return {
    mobile: {
      heading: {
        fontSize: tokens.typography.fontSize['2xl'],
        lineHeight: tokens.typography.lineHeight.tight
      },
      subheading: {
        fontSize: tokens.typography.fontSize.xl,
        lineHeight: tokens.typography.lineHeight.snug
      },
      body: {
        fontSize: tokens.typography.fontSize.sm,
        lineHeight: tokens.typography.lineHeight.normal
      }
    },
    tablet: {
      heading: {
        fontSize: tokens.typography.fontSize['3xl'],
        lineHeight: tokens.typography.lineHeight.tight
      },
      subheading: {
        fontSize: tokens.typography.fontSize['2xl'],
        lineHeight: tokens.typography.lineHeight.snug
      },
      body: {
        fontSize: tokens.typography.fontSize.base,
        lineHeight: tokens.typography.lineHeight.normal
      }
    },
    desktop: {
      heading: {
        fontSize: tokens.typography.fontSize['4xl'],
        lineHeight: tokens.typography.lineHeight.tight
      },
      subheading: {
        fontSize: tokens.typography.fontSize['2xl'],
        lineHeight: tokens.typography.lineHeight.snug
      },
      body: {
        fontSize: tokens.typography.fontSize.base,
        lineHeight: tokens.typography.lineHeight.normal
      }
    }
  }
}

/**
 * Generate dark mode tokens
 */
export function generateDarkModeTokens(variant: BusinessVariant): Record<string, any> {
  const tokens = getDesignTokens(variant)
  
  return {
    button: {
      primary: {
        backgroundColor: tokens.colors.primary[500],
        color: tokens.colors.neutral[900],
        padding: `${tokens.spacing.sm} ${tokens.spacing.lg}`,
        borderRadius: tokens.spacing.md,
        fontSize: tokens.typography.fontSize.base,
        fontWeight: tokens.typography.fontWeight.semibold,
        fontFamily: tokens.typography.fontFamily.accent,
        letterSpacing: tokens.typography.letterSpacing.wide,
        boxShadow: tokens.shadows.lg,
        border: 'none',
        cursor: 'pointer',
        transition: 'all 0.2s ease'
      }
    },
    card: {
      backgroundColor: tokens.colors.neutral[800],
      padding: tokens.spacing.lg,
      borderRadius: tokens.spacing.lg,
      boxShadow: tokens.shadows.xl,
      color: tokens.colors.neutral[200],
      fontFamily: tokens.typography.fontFamily.body
    },
    input: {
      backgroundColor: tokens.colors.neutral[800],
      padding: tokens.spacing.sm,
      borderRadius: tokens.spacing.md,
      fontSize: tokens.typography.fontSize.base,
      fontFamily: tokens.typography.fontFamily.body,
      border: `1px solid ${tokens.colors.neutral[600]}`,
      color: tokens.colors.neutral[200],
      boxShadow: tokens.shadows.md
    },
    heading: {
      fontFamily: tokens.typography.fontFamily.heading,
      fontSize: tokens.typography.fontSize['4xl'],
      fontWeight: tokens.typography.fontWeight.bold,
      lineHeight: tokens.typography.lineHeight.tight,
      letterSpacing: tokens.typography.letterSpacing.tight,
      color: tokens.colors.neutral[100]
    },
    subheading: {
      fontFamily: tokens.typography.fontFamily.heading,
      fontSize: tokens.typography.fontSize['2xl'],
      fontWeight: tokens.typography.fontWeight.semibold,
      lineHeight: tokens.typography.lineHeight.snug,
      color: tokens.colors.neutral[200]
    },
    body: {
      fontFamily: tokens.typography.fontFamily.body,
      fontSize: tokens.typography.fontSize.base,
      fontWeight: tokens.typography.fontWeight.normal,
      lineHeight: tokens.typography.lineHeight.normal,
      color: tokens.colors.neutral[300]
    }
  }
}

/**
 * Generate accessible tokens with high contrast
 */
export function generateAccessibleTokens(variant: BusinessVariant): Record<string, any> {
  const tokens = getDesignTokens(variant)
  
  return {
    button: {
      primary: {
        backgroundColor: tokens.colors.primary[700],
        color: tokens.colors.neutral[50],
        padding: `${tokens.spacing.md} ${tokens.spacing.xl}`,
        borderRadius: tokens.spacing.md,
        fontSize: tokens.typography.fontSize.lg,
        fontWeight: tokens.typography.fontWeight.bold,
        fontFamily: tokens.typography.fontFamily.accent,
        letterSpacing: tokens.typography.letterSpacing.wide,
        boxShadow: tokens.shadows.lg,
        border: `2px solid ${tokens.colors.primary[800]}`,
        cursor: 'pointer',
        transition: 'all 0.3s ease',
        minHeight: '44px',
        minWidth: '44px'
      }
    },
    card: {
      backgroundColor: tokens.colors.neutral[50],
      padding: tokens.spacing.xl,
      borderRadius: tokens.spacing.lg,
      boxShadow: tokens.shadows.xl,
      color: tokens.colors.neutral[800],
      fontFamily: tokens.typography.fontFamily.body,
      border: `2px solid ${tokens.colors.neutral[200]}`
    },
    input: {
      backgroundColor: tokens.colors.neutral[50],
      padding: tokens.spacing.md,
      borderRadius: tokens.spacing.md,
      fontSize: tokens.typography.fontSize.lg,
      fontFamily: tokens.typography.fontFamily.body,
      border: `3px solid ${tokens.colors.neutral[400]}`,
      color: tokens.colors.neutral[800],
      boxShadow: tokens.shadows.md,
      minHeight: '44px'
    },
    heading: {
      fontFamily: tokens.typography.fontFamily.heading,
      fontSize: tokens.typography.fontSize['5xl'],
      fontWeight: tokens.typography.fontWeight.extrabold,
      lineHeight: tokens.typography.lineHeight.tight,
      letterSpacing: tokens.typography.letterSpacing.tight,
      color: tokens.colors.neutral[900]
    },
    subheading: {
      fontFamily: tokens.typography.fontFamily.heading,
      fontSize: tokens.typography.fontSize['3xl'],
      fontWeight: tokens.typography.fontWeight.bold,
      lineHeight: tokens.typography.lineHeight.snug,
      color: tokens.colors.neutral[800]
    },
    body: {
      fontFamily: tokens.typography.fontFamily.body,
      fontSize: tokens.typography.fontSize.lg,
      fontWeight: tokens.typography.fontWeight.medium,
      lineHeight: tokens.typography.lineHeight.relaxed,
      color: tokens.colors.neutral[700]
    }
  }
}
