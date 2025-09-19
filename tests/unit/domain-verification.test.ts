import {
  extractVerificationInfo,
  generateDnsInstructions,
  validateDnsRecord,
  parseDnsRecord,
  getVerificationStatus,
  needsManualDnsSetup,
  generateVerificationSummary
} from '../../src/lib/domain-verification'

describe('Domain Verification Utilities', () => {
  describe('extractVerificationInfo', () => {
    it('should extract TXT verification info from Vercel response', () => {
      const vercelResponse = {
        verification: [
          {
            type: 'TXT',
            domain: '_vercel',
            value: 'vercel-verification=abc123def456'
          }
        ]
      }

      const result = extractVerificationInfo(vercelResponse)

      expect(result.txt).toBe('vercel-verification=abc123def456')
      expect(result.record).toBe('_vercel TXT "vercel-verification=abc123def456"')
      expect(result.host).toBe('_vercel')
      expect(result.type).toBe('TXT')
    })

    it('should handle response with no verification records', () => {
      const vercelResponse = {
        verification: []
      }

      const result = extractVerificationInfo(vercelResponse)

      expect(result.txt).toBeNull()
      expect(result.record).toBeNull()
      expect(result.host).toBeNull()
      expect(result.type).toBeNull()
    })

    it('should handle response with no verification field', () => {
      const vercelResponse = {}

      const result = extractVerificationInfo(vercelResponse)

      expect(result.txt).toBeNull()
      expect(result.record).toBeNull()
      expect(result.host).toBeNull()
      expect(result.type).toBeNull()
    })

    it('should handle response with non-TXT verification', () => {
      const vercelResponse = {
        verification: [
          {
            type: 'CNAME',
            domain: 'www',
            value: 'cname.vercel-dns.com'
          }
        ]
      }

      const result = extractVerificationInfo(vercelResponse)

      expect(result.txt).toBeNull()
      expect(result.record).toBeNull()
      expect(result.host).toBeNull()
      expect(result.type).toBeNull()
    })
  })

  describe('generateDnsInstructions', () => {
    it('should generate DNS instructions for subdomain', () => {
      const hostname = 'app.example.com'
      const verificationInfo = {
        txt: 'vercel-verification=abc123def456',
        record: '_vercel TXT "vercel-verification=abc123def456"',
        host: '_vercel',
        type: 'TXT'
      }

      const result = generateDnsInstructions(hostname, verificationInfo)

      expect(result).toBeDefined()
      expect(result?.type).toBe('TXT')
      expect(result?.name).toBe('_vercel')
      expect(result?.value).toBe('vercel-verification=abc123def456')
      expect(result?.instructions).toContain('Add this TXT record')
      expect(result?.instructions).toContain('subdomain verification')
    })

    it('should generate DNS instructions for apex domain', () => {
      const hostname = 'example.com'
      const verificationInfo = {
        txt: 'vercel-verification=abc123def456',
        record: '@ TXT "vercel-verification=abc123def456"',
        host: '@',
        type: 'TXT'
      }

      const result = generateDnsInstructions(hostname, verificationInfo)

      expect(result).toBeDefined()
      expect(result?.instructions).toContain('apex domains')
      expect(result?.instructions).toContain('root domain')
    })

    it('should return null for incomplete verification info', () => {
      const hostname = 'example.com'
      const verificationInfo = {
        txt: null,
        record: null,
        host: null,
        type: null
      }

      const result = generateDnsInstructions(hostname, verificationInfo)

      expect(result).toBeNull()
    })
  })

  describe('validateDnsRecord', () => {
    it('should validate correct TXT record format', () => {
      const validRecords = [
        '_vercel TXT "vercel-verification=abc123"',
        '@ TXT "vercel-verification=def456"',
        'www TXT "some-value"',
        'subdomain.example.com TXT "another-value"'
      ]

      validRecords.forEach(record => {
        expect(validateDnsRecord(record)).toBe(true)
      })
    })

    it('should reject invalid TXT record formats', () => {
      const invalidRecords = [
        '_vercel TXT vercel-verification=abc123', // Missing quotes
        '_vercel "vercel-verification=abc123"', // Missing TXT
        'TXT "vercel-verification=abc123"', // Missing name
        '_vercel TXT "vercel-verification=abc123" extra', // Extra content
        '' // Empty string
      ]

      invalidRecords.forEach(record => {
        expect(validateDnsRecord(record)).toBe(false)
      })
    })
  })

  describe('parseDnsRecord', () => {
    it('should parse valid DNS record', () => {
      const record = '_vercel TXT "vercel-verification=abc123"'
      const result = parseDnsRecord(record)

      expect(result).toBeDefined()
      expect(result?.name).toBe('_vercel')
      expect(result?.type).toBe('TXT')
      expect(result?.value).toBe('vercel-verification=abc123')
    })

    it('should return null for invalid DNS record', () => {
      const record = 'invalid record format'
      const result = parseDnsRecord(record)

      expect(result).toBeNull()
    })
  })

  describe('getVerificationStatus', () => {
    it('should return verified status', () => {
      const result = getVerificationStatus(true, {
        txt: 'vercel-verification=abc123',
        record: '_vercel TXT "vercel-verification=abc123"',
        host: '_vercel',
        type: 'TXT'
      })

      expect(result.status).toBe('verified')
      expect(result.message).toContain('verified and active')
    })

    it('should return pending status with verification info', () => {
      const result = getVerificationStatus(false, {
        txt: 'vercel-verification=abc123',
        record: '_vercel TXT "vercel-verification=abc123"',
        host: '_vercel',
        type: 'TXT'
      })

      expect(result.status).toBe('pending')
      expect(result.message).toContain('verification pending')
      expect(result.action).toBe('Add the TXT record to your DNS provider')
    })

    it('should return failed status without verification info', () => {
      const result = getVerificationStatus(false, {
        txt: null,
        record: null,
        host: null,
        type: null
      })

      expect(result.status).toBe('failed')
      expect(result.message).toContain('verification failed')
    })
  })

  describe('needsManualDnsSetup', () => {
    it('should return true for unverified domain with verification info', () => {
      const result = needsManualDnsSetup(false, {
        txt: 'vercel-verification=abc123',
        record: '_vercel TXT "vercel-verification=abc123"',
        host: '_vercel',
        type: 'TXT'
      })

      expect(result).toBe(true)
    })

    it('should return false for verified domain', () => {
      const result = needsManualDnsSetup(true, {
        txt: 'vercel-verification=abc123',
        record: '_vercel TXT "vercel-verification=abc123"',
        host: '_vercel',
        type: 'TXT'
      })

      expect(result).toBe(false)
    })

    it('should return false for domain without verification info', () => {
      const result = needsManualDnsSetup(false, {
        txt: null,
        record: null,
        host: null,
        type: null
      })

      expect(result).toBe(false)
    })
  })

  describe('generateVerificationSummary', () => {
    it('should generate success summary for verified domain', () => {
      const result = generateVerificationSummary(
        'example.com',
        true,
        {
          txt: 'vercel-verification=abc123',
          record: '_vercel TXT "vercel-verification=abc123"',
          host: '_vercel',
          type: 'TXT'
        }
      )

      expect(result.title).toBe('Domain Verified')
      expect(result.status).toBe('success')
      expect(result.message).toContain('verified and ready')
    })

    it('should generate warning summary for pending verification', () => {
      const result = generateVerificationSummary(
        'example.com',
        false,
        {
          txt: 'vercel-verification=abc123',
          record: '_vercel TXT "vercel-verification=abc123"',
          host: '_vercel',
          type: 'TXT'
        }
      )

      expect(result.title).toBe('DNS Verification Required')
      expect(result.status).toBe('warning')
      expect(result.message).toContain('Add the TXT record')
      expect(result.action).toBe('Add TXT Record')
      expect(result.instructions).toBeDefined()
    })

    it('should generate error summary for failed verification', () => {
      const result = generateVerificationSummary(
        'example.com',
        false,
        {
          txt: null,
          record: null,
          host: null,
          type: null
        }
      )

      expect(result.title).toBe('Verification Failed')
      expect(result.status).toBe('error')
      expect(result.message).toContain('Unable to get verification records')
      expect(result.action).toBe('Retry Verification')
    })
  })
})
