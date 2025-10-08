/**
 * Timezone utilities for displaying times in company timezone
 */

export function formatTimeInTimezone(
  date: Date | string,
  timezone: string = 'America/Denver',
  options: Intl.DateTimeFormatOptions = {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    hour12: true
  }
): string {
  let dateObj: Date
  
  if (typeof date === 'string') {
    // Handle time-only strings (HH:MM format)
    if (date.match(/^\d{2}:\d{2}$/)) {
      const today = new Date()
      const [hours, minutes] = date.split(':').map(Number)
      dateObj = new Date(today.getFullYear(), today.getMonth(), today.getDate(), hours, minutes)
    } else {
      dateObj = new Date(date)
    }
  } else {
    dateObj = date
  }
  
  // Check if date is valid
  if (isNaN(dateObj.getTime())) {
    console.error('Invalid date:', date)
    return 'Invalid time'
  }
  
  try {
    return new Intl.DateTimeFormat('en-US', {
      ...options,
      timeZone: timezone
    }).format(dateObj)
  } catch (error) {
    console.error('Invalid timezone:', timezone, error)
    // Fallback to local time
    return new Intl.DateTimeFormat('en-US', options).format(dateObj)
  }
}

export function getRelativeTime(
  date: Date | string,
  timezone: string = 'America/Denver'
): string {
  const dateObj = typeof date === 'string' ? new Date(date) : date
  const now = new Date()
  
  // Convert both dates to the company timezone for accurate comparison
  const companyNow = new Date(now.toLocaleString('en-US', { timeZone: timezone }))
  const companyDate = new Date(dateObj.toLocaleString('en-US', { timeZone: timezone }))
  
  const diffInSeconds = Math.floor((companyNow.getTime() - companyDate.getTime()) / 1000)
  
  if (diffInSeconds < 60) {
    return 'Just now'
  } else if (diffInSeconds < 3600) {
    const minutes = Math.floor(diffInSeconds / 60)
    return `${minutes} minute${minutes === 1 ? '' : 's'} ago`
  } else if (diffInSeconds < 86400) {
    const hours = Math.floor(diffInSeconds / 3600)
    return `${hours} hour${hours === 1 ? '' : 's'} ago`
  } else if (diffInSeconds < 604800) {
    const days = Math.floor(diffInSeconds / 86400)
    return `${days} day${days === 1 ? '' : 's'} ago`
  } else if (diffInSeconds < 2592000) {
    const weeks = Math.floor(diffInSeconds / 604800)
    return `${weeks} week${weeks === 1 ? '' : 's'} ago`
  } else {
    return formatTimeInTimezone(dateObj, timezone, {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    })
  }
}

export function getCompanyTimezone(): string {
  // This would typically come from site settings
  // For now, defaulting to Denver timezone
  return 'America/Denver'
}

export function getAvailableTimezones(): Array<{ value: string; label: string }> {
  return [
    { value: 'America/New_York', label: 'Eastern Time (ET)' },
    { value: 'America/Chicago', label: 'Central Time (CT)' },
    { value: 'America/Denver', label: 'Mountain Time (MT)' },
    { value: 'America/Los_Angeles', label: 'Pacific Time (PT)' },
    { value: 'America/Anchorage', label: 'Alaska Time (AKT)' },
    { value: 'Pacific/Honolulu', label: 'Hawaii Time (HST)' },
    { value: 'UTC', label: 'UTC' }
  ]
}
