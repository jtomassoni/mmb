'use client'

import React, { useState, useEffect, useRef } from 'react'
import { DayPicker } from 'react-day-picker'
import 'react-day-picker/dist/style.css'

interface BetterDatePickerProps {
  value?: string
  onChange?: (value: string) => void
  name?: string
  label?: string
  required?: boolean
  className?: string
}

export function BetterDatePicker({
  value = '',
  onChange,
  name,
  label,
  required = false,
  className = ''
}: BetterDatePickerProps) {
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(() => {
    if (value) {
      // Parse the date string and create a local date
      const [year, month, day] = value.split('-').map(Number)
      return new Date(year, month - 1, day)
    }
    return undefined
  })

  const [isOpen, setIsOpen] = useState(false)
  const pickerRef = useRef<HTMLDivElement>(null)

  // Handle click outside to close picker
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (pickerRef.current && !pickerRef.current.contains(event.target as Node)) {
        setIsOpen(false)
      }
    }

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside)
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [isOpen])

  useEffect(() => {
    if (value) {
      // Parse the date string and create a local date to avoid timezone issues
      const [year, month, day] = value.split('-').map(Number)
      const parsedDate = new Date(year, month - 1, day)
      console.log('Parsing value:', value, 'into date:', parsedDate)
      console.log('Parsed date parts:', {
        year: parsedDate.getFullYear(),
        month: parsedDate.getMonth() + 1,
        day: parsedDate.getDate()
      })
      setSelectedDate(parsedDate)
    } else {
      setSelectedDate(undefined)
    }
  }, [value])

  const handleDateChange = (date: Date | undefined) => {
    console.log('DayPicker changed date to:', date)
    if (date) {
      console.log('Date parts:', {
        year: date.getFullYear(),
        month: date.getMonth() + 1,
        day: date.getDate()
      })
    }
    setSelectedDate(date)
    if (onChange && date) {
      // Use local date to avoid timezone issues
      const year = date.getFullYear()
      const month = String(date.getMonth() + 1).padStart(2, '0')
      const day = String(date.getDate()).padStart(2, '0')
      const localDateString = `${year}-${month}-${day}`
      console.log('Emitting date string:', localDateString)
      onChange(localDateString)
    }
  }

  const formatDate = (date: Date | undefined) => {
    if (!date) return 'Select date'
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    })
  }

  return (
    <div className={className} ref={pickerRef}>
      <label className="block text-sm font-medium text-gray-700 mb-1">
        {label} {required && '*'}
      </label>
      
      <div className="relative">
        <input
          type="hidden"
          name={name}
          value={value}
        />
        
        <button
          type="button"
          onClick={() => setIsOpen(!isOpen)}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 text-gray-900 bg-white text-left flex items-center justify-between hover:border-gray-400 transition-colors"
        >
          <span>{formatDate(selectedDate)}</span>
          <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
          </svg>
        </button>

        {isOpen && (
          <div className="absolute z-10 mt-1 w-full bg-white border border-gray-300 rounded-lg shadow-lg">
            <div className="p-4">
              <div className="text-center mb-4">
                <h3 className="text-lg font-semibold text-gray-900">
                  {formatDate(selectedDate)}
                </h3>
              </div>
              
              <DayPicker
                mode="single"
                selected={selectedDate}
                onSelect={handleDateChange}
                disabled={{ before: new Date(2020, 0, 1), after: new Date(2040, 11, 31) }}
                className="rdp"
              />
              
              <div className="flex gap-2 mt-4">
                <button
                  type="button"
                  onClick={() => {
                    const today = new Date()
                    handleDateChange(today)
                  }}
                  className="flex-1 px-3 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors"
                >
                  Today
                </button>
                <button
                  type="button"
                  onClick={() => setIsOpen(false)}
                  className="flex-1 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                >
                  Done
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
