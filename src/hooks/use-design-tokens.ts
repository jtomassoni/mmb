'use client'

import { useState, useEffect, useMemo } from 'react'
import { BusinessVariant } from '../lib/design-tokens'
import { 
  getDesignTokens, 
  getCSSVariables, 
  generateComponentTokens, 
  generateResponsiveTypography,
  generateDarkModeTokens,
  generateAccessibleTokens,
  validateContrastRatios,
  getVariantInfo
} from '../lib/design-tokens'
import { 
  generateCSSCustomProperties, 
  generateVariantClasses,
  tokensToCSS 
} from '../lib/apply-tokens'

export interface UseDesignTokensOptions {
  variant: BusinessVariant
  responsive?: boolean
  darkMode?: boolean
  accessible?: boolean
  customTokens?: Partial<BusinessVariant>
}

export interface UseDesignTokensReturn {
  // Core tokens
  tokens: ReturnType<typeof getDesignTokens>
  cssVariables: Record<string, string>
  cssString: string
  
  // Component tokens
  componentTokens: ReturnType<typeof generateComponentTokens>
  responsiveTokens?: ReturnType<typeof generateResponsiveTypography>
  darkModeTokens?: ReturnType<typeof generateComponentTokens>
  accessibleTokens?: ReturnType<typeof generateComponentTokens>
  
  // Utility functions
  getToken: (path: string) => any
  getCSS: (component: keyof ReturnType<typeof generateComponentTokens>) => React.CSSProperties
  getClasses: () => ReturnType<typeof generateVariantClasses>
  
  // Validation
  contrastValidation: ReturnType<typeof validateContrastRatios>
  variantInfo: ReturnType<typeof getVariantInfo>
  
  // State
  isLoaded: boolean
  error?: string
}

/**
 * React hook for using design tokens
 */
export function useDesignTokens(options: UseDesignTokensOptions): UseDesignTokensReturn {
  const { variant, responsive = false, darkMode = false, accessible = false } = options
  
  const [isLoaded, setIsLoaded] = useState(false)
  const [error, setError] = useState<string | undefined>()
  
  // Core tokens
  const tokens = useMemo(() => getDesignTokens(variant), [variant])
  const cssVariables = useMemo(() => getCSSVariables(variant), [variant])
  const cssString = useMemo(() => generateCSSCustomProperties(variant), [variant])
  
  // Component tokens
  const componentTokens = useMemo(() => generateComponentTokens(variant), [variant])
  const responsiveTokens = useMemo(() => 
    responsive ? generateResponsiveTypography(variant) : undefined, 
    [responsive, variant]
  )
  const darkModeTokens = useMemo(() => 
    darkMode ? generateDarkModeTokens(variant) : undefined, 
    [darkMode, variant]
  )
  const accessibleTokens = useMemo(() => 
    accessible ? generateAccessibleTokens(variant) : undefined, 
    [accessible, variant]
  )
  
  // Utility functions
  const getToken = useMemo(() => {
    return (path: string) => {
      const keys = path.split('.')
      let value: any = tokens
      
      for (const key of keys) {
        if (value && typeof value === 'object' && key in value) {
          value = value[key]
        } else {
          return undefined
        }
      }
      
      return value
    }
  }, [tokens])
  
  const getCSS = useMemo(() => {
    return (component: keyof typeof componentTokens) => {
      const componentToken = componentTokens[component]
      return tokensToCSS(componentToken)
    }
  }, [componentTokens])
  
  const getClasses = useMemo(() => {
    return () => generateVariantClasses(variant)
  }, [variant])
  
  // Validation
  const contrastValidation = useMemo(() => validateContrastRatios(variant), [variant])
  const variantInfo = useMemo(() => getVariantInfo(variant), [variant])
  
  // Apply CSS variables to document
  useEffect(() => {
    try {
      const styleId = `design-tokens-${variant}`
      let styleElement = document.getElementById(styleId) as HTMLStyleElement
      
      if (!styleElement) {
        styleElement = document.createElement('style')
        styleElement.id = styleId
        document.head.appendChild(styleElement)
      }
      
      styleElement.textContent = `
        :root {
${cssString}
        }
        
        .variant-${variant} {
          font-family: var(--font-body);
          color: var(--color-primary-700);
        }
        
        .variant-${variant}-heading {
          font-family: var(--font-heading);
          font-size: var(--text-4xl);
          font-weight: var(--font-bold);
          line-height: var(--leading-tight);
          letter-spacing: var(--tracking-tight);
          color: var(--color-primary-900);
        }
        
        .variant-${variant}-subheading {
          font-family: var(--font-heading);
          font-size: var(--text-2xl);
          font-weight: var(--font-semibold);
          line-height: var(--leading-snug);
          color: var(--color-primary-800);
        }
        
        .variant-${variant}-body {
          font-family: var(--font-body);
          font-size: var(--text-base);
          font-weight: var(--font-normal);
          line-height: var(--leading-normal);
          color: var(--color-neutral-700);
        }
        
        .variant-${variant}-button {
          font-family: var(--font-accent);
          font-size: var(--text-base);
          font-weight: var(--font-semibold);
          letter-spacing: var(--tracking-wide);
          color: var(--color-neutral-50);
          background-color: var(--color-primary-600);
          padding: var(--spacing-sm) var(--spacing-lg);
          border-radius: var(--radius-md);
          box-shadow: var(--shadow-md);
          border: none;
          cursor: pointer;
          transition: all 0.2s ease;
        }
        
        .variant-${variant}-button:hover {
          background-color: var(--color-primary-700);
          box-shadow: var(--shadow-lg);
        }
        
        .variant-${variant}-card {
          font-family: var(--font-body);
          background-color: var(--color-neutral-50);
          padding: var(--spacing-lg);
          border-radius: var(--radius-lg);
          box-shadow: var(--shadow-lg);
          color: var(--color-neutral-700);
        }
        
        .variant-${variant}-input {
          font-family: var(--font-body);
          font-size: var(--text-base);
          background-color: var(--color-neutral-50);
          padding: var(--spacing-sm);
          border-radius: var(--radius-md);
          box-shadow: var(--shadow-sm);
          border: 1px solid var(--color-neutral-300);
          color: var(--color-neutral-700);
        }
        
        .variant-${variant}-input:focus {
          outline: none;
          border-color: var(--color-primary-500);
          box-shadow: var(--shadow-md);
        }
      `
      
      setIsLoaded(true)
      setError(undefined)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to apply design tokens')
      setIsLoaded(false)
    }
  }, [variant, cssString])
  
  // Cleanup on unmount
  useEffect(() => {
    return () => {
      const styleElement = document.getElementById(`design-tokens-${variant}`)
      if (styleElement) {
        styleElement.remove()
      }
    }
  }, [variant])
  
  return {
    tokens,
    cssVariables,
    cssString,
    componentTokens,
    responsiveTokens,
    darkModeTokens,
    accessibleTokens,
    getToken,
    getCSS,
    getClasses,
    contrastValidation,
    variantInfo,
    isLoaded,
    error
  }
}

