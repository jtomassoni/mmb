/**
 * Design Token Application Utilities
 * 
 * Provides utilities for applying design tokens to React components
 * and generating CSS-in-JS styles.
 */

import { getDesignTokens, getCSSVariables, BusinessVariant } from './design-tokens'

export interface TokenStyles {
  fontFamily: string
  fontSize: string
  fontWeight: string
  lineHeight: string
  letterSpacing: string
  color: string
  backgroundColor: string
  padding: string
  margin: string
  borderRadius: string
  boxShadow: string
}

export interface ComponentTokens {
  heading: TokenStyles
  subheading: TokenStyles
  body: TokenStyles
  caption: TokenStyles
  button: TokenStyles
  card: TokenStyles
  input: TokenStyles
}

/**
 * Generate component-specific token styles
 */
export function generateComponentTokens(variant: BusinessVariant): ComponentTokens {
  const tokens = getDesignTokens(variant)
  
  return {
    heading: {
      fontFamily: tokens.typography.fontFamily.heading,
      fontSize: tokens.typography.fontSize['4xl'],
      fontWeight: tokens.typography.fontWeight.bold.toString(),
      lineHeight: tokens.typography.lineHeight.tight.toString(),
      letterSpacing: tokens.typography.letterSpacing.tight,
      color: tokens.colors.primary[900],
      backgroundColor: 'transparent',
      padding: tokens.spacing.md,
      margin: tokens.spacing.lg,
      borderRadius: tokens.borderRadius.none,
      boxShadow: 'none'
    },
    subheading: {
      fontFamily: tokens.typography.fontFamily.heading,
      fontSize: tokens.typography.fontSize['2xl'],
      fontWeight: tokens.typography.fontWeight.semibold.toString(),
      lineHeight: tokens.typography.lineHeight.snug.toString(),
      letterSpacing: tokens.typography.letterSpacing.normal,
      color: tokens.colors.primary[800],
      backgroundColor: 'transparent',
      padding: tokens.spacing.sm,
      margin: tokens.spacing.md,
      borderRadius: tokens.borderRadius.none,
      boxShadow: 'none'
    },
    body: {
      fontFamily: tokens.typography.fontFamily.body,
      fontSize: tokens.typography.fontSize.base,
      fontWeight: tokens.typography.fontWeight.normal.toString(),
      lineHeight: tokens.typography.lineHeight.normal.toString(),
      letterSpacing: tokens.typography.letterSpacing.normal,
      color: tokens.colors.neutral[700],
      backgroundColor: 'transparent',
      padding: tokens.spacing.sm,
      margin: tokens.spacing.sm,
      borderRadius: tokens.borderRadius.none,
      boxShadow: 'none'
    },
    caption: {
      fontFamily: tokens.typography.fontFamily.body,
      fontSize: tokens.typography.fontSize.sm,
      fontWeight: tokens.typography.fontWeight.normal.toString(),
      lineHeight: tokens.typography.lineHeight.normal.toString(),
      letterSpacing: tokens.typography.letterSpacing.normal,
      color: tokens.colors.neutral[600],
      backgroundColor: 'transparent',
      padding: tokens.spacing.xs,
      margin: tokens.spacing.xs,
      borderRadius: tokens.borderRadius.none,
      boxShadow: 'none'
    },
    button: {
      fontFamily: tokens.typography.fontFamily.accent,
      fontSize: tokens.typography.fontSize.base,
      fontWeight: tokens.typography.fontWeight.semibold.toString(),
      lineHeight: tokens.typography.lineHeight.normal.toString(),
      letterSpacing: tokens.typography.letterSpacing.wide,
      color: tokens.colors.neutral[50],
      backgroundColor: tokens.colors.primary[600],
      padding: `${tokens.spacing.sm} ${tokens.spacing.lg}`,
      margin: tokens.spacing.sm,
      borderRadius: tokens.borderRadius.md,
      boxShadow: tokens.shadows.md
    },
    card: {
      fontFamily: tokens.typography.fontFamily.body,
      fontSize: tokens.typography.fontSize.base,
      fontWeight: tokens.typography.fontWeight.normal.toString(),
      lineHeight: tokens.typography.lineHeight.normal.toString(),
      letterSpacing: tokens.typography.letterSpacing.normal,
      color: tokens.colors.neutral[700],
      backgroundColor: tokens.colors.neutral[50],
      padding: tokens.spacing.lg,
      margin: tokens.spacing.md,
      borderRadius: tokens.borderRadius.lg,
      boxShadow: tokens.shadows.lg
    },
    input: {
      fontFamily: tokens.typography.fontFamily.body,
      fontSize: tokens.typography.fontSize.base,
      fontWeight: tokens.typography.fontWeight.normal.toString(),
      lineHeight: tokens.typography.lineHeight.normal.toString(),
      letterSpacing: tokens.typography.letterSpacing.normal,
      color: tokens.colors.neutral[700],
      backgroundColor: tokens.colors.neutral[50],
      padding: tokens.spacing.sm,
      margin: tokens.spacing.sm,
      borderRadius: tokens.borderRadius.md,
      boxShadow: tokens.shadows.sm
    }
  }
}

