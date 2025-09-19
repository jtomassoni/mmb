// src/lib/content-moderation.ts
import { BusinessType } from './ai-intake'

export interface ModerationResult {
  isApproved: boolean
  flags: ModerationFlag[]
  sanitizedContent?: string
  reason?: string
}

export interface ModerationFlag {
  type: 'profanity' | 'pii' | 'inappropriate' | 'spam' | 'quality'
  severity: 'low' | 'medium' | 'high'
  message: string
  field?: string
  suggestion?: string
}

// Profanity filter (basic implementation)
const PROFANITY_WORDS = [
  'damn', 'hell', 'crap', 'stupid', 'idiot', 'moron', 'jerk', 'loser',
  // Add more as needed - this is a basic list
]

// PII patterns
const PII_PATTERNS = {
  ssn: /\b\d{3}-?\d{2}-?\d{4}\b/g,
  creditCard: /\b\d{4}[-\s]?\d{4}[-\s]?\d{4}[-\s]?\d{4}\b/g,
  phone: /\(\d{3}\)\s\d{3}-\d{4}/g,
  email: /\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}\b/g,
  address: /\b\d+\s+[A-Za-z\s]+(?:Street|St|Avenue|Ave|Road|Rd|Boulevard|Blvd|Drive|Dr|Lane|Ln|Way|Court|Ct|Place|Pl)\b/g
}

// Quality checks
const QUALITY_CHECKS = {
  minLength: 3,
  maxLength: 500,
  minWords: 2,
  maxWords: 100
}

export function moderateContent(content: string, field: string, businessType: BusinessType): ModerationResult {
  const flags: ModerationFlag[] = []
  let sanitizedContent = content

  // Check for profanity
  const profanityFlags = checkProfanity(content, field)
  flags.push(...profanityFlags)

  // Check for PII
  const piiFlags = checkPII(content, field)
  flags.push(...piiFlags)

  // Check content quality
  const qualityFlags = checkQuality(content, field)
  flags.push(...qualityFlags)

  // Check business-specific appropriateness
  const appropriatenessFlags = checkAppropriateness(content, field, businessType)
  flags.push(...appropriatenessFlags)

  // Sanitize content if needed
  if (flags.some(flag => flag.type === 'profanity')) {
    sanitizedContent = sanitizeProfanity(content)
  }

  // Determine if content is approved
  const hasHighSeverityFlags = flags.some(flag => flag.severity === 'high')
  const hasMediumSeverityFlags = flags.some(flag => flag.severity === 'medium')
  
  const isApproved = !hasHighSeverityFlags && (hasMediumSeverityFlags ? flags.length <= 1 : true)

  return {
    isApproved,
    flags,
    sanitizedContent: sanitizedContent !== content ? sanitizedContent : undefined,
    reason: hasHighSeverityFlags ? 'Content contains high-severity issues' : 
            hasMediumSeverityFlags ? 'Content has minor issues' : undefined
  }
}

function checkProfanity(content: string, field: string): ModerationFlag[] {
  const flags: ModerationFlag[] = []
  const lowerContent = content.toLowerCase()

  PROFANITY_WORDS.forEach(word => {
    if (lowerContent.includes(word)) {
      flags.push({
        type: 'profanity',
        severity: 'medium',
        message: `Content contains inappropriate language`,
        field,
        suggestion: 'Please use professional language'
      })
    }
  })

  return flags
}

function checkPII(content: string, field: string): ModerationFlag[] {
  const flags: ModerationFlag[] = []

  // Check for SSN
  if (PII_PATTERNS.ssn.test(content)) {
    flags.push({
      type: 'pii',
      severity: 'high',
      message: 'Content contains what appears to be a Social Security Number',
      field,
      suggestion: 'Please remove personal identification numbers'
    })
  }

  // Check for credit card numbers
  if (PII_PATTERNS.creditCard.test(content)) {
    flags.push({
      type: 'pii',
      severity: 'high',
      message: 'Content contains what appears to be a credit card number',
      field,
      suggestion: 'Please remove financial information'
    })
  }

  // Check for phone numbers (only flag if not in phone field)
  if (field !== 'phone' && PII_PATTERNS.phone.test(content)) {
    flags.push({
      type: 'pii',
      severity: 'medium',
      message: 'Content contains a phone number',
      field,
      suggestion: 'Please use the dedicated phone field for contact information'
    })
  }

  // Check for email addresses (only flag if not in email field)
  if (field !== 'email' && PII_PATTERNS.email.test(content)) {
    flags.push({
      type: 'pii',
      severity: 'medium',
      message: 'Content contains an email address',
      field,
      suggestion: 'Please use the dedicated email field for contact information'
    })
  }

  return flags
}

