'use client'

import { createContext, useContext, useEffect, useState, ReactNode } from 'react'
import { Theme, getStoredTheme, applyThemeToDocument, getThemeById } from '../lib/themes'

interface ThemeContextType {
  currentTheme: Theme
  setTheme: (theme: Theme) => void
  isLoaded: boolean
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined)

interface ThemeProviderProps {
  children: ReactNode
}

export function ThemeProvider({ children }: ThemeProviderProps) {
  const [currentTheme, setCurrentTheme] = useState<Theme>(getStoredTheme())
  const [isLoaded, setIsLoaded] = useState(false)

  useEffect(() => {
    // Load theme from database on mount
    const loadThemeFromDatabase = async () => {
      try {
        const response = await fetch('/api/admin/theme')
        if (response.ok) {
          const data = await response.json()
          const theme = getThemeById(data.themeId)
          if (theme) {
            setCurrentTheme(theme)
            applyThemeToDocument(theme)
          }
        }
      } catch (error) {
        console.error('Failed to load theme from database:', error)
        // Fall back to stored theme
        applyThemeToDocument(currentTheme)
      }
    }

    loadThemeFromDatabase()
    setIsLoaded(true)
  }, [])

  const setTheme = async (theme: Theme) => {
    setCurrentTheme(theme)
    applyThemeToDocument(theme)
    
    // Save to database
    try {
      await fetch('/api/admin/theme', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ themeId: theme.id })
      })
    } catch (error) {
      console.error('Failed to save theme to database:', error)
    }
  }

  return (
    <ThemeContext.Provider value={{ currentTheme, setTheme, isLoaded }}>
      {children}
    </ThemeContext.Provider>
  )
}

export function useTheme() {
  const context = useContext(ThemeContext)
  if (context === undefined) {
    throw new Error('useTheme must be used within a ThemeProvider')
  }
  return context
}
