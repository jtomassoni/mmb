// Special Dates System for Monaghan's Bar & Grill
// Handles custom hours, closures, early openings, etc.

export interface SpecialDate {
  id: string
  date: string // YYYY-MM-DD format
  type: 'closure' | 'early_closure' | 'late_opening' | 'early_opening' | 'custom_hours'
  title: string
  description?: string
  customHours?: {
    open: string // HH:MM format
    close: string // HH:MM format
  }
  closureReason?: string
  isRecurring?: boolean // For annual events like holidays
  recurringPattern?: 'yearly' | 'monthly' | 'weekly'
  createdAt: Date
  updatedAt: Date
}

export interface SpecialDateRule {
  id: string
  name: string
  description: string
  datePattern: string // Can be specific date, day of week, or holiday
  type: SpecialDate['type']
  customHours?: SpecialDate['customHours']
  closureReason?: string
  isActive: boolean
  priority: number // Higher number = higher priority
}

// Predefined special date rules
export const DEFAULT_SPECIAL_DATE_RULES: SpecialDateRule[] = [
  {
    id: 'christmas_day',
    name: 'Christmas Day',
    description: 'Closed for Christmas Day',
    datePattern: '12-25',
    type: 'closure',
    closureReason: 'Christmas Day',
    isActive: true,
    priority: 10
  },
  {
    id: 'new_years_day',
    name: 'New Year\'s Day',
    description: 'Closed for New Year\'s Day',
    datePattern: '01-01',
    type: 'closure',
    closureReason: 'New Year\'s Day',
    isActive: true,
    priority: 10
  },
  {
    id: 'thanksgiving',
    name: 'Thanksgiving Day',
    description: 'Closed for Thanksgiving',
    datePattern: '11-fourth-thursday',
    type: 'closure',
    closureReason: 'Thanksgiving Day',
    isActive: true,
    priority: 10
  },
  {
    id: 'super_bowl_sunday',
    name: 'Super Bowl Sunday',
    description: 'Early opening for Super Bowl',
    datePattern: '02-second-sunday',
    type: 'early_opening',
    customHours: {
      open: '08:00',
      close: '02:00'
    },
    isActive: true,
    priority: 5
  },
  {
    id: 'denver_broncos_playoffs',
    name: 'Broncos Playoff Games',
    description: 'Extended hours for Broncos playoff games',
    datePattern: 'broncos-playoff',
    type: 'custom_hours',
    customHours: {
      open: '09:00',
      close: '02:00'
    },
    isActive: true,
    priority: 7
  }
]

// Helper functions for special dates
export class SpecialDatesService {
  static isSpecialDate(date: Date): SpecialDate | null {
    const dateStr = date.toISOString().split('T')[0]
    
    // Check for specific special dates
    // This would typically query a database
    // For now, we'll use a simple check
    
    return null
  }

  static getSpecialDateRules(): SpecialDateRule[] {
    return DEFAULT_SPECIAL_DATE_RULES.filter(rule => rule.isActive)
  }

  static calculateHoursForDate(date: Date): { open: string; close: string; isSpecial: boolean } {
    const specialDate = this.isSpecialDate(date)
    
    if (specialDate) {
      if (specialDate.type === 'closure') {
        return { open: '00:00', close: '00:00', isSpecial: true }
      }
      
      if (specialDate.customHours) {
        return {
          open: specialDate.customHours.open,
          close: specialDate.customHours.close,
          isSpecial: true
        }
      }
    }

    // Default hours based on day of week
    const dayOfWeek = date.getDay()
    const defaultHours = {
      0: { open: '08:00', close: '02:00' }, // Sunday
      1: { open: '10:00', close: '02:00' }, // Monday
      2: { open: '10:00', close: '02:00' }, // Tuesday
      3: { open: '10:00', close: '02:00' }, // Wednesday
      4: { open: '10:00', close: '02:00' }, // Thursday
      5: { open: '10:00', close: '02:00' }, // Friday
      6: { open: '08:00', close: '02:00' }, // Saturday
    }

    const hours = defaultHours[dayOfWeek as keyof typeof defaultHours]
    return {
      open: hours.open,
      close: hours.close,
      isSpecial: false
    }
  }

  static formatTime(timeStr: string): string {
    const [hours, minutes] = timeStr.split(':')
    const hour = parseInt(hours)
    const ampm = hour >= 12 ? 'PM' : 'AM'
    const displayHour = hour % 12 || 12
    return `${displayHour}:${minutes} ${ampm}`
  }

  static isCurrentlyOpen(date: Date = new Date()): boolean {
    const hours = this.calculateHoursForDate(date)
    
    if (hours.open === '00:00' && hours.close === '00:00') {
      return false // Closed all day
    }

    const now = new Date()
    const currentTime = now.getHours() * 60 + now.getMinutes()
    
    const [openHour, openMinute] = hours.open.split(':').map(Number)
    const [closeHour, closeMinute] = hours.close.split(':').map(Number)
    
    const openTime = openHour * 60 + openMinute
    let closeTime = closeHour * 60 + closeMinute
    
    // Handle closing after midnight
    if (closeTime < openTime) {
      closeTime += 24 * 60
    }

    return currentTime >= openTime && currentTime < closeTime
  }
}

// API endpoints for managing special dates
export const SPECIAL_DATES_API = {
  // Get all special dates for a date range
  getSpecialDates: async (startDate: string, endDate: string): Promise<SpecialDate[]> => {
    // Implementation would fetch from database
    return []
  },

  // Create a new special date
  createSpecialDate: async (specialDate: Omit<SpecialDate, 'id' | 'createdAt' | 'updatedAt'>): Promise<SpecialDate> => {
    // Implementation would save to database
    throw new Error('Not implemented')
  },

  // Update an existing special date
  updateSpecialDate: async (id: string, updates: Partial<SpecialDate>): Promise<SpecialDate> => {
    // Implementation would update database
    throw new Error('Not implemented')
  },

  // Delete a special date
  deleteSpecialDate: async (id: string): Promise<void> => {
    // Implementation would delete from database
    throw new Error('Not implemented')
  },

  // Get special date rules
  getSpecialDateRules: async (): Promise<SpecialDateRule[]> => {
    return DEFAULT_SPECIAL_DATE_RULES
  },

  // Create a new special date rule
  createSpecialDateRule: async (rule: Omit<SpecialDateRule, 'id'>): Promise<SpecialDateRule> => {
    // Implementation would save to database
    throw new Error('Not implemented')
  }
}
