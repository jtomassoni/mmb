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

// Profanity filter (enhanced implementation)
const PROFANITY_WORDS = [
  'damn', 'hell', 'crap', 'stupid', 'idiot', 'moron', 'jerk', 'loser',
  'fucking', 'fuck', 'shit', 'bitch', 'asshole', 'bastard', 'piss',
  'bloody', 'bugger', 'crap', 'damn', 'hell', 'piss', 'shit', 'stupid'
]

// Disguised profanity patterns
const DISGUISED_PROFANITY_PATTERNS = [
  /\bf\*ck\w*\b/i,
  /\bsh\*t\w*\b/i,
  /\bb\*tch\w*\b/i,
  /\ba\*shole\w*\b/i,
  /\bf\*\*\*\*\w*\b/i,
  /\bs\*\*\*\w*\b/i
]

// PII patterns
const PII_PATTERNS = {
  ssn: /\b\d{3}-?\d{2}-?\d{4}\b/g,
  creditCard: /\b\d{4}[-\s]?\d{4}[-\s]?\d{4}[-\s]?\d{4}\b/g,
  phone: /\(\d{3}\)\s\d{3}-\d{4}/g,
  email: /\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}\b/g,
  address: /\b\d+\s+[A-Za-z\s]+(?:Street|St|Avenue|Ave|Road|Rd|Boulevard|Blvd|Drive|Dr|Lane|Ln|Way|Court|Ct|Place|Pl)\b/g
}

// Malformed data patterns
const MALFORMED_PATTERNS = {
  json: /^[\s]*\{[\s\S]*\}[\s]*$/,
  html: /<[^>]+>/,
  sql: /\b(SELECT|INSERT|UPDATE|DELETE|DROP|CREATE|ALTER)\b/i,
  url: /https?:\/\/[^\s]+/i,
  boolean: /^(true|false|yes|no|on|off|1|0)(\s+(true|false|yes|no|on|off|1|0))*$/i
}

// Quality checks
const QUALITY_CHECKS = {
  minLength: 3,
  maxLength: 500,
  minWords: 2,
  maxWords: 100
}

// Helper functions for content analysis
function isGibberish(content: string): boolean {
  const words = content.trim().split(/\s+/)
  
  // Allow unicode emojis - they're not gibberish
  if (/^[\u{1F600}-\u{1F64F}\u{1F300}-\u{1F5FF}\u{1F680}-\u{1F6FF}\u{1F1E0}-\u{1F1FF}\u{2600}-\u{26FF}\u{2700}-\u{27BF}]+$/u.test(content)) {
    return false
  }
  
  // Check for keyboard mashing patterns
  const keyboardPatterns = [
    /^[qwertyuiopasdfghjklzxcvbnm]+$/i,
    /^[asdfghjkl]+$/i,
    /^[qwerty]+$/i,
    /^[zxcvbnm]+$/i
  ]
  
  if (keyboardPatterns.some(pattern => pattern.test(content))) {
    return true
  }
  
  // Check for random character sequences
  if (content.length > 10 && /^[a-z]{10,}$/i.test(content) && !hasVowels(content)) {
    return true
  }
  
  // Check for excessive consonants without vowels
  if (content.length > 5 && !hasVowels(content)) {
    return true
  }
  
  return false
}

function hasVowels(content: string): boolean {
  return /[aeiou]/i.test(content)
}

function hasRepeatedCharacters(content: string): boolean {
  // Check for more than 3 consecutive identical characters
  return /(.)\1{3,}/.test(content)
}