/**
 * Convert token styles to CSS-in-JS object
 */
export function tokensToCSS(styles: TokenStyles): React.CSSProperties {
  return {
    fontFamily: styles.fontFamily,
    fontSize: styles.fontSize,
    fontWeight: styles.fontWeight,
    lineHeight: styles.lineHeight,
    letterSpacing: styles.letterSpacing,
    color: styles.color,
    backgroundColor: styles.backgroundColor,
    padding: styles.padding,
    margin: styles.margin,
    borderRadius: styles.borderRadius,
    boxShadow: styles.boxShadow
  }
}

/**
 * Generate CSS custom properties string
 */
export function generateCSSCustomProperties(variant: BusinessVariant): string {
  const variables = getCSSVariables(variant)
  
  return Object.entries(variables)
    .map(([key, value]) => `  ${key}: ${value};`)
    .join('\n')
}

/**
 * Generate CSS class names for a variant
 */
export function generateVariantClasses(variant: BusinessVariant): {
  container: string
  heading: string
  subheading: string
  body: string
  button: string
  card: string
  input: string
} {
  const tokens = getDesignTokens(variant)
  
  return {
    container: `variant-${variant}-container`,
    heading: `variant-${variant}-heading`,
    subheading: `variant-${variant}-subheading`,
    body: `variant-${variant}-body`,
    button: `variant-${variant}-button`,
    card: `variant-${variant}-card`,
    input: `variant-${variant}-input`
  }
}

/**
 * Generate responsive typography scale
 */
export function generateResponsiveTypography(variant: BusinessVariant): {
  mobile: ComponentTokens
  tablet: ComponentTokens
  desktop: ComponentTokens
} {
  const baseTokens = generateComponentTokens(variant)
  
  return {
    mobile: {
      ...baseTokens,
      heading: {
        ...baseTokens.heading,
        fontSize: baseTokens.heading.fontSize.replace('2.25rem', '1.875rem') // Smaller on mobile
      },
      subheading: {
        ...baseTokens.subheading,
        fontSize: baseTokens.subheading.fontSize.replace('1.5rem', '1.25rem')
      }
    },
    tablet: baseTokens,
    desktop: {
      ...baseTokens,
      heading: {
        ...baseTokens.heading,
        fontSize: baseTokens.heading.fontSize.replace('2.25rem', '3rem') // Larger on desktop
      },
      subheading: {
        ...baseTokens.subheading,
        fontSize: baseTokens.subheading.fontSize.replace('1.5rem', '1.875rem')
      }
    }
  }
}

/**
 * Generate dark mode variants
 */
