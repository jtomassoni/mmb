'use client'

import React, { useState, useEffect, useRef } from 'react'
import { datePickerClasses, datePickerUtils } from '@/lib/form-input-theme'
import { formIcons } from './form-icons'
import { usePicker } from './picker-context'

interface DatePickerProps {
  name: string
  label: string
  required?: boolean
  defaultValue?: string
  className?: string
}

export function DatePicker({ name, label, required, defaultValue = '', className = '' }: DatePickerProps) {
  const [date, setDate] = useState(defaultValue)
  const [selectedDate, setSelectedDate] = useState<Date | null>(null)
  const [currentMonth, setCurrentMonth] = useState(new Date().getMonth())
  const [currentYear, setCurrentYear] = useState(new Date().getFullYear())
  const [currentDay, setCurrentDay] = useState(new Date().getDate())

  const monthRef = useRef<HTMLDivElement>(null)
  const dayRef = useRef<HTMLDivElement>(null)
  const yearRef = useRef<HTMLDivElement>(null)

  const { activePicker, setActivePicker } = usePicker()
  const pickerId = `date-picker-${name}`
  const showPicker = activePicker === pickerId

  // Parse initial date
  useEffect(() => {
    if (defaultValue) {
      const parsedDate = datePickerUtils.parseDate(defaultValue)
      setSelectedDate(parsedDate)
      setCurrentMonth(parsedDate.getMonth())
      setCurrentYear(parsedDate.getFullYear())
      setCurrentDay(parsedDate.getDate())
    } else {
      const today = new Date()
      setCurrentMonth(today.getMonth())
      setCurrentYear(today.getFullYear())
      setCurrentDay(today.getDate())
    }
  }, [defaultValue])

  const formatDate = (date: Date) => {
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    })
  }

  const toISOString = (date: Date) => {
    return date.toISOString().split('T')[0]
  }

  const handleDateChange = () => {
    const newDate = new Date(currentYear, currentMonth, currentDay)
    setSelectedDate(newDate)
    const isoString = toISOString(newDate)
    setDate(isoString)
  }

  useEffect(() => {
    handleDateChange()
  }, [currentMonth, currentYear, currentDay])

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
        if (monthRef.current) scrollToItem(monthRef, currentMonth)
        if (dayRef.current) scrollToItem(dayRef, currentDay - 1)
        if (yearRef.current) scrollToItem(yearRef, currentYear - 2020)
        // Re-enable scroll handling after initialization
        setTimeout(() => {
          isInitializing.current = false
        }, 200)
      }, 100) // Increased delay to ensure proper positioning
    }
  }, [showPicker, currentMonth, currentDay, currentYear])

  const handleDone = () => {
    setActivePicker(null)
  }

  const goToToday = () => {
    const today = new Date()
    setSelectedDate(today)
    setCurrentMonth(today.getMonth())
    setCurrentYear(today.getFullYear())
    setCurrentDay(today.getDate())
    const isoString = toISOString(today)
    setDate(isoString)
  }

  const scrollToItem = (ref: React.RefObject<HTMLDivElement | null>, index: number) => {
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

  const handleScroll = (type: 'month' | 'day' | 'year', scrollTop: number) => {
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
      if (type === 'month') {
        const monthNames = datePickerUtils.getMonthNames()
        const clampedIndex = Math.max(0, Math.min(centerIndex, monthNames.length - 1))
        setCurrentMonth(clampedIndex)
      } else if (type === 'day') {
        const daysInMonth = datePickerUtils.getDaysInMonth(currentYear, currentMonth)
        const clampedIndex = Math.max(1, Math.min(centerIndex + 1, daysInMonth))
        setCurrentDay(clampedIndex)
      } else if (type === 'year') {
        const currentYearIndex = Math.max(2020, Math.min(centerIndex + 2020, 2039))
        setCurrentYear(currentYearIndex)
      }
      
      setIsScrolling(false)
    }, 150) // 150ms debounce
  }

  const renderScrollableColumn = (
    type: 'month' | 'day' | 'year',
    items: (string | number)[],
    currentValue: number,
    ref: React.RefObject<HTMLDivElement | null>
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
                (type === 'month' && actualIndex === currentValue) ||
                (type === 'day' && actualIndex === currentValue - 1) ||
                (type === 'year' && actualIndex === currentValue - 2020)
              
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
                    if (type === 'month') {
                      setCurrentMonth(actualIndex)
                    } else if (type === 'day') {
                      setCurrentDay(actualIndex + 1)
                    } else if (type === 'year') {
                      setCurrentYear(actualIndex + 2020)
                    }
                    if (ref.current) scrollToItem(ref, actualIndex)
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

  return (
    <div className={className}>
      <label className="block text-sm font-medium text-gray-700 mb-1">
        {label} {required && '*'}
      </label>
      
      <div className="relative">
        <input
          type="hidden"
          name={name}
          value={date}
        />
        
        <button
          type="button"
          onClick={() => setActivePicker(showPicker ? null : pickerId)}
          className={datePickerClasses.triggerButton}
        >
          <span>{selectedDate ? formatDate(selectedDate) : 'Select date'}</span>
          {formIcons.calendar}
        </button>

        {showPicker && (
          <div className={datePickerClasses.dropdown}>
            <div className={datePickerClasses.content}>
              {/* Date Display */}
              <div className={datePickerClasses.dateDisplay}>
                <div className={datePickerClasses.dateText}>
                  {selectedDate ? formatDate(selectedDate) : 'Select a date'}
                </div>
              </div>

              {/* Scrollable Date Selector */}
              <div className="flex gap-2 mb-4">
                {renderScrollableColumn(
                  'month',
                  datePickerUtils.getMonthNames(),
                  currentMonth,
                  monthRef
                )}
                {renderScrollableColumn(
                  'day',
                  Array.from({ length: datePickerUtils.getDaysInMonth(currentYear, currentMonth) }, (_, i) => i + 1),
                  currentDay - 1,
                  dayRef
                )}
                {renderScrollableColumn(
                  'year',
                  Array.from({ length: 20 }, (_, i) => i + 2020),
                  currentYear - 2020,
                  yearRef
                )}
              </div>

              {/* Today Button */}
              <div className="mb-4">
                <button
                  type="button"
                  onClick={goToToday}
                  className="w-full px-3 py-2 text-sm bg-gray-100 text-gray-700 rounded hover:bg-gray-200 transition-colors"
                >
                  Today
                </button>
              </div>

              {/* Done Button */}
              <button
                type="button"
                onClick={handleDone}
                className={datePickerClasses.doneButton}
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