/**
 * Hook for responsive design tokens
 */
export function useResponsiveTokens(variant: BusinessVariant) {
  const { responsiveTokens, isLoaded } = useDesignTokens({ 
    variant, 
    responsive: true 
  })
  
  const [breakpoint, setBreakpoint] = useState<'mobile' | 'tablet' | 'desktop'>('desktop')
  
  useEffect(() => {
    const updateBreakpoint = () => {
      const width = window.innerWidth
      if (width < 768) {
        setBreakpoint('mobile')
      } else if (width < 1024) {
        setBreakpoint('tablet')
      } else {
        setBreakpoint('desktop')
      }
    }
    
    updateBreakpoint()
    window.addEventListener('resize', updateBreakpoint)
    
    return () => window.removeEventListener('resize', updateBreakpoint)
  }, [])
  
  const currentTokens = responsiveTokens?.[breakpoint]
  
  return {
    tokens: currentTokens,
    breakpoint,
    isLoaded,
    isMobile: breakpoint === 'mobile',
    isTablet: breakpoint === 'tablet',
    isDesktop: breakpoint === 'desktop'
  }
}

/**
 * Hook for dark mode design tokens
 */
export function useDarkModeTokens(variant: BusinessVariant) {
  const { darkModeTokens, isLoaded } = useDesignTokens({ 
    variant, 
    darkMode: true 
  })
  
  const [isDarkMode, setIsDarkMode] = useState(false)
  
  useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)')
    setIsDarkMode(mediaQuery.matches)
    
    const handler = (e: MediaQueryListEvent) => setIsDarkMode(e.matches)
    mediaQuery.addEventListener('change', handler)
    
    return () => mediaQuery.removeEventListener('change', handler)
  }, [])
  
  return {
    tokens: isDarkMode ? darkModeTokens : undefined,
    isDarkMode,
    isLoaded,
    toggleDarkMode: () => setIsDarkMode(!isDarkMode)
  }
}

/**
 * Hook for accessible design tokens
 */
export function useAccessibleTokens(variant: BusinessVariant) {
  const { accessibleTokens, contrastValidation, isLoaded } = useDesignTokens({ 
    variant, 
    accessible: true 
  })
  
  const [isAccessibleMode, setIsAccessibleMode] = useState(false)
  
  useEffect(() => {
    // Check for accessibility preferences
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    const prefersHighContrast = window.matchMedia('(prefers-contrast: high)').matches
    
    setIsAccessibleMode(prefersReducedMotion || prefersHighContrast)
  }, [])
  
  return {
    tokens: isAccessibleMode ? accessibleTokens : undefined,
    isAccessibleMode,
    isLoaded,
    contrastValidation,
    toggleAccessibleMode: () => setIsAccessibleMode(!isAccessibleMode)
  }
}
