import {
  validateVercelEnv,
  getVercelEnvHelpMessage,
  requireVercelEnv,
  hasVercelEnv,
  getVercelEnvConfig
} from '../../src/lib/vercel-env'

// Mock process.env
const originalEnv = process.env

describe('Vercel Environment Validation', () => {
  beforeEach(() => {
    // Reset environment
    process.env = { ...originalEnv }
  })

  afterAll(() => {
    // Restore original environment
    process.env = originalEnv
  })

  describe('validateVercelEnv', () => {
    it('should validate complete and correct environment', () => {
      process.env.VERCEL_TOKEN = 'vercel_token_12345678901234567890'
      process.env.VERCEL_PROJECT_ID = 'prj_12345678901234567890'
      process.env.VERCEL_TEAM_ID = 'team_12345678901234567890'

      const result = validateVercelEnv()

      expect(result.isValid).toBe(true)
      expect(result.missing).toHaveLength(0)
      expect(result.invalid).toHaveLength(0)
      expect(result.config).toBeDefined()
      expect(result.config?.VERCEL_TOKEN).toBe('vercel_token_12345678901234567890')
      expect(result.config?.VERCEL_PROJECT_ID).toBe('prj_12345678901234567890')
      expect(result.config?.VERCEL_TEAM_ID).toBe('team_12345678901234567890')
    })

    it('should detect missing required variables', () => {
      process.env.VERCEL_TOKEN = 'vercel_token_12345678901234567890'
      // Missing VERCEL_PROJECT_ID

      const result = validateVercelEnv()

      expect(result.isValid).toBe(false)
      expect(result.missing).toContain('VERCEL_PROJECT_ID')
      expect(result.missing).not.toContain('VERCEL_TOKEN')
    })

    it('should detect invalid token format', () => {
      process.env.VERCEL_TOKEN = 'invalid_token'
      process.env.VERCEL_PROJECT_ID = 'prj_12345678901234567890'

      const result = validateVercelEnv()

      expect(result.isValid).toBe(false)
      expect(result.invalid).toContain('VERCEL_TOKEN')
    })

    it('should detect invalid project ID format', () => {
      process.env.VERCEL_TOKEN = 'vercel_token_12345678901234567890'
      process.env.VERCEL_PROJECT_ID = 'id' // Too short

      const result = validateVercelEnv()

      expect(result.isValid).toBe(false)
      expect(result.invalid).toContain('VERCEL_PROJECT_ID')
    })

    it('should handle optional variables correctly', () => {
      process.env.VERCEL_TOKEN = 'vercel_token_12345678901234567890'
      process.env.VERCEL_PROJECT_ID = 'prj_12345678901234567890'
      // No optional variables

      const result = validateVercelEnv()

      expect(result.isValid).toBe(true)
      expect(result.warnings).toContain('VERCEL_TEAM_ID or VERCEL_ORG_ID recommended for team projects')
    })

    it('should warn about short token', () => {
      process.env.VERCEL_TOKEN = 'short_token'
      process.env.VERCEL_PROJECT_ID = 'prj_12345678901234567890'

      const result = validateVercelEnv()

      expect(result.isValid).toBe(false)
      expect(result.invalid).toContain('VERCEL_TOKEN')
    })
  })

  describe('getVercelEnvHelpMessage', () => {
    it('should return success message for valid environment', () => {
      process.env.VERCEL_TOKEN = 'vercel_token_12345678901234567890'
      process.env.VERCEL_PROJECT_ID = 'prj_12345678901234567890'
      process.env.VERCEL_TEAM_ID = 'team_12345678901234567890'

      const validation = validateVercelEnv()
      const message = getVercelEnvHelpMessage(validation)

      expect(message).toContain('✅ All Vercel environment variables are properly configured!')
    })

    it('should provide helpful setup instructions for missing variables', () => {
      process.env.VERCEL_TOKEN = 'vercel_token_12345678901234567890'
      // Missing VERCEL_PROJECT_ID

      const validation = validateVercelEnv()
      const message = getVercelEnvHelpMessage(validation)

      expect(message).toContain('❌ Vercel environment configuration issues found')
      expect(message).toContain('🔴 Missing required variables')
      expect(message).toContain('VERCEL_PROJECT_ID')
      expect(message).toContain('Get from Vercel Dashboard → Project → Settings → General')
      expect(message).toContain('📖 Setup Guide')
      expect(message).toContain('https://vercel.com/dashboard')
    })

    it('should include warnings in help message', () => {
      process.env.VERCEL_TOKEN = 'vercel_token_12345678901234567890'
      process.env.VERCEL_PROJECT_ID = 'prj_12345678901234567890'
      // No team ID - this should generate a warning

      const validation = validateVercelEnv()
      const message = getVercelEnvHelpMessage(validation)

      // The validation should be valid but have warnings
      expect(validation.isValid).toBe(true)
      expect(validation.warnings.length).toBeGreaterThan(0)
      expect(message).toContain('⚠️  Warnings')
      expect(message).toContain('VERCEL_TEAM_ID or VERCEL_ORG_ID recommended')
    })
  })

  describe('requireVercelEnv', () => {
    it('should return config for valid environment', () => {
      process.env.VERCEL_TOKEN = 'vercel_token_12345678901234567890'
      process.env.VERCEL_PROJECT_ID = 'prj_12345678901234567890'

      const config = requireVercelEnv()

      expect(config.VERCEL_TOKEN).toBe('vercel_token_12345678901234567890')
      expect(config.VERCEL_PROJECT_ID).toBe('prj_12345678901234567890')
    })

    it('should throw error for invalid environment', () => {
      process.env.VERCEL_TOKEN = 'invalid_token'
      process.env.VERCEL_PROJECT_ID = 'prj_12345678901234567890'

      expect(() => requireVercelEnv()).toThrow('Vercel environment validation failed')
    })
  })

  describe('hasVercelEnv', () => {
    it('should return true for valid environment', () => {
      process.env.VERCEL_TOKEN = 'vercel_token_12345678901234567890'
      process.env.VERCEL_PROJECT_ID = 'prj_12345678901234567890'

      expect(hasVercelEnv()).toBe(true)
    })

    it('should return false for invalid environment', () => {
      process.env.VERCEL_TOKEN = 'invalid_token'
      process.env.VERCEL_PROJECT_ID = 'prj_12345678901234567890'

      expect(hasVercelEnv()).toBe(false)
    })
  })

  describe('getVercelEnvConfig', () => {
    it('should return config for valid environment', () => {
      process.env.VERCEL_TOKEN = 'vercel_token_12345678901234567890'
      process.env.VERCEL_PROJECT_ID = 'prj_12345678901234567890'

      const config = getVercelEnvConfig()

      expect(config).toBeDefined()
      expect(config?.VERCEL_TOKEN).toBe('vercel_token_12345678901234567890')
    })

    it('should return null for invalid environment', () => {
      process.env.VERCEL_TOKEN = 'invalid_token'
      process.env.VERCEL_PROJECT_ID = 'prj_12345678901234567890'

      const config = getVercelEnvConfig()

      expect(config).toBeNull()
    })
  })
})
