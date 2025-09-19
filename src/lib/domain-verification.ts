/**
 * Domain Verification Utilities
 * 
 * Handles extraction and management of domain verification TXT records
 * from Vercel API responses.
 */

export interface VerificationInfo {
  txt: string | null
  record: string | null
  host: string | null
  type: string | null
}

export interface DnsInstructions {
  type: 'TXT'
  name: string
  value: string
  ttl?: number
  instructions: string
}

/**
 * Extracts verification information from Vercel domain response
 */
export function extractVerificationInfo(vercelResponse: {
  verification?: {
    type: string
    domain: string
    value: string
  }[]
}): VerificationInfo {
  if (!vercelResponse.verification || vercelResponse.verification.length === 0) {
    return {
      txt: null,
      record: null,
      host: null,
      type: null
    }
  }

  // Find TXT verification record
  const txtVerification = vercelResponse.verification.find(v => v.type === 'TXT')
  
  if (!txtVerification) {
    return {
      txt: null,
      record: null,
      host: null,
      type: null
    }
  }

  return {
    txt: txtVerification.value,
    record: `${txtVerification.domain} TXT "${txtVerification.value}"`,
    host: txtVerification.domain,
    type: txtVerification.type
  }
}

/**
 * Generates DNS instructions for domain verification
 */
export function generateDnsInstructions(
  hostname: string,
  verificationInfo: VerificationInfo
): DnsInstructions | null {
  if (!verificationInfo.txt || !verificationInfo.host) {
    return null
  }

  const isApexDomain = !hostname.includes('.') || hostname.split('.').length === 2
  
  return {
    type: 'TXT',
    name: verificationInfo.host,
    value: verificationInfo.txt,
    ttl: 300, // 5 minutes default
    instructions: `Add this TXT record to your DNS provider:
    
Name: ${verificationInfo.host}
Type: TXT
Value: "${verificationInfo.txt}"
TTL: 300 (or default)

${isApexDomain ? 
  'Note: For apex domains, you may need to add this as "@" or the root domain.' : 
  'Note: This is for subdomain verification.'}`
  }
}

/**
 * Validates DNS record format
 */
export function validateDnsRecord(record: string): boolean {
  // Basic validation for TXT record format
  const txtPattern = /^[a-zA-Z0-9._@-]+\s+TXT\s+"[^"]+"$/
  return txtPattern.test(record.trim())
}

/**
 * Parses DNS record into components
 */
export function parseDnsRecord(record: string): {
  name: string
  type: string
  value: string
} | null {
  const match = record.match(/^([a-zA-Z0-9._@-]+)\s+(TXT)\s+"([^"]+)"$/)
  
  if (!match) {
    return null
  }

  return {
    name: match[1],
    type: match[2],
    value: match[3]
  }
}

/**
 * Generates human-readable verification status
 */
export function getVerificationStatus(
  verified: boolean,
  verificationInfo: VerificationInfo
): {
  status: 'verified' | 'pending' | 'failed'
  message: string
  action?: string
} {
  if (verified) {
    return {
      status: 'verified',
      message: 'Domain is verified and active'
    }
  }

  if (verificationInfo.txt) {
    return {
      status: 'pending',
      message: 'Domain verification pending - DNS records need to be added',
      action: 'Add the TXT record to your DNS provider'
    }
  }

  return {
    status: 'failed',
    message: 'Domain verification failed - no verification records found'
  }
}

/**
 * Checks if domain needs manual DNS setup
 */
export function needsManualDnsSetup(
  verified: boolean,
  verificationInfo: VerificationInfo
): boolean {
  return !verified && verificationInfo.txt !== null
}

/**
 * Generates verification summary for UI
 */
export function generateVerificationSummary(
  hostname: string,
  verified: boolean,
  verificationInfo: VerificationInfo
): {
  title: string
  status: 'success' | 'warning' | 'error'
  message: string
  instructions?: DnsInstructions
  action?: string
} {
  if (verified) {
    return {
      title: 'Domain Verified',
      status: 'success',
      message: `${hostname} is verified and ready to use`
    }
  }

  if (verificationInfo.txt) {
    const instructions = generateDnsInstructions(hostname, verificationInfo)
    return {
      title: 'DNS Verification Required',
      status: 'warning',
      message: `Add the TXT record below to verify ${hostname}`,
      instructions: instructions || undefined,
      action: 'Add TXT Record'
    }
  }

  return {
    title: 'Verification Failed',
    status: 'error',
    message: `Unable to get verification records for ${hostname}`,
    action: 'Retry Verification'
  }
}
