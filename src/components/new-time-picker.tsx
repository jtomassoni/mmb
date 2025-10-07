'use client'

import React, { useState, useEffect, useRef } from 'react'

interface NewTimePickerProps {
  value?: string
  onChange?: (value: string) => void
  name?: string
  label?: string
  required?: boolean
  className?: string
}

export function NewTimePicker({
  value = '',
  onChange,
  name,
  label,
  required = false,
  className = ''
}: NewTimePickerProps) {
  const [hours, setHours] = useState(12)
  const [minutes, setMinutes] = useState(0)
  const [period, setPeriod] = useState<'AM' | 'PM'>('PM')
  const [isInitialized, setIsInitialized] = useState(false)
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

  // Parse initial value
  useEffect(() => {
    if (value && value.trim()) {
      try {
        const [time] = value.split('T')
        const [h, m] = time.split(':')
        const hour24 = parseInt(h, 10)
        const minute = parseInt(m, 10)
        
        // Validate parsed values
        if (isNaN(hour24) || isNaN(minute)) {
          console.warn('Invalid time format:', value)
          return
        }
        
        if (hour24 === 0) {
          setHours(12)
          setPeriod('AM')
        } else if (hour24 < 12) {
          setHours(hour24)
          setPeriod('AM')
        } else if (hour24 === 12) {
          setHours(12)
          setPeriod('PM')
        } else {
          setHours(hour24 - 12)
          setPeriod('PM')
        }
        
        setMinutes(minute)
        setIsInitialized(true)
      } catch (error) {
        console.warn('Error parsing time value:', value, error)
        setIsInitialized(true)
      }
    } else {
      setIsInitialized(true)
    }
  }, [value])

  const formatTime = (h: number, m: number, p: 'AM' | 'PM') => {
    return `${h}:${m.toString().padStart(2, '0')} ${p}`
  }

  const to24Hour = (h: number, m: number, p: 'AM' | 'PM') => {
    let hour24 = h
    if (p === 'AM' && h === 12) hour24 = 0
    if (p === 'PM' && h !== 12) hour24 = h + 12
    return `${hour24.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}`
  }

  const handleTimeChange = () => {
    if (onChange) {
      const time24 = to24Hour(hours, minutes, period)
      onChange(time24)
    }
  }

  // Only call handleTimeChange when user manually changes time, not when parsing initial value
  const handleManualTimeChange = (newHours: number, newMinutes: number, newPeriod: 'AM' | 'PM') => {
    setHours(newHours)
    setMinutes(newMinutes)
    setPeriod(newPeriod)
    
    if (onChange) {
      const time24 = to24Hour(newHours, newMinutes, newPeriod)
      onChange(time24)
    }
  }

  const hourOptions = Array.from({ length: 12 }, (_, i) => ({
    value: i + 1,
    label: (i + 1).toString()
  }))

  const minuteOptions = Array.from({ length: 12 }, (_, i) => ({
    value: i * 5,
    label: (i * 5).toString().padStart(2, '0')
  }))

  const periodOptions = [
    { value: 'AM', label: 'AM' },
    { value: 'PM', label: 'PM' }
  ]

  // Validate that we have valid options arrays and component is initialized
  if (!isInitialized) {
    return (
      <div className={className}>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          {label} {required && '*'}
        </label>
        <div className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-gray-50 text-gray-500">
          Loading...
        </div>
      </div>
    )
  }

  if (!hourOptions || hourOptions.length === 0) {
    console.error('hourOptions is empty or undefined')
    return null
  }
  
  if (!minuteOptions || minuteOptions.length === 0) {
    console.error('minuteOptions is empty or undefined')
    return null
  }
  
  if (!periodOptions || periodOptions.length === 0) {
    console.error('periodOptions is empty or undefined')
    return null
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
          <span>{value ? formatTime(hours, minutes, period) : 'Select time'}</span>
          <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        </button>

        {isOpen && (
          <div className="absolute z-10 mt-1 w-full bg-white border border-gray-300 rounded-lg shadow-lg">
            <div className="p-4">
              <div className="text-center mb-4">
                <h3 className="text-lg font-semibold text-gray-900">
                  {formatTime(hours, minutes, period)}
                </h3>
              </div>
              
              <div className="flex gap-2 mb-4">
                <div className="flex-1">
                  <label className="block text-xs font-medium text-gray-500 mb-1">Hour</label>
                  <div className="h-[120px] border border-gray-300 rounded-lg overflow-hidden">
                    <select
                      value={hours}
                      onChange={(e) => handleManualTimeChange(parseInt(e.target.value), minutes, period)}
                      className="w-full h-full text-center text-lg font-medium bg-white border-none outline-none text-gray-900"
                    >
                      {hourOptions.map((option) => (
                        <option key={option.value} value={option.value}>
                          {option.label}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
                
                <div className="flex-1">
                  <label className="block text-xs font-medium text-gray-500 mb-1">Minute</label>
                  <div className="h-[120px] border border-gray-300 rounded-lg overflow-hidden">
                    <select
                      value={minutes}
                      onChange={(e) => handleManualTimeChange(hours, parseInt(e.target.value), period)}
                      className="w-full h-full text-center text-lg font-medium bg-white border-none outline-none text-gray-900"
                    >
                      {minuteOptions.map((option) => (
                        <option key={option.value} value={option.value}>
                          {option.label}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
                
                <div className="flex-1">
                  <label className="block text-xs font-medium text-gray-500 mb-1">Period</label>
                  <div className="h-[120px] border border-gray-300 rounded-lg overflow-hidden">
                    <select
                      value={period}
                      onChange={(e) => handleManualTimeChange(hours, minutes, e.target.value as 'AM' | 'PM')}
                      className="w-full h-full text-center text-lg font-medium bg-white border-none outline-none text-gray-900"
                    >
                      {periodOptions.map((option) => (
                        <option key={option.value} value={option.value}>
                          {option.label}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
              </div>
              
              <button
                type="button"
                onClick={() => setIsOpen(false)}
                className="w-full px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
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
