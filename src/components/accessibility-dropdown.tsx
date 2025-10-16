'use client'

import { useState, useEffect } from 'react'

export function AccessibilityDropdown() {
  const [isOpen, setIsOpen] = useState(false)
  const [fontScale, setFontScale] = useState<'normal' | 'large' | 'larger'>('normal')
  const [highContrast, setHighContrast] = useState(false)
  const [reducedMotion, setReducedMotion] = useState(false)
  const [dyslexiaFont, setDyslexiaFont] = useState(false)

  useEffect(() => {
    // Load saved preferences from localStorage
    const savedFontScale = localStorage.getItem('fontScale') as 'normal' | 'large' | 'larger' || 'normal'
    const savedHighContrast = localStorage.getItem('highContrast') === 'true'
    const savedReducedMotion = localStorage.getItem('reducedMotion') === 'true'
    const savedDyslexiaFont = localStorage.getItem('dyslexiaFont') === 'true'

    setFontScale(savedFontScale)
    setHighContrast(savedHighContrast)
    setReducedMotion(savedReducedMotion)
    setDyslexiaFont(savedDyslexiaFont)

    // Apply initial styles
    applyAccessibilityStyles(savedFontScale, savedHighContrast, savedReducedMotion, savedDyslexiaFont)
  }, [])

  useEffect(() => {
    // Handle Escape key to close dropdown
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape' && isOpen) {
        setIsOpen(false)
      }
    }

    // Handle click outside to close dropdown
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as Element
      if (isOpen && !target.closest('[data-accessibility-dropdown]')) {
        setIsOpen(false)
      }
    }

    if (isOpen) {
      document.addEventListener('keydown', handleKeyDown)
      document.addEventListener('mousedown', handleClickOutside)
      return () => {
        document.removeEventListener('keydown', handleKeyDown)
        document.removeEventListener('mousedown', handleClickOutside)
      }
    }
  }, [isOpen])

  const applyAccessibilityStyles = (
    scale: 'normal' | 'large' | 'larger',
    contrast: boolean,
    motion: boolean,
    dyslexia: boolean
  ) => {
    const root = document.documentElement

    // Font scaling
    root.style.setProperty('--font-scale', scale === 'normal' ? '1' : scale === 'large' ? '1.2' : '1.35')
    
    // High contrast
    if (contrast) {
      root.classList.add('high-contrast')
    } else {
      root.classList.remove('high-contrast')
    }

    // Reduced motion
    if (motion) {
      root.classList.add('reduced-motion')
    } else {
      root.classList.remove('reduced-motion')
    }

    // Dyslexia font
    if (dyslexia) {
      root.classList.add('dyslexia-font')
    } else {
      root.classList.remove('dyslexia-font')
    }
  }

  const handleFontScaleChange = (scale: 'normal' | 'large' | 'larger') => {
    setFontScale(scale)
    localStorage.setItem('fontScale', scale)
    applyAccessibilityStyles(scale, highContrast, reducedMotion, dyslexiaFont)
    announceChange(`Font size set to ${scale}`)
  }

  const handleHighContrastToggle = () => {
    const newValue = !highContrast
    setHighContrast(newValue)
    localStorage.setItem('highContrast', newValue.toString())
    applyAccessibilityStyles(fontScale, newValue, reducedMotion, dyslexiaFont)
    announceChange(`High contrast ${newValue ? 'enabled' : 'disabled'}`)
  }

  const handleReducedMotionToggle = () => {
    const newValue = !reducedMotion
    setReducedMotion(newValue)
    localStorage.setItem('reducedMotion', newValue.toString())
    applyAccessibilityStyles(fontScale, highContrast, newValue, dyslexiaFont)
    announceChange(`Reduced motion ${newValue ? 'enabled' : 'disabled'}`)
  }

  const handleDyslexiaFontToggle = () => {
    const newValue = !dyslexiaFont
    setDyslexiaFont(newValue)
    localStorage.setItem('dyslexiaFont', newValue.toString())
    applyAccessibilityStyles(fontScale, highContrast, reducedMotion, newValue)
    announceChange(`Dyslexia-friendly font ${newValue ? 'enabled' : 'disabled'}`)
  }

  const announceChange = (message: string) => {
    // Create or update aria-live region
    let liveRegion = document.getElementById('accessibility-announcements')
    if (!liveRegion) {
      liveRegion = document.createElement('div')
      liveRegion.id = 'accessibility-announcements'
      liveRegion.setAttribute('aria-live', 'polite')
      liveRegion.setAttribute('aria-atomic', 'true')
      liveRegion.className = 'sr-only'
      document.body.appendChild(liveRegion)
    }
    liveRegion.textContent = message
  }

  return (
    <div className="relative">
      {/* Dropdown Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center text-white/70 hover:text-white p-2 rounded-md hover:bg-white/10 focus:outline-none focus:ring-2 focus:ring-white/50 focus:ring-offset-2 focus:ring-offset-black/50 transition-all duration-300"
        aria-label="Accessibility options"
        aria-expanded={isOpen}
        aria-haspopup="true"
        title="Accessibility options"
        data-accessibility-dropdown
      >
        {/* Accessibility icon from Freepik: https://www.freepik.com/icon/accessibility_1512642 */}
        <img 
          src="/accessibility-icon.png" 
          alt="Accessibility" 
          className="w-8 h-8 brightness-0 invert"
          aria-hidden="true"
        />
      </button>

      {/* Dropdown Panel */}
      {isOpen && (
        <div className="absolute right-0 mt-2 w-64 bg-white border border-gray-300 rounded-lg shadow-lg p-4 z-50" data-accessibility-dropdown>
          <h3 className="text-sm font-semibold text-gray-900 mb-3">Accessibility Options</h3>
          
          <div className="space-y-3">
            {/* Font Scale */}
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">Font Size</label>
              <div className="flex space-x-1">
                <button
                  onClick={() => handleFontScaleChange('normal')}
                  className={`px-2 py-1 text-xs rounded ${
                    fontScale === 'normal' 
                      ? 'bg-blue-600 text-white' 
                      : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                  }`}
                  aria-label="Normal font size"
                >
                  A
                </button>
                <button
                  onClick={() => handleFontScaleChange('large')}
                  className={`px-2 py-1 text-xs rounded ${
                    fontScale === 'large' 
                      ? 'bg-blue-600 text-white' 
                      : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                  }`}
                  aria-label="Large font size (+20%)"
                >
                  A+
                </button>
                <button
                  onClick={() => handleFontScaleChange('larger')}
                  className={`px-2 py-1 text-xs rounded ${
                    fontScale === 'larger' 
                      ? 'bg-blue-600 text-white' 
                      : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                  }`}
                  aria-label="Larger font size (+35%)"
                >
                  A++
                </button>
              </div>
            </div>

            {/* High Contrast */}
            <div>
              <label className="flex items-center">
                <input
                  type="checkbox"
                  checked={highContrast}
                  onChange={handleHighContrastToggle}
                  className="mr-2"
                  aria-label="Toggle high contrast mode"
                />
                <span className="text-xs text-gray-700">High Contrast</span>
              </label>
            </div>

            {/* Reduced Motion */}
            <div>
              <label className="flex items-center">
                <input
                  type="checkbox"
                  checked={reducedMotion}
                  onChange={handleReducedMotionToggle}
                  className="mr-2"
                  aria-label="Toggle reduced motion"
                />
                <span className="text-xs text-gray-700">Reduced Motion</span>
              </label>
            </div>

            {/* Dyslexia Font */}
            <div>
              <label className="flex items-center">
                <input
                  type="checkbox"
                  checked={dyslexiaFont}
                  onChange={handleDyslexiaFontToggle}
                  className="mr-2"
                  aria-label="Toggle dyslexia-friendly font"
                />
                <span className="text-xs text-gray-700">Dyslexia Font</span>
              </label>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