export function generateDarkModeTokens(variant: BusinessVariant): ComponentTokens {
  const tokens = getDesignTokens(variant)
  
  return {
    heading: {
      fontFamily: tokens.typography.fontFamily.heading,
      fontSize: tokens.typography.fontSize['4xl'],
      fontWeight: tokens.typography.fontWeight.bold.toString(),
      lineHeight: tokens.typography.lineHeight.tight.toString(),
      letterSpacing: tokens.typography.letterSpacing.tight,
      color: tokens.colors.neutral[100],
      backgroundColor: 'transparent',
      padding: tokens.spacing.md,
      margin: tokens.spacing.lg,
      borderRadius: tokens.borderRadius.none,
      boxShadow: 'none'
    },
    subheading: {
      fontFamily: tokens.typography.fontFamily.heading,
      fontSize: tokens.typography.fontSize['2xl'],
      fontWeight: tokens.typography.fontWeight.semibold.toString(),
      lineHeight: tokens.typography.lineHeight.snug.toString(),
      letterSpacing: tokens.typography.letterSpacing.normal,
      color: tokens.colors.neutral[200],
      backgroundColor: 'transparent',
      padding: tokens.spacing.sm,
      margin: tokens.spacing.md,
      borderRadius: tokens.borderRadius.none,
      boxShadow: 'none'
    },
    body: {
      fontFamily: tokens.typography.fontFamily.body,
      fontSize: tokens.typography.fontSize.base,
      fontWeight: tokens.typography.fontWeight.normal.toString(),
      lineHeight: tokens.typography.lineHeight.normal.toString(),
      letterSpacing: tokens.typography.letterSpacing.normal,
      color: tokens.colors.neutral[300],
      backgroundColor: 'transparent',
      padding: tokens.spacing.sm,
      margin: tokens.spacing.sm,
      borderRadius: tokens.borderRadius.none,
      boxShadow: 'none'
    },
    caption: {
      fontFamily: tokens.typography.fontFamily.body,
      fontSize: tokens.typography.fontSize.sm,
      fontWeight: tokens.typography.fontWeight.normal.toString(),
      lineHeight: tokens.typography.lineHeight.normal.toString(),
      letterSpacing: tokens.typography.letterSpacing.normal,
      color: tokens.colors.neutral[400],
      backgroundColor: 'transparent',
      padding: tokens.spacing.xs,
      margin: tokens.spacing.xs,
      borderRadius: tokens.borderRadius.none,
      boxShadow: 'none'
    },
    button: {
      fontFamily: tokens.typography.fontFamily.accent,
      fontSize: tokens.typography.fontSize.base,
      fontWeight: tokens.typography.fontWeight.semibold.toString(),
      lineHeight: tokens.typography.lineHeight.normal.toString(),
      letterSpacing: tokens.typography.letterSpacing.wide,
      color: tokens.colors.neutral[900],
      backgroundColor: tokens.colors.primary[400],
      padding: `${tokens.spacing.sm} ${tokens.spacing.lg}`,
      margin: tokens.spacing.sm,
      borderRadius: tokens.borderRadius.md,
      boxShadow: tokens.shadows.md
    },
    card: {
      fontFamily: tokens.typography.fontFamily.body,
      fontSize: tokens.typography.fontSize.base,
      fontWeight: tokens.typography.fontWeight.normal.toString(),
      lineHeight: tokens.typography.lineHeight.normal.toString(),
      letterSpacing: tokens.typography.letterSpacing.normal,
      color: tokens.colors.neutral[200],
      backgroundColor: tokens.colors.neutral[800],
      padding: tokens.spacing.lg,
      margin: tokens.spacing.md,
      borderRadius: tokens.borderRadius.lg,
      boxShadow: tokens.shadows.lg
    },
    input: {
      fontFamily: tokens.typography.fontFamily.body,
      fontSize: tokens.typography.fontSize.base,
      fontWeight: tokens.typography.fontWeight.normal.toString(),
      lineHeight: tokens.typography.lineHeight.normal.toString(),
      letterSpacing: tokens.typography.letterSpacing.normal,
      color: tokens.colors.neutral[200],
      backgroundColor: tokens.colors.neutral[800],
      padding: tokens.spacing.sm,
      margin: tokens.spacing.sm,
      borderRadius: tokens.borderRadius.md,
      boxShadow: tokens.shadows.sm
    }
  }
}

/**
 * Generate accessibility-focused tokens
 */
