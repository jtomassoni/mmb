'use client'

import React, { useState, useRef, useEffect } from 'react'
import { timePickerClasses, timePickerUtils } from '@/lib/form-input-theme'
import { formIcons } from './form-icons'
import { usePicker } from './picker-context'

interface TimePickerProps {
  name: string
  label: string
  required?: boolean
  defaultValue?: string
  className?: string
}

export function TimePicker({ name, label, required, defaultValue = '', className = '' }: TimePickerProps) {
  const [time, setTime] = useState(defaultValue)
  const [hours, setHours] = useState(12)
  const [minutes, setMinutes] = useState(0)
  const [period, setPeriod] = useState('PM')

  const hoursRef = useRef<HTMLDivElement>(null)
  const minutesRef = useRef<HTMLDivElement>(null)
  const periodRef = useRef<HTMLDivElement>(null)

  const { activePicker, setActivePicker } = usePicker()
  const pickerId = `time-picker-${name}`
  const showPicker = activePicker === pickerId

  // Parse initial time
  useEffect(() => {
    if (defaultValue) {
      const { hours, minutes, period } = timePickerUtils.parseTime(defaultValue)
      setHours(hours)
      setMinutes(minutes)
      setPeriod(period)
    }
  }, [defaultValue])

  const formatTime = timePickerUtils.formatTime
  const to24Hour = timePickerUtils.to24Hour

  const handleTimeChange = () => {
    const time24 = to24Hour(hours, minutes, period)
    setTime(time24)
  }

  useEffect(() => {
    handleTimeChange()
  }, [hours, minutes, period])

  // Cleanup timeout on unmount
  useEffect(() => {
    return () => {
      if (scrollTimeoutRef.current) {
        clearTimeout(scrollTimeoutRef.current)
      }
    }
  }, [])

  // Initialize scroll positions when picker opens
  useEffect(() => {
    if (showPicker) {
      isInitializing.current = true
      // Small delay to ensure DOM is ready
      setTimeout(() => {
        scrollToItem(hoursRef, hours - 1)
        scrollToItem(minutesRef, minutes / 5)
        scrollToItem(periodRef, period === 'AM' ? 0 : 1)
        // Re-enable scroll handling after initialization
        setTimeout(() => {
          isInitializing.current = false
        }, 200)
      }, 100) // Increased delay to ensure proper positioning
    }
  }, [showPicker, hours, minutes, period])

  const scrollToItem = (ref: React.RefObject<HTMLDivElement>, index: number) => {
    if (ref.current) {
      const itemHeight = 40
      const paddingItems = 2 // Half of visible items (5/2 = 2.5, rounded down to 2)
      // Position the item in the center of the selection box
      const scrollTop = (paddingItems + index) * itemHeight
      ref.current.scrollTop = scrollTop
    }
  }

  const [isScrolling, setIsScrolling] = useState(false)
  const scrollTimeoutRef = useRef<NodeJS.Timeout | null>(null)
  const isInitializing = useRef(false)

  const handleScroll = (type: 'hours' | 'minutes' | 'period', scrollTop: number) => {
    // Don't handle scroll during initialization
    if (isInitializing.current) return
    
    setIsScrolling(true)
    
    // Clear existing timeout
    if (scrollTimeoutRef.current) {
      clearTimeout(scrollTimeoutRef.current)
    }
    
    // Debounce scroll updates
    scrollTimeoutRef.current = setTimeout(() => {
      const itemHeight = 40
      const paddingItems = 2
      // Calculate which item is currently in the center selection box
      const centerIndex = Math.round(scrollTop / itemHeight) - paddingItems
      
      // Add bounds checking to prevent invalid values
      if (type === 'hours') {
        const clampedIndex = Math.max(0, Math.min(centerIndex, 11)) // 0-11 for 1-12
        setHours(clampedIndex + 1)
      } else if (type === 'minutes') {
        const clampedIndex = Math.max(0, Math.min(centerIndex, 11)) // 0-11 for 0-55 (5-minute intervals)
        setMinutes(clampedIndex * 5)
      } else if (type === 'period') {
        const clampedIndex = Math.max(0, Math.min(centerIndex, 1)) // 0-1 for AM/PM
        setPeriod(clampedIndex === 0 ? 'AM' : 'PM')
      }
      
      setIsScrolling(false)
    }, 150) // 150ms debounce
  }

  const renderScrollableColumn = (
    type: 'hours' | 'minutes' | 'period',
    items: (string | number)[],
    currentValue: number | string,
    ref: React.RefObject<HTMLDivElement>
  ) => {
    const itemHeight = 40
    const visibleItems = 5
    const paddingItems = Math.floor(visibleItems / 2)

    // Create padded array for smooth scrolling
    const paddedItems = [
      ...Array(paddingItems).fill(''),
      ...items,
      ...Array(paddingItems).fill('')
    ]

    return (
      <div className="flex-1">
        <div className="relative h-48 overflow-hidden bg-gray-50 rounded-lg">
          {/* Selection indicator */}
          <div className="absolute top-1/2 left-0 right-0 h-10 bg-white border-2 border-green-500 rounded transform -translate-y-1/2 z-10 pointer-events-none shadow-sm"></div>
          
          <div
            ref={ref}
            className="overflow-y-auto h-full scrollbar-hide picker-wheel"
            style={{ 
              scrollbarWidth: 'none', 
              msOverflowStyle: 'none',
              scrollBehavior: 'smooth'
            }}
            onScroll={(e) => {
              const scrollTop = e.currentTarget.scrollTop
              handleScroll(type, scrollTop)
            }}
          >
            {paddedItems.map((item, index) => {
              // Calculate the actual item index (accounting for padding)
              const actualIndex = index - paddingItems
              const isSelected = 
                (type === 'hours' && actualIndex === (currentValue as number) - 1) ||
                (type === 'minutes' && actualIndex === (currentValue as number) / 5) ||
                (type === 'period' && ((actualIndex === 0 && currentValue === 'AM') || (actualIndex === 1 && currentValue === 'PM')))
              
              // Skip rendering empty padding items
              if (item === '') {
                return (
                  <div
                    key={`padding-${index}`}
                    style={{ height: `${itemHeight}px` }}
                  />
                )
              }
              
              return (
                <div
                  key={index}
                  className={`flex items-center justify-center h-10 text-sm font-medium cursor-pointer transition-all duration-200 picker-item ${
                    isSelected 
                      ? 'text-green-600 font-semibold scale-110' 
                      : 'text-gray-600 hover:text-gray-800 hover:bg-gray-100'
                  }`}
                  style={{ height: `${itemHeight}px` }}
                  onClick={(e) => {
                    e.preventDefault()
                    e.stopPropagation()
                    if (type === 'hours') {
                      setHours(actualIndex + 1)
                    } else if (type === 'minutes') {
                      setMinutes(actualIndex * 5)
                    } else if (type === 'period') {
                      setPeriod(actualIndex === 0 ? 'AM' : 'PM')
                    }
                    // Scroll to the clicked item
                    scrollToItem(ref, actualIndex)
                  }}
                >
                  {item}
                </div>
              )
            })}
          </div>
        </div>
      </div>
    )
  }

  const handleDone = () => {
    setActivePicker(null)
  }

  return (
    <div className={className}>
      <label className="block text-sm font-medium text-gray-700 mb-1">
        {label} {required && '*'}
      </label>
      
      <div className="relative">
        <input
          type="hidden"
          name={name}
          value={time}
        />
        
        <button
          type="button"
          onClick={() => setActivePicker(showPicker ? null : pickerId)}
          className={timePickerClasses.triggerButton}
        >
          <span>{time ? formatTime(hours, minutes, period) : 'Select time'}</span>
          {formIcons.clock}
        </button>

        {showPicker && (
          <div className={timePickerClasses.dropdown}>
            <div className={timePickerClasses.content}>
              {/* Time Display */}
              <div className={timePickerClasses.timeDisplay}>
                <div className={timePickerClasses.timeText}>
                  {formatTime(hours, minutes, period)}
                </div>
              </div>

              {/* Scrollable Time Selector */}
              <div className="flex gap-2 mb-4">
                {renderScrollableColumn(
                  'hours',
                  timePickerUtils.getHourOptions(),
                  hours,
                  hoursRef
                )}
                {renderScrollableColumn(
                  'minutes',
                  timePickerUtils.getMinuteOptions(),
                  minutes,
                  minutesRef
                )}
                {renderScrollableColumn(
                  'period',
                  timePickerUtils.getPeriodOptions(),
                  period,
                  periodRef
                )}
              </div>

              {/* Done Button */}
              <button
                type="button"
                onClick={handleDone}
                className={timePickerClasses.doneButton}
              >
                Done
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}