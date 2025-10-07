'use client'

import { useState, useRef, useEffect } from 'react'

interface ProperTimePickerProps {
  value: string
  onChange: (value: string) => void
  error?: boolean
  disabled?: boolean
  className?: string
}

export function ProperTimePicker({ 
  value, 
  onChange, 
  error = false, 
  disabled = false,
  className = '' 
}: ProperTimePickerProps) {
  const [selectedHour, setSelectedHour] = useState('')
  const [selectedMinute, setSelectedMinute] = useState('')

  // Parse the time value
  useEffect(() => {
    if (value) {
      const [hour, minute] = value.split(':')
      setSelectedHour(hour || '')
      setSelectedMinute(minute || '')
    } else {
      setSelectedHour('')
      setSelectedMinute('')
    }
  }, [value])

  const handleTimeChange = (hour: string, minute: string) => {
    const time24 = `${hour.padStart(2, '0')}:${minute.padStart(2, '0')}`
    onChange(time24)
  }

  const handleHourChange = (hour: string) => {
    setSelectedHour(hour)
    handleTimeChange(hour, selectedMinute)
  }

  const handleMinuteChange = (minute: string) => {
    setSelectedMinute(minute)
    handleTimeChange(selectedHour, minute)
  }


  const displayValue = value ? (() => {
    const [hour, minute] = value.split(':')
    const hourNum = parseInt(hour)
    const period = hourNum >= 12 ? 'PM' : 'AM'
    const displayHour = hourNum === 0 ? 12 : hourNum > 12 ? hourNum - 12 : hourNum
    return `${displayHour}:${minute} ${period}`
  })() : ''

  const format24Hour = (hour: string, minute: string) => {
    return `${hour.padStart(2, '0')}:${minute.padStart(2, '0')}`
  }

  return (
    <div className={`relative ${className}`}>
      {/* Direct Time Selection - Compact Layout */}
      <div className="flex items-center space-x-1">
        {/* Hour Selector */}
        <select
          value={selectedHour}
          onChange={(e) => handleHourChange(e.target.value)}
          disabled={disabled}
          className={`
            w-12 h-7 text-xs border rounded px-1 bg-white focus:ring-1 focus:ring-blue-500 focus:border-blue-500
            ${disabled ? 'bg-gray-100 text-gray-400 cursor-not-allowed' : 'border-gray-300 text-gray-900'}
            ${error ? 'border-red-300 focus:ring-red-500 focus:border-red-500' : ''}
          `}
        >
          <option value="">--</option>
          {Array.from({ length: 24 }, (_, i) => {
            const hour = i.toString().padStart(2, '0')
            return (
              <option key={hour} value={hour}>
                {hour}
              </option>
            )
          })}
        </select>

        <span className="text-gray-400 text-xs font-bold">:</span>

        {/* Minute Selector */}
        <select
          value={selectedMinute}
          onChange={(e) => handleMinuteChange(e.target.value)}
          disabled={disabled}
          className={`
            w-12 h-7 text-xs border rounded px-1 bg-white focus:ring-1 focus:ring-blue-500 focus:border-blue-500
            ${disabled ? 'bg-gray-100 text-gray-400 cursor-not-allowed' : 'border-gray-300 text-gray-900'}
            ${error ? 'border-red-300 focus:ring-red-500 focus:border-red-500' : ''}
          `}
        >
          <option value="">--</option>
          {[0, 15, 30, 45].map((minute) => {
            const minuteStr = minute.toString().padStart(2, '0')
            return (
              <option key={minute} value={minuteStr}>
                {minuteStr}
              </option>
            )
          })}
        </select>

        {/* AM/PM Display - Compact */}
        {displayValue && (
          <span className="text-xs text-gray-600 font-mono whitespace-nowrap">
            {displayValue.split(' ')[1]}
          </span>
        )}
      </div>
    </div>
  )
}
