/**
 * Shared Form Input Theme
 * 
 * This file contains consistent styling and behavior for all form inputs
 * used throughout the Monaghan's application.
 */

// Base input classes for consistent styling
export const baseInputClasses = "w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 text-gray-900 placeholder-gray-500"
export const baseLabelClasses = "block text-sm font-medium text-gray-700 mb-1"

// Time picker specific classes
export const timePickerClasses = {
  // Main trigger button
  triggerButton: "w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 text-gray-900 bg-white text-left flex items-center justify-between hover:border-gray-400 transition-colors",
  
  // Dropdown container
  dropdown: "absolute z-10 mt-1 w-full bg-white border border-gray-300 rounded-lg shadow-lg",
  
  // Dropdown content
  content: "p-4",
  
  // Time display
  timeDisplay: "text-center mb-4",
  timeText: "text-2xl font-bold text-gray-900 mb-2",
  
  // Selector container
  selectorContainer: "flex items-center justify-center gap-4 mb-4",
  
  // Individual selector
  selector: "flex flex-col items-center",
  selectorLabel: "text-xs font-medium text-gray-600 mb-2",
  
  // Select dropdown
  select: "appearance-none bg-white border border-gray-300 rounded-lg px-3 py-2 pr-8 text-center font-semibold text-gray-900 focus:ring-2 focus:ring-green-500 focus:border-green-500",
  
  // Select option
  selectOption: "text-gray-900",
  
  // Select dropdown icon
  selectIcon: "absolute inset-y-0 right-0 flex items-center pr-2 pointer-events-none",
  selectIconSvg: "w-4 h-4 text-gray-400",
  
  // Colon separator
  colon: "text-2xl font-bold text-gray-400",
  
  // Done button
  doneButton: "w-full px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors",
  
  // Clock icon for trigger
  clockIcon: "w-5 h-5 text-gray-400"
}

// Date picker specific classes
export const datePickerClasses = {
  // Main trigger button
  triggerButton: "w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 text-gray-900 bg-white text-left flex items-center justify-between hover:border-gray-400 transition-colors",
  
  // Dropdown container
  dropdown: "absolute z-10 mt-1 w-full bg-white border border-gray-300 rounded-lg shadow-lg",
  
  // Dropdown content
  content: "p-4",
  
  // Date display
  dateDisplay: "text-center mb-4",
  dateText: "text-2xl font-bold text-gray-900 mb-2",
  
  // Calendar container
  calendarContainer: "mb-4",
  
  // Calendar header
  calendarHeader: "flex items-center justify-between mb-4",
  monthYearDisplay: "text-lg font-semibold text-gray-900",
  navButton: "p-2 hover:bg-gray-100 rounded-lg transition-colors",
  navButtonIcon: "w-5 h-5 text-gray-600",
  
  // Calendar grid
  calendarGrid: "grid grid-cols-7 gap-1",
  dayHeader: "text-xs font-medium text-gray-500 text-center py-2",
  dayCell: "text-center py-2 cursor-pointer rounded-lg transition-colors",
  dayCellToday: "bg-green-100 text-green-800 font-semibold",
  dayCellSelected: "bg-green-600 text-white font-semibold",
  dayCellOtherMonth: "text-gray-400",
  dayCellHover: "hover:bg-gray-100",
  
  // Done button
  doneButton: "w-full px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors",
  
  // Calendar icon for trigger
  calendarIcon: "w-5 h-5 text-gray-400"
}

// Time picker utilities
export const timePickerUtils = {
  // Format time for display (12-hour format)
  formatTime: (hours: number, minutes: number, period: string) => {
    return `${hours}:${minutes.toString().padStart(2, '0')} ${period}`
  },

  // Convert to 24-hour format for form submission
  to24Hour: (hours: number, minutes: number, period: string) => {
    let hour24 = hours
    if (period === 'AM' && hours === 12) hour24 = 0
    if (period === 'PM' && hours !== 12) hour24 = hours + 12
    return `${hour24.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}`
  },

  // Parse 24-hour time to 12-hour components
  parseTime: (timeStr: string) => {
    if (!timeStr) return { hours: 12, minutes: 0, period: 'PM' }
    
    const [hours, minutes] = timeStr.split(':')
    const hour24 = parseInt(hours)
    const hour12 = hour24 === 0 ? 12 : hour24 > 12 ? hour24 - 12 : hour24
    const period = hour24 >= 12 ? 'PM' : 'AM'
    
    return { hours: hour12, minutes: parseInt(minutes), period }
  },

  // Generate hour options (1-12)
  getHourOptions: () => {
    return Array.from({ length: 12 }, (_, i) => i + 1)
  },

  // Generate minute options (0, 5, 10, 15, etc.)
  getMinuteOptions: () => {
    return Array.from({ length: 12 }, (_, i) => i * 5)
  },

  // Generate period options
  getPeriodOptions: () => {
    return ['AM', 'PM']
  }
}

// Date picker utilities
export const datePickerUtils = {
  // Format date for display
  formatDate: (date: Date) => {
    return date.toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    })
  },

  // Format date for form submission (YYYY-MM-DD)
  toISOString: (date: Date) => {
    return date.toISOString().split('T')[0]
  },

  // Parse date string to Date object
  parseDate: (dateStr: string) => {
    return new Date(dateStr)
  },

  // Get month names
  getMonthNames: () => {
    return [
      'January', 'February', 'March', 'April', 'May', 'June',
      'July', 'August', 'September', 'October', 'November', 'December'
    ]
  },

  // Get day names
  getDayNames: () => {
    return ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']
  },

  // Get days in month
  getDaysInMonth: (year: number, month: number) => {
    return new Date(year, month + 1, 0).getDate()
  },

  // Get first day of month
  getFirstDayOfMonth: (year: number, month: number) => {
    return new Date(year, month, 1).getDay()
  },

  // Check if date is today
  isToday: (date: Date) => {
    const today = new Date()
    return date.toDateString() === today.toDateString()
  },

  // Check if date is selected
  isSelected: (date: Date, selectedDate: Date | null) => {
    if (!selectedDate) return false
    return date.toDateString() === selectedDate.toDateString()
  }
}

// Note: SVG icons are exported from src/components/form-icons.tsx

// Default configurations
export const formConfig = {
  timePicker: {
    defaultHours: 12,
    defaultMinutes: 0,
    defaultPeriod: 'PM',
    placeholder: 'Select time',
    minuteInterval: 5, // 5-minute intervals
    hourRange: { min: 1, max: 12 },
    periodOptions: ['AM', 'PM']
  },
  
  datePicker: {
    placeholder: 'Select date',
    dateFormat: 'MM/DD/YYYY',
    firstDayOfWeek: 0, // Sunday
    showTodayButton: true,
    showClearButton: true
  }
}

// Export everything for easy importing
export default {
  baseInputClasses,
  baseLabelClasses,
  timePicker: {
    classes: timePickerClasses,
    utils: timePickerUtils
  },
  datePicker: {
    classes: datePickerClasses,
    utils: datePickerUtils
  },
  config: formConfig
}
