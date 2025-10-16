'use client'

import { useState } from 'react'
import { themes, Theme, applyThemeToDocument } from '../lib/themes'

export function ThemeDemo() {
  const [selectedTheme, setSelectedTheme] = useState<Theme>(themes[0])

  const handleThemeChange = (theme: Theme) => {
    setSelectedTheme(theme)
    applyThemeToDocument(theme)
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">Theme System Demo</h1>
          <p className="text-lg text-gray-600">
            See how different themes transform the look and feel of your restaurant website
          </p>
        </div>

        {/* Theme Selector */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-8">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Choose a Theme</h2>
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
            {themes.map((theme) => (
              <button
                key={theme.id}
                onClick={() => handleThemeChange(theme)}
                className={`p-4 rounded-lg border-2 transition-all ${
                  selectedTheme.id === theme.id
                    ? 'border-blue-500 bg-blue-50'
                    : 'border-gray-200 hover:border-gray-300'
                }`}
              >
                <div className="flex space-x-1 mb-2">
                  <div 
                    className="w-4 h-4 rounded-full"
                    style={{ backgroundColor: theme.colors.primary }}
                  />
                  <div 
                    className="w-4 h-4 rounded-full"
                    style={{ backgroundColor: theme.colors.secondary }}
                  />
                  <div 
                    className="w-4 h-4 rounded-full"
                    style={{ backgroundColor: theme.colors.accent }}
                  />
                </div>
                <div className="text-sm font-medium text-gray-900">{theme.name}</div>
                <div className="text-xs text-gray-500">{theme.category}</div>
              </button>
            ))}
          </div>
        </div>

        {/* Live Preview */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-6">Live Preview</h2>
          
          {/* Sample Restaurant Content */}
          <div className="space-y-6">
            {/* Header */}
            <div 
              className="p-6 rounded-lg text-white"
              style={{ backgroundColor: selectedTheme.colors.primary }}
            >
              <h3 className="text-2xl font-bold mb-2">Monaghan's Bar & Grill</h3>
              <p className="text-lg opacity-90">Where Denver comes to eat, drink, and play</p>
            </div>

            {/* Menu Items */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div 
                className="p-4 rounded-lg border"
                style={{ 
                  backgroundColor: selectedTheme.colors.surface,
                  borderColor: selectedTheme.colors.border,
                  color: selectedTheme.colors.text
                }}
              >
                <div className="flex justify-between items-start mb-2">
                  <h4 className="font-semibold">Monaghan Burger</h4>
                  <span 
                    className="font-bold"
                    style={{ color: selectedTheme.colors.primary }}
                  >
                    $16.99
                  </span>
                </div>
                <p 
                  className="text-sm"
                  style={{ color: selectedTheme.colors.textSecondary }}
                >
                  Our famous burger with lettuce, tomato, onion, and special sauce
                </p>
              </div>

              <div 
                className="p-4 rounded-lg border"
                style={{ 
                  backgroundColor: selectedTheme.colors.surface,
                  borderColor: selectedTheme.colors.border,
                  color: selectedTheme.colors.text
                }}
              >
                <div className="flex justify-between items-start mb-2">
                  <h4 className="font-semibold">Fish & Chips</h4>
                  <span 
                    className="font-bold"
                    style={{ color: selectedTheme.colors.primary }}
                  >
                    $18.99
                  </span>
                </div>
                <p 
                  className="text-sm"
                  style={{ color: selectedTheme.colors.textSecondary }}
                >
                  Beer-battered cod with crispy fries and coleslaw
                </p>
              </div>
            </div>

            {/* Buttons */}
            <div className="flex space-x-4">
              <button
                className="px-6 py-3 rounded-lg font-semibold text-white transition-all hover:shadow-lg"
                style={{ backgroundColor: selectedTheme.colors.primary }}
              >
                Order Now
              </button>
              <button
                className="px-6 py-3 rounded-lg font-semibold border-2 transition-all"
                style={{ 
                  backgroundColor: selectedTheme.colors.surface,
                  borderColor: selectedTheme.colors.primary,
                  color: selectedTheme.colors.primary
                }}
              >
                View Menu
              </button>
            </div>

            {/* Special Notice */}
            <div 
              className="p-4 rounded-lg"
              style={{ 
                backgroundColor: selectedTheme.colors.accent + '20',
                borderColor: selectedTheme.colors.accent,
                borderWidth: '1px',
                borderStyle: 'solid'
              }}
            >
              <div className="flex items-center space-x-2">
                <span 
                  className="text-lg"
                  style={{ color: selectedTheme.colors.accent }}
                >
                  🎉
                </span>
                <div>
                  <h4 
                    className="font-semibold"
                    style={{ color: selectedTheme.colors.accent }}
                  >
                    Happy Hour Special
                  </h4>
                  <p 
                    className="text-sm"
                    style={{ color: selectedTheme.colors.textSecondary }}
                  >
                    Half price drinks and appetizers from 3pm-7pm daily
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Theme Details */}
        <div className="mt-8 bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Current Theme: {selectedTheme.name}</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div>
              <h4 className="font-medium text-gray-900 mb-2">Primary Color</h4>
              <div className="flex items-center space-x-2">
                <div 
                  className="w-8 h-8 rounded border"
                  style={{ backgroundColor: selectedTheme.colors.primary }}
                />
                <span className="text-sm font-mono">{selectedTheme.colors.primary}</span>
              </div>
            </div>
            <div>
              <h4 className="font-medium text-gray-900 mb-2">Secondary Color</h4>
              <div className="flex items-center space-x-2">
                <div 
                  className="w-8 h-8 rounded border"
                  style={{ backgroundColor: selectedTheme.colors.secondary }}
                />
                <span className="text-sm font-mono">{selectedTheme.colors.secondary}</span>
              </div>
            </div>
            <div>
              <h4 className="font-medium text-gray-900 mb-2">Accent Color</h4>
              <div className="flex items-center space-x-2">
                <div 
                  className="w-8 h-8 rounded border"
                  style={{ backgroundColor: selectedTheme.colors.accent }}
                />
                <span className="text-sm font-mono">{selectedTheme.colors.accent}</span>
              </div>
            </div>
            <div>
              <h4 className="font-medium text-gray-900 mb-2">Font Family</h4>
              <span className="text-sm">{selectedTheme.fonts.heading}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
