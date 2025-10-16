'use client'

import { useState, useEffect } from 'react'
import { themes, Theme, applyThemeToDocument, getStoredTheme } from '../lib/themes'

interface ThemeSelectorProps {
  onThemeChange?: (theme: Theme) => void
}

export function ThemeSelector({ onThemeChange }: ThemeSelectorProps) {
  const [selectedTheme, setSelectedTheme] = useState<Theme>(getStoredTheme())
  const [isOpen, setIsOpen] = useState(false)

  useEffect(() => {
    applyThemeToDocument(selectedTheme)
    onThemeChange?.(selectedTheme)
  }, [selectedTheme, onThemeChange])

  const handleThemeSelect = (theme: Theme) => {
    setSelectedTheme(theme)
    setIsOpen(false)
  }

  const categories = [
    { id: 'classic', name: 'Classic', icon: 'Classic' },
    { id: 'modern', name: 'Modern', icon: 'Modern' },
    { id: 'rustic', name: 'Rustic', icon: 'Rustic' },
    { id: 'elegant', name: 'Elegant', icon: 'Elegant' },
    { id: 'vibrant', name: 'Vibrant', icon: 'Vibrant' },
  ] as const

  return (
    <div className="relative">
      {/* Theme Selector Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center space-x-2 px-4 py-2 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
      >
        <div 
          className="w-4 h-4 rounded-full border border-gray-300"
          style={{ backgroundColor: selectedTheme.colors.primary }}
        />
        <span className="text-sm font-medium text-gray-700">
          {selectedTheme.name}
        </span>
        <svg 
          className={`w-4 h-4 text-gray-500 transition-transform ${isOpen ? 'rotate-180' : ''}`}
          fill="none" 
          stroke="currentColor" 
          viewBox="0 0 24 24"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {/* Theme Dropdown */}
      {isOpen && (
        <div className="absolute top-full left-0 mt-2 bg-white border border-gray-300 rounded-lg shadow-xl z-50 w-[1000px] max-w-[95vw]">
          <div className="p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-xl font-semibold text-gray-900">Choose Theme</h3>
              <button 
                onClick={() => setIsOpen(false)}
                className="text-gray-400 hover:text-gray-600 transition-colors"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            
            {/* All Themes in One Grid - No Categories */}
            <div className="grid grid-cols-5 gap-2">
              {themes.map((theme) => (
                <button
                  key={theme.id}
                  onClick={() => handleThemeSelect(theme)}
                  className={`flex flex-col items-center p-2 rounded-lg border-2 transition-all ${
                    selectedTheme.id === theme.id
                      ? 'border-blue-500 bg-blue-50 shadow-md'
                      : 'border-gray-200 hover:border-blue-300 hover:bg-gray-50 hover:shadow'
                  }`}
                >
                  {/* Color Preview */}
                  <div className="flex flex-col items-center space-y-1 mb-2">
                    <div 
                      className="w-12 h-12 rounded-lg border border-gray-300 shadow-sm"
                      style={{ backgroundColor: theme.colors.primary }}
                    />
                    <div className="flex space-x-1">
                      <div 
                        className="w-4 h-4 rounded border border-gray-300"
                        style={{ backgroundColor: theme.colors.secondary }}
                      />
                      <div 
                        className="w-4 h-4 rounded border border-gray-300"
                        style={{ backgroundColor: theme.colors.accent }}
                      />
                    </div>
                  </div>
                  
                  {/* Theme Info */}
                  <div className="text-center">
                    <div className="font-semibold text-sm text-gray-900">{theme.name}</div>
                    <div className="text-xs text-gray-500 mt-1">{theme.description}</div>
                  </div>
                  
                  {/* Selected Indicator */}
                  {selectedTheme.id === theme.id && (
                    <div className="mt-2">
                      <svg className="w-5 h-5 text-blue-500" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                      </svg>
                    </div>
                  )}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Click outside to close */}
      {isOpen && (
        <div 
          className="fixed inset-0 z-40" 
          onClick={() => setIsOpen(false)}
        />
      )}
    </div>
  )
}

// Theme Preview Component for Settings Page
export function ThemePreview({ theme }: { theme: Theme }) {
  return (
    <div 
      className="p-4 rounded-lg border"
      style={{ 
        backgroundColor: theme.colors.surface,
        borderColor: theme.colors.border,
        color: theme.colors.text
      }}
    >
      <div className="space-y-3">
        {/* Header */}
        <div 
          className="p-3 rounded"
          style={{ backgroundColor: theme.colors.primary }}
        >
          <h3 
            className="font-semibold"
            style={{ color: theme.colors.surface }}
          >
            Sample Header
          </h3>
        </div>
        
        {/* Content */}
        <div className="space-y-2">
          <p 
            className="text-sm"
            style={{ color: theme.colors.textSecondary }}
          >
            Sample content text
          </p>
          
          {/* Buttons */}
          <div className="flex space-x-2">
            <button
              className="px-3 py-1 rounded text-sm font-medium"
              style={{ 
                backgroundColor: theme.colors.primary,
                color: theme.colors.surface
              }}
            >
              Primary
            </button>
            <button
              className="px-3 py-1 rounded text-sm font-medium border"
              style={{ 
                backgroundColor: theme.colors.surface,
                color: theme.colors.primary,
                borderColor: theme.colors.primary
              }}
            >
              Secondary
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