function hasSpecialCharacterSpam(content: string): boolean {
  const specialCharCount = (content.match(/[!@#$%^&*()_+{}|:<>?[\]\\;'.,/`~]/g) || []).length
  const totalChars = content.length
  
  // If more than 30% of characters are special characters, it's likely spam
  return specialCharCount / totalChars > 0.3
}

function isSpamContent(content: string): boolean {
  const lowerContent = content.toLowerCase()
  
  // Check for spam indicators
  const spamIndicators = [
    'buy now', 'cheap prices', 'best deals', 'click here', 'limited time',
    'act now', 'don\'t miss out', 'exclusive offer', 'free money',
    'make money fast', 'work from home', 'get rich quick'
  ]
  
  return spamIndicators.some(indicator => lowerContent.includes(indicator))
}

export function moderateContent(content: string, field: string, businessType: BusinessType): ModerationResult {
  const flags: ModerationFlag[] = []
  let sanitizedContent = content

  // Handle null/undefined content
  if (content === null || content === undefined) {
    flags.push({
      type: 'quality',
      severity: 'high',
      message: 'Content is null or undefined',
      field,
      suggestion: 'Please provide valid content'
    })
    return {
      isApproved: false,
      flags,
      sanitizedContent: '',
      reason: 'Content is null or undefined'
    }
  }

  // Convert to string if not already
  content = String(content)

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

  // Check for explicit profanity
  PROFANITY_WORDS.forEach(word => {
    if (lowerContent.includes(word)) {
      flags.push({
        type: 'profanity',
        severity: 'high',
        message: `Content contains inappropriate language`,
        field,
        suggestion: 'Please use professional language'
      })
    }
  })

  // Check for disguised profanity
  DISGUISED_PROFANITY_PATTERNS.forEach(pattern => {
    if (pattern.test(content)) {
      flags.push({
        type: 'profanity',
        severity: 'high',
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

  // Check for addresses (only flag if not in address field)
  if (field !== 'address' && PII_PATTERNS.address.test(content)) {
    flags.push({
      type: 'pii',
      severity: 'medium',
      message: 'Content contains an address',
      field,
      suggestion: 'Please use the dedicated address field for location information'
    })
  }

  return flags
}

function checkQuality(content: string, field: string): ModerationFlag[] {
  const flags: ModerationFlag[] = []
  const words = content.trim().split(/\s+/)

  // Check for empty or whitespace-only content
  if (!content.trim()) {
    flags.push({
      type: 'quality',
      severity: 'high',
      message: 'Content is empty or contains only whitespace',
      field,
      suggestion: 'Please provide meaningful content'
    })
    return flags
  }

  // Check for gibberish patterns
  if (isGibberish(content)) {
    flags.push({
      type: 'quality',
      severity: 'high',
      message: 'Content appears to be gibberish or random characters',
      field,
      suggestion: 'Please provide meaningful, readable content'
    })
  }

  // Check for repeated characters
  if (hasRepeatedCharacters(content)) {
    flags.push({
      type: 'quality',
      severity: 'medium',
      message: 'Content contains excessive repeated characters',
      field,
      suggestion: 'Please provide varied, meaningful content'
    })
  }

  // Check for special character spam
  if (hasSpecialCharacterSpam(content)) {
    flags.push({
      type: 'quality',
      severity: 'medium',
      message: 'Content contains excessive special characters',
      field,
      suggestion: 'Please use normal text characters'
    })
  }

  // Check for malformed data patterns
  if (MALFORMED_PATTERNS.json.test(content)) {
    flags.push({
      type: 'quality',
      severity: 'high',
      message: 'Content appears to be JSON data',
      field,
      suggestion: 'Please provide plain text content'
    })
  }

  if (MALFORMED_PATTERNS.html.test(content)) {
    flags.push({
      type: 'quality',
      severity: 'high',
      message: 'Content contains HTML tags',
      field,
      suggestion: 'Please provide plain text content'
    })
  }

  if (MALFORMED_PATTERNS.sql.test(content)) {
    flags.push({
      type: 'quality',
      severity: 'high',
      message: 'Content appears to be SQL code',
      field,
      suggestion: 'Please provide plain text content'
    })
  }

  if (MALFORMED_PATTERNS.url.test(content)) {
    flags.push({
      type: 'quality',
      severity: 'medium',
      message: 'Content contains URLs or links',
      field,
      suggestion: 'Please provide plain text content without links'
    })
  }

  if (MALFORMED_PATTERNS.boolean.test(content)) {
    flags.push({
      type: 'quality',
      severity: 'medium',
      message: 'Content appears to be boolean values',
      field,
      suggestion: 'Please provide descriptive text content'
    })
  }

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

  // Check for inappropriate business descriptions
  const inappropriateTerms = ['illegal', 'drugs', 'weapons', 'prostitution', 'gambling', 'illegal activities', 'sell drugs']
  inappropriateTerms.forEach(term => {
    if (lowerContent.includes(term)) {
      flags.push({
        type: 'inappropriate',
        severity: 'high',
        message: 'Content contains inappropriate business references',
        field,
        suggestion: 'Please describe legitimate business activities only'
      })
    }
  })

  // Check for spam-like content
  if (isSpamContent(content)) {
    flags.push({
      type: 'spam',
      severity: 'medium',
      message: 'Content appears to be spam or promotional material',
      field,
      suggestion: 'Please provide genuine business information'
    })
  }

  // Business-specific appropriateness checks
  switch (businessType) {
    case 'fine_dining':
      // Fine dining should be more formal
      if (field === 'description' && (lowerContent.includes('cheap') || lowerContent.includes('budget') || lowerContent.includes('pool tables'))) {
        flags.push({
          type: 'inappropriate',
          severity: 'medium',
          message: 'Content may not match fine dining expectations',
          field,
          suggestion: 'Consider using more upscale language'
        })
      }
      break

    case 'dive_bar':
      // Dive bars can be more casual
      if (field === 'description' && (lowerContent.includes('upscale') || lowerContent.includes('elegant') || lowerContent.includes('wine pairings'))) {
        flags.push({
          type: 'inappropriate',
          severity: 'medium',
          message: 'Content may not match dive bar expectations',
          field,
          suggestion: 'Consider using more casual language'
        })
      }
      break

    case 'cafe':
      // Cafes should be quiet and coffee-focused
      if (field === 'description' && (lowerContent.includes('big screen') || lowerContent.includes('loud music') || lowerContent.includes('sports'))) {
        flags.push({
          type: 'inappropriate',
          severity: 'medium',
          message: 'Content may not match cafe expectations',
          field,
          suggestion: 'Consider focusing on coffee and quiet atmosphere'
        })
      }
      break

    case 'sports_bar':
      // Sports bars should be energetic
      if (field === 'description' && (lowerContent.includes('quiet') || lowerContent.includes('artisanal coffee'))) {
        flags.push({
          type: 'inappropriate',
          severity: 'medium',
          message: 'Content may not match sports bar expectations',
          field,
          suggestion: 'Consider focusing on sports and energetic atmosphere'
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
export function getModerationSummary(results: ModerationResult | ModerationResult[]): string {
  const resultsArray = Array.isArray(results) ? results : [results]
  
  if (resultsArray.length === 0) {
    return 'No content to moderate'
  }
  
  const result = resultsArray[0] // For single result, use the first one
  
  if (result.flags.length === 0) {
    return 'Content approved'
  }
  
  const flagTypes = result.flags.map(f => f.type)
  const uniqueFlagTypes = [...new Set(flagTypes)]
  
  if (uniqueFlagTypes.includes('profanity')) {
    return 'Content contains profanity'
  }
  if (uniqueFlagTypes.includes('pii')) {
    return 'Content contains PII'
  }
  if (uniqueFlagTypes.includes('inappropriate')) {
    return 'Content is inappropriate for business type'
  }
  if (uniqueFlagTypes.includes('spam')) {
    return 'Content appears to be spam'
  }
  if (uniqueFlagTypes.includes('quality')) {
    return 'Content quality issues detected'
  }
  
  return 'Content has moderation issues'
}