export function generateAccessibleTokens(variant: BusinessVariant): ComponentTokens {
  const tokens = getDesignTokens(variant)
  
  // Ensure minimum contrast ratios for accessibility
  const accessibleColors = {
    primary: tokens.colors.primary[700], // Darker for better contrast
    secondary: tokens.colors.secondary[700],
    neutral: tokens.colors.neutral[800], // Darker text
    background: tokens.colors.neutral[50] // Light background
  }
  
  return {
    heading: {
      fontFamily: tokens.typography.fontFamily.heading,
      fontSize: tokens.typography.fontSize['4xl'],
      fontWeight: tokens.typography.fontWeight.bold.toString(),
      lineHeight: tokens.typography.lineHeight.tight.toString(),
      letterSpacing: tokens.typography.letterSpacing.tight,
      color: accessibleColors.primary,
      backgroundColor: 'transparent',
      padding: tokens.spacing.md,
      margin: tokens.spacing.lg,
      borderRadius: tokens.borderRadius.none,
      boxShadow: 'none'
    },
    subheading: {
      fontFamily: tokens.typography.fontFamily.heading,
      fontSize: tokens.typography.fontSize['2xl'],
      fontWeight: tokens.typography.fontWeight.semibold.toString(),
      lineHeight: tokens.typography.lineHeight.snug.toString(),
      letterSpacing: tokens.typography.letterSpacing.normal,
      color: accessibleColors.primary,
      backgroundColor: 'transparent',
      padding: tokens.spacing.sm,
      margin: tokens.spacing.md,
      borderRadius: tokens.borderRadius.none,
      boxShadow: 'none'
    },
    body: {
      fontFamily: tokens.typography.fontFamily.body,
      fontSize: tokens.typography.fontSize.base,
      fontWeight: tokens.typography.fontWeight.normal.toString(),
      lineHeight: tokens.typography.lineHeight.normal.toString(),
      letterSpacing: tokens.typography.letterSpacing.normal,
      color: accessibleColors.neutral,
      backgroundColor: 'transparent',
      padding: tokens.spacing.sm,
      margin: tokens.spacing.sm,
      borderRadius: tokens.borderRadius.none,
      boxShadow: 'none'
    },
    caption: {
      fontFamily: tokens.typography.fontFamily.body,
      fontSize: tokens.typography.fontSize.sm,
      fontWeight: tokens.typography.fontWeight.normal.toString(),
      lineHeight: tokens.typography.lineHeight.normal.toString(),
      letterSpacing: tokens.typography.letterSpacing.normal,
      color: accessibleColors.neutral,
      backgroundColor: 'transparent',
      padding: tokens.spacing.xs,
      margin: tokens.spacing.xs,
      borderRadius: tokens.borderRadius.none,
      boxShadow: 'none'
    },
    button: {
      fontFamily: tokens.typography.fontFamily.accent,
      fontSize: tokens.typography.fontSize.base,
      fontWeight: tokens.typography.fontWeight.semibold.toString(),
      lineHeight: tokens.typography.lineHeight.normal.toString(),
      letterSpacing: tokens.typography.letterSpacing.wide,
      color: accessibleColors.background,
      backgroundColor: accessibleColors.primary,
      padding: `${tokens.spacing.sm} ${tokens.spacing.lg}`,
      margin: tokens.spacing.sm,
      borderRadius: tokens.borderRadius.md,
      boxShadow: tokens.shadows.md
    },
    card: {
      fontFamily: tokens.typography.fontFamily.body,
      fontSize: tokens.typography.fontSize.base,
      fontWeight: tokens.typography.fontWeight.normal.toString(),
      lineHeight: tokens.typography.lineHeight.normal.toString(),
      letterSpacing: tokens.typography.letterSpacing.normal,
      color: accessibleColors.neutral,
      backgroundColor: accessibleColors.background,
      padding: tokens.spacing.lg,
      margin: tokens.spacing.md,
      borderRadius: tokens.borderRadius.lg,
      boxShadow: tokens.shadows.lg
    },
    input: {
      fontFamily: tokens.typography.fontFamily.body,
      fontSize: tokens.typography.fontSize.base,
      fontWeight: tokens.typography.fontWeight.normal.toString(),
      lineHeight: tokens.typography.lineHeight.normal.toString(),
      letterSpacing: tokens.typography.letterSpacing.normal,
      color: accessibleColors.neutral,
      backgroundColor: accessibleColors.background,
      padding: tokens.spacing.sm,
      margin: tokens.spacing.sm,
      borderRadius: tokens.borderRadius.md,
      boxShadow: tokens.shadows.sm
    }
  }
}