function checkQuality(content: string, field: string): ModerationFlag[] {
  const flags: ModerationFlag[] = []
  const words = content.trim().split(/\s+/)

  // Check minimum length
  if (content.length < QUALITY_CHECKS.minLength) {
    flags.push({
      type: 'quality',
      severity: 'medium',
      message: 'Content is too short',
      field,
      suggestion: `Please provide at least ${QUALITY_CHECKS.minLength} characters`
    })
  }

  // Check maximum length
  if (content.length > QUALITY_CHECKS.maxLength) {
    flags.push({
      type: 'quality',
      severity: 'medium',
      message: 'Content is too long',
      field,
      suggestion: `Please keep content under ${QUALITY_CHECKS.maxLength} characters`
    })
  }

  // Check minimum words
  if (words.length < QUALITY_CHECKS.minWords) {
    flags.push({
      type: 'quality',
      severity: 'low',
      message: 'Content has too few words',
      field,
      suggestion: `Please provide at least ${QUALITY_CHECKS.minWords} words`
    })
  }

  // Check maximum words
  if (words.length > QUALITY_CHECKS.maxWords) {
    flags.push({
      type: 'quality',
      severity: 'medium',
      message: 'Content has too many words',
      field,
      suggestion: `Please keep content under ${QUALITY_CHECKS.maxWords} words`
    })
  }

  // Check for excessive repetition
  const wordCounts = words.reduce((acc, word) => {
    acc[word.toLowerCase()] = (acc[word.toLowerCase()] || 0) + 1
    return acc
  }, {} as Record<string, number>)

  const maxRepetition = Math.max(...Object.values(wordCounts))
  if (maxRepetition > words.length * 0.3) {
    flags.push({
      type: 'quality',
      severity: 'low',
      message: 'Content has excessive repetition',
      field,
      suggestion: 'Please vary your word choice'
    })
  }

  return flags
}

function checkAppropriateness(content: string, field: string, businessType: BusinessType): ModerationFlag[] {
  const flags: ModerationFlag[] = []
  const lowerContent = content.toLowerCase()

  // Business-specific appropriateness checks
  switch (businessType) {
    case 'fine_dining':
      // Fine dining should be more formal
      if (field === 'description' && (lowerContent.includes('cheap') || lowerContent.includes('budget'))) {
        flags.push({
          type: 'inappropriate',
          severity: 'low',
          message: 'Content may not match fine dining expectations',
          field,
          suggestion: 'Consider using more upscale language'
        })
      }
      break

    case 'dive_bar':
      // Dive bars can be more casual
      if (field === 'description' && (lowerContent.includes('upscale') || lowerContent.includes('elegant'))) {
        flags.push({
          type: 'inappropriate',
          severity: 'low',
          message: 'Content may not match dive bar expectations',
          field,
          suggestion: 'Consider using more casual language'
        })
      }
      break

    case 'family_restaurant':
      // Family restaurants should be family-friendly
      if (lowerContent.includes('bar') || lowerContent.includes('alcohol') || lowerContent.includes('drinks')) {
        flags.push({
          type: 'inappropriate',
          severity: 'medium',
          message: 'Content may not be appropriate for family dining',
          field,
          suggestion: 'Consider focusing on family-friendly aspects'
        })
      }
      break
  }

  return flags
}

function sanitizeProfanity(content: string): string {
  let sanitized = content
  const lowerContent = content.toLowerCase()

  PROFANITY_WORDS.forEach(word => {
    const regex = new RegExp(`\\b${word}\\b`, 'gi')
    sanitized = sanitized.replace(regex, '*'.repeat(word.length))
  })

  return sanitized
}

// Helper function to get moderation summary
export function getModerationSummary(results: ModerationResult[]): {
  totalFlags: number
  highSeverityFlags: number
  mediumSeverityFlags: number
  lowSeverityFlags: number
  approvedFields: number
  rejectedFields: number
} {
  const summary = {
    totalFlags: 0,
    highSeverityFlags: 0,
    mediumSeverityFlags: 0,
    lowSeverityFlags: 0,
    approvedFields: 0,
    rejectedFields: 0
  }

  results.forEach(result => {
    summary.totalFlags += result.flags.length
    summary.highSeverityFlags += result.flags.filter(f => f.severity === 'high').length
    summary.mediumSeverityFlags += result.flags.filter(f => f.severity === 'medium').length
    summary.lowSeverityFlags += result.flags.filter(f => f.severity === 'low').length
    
    if (result.isApproved) {
      summary.approvedFields++
    } else {
      summary.rejectedFields++
    }
  })

  return summary
}
