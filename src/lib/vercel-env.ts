/**
 * Vercel Environment Validation
 * 
 * Validates that all required Vercel environment variables are present
 * and provides helpful error messages for missing or invalid values.
 */

export interface VercelEnvConfig {
  VERCEL_TOKEN: string
  VERCEL_PROJECT_ID: string
  VERCEL_TEAM_ID?: string
  VERCEL_ORG_ID?: string
}

export interface VercelEnvValidationResult {
  isValid: boolean
  missing: string[]
  invalid: string[]
  warnings: string[]
  config?: VercelEnvConfig
}

/**
 * Validates Vercel environment variables
 */
export function validateVercelEnv(): VercelEnvValidationResult {
  const result: VercelEnvValidationResult = {
    isValid: true,
    missing: [],
    invalid: [],
    warnings: []
  }

  // Required environment variables
  const requiredVars = {
    VERCEL_TOKEN: 'Vercel API token for domain management',
    VERCEL_PROJECT_ID: 'Vercel project ID for domain operations'
  }

  // Optional environment variables
  const optionalVars = {
    VERCEL_TEAM_ID: 'Vercel team ID (required for team projects)',
    VERCEL_ORG_ID: 'Vercel organization ID (alternative to team ID)'
  }

  const config: Partial<VercelEnvConfig> = {}

  // Check required variables
  for (const [key] of Object.entries(requiredVars)) {
    const value = process.env[key]
    
    if (!value) {
      result.missing.push(key)
      result.isValid = false
    } else if (!isValidVercelValue(key, value)) {
      result.invalid.push(key)
      result.isValid = false
    } else {
      config[key as keyof VercelEnvConfig] = value
    }
  }

  // Check optional variables
  for (const [key] of Object.entries(optionalVars)) {
    const value = process.env[key]
    
    if (value) {
      if (!isValidVercelValue(key, value)) {
        result.invalid.push(key)
        result.isValid = false
      } else {
        config[key as keyof VercelEnvConfig] = value
      }
    }
  }

  // Add warnings for common issues
  if (config.VERCEL_TOKEN && !config.VERCEL_TEAM_ID && !config.VERCEL_ORG_ID) {
    result.warnings.push('VERCEL_TEAM_ID or VERCEL_ORG_ID recommended for team projects')
  }

  if (config.VERCEL_TOKEN && config.VERCEL_TOKEN.length < 20) {
    result.warnings.push('VERCEL_TOKEN appears to be too short - verify it\'s a valid API token')
  }

  if (result.isValid) {
    result.config = config as VercelEnvConfig
  }

  return result
}

/**
 * Validates individual Vercel environment variable values
 */
function isValidVercelValue(key: string, value: string): boolean {
  switch (key) {
    case 'VERCEL_TOKEN':
      // Vercel tokens are typically 40+ characters
      return value.length >= 20 && /^[a-zA-Z0-9_-]+$/.test(value)
    
    case 'VERCEL_PROJECT_ID':
      // Vercel project IDs are typically alphanumeric with hyphens, but can be shorter
      return value.length >= 5 && /^[a-zA-Z0-9_-]+$/.test(value)
    
    case 'VERCEL_TEAM_ID':
      // Team IDs are typically alphanumeric
      return value.length >= 5 && /^[a-zA-Z0-9_-]+$/.test(value)
    
    case 'VERCEL_ORG_ID':
      // Org IDs are typically alphanumeric
      return value.length >= 5 && /^[a-zA-Z0-9_-]+$/.test(value)
    
    default:
      return true
  }
}

/**
 * Gets helpful error messages for missing Vercel environment variables
 */
export function getVercelEnvHelpMessage(validation: VercelEnvValidationResult): string {
  if (validation.isValid && validation.warnings.length === 0) {
    return '✅ All Vercel environment variables are properly configured!'
  }

  let message = '❌ Vercel environment configuration issues found:\n\n'

  if (validation.missing.length > 0) {
    message += '🔴 Missing required variables:\n'
    validation.missing.forEach(key => {
      const descriptions = {
        VERCEL_TOKEN: 'Get from Vercel Dashboard → Settings → Tokens',
        VERCEL_PROJECT_ID: 'Get from Vercel Dashboard → Project → Settings → General',
        VERCEL_TEAM_ID: 'Get from Vercel Dashboard → Team → Settings → General',
        VERCEL_ORG_ID: 'Get from Vercel Dashboard → Organization → Settings → General'
      }
      
      message += `  • ${key}: ${descriptions[key as keyof typeof descriptions] || 'Required for Vercel integration'}\n`
    })
    message += '\n'
  }

  if (validation.invalid.length > 0) {
    message += '🟡 Invalid variable values:\n'
    validation.invalid.forEach(key => {
      message += `  • ${key}: Value appears to be invalid format\n`
    })
    message += '\n'
  }

  if (validation.warnings.length > 0) {
    message += '⚠️  Warnings:\n'
    validation.warnings.forEach(warning => {
      message += `  • ${warning}\n`
    })
    message += '\n'
  }

  message += '📖 Setup Guide:\n'
  message += '1. Go to https://vercel.com/dashboard\n'
  message += '2. Create a new API token in Settings → Tokens\n'
  message += '3. Copy your project ID from Project → Settings → General\n'
  message += '4. Add these to your .env.local file:\n'
  message += '   VERCEL_TOKEN=your_token_here\n'
  message += '   VERCEL_PROJECT_ID=your_project_id_here\n'
  message += '   VERCEL_TEAM_ID=your_team_id_here (if using team project)\n'

  return message
}

/**
 * Throws an error with helpful message if Vercel environment is invalid
 */
export function requireVercelEnv(): VercelEnvConfig {
  const validation = validateVercelEnv()
  
  if (!validation.isValid) {
    const helpMessage = getVercelEnvHelpMessage(validation)
    throw new Error(`Vercel environment validation failed:\n\n${helpMessage}`)
  }

  return validation.config!
}

/**
 * Checks if Vercel environment is available (for optional features)
 */
export function hasVercelEnv(): boolean {
  return validateVercelEnv().isValid
}

/**
 * Gets Vercel environment config with fallback for optional features
 */
export function getVercelEnvConfig(): VercelEnvConfig | null {
  const validation = validateVercelEnv()
  return validation.isValid ? validation.config! : null
}
