/**
 * Input validation and sanitization utilities
 * Prevents SQL injection, XSS, and controls emoji usage
 */

// Emoji regex pattern
const EMOJI_REGEX = /[\u{1F600}-\u{1F64F}]|[\u{1F300}-\u{1F5FF}]|[\u{1F680}-\u{1F6FF}]|[\u{1F1E0}-\u{1F1FF}]|[\u{2600}-\u{26FF}]|[\u{2700}-\u{27BF}]/gu

// SQL injection patterns
const SQL_INJECTION_PATTERNS = [
  /(\b(SELECT|INSERT|UPDATE|DELETE|DROP|CREATE|ALTER|EXEC|UNION|SCRIPT)\b)/gi,
  /(\b(OR|AND)\s+\d+\s*=\s*\d+)/gi,
  /(\b(OR|AND)\s+['"]\s*=\s*['"])/gi,
  /(UNION\s+SELECT)/gi,
  /(DROP\s+TABLE)/gi,
  /(DELETE\s+FROM)/gi,
  /(INSERT\s+INTO)/gi,
  /(UPDATE\s+SET)/gi,
  /(--|\/\*|\*\/)/g,
  /(;|\||&)/g
]

// XSS patterns
const XSS_PATTERNS = [
  /<script[^>]*>.*?<\/script>/gi,
  /<iframe[^>]*>.*?<\/iframe>/gi,
  /<object[^>]*>.*?<\/object>/gi,
  /<embed[^>]*>.*?<\/embed>/gi,
  /<link[^>]*>.*?<\/link>/gi,
  /<meta[^>]*>.*?<\/meta>/gi,
  /javascript:/gi,
  /on\w+\s*=/gi,
  /<[^>]*>/g
]

export interface ValidationResult {
  isValid: boolean
  sanitizedValue: string
  errors: string[]
}

export interface ValidationOptions {
  allowEmojis?: boolean
  maxLength?: number
  minLength?: number
  required?: boolean
  pattern?: RegExp
  customValidator?: (value: string) => string | null
}

/**
 * Sanitize text input by removing dangerous patterns
 */
export function sanitizeText(input: string, allowEmojis: boolean = false): string {
  if (!input || typeof input !== 'string') return ''
  
  let sanitized = input.trim()
  
  // Remove SQL injection patterns
  SQL_INJECTION_PATTERNS.forEach(pattern => {
    sanitized = sanitized.replace(pattern, '')
  })
  
  // Remove XSS patterns
  XSS_PATTERNS.forEach(pattern => {
    sanitized = sanitized.replace(pattern, '')
  })
  
  // Remove emojis if not allowed
  if (!allowEmojis) {
    sanitized = sanitized.replace(EMOJI_REGEX, '')
  }
  
  // Remove excessive whitespace
  sanitized = sanitized.replace(/\s+/g, ' ')
  
  return sanitized
}

/**
 * Validate and sanitize text input
 */
export function validateText(
  value: string, 
  options: ValidationOptions = {}
): ValidationResult {
  const {
    allowEmojis = false,
    maxLength = 1000,
    minLength = 0,
    required = false,
    pattern,
    customValidator
  } = options
  
  const errors: string[] = []
  let sanitizedValue = sanitizeText(value, allowEmojis)
  
  // Check required
  if (required && (!sanitizedValue || sanitizedValue.length === 0)) {
    errors.push('This field is required')
  }
  
  // Check minimum length
  if (sanitizedValue.length > 0 && sanitizedValue.length < minLength) {
    errors.push(`Minimum length is ${minLength} characters`)
  }
  
  // Check maximum length
  if (sanitizedValue.length > maxLength) {
    errors.push(`Maximum length is ${maxLength} characters`)
    sanitizedValue = sanitizedValue.substring(0, maxLength)
  }
  
  // Check pattern
  if (pattern && sanitizedValue.length > 0 && !pattern.test(sanitizedValue)) {
    errors.push('Invalid format')
  }
  
  // Custom validation
  if (customValidator && sanitizedValue.length > 0) {
    const customError = customValidator(sanitizedValue)
    if (customError) {
      errors.push(customError)
    }
  }
  
  return {
    isValid: errors.length === 0,
    sanitizedValue,
    errors
  }
}

/**
 * Validate email address
 */
export function validateEmail(email: string): ValidationResult {
  const emailPattern = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/
  
  return validateText(email, {
    required: true,
    maxLength: 255,
    pattern: emailPattern,
    customValidator: (value) => {
      if (!emailPattern.test(value)) {
        return 'Invalid email format'
      }
      return null
    }
  })
}

/**
 * Validate phone number
 */
export function validatePhone(phone: string): ValidationResult {
  const phonePattern = /^[\+]?[1-9][\d]{0,15}$/
  const sanitized = phone.replace(/[\s\-\(\)\.]/g, '')
  
  return validateText(sanitized, {
    required: true,
    maxLength: 20,
    pattern: phonePattern,
    customValidator: (value) => {
      if (!phonePattern.test(value)) {
        return 'Invalid phone number format'
      }
      return null
    }
  })
}

/**
 * Validate business name
 */
export function validateBusinessName(name: string): ValidationResult {
  return validateText(name, {
    required: true,
    maxLength: 100,
    minLength: 2,
    allowEmojis: false,
    customValidator: (value) => {
      if (!/^[a-zA-Z0-9\s\-'&.]+$/.test(value)) {
        return 'Business name contains invalid characters'
      }
      return null
    }
  })
}

/**
 * Validate address
 */
export function validateAddress(address: string): ValidationResult {
  return validateText(address, {
    required: true,
    maxLength: 200,
    minLength: 10,
    allowEmojis: false,
    customValidator: (value) => {
      if (!/^[a-zA-Z0-9\s\-.,#]+$/.test(value)) {
        return 'Address contains invalid characters'
      }
      return null
    }
  })
}

/**
 * Validate description (allows emojis)
 */
export function validateDescription(description: string): ValidationResult {
  return validateText(description, {
    required: false,
    maxLength: 500,
    allowEmojis: true,
    customValidator: (value) => {
      if (value.length > 0 && !/^[a-zA-Z0-9\s\-.,!?&'"]+$/.test(value.replace(EMOJI_REGEX, ''))) {
        return 'Description contains invalid characters'
      }
      return null
    }
  })
}

/**
 * Validate password
 */
export function validatePassword(password: string): ValidationResult {
  return validateText(password, {
    required: true,
    minLength: 8,
    maxLength: 128,
    allowEmojis: false,
    customValidator: (value) => {
      if (!/(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/.test(value)) {
        return 'Password must contain at least one uppercase letter, one lowercase letter, and one number'
      }
      return null
    }
  })
}

/**
 * Validate time format (HH:MM)
 */
export function validateTime(time: string): ValidationResult {
  const timePattern = /^([01]?[0-9]|2[0-3]):[0-5][0-9]$/
  
  return validateText(time, {
    required: true,
    maxLength: 5,
    pattern: timePattern,
    customValidator: (value) => {
      if (!timePattern.test(value)) {
        return 'Time must be in HH:MM format (24-hour)'
      }
      return null
    }
  })
}

/**
 * Validate price (decimal number)
 */
export function validatePrice(price: string): ValidationResult {
  const pricePattern = /^\d+(\.\d{1,2})?$/
  
  return validateText(price, {
    required: true,
    maxLength: 10,
    pattern: pricePattern,
    customValidator: (value) => {
      if (!pricePattern.test(value)) {
        return 'Price must be a valid decimal number (e.g., 12.99)'
      }
      const numPrice = parseFloat(value)
      if (numPrice < 0 || numPrice > 9999.99) {
        return 'Price must be between $0.00 and $9999.99'
      }
      return null
    }
  })
}

/**
 * Validate URL
 */
export function validateUrl(url: string): ValidationResult {
  const urlPattern = /^https?:\/\/.+\..+/
  
  return validateText(url, {
    required: false,
    maxLength: 500,
    pattern: urlPattern,
    customValidator: (value) => {
      if (value.length > 0 && !urlPattern.test(value)) {
        return 'URL must start with http:// or https://'
      }
      return null
    }
  })
}

/**
 * Validate coordinates
 */
export function validateCoordinates(lat: string, lng: string): ValidationResult {
  const latNum = parseFloat(lat)
  const lngNum = parseFloat(lng)
  
  const errors: string[] = []
  
  if (isNaN(latNum) || latNum < -90 || latNum > 90) {
    errors.push('Latitude must be between -90 and 90')
  }
  
  if (isNaN(lngNum) || lngNum < -180 || lngNum > 180) {
    errors.push('Longitude must be between -180 and 180')
  }
  
  return {
    isValid: errors.length === 0,
    sanitizedValue: `${lat},${lng}`,
    errors
  }
}

/**
 * Validate form data object
 */
export function validateFormData<T extends Record<string, any>>(
  data: T,
  validators: Partial<Record<keyof T, (value: any) => ValidationResult>>
): { isValid: boolean; sanitizedData: T; errors: Record<string, string[]> } {
  const errors: Record<string, string[]> = {}
  const sanitizedData = { ...data }
  let isValid = true
  
  Object.entries(validators).forEach(([key, validator]) => {
    if (validator && data[key] !== undefined) {
      const result = validator(data[key])
      if (!result.isValid) {
        errors[key] = result.errors
        isValid = false
      }
      sanitizedData[key] = result.sanitizedValue
    }
  })
  
  return { isValid, sanitizedData, errors }
}
