/**
 * Domain Verification Service
 * 
 * Handles automatic domain verification with exponential backoff
 * and retry logic for DNS propagation.
 */

import { prisma } from './prisma'
import { getDomainStatus } from './vercel'
import { validateVercelEnv } from './vercel-env'
import { extractVerificationInfo, getVerificationStatus } from './domain-verification'
import { createTelemetryEvent } from './domain-telemetry'

export interface VerificationAttempt {
  id: string
  domainId: string
  attempt: number
  maxAttempts: number
  nextRetryAt: Date
  status: 'pending' | 'verified' | 'failed' | 'timeout'
  error?: string
  createdAt: Date
  updatedAt: Date
}

export interface VerificationConfig {
  maxAttempts: number
  initialDelayMs: number
  maxDelayMs: number
  backoffMultiplier: number
  jitterMs: number
}

const DEFAULT_CONFIG: VerificationConfig = {
  maxAttempts: 10,
  initialDelayMs: 30000, // 30 seconds
  maxDelayMs: 300000, // 5 minutes
  backoffMultiplier: 1.5,
  jitterMs: 5000 // 5 seconds
}

/**
 * Calculates next retry delay with exponential backoff and jitter
 */
export function calculateNextRetryDelay(
  attempt: number,
  config: VerificationConfig = DEFAULT_CONFIG
): number {
  const { initialDelayMs, maxDelayMs, backoffMultiplier, jitterMs } = config
  
  // Exponential backoff: delay = initial * (multiplier ^ attempt)
  const exponentialDelay = initialDelayMs * Math.pow(backoffMultiplier, attempt - 1)
  
  // Cap at maximum delay
  const cappedDelay = Math.min(exponentialDelay, maxDelayMs)
  
  // Add jitter to prevent thundering herd
  const jitter = Math.random() * jitterMs
  
  return Math.floor(cappedDelay + jitter)
}

/**
 * Creates a new verification attempt
 */
export async function createVerificationAttempt(
  domainId: string,
  config: VerificationConfig = DEFAULT_CONFIG
): Promise<VerificationAttempt> {
  const nextRetryAt = new Date(Date.now() + calculateNextRetryDelay(1, config))
  
  const attempt = await prisma.verificationAttempt.create({
    data: {
      domainId,
      attempt: 1,
      maxAttempts: config.maxAttempts,
      nextRetryAt,
      status: 'pending'
    }
  })

  // Create telemetry event for verification start
  await createTelemetryEvent(
    domainId,
    'verification_started',
    'info',
    'Domain verification process started',
    {
      attemptId: attempt.id,
      maxAttempts: config.maxAttempts,
      nextRetryAt: nextRetryAt.toISOString()
    }
  )
  
  return {
    ...attempt,
    status: attempt.status as 'pending' | 'verified' | 'failed' | 'timeout',
    error: attempt.error || undefined
  }
}

/**
 * Processes a single verification attempt
 */
export async function processVerificationAttempt(
  attemptId: string
): Promise<{
  success: boolean
  verified: boolean
  error?: string
  nextRetryAt?: Date
}> {
  const attempt = await prisma.verificationAttempt.findUnique({
    where: { id: attemptId },
    include: {
      domain: true
    }
  })
  
  if (!attempt) {
    throw new Error('Verification attempt not found')
  }
  
  if (attempt.status !== 'pending') {
    return {
      success: true,
      verified: attempt.status === 'verified'
    }
  }
  
  // Check if it's time to retry
  if (new Date() < attempt.nextRetryAt) {
    return {
      success: false,
      verified: false,
      error: 'Not yet time to retry'
    }
  }
  
  try {
    // Check Vercel environment
    const vercelValidation = validateVercelEnv()
    
    if (!vercelValidation.isValid || attempt.domain.provider !== 'VERCEL') {
      // Mark as failed if Vercel not available
      await prisma.verificationAttempt.update({
        where: { id: attemptId },
        data: {
          status: 'failed',
          error: 'Vercel environment not available'
        }
      })

      // Create telemetry event for environment error
      await createTelemetryEvent(
        attempt.domainId,
        'environment_error',
        'critical',
        'Vercel environment configuration is missing or invalid',
        {
          attemptId: attemptId,
          missing: vercelValidation.missing,
          invalid: vercelValidation.invalid,
          warnings: vercelValidation.warnings
        }
      )
      
      return {
        success: true,
        verified: false,
        error: 'Vercel environment not available'
      }
    }
    
    // Check domain status with Vercel
    const vercelConfig = vercelValidation.config!
    const domainStatus = await getDomainStatus({
      token: vercelConfig.VERCEL_TOKEN,
      hostname: attempt.domain.hostname
    })
    
    const isVerified = domainStatus.verified === true
    
    if (isVerified) {
      // Domain is verified - update both attempt and domain
      await prisma.$transaction([
        prisma.verificationAttempt.update({
          where: { id: attemptId },
          data: {
            status: 'verified',
            updatedAt: new Date()
          }
        }),
        prisma.domain.update({
          where: { id: attempt.domainId },
          data: {
            status: 'ACTIVE',
            verifiedAt: new Date()
          }
        })
      ])

      // Create telemetry event for successful verification
      await createTelemetryEvent(
        attempt.domainId,
        'verification_success',
        'info',
        'Domain verification completed successfully',
        {
          attemptId: attemptId,
          attempt: attempt.attempt,
          verifiedAt: new Date().toISOString()
        }
      )
      
      return {
        success: true,
        verified: true
      }
    } else {
      // Domain not yet verified - check if we should retry
      if (attempt.attempt >= attempt.maxAttempts) {
        // Max attempts reached - mark as timeout
        await prisma.verificationAttempt.update({
          where: { id: attemptId },
          data: {
            status: 'timeout',
            error: 'Maximum verification attempts reached'
          }
        })

        // Create telemetry event for timeout
        await createTelemetryEvent(
          attempt.domainId,
          'verification_timeout',
          'error',
          'Domain verification timed out after maximum attempts',
          {
            attemptId: attemptId,
            attempt: attempt.attempt,
            maxAttempts: attempt.maxAttempts,
            hostname: attempt.domain.hostname
          }
        )
        
        return {
          success: true,
          verified: false,
          error: 'Maximum verification attempts reached'
        }
      } else {
        // Schedule next retry
        const nextRetryAt = new Date(Date.now() + calculateNextRetryDelay(attempt.attempt + 1))
        
        await prisma.verificationAttempt.update({
          where: { id: attemptId },
          data: {
            attempt: attempt.attempt + 1,
            nextRetryAt,
            updatedAt: new Date()
          }
        })
        
        return {
          success: false,
          verified: false,
          nextRetryAt
        }
      }
    }
  } catch (error) {
    // Error occurred - check if we should retry
    const errorMessage = error instanceof Error ? error.message : 'Unknown error'
    
    // Create telemetry event for Vercel error
    await createTelemetryEvent(
      attempt.domainId,
      'vercel_error',
      'error',
      `Vercel API error: ${errorMessage}`,
      {
        attemptId: attemptId,
        attempt: attempt.attempt,
        error: errorMessage,
        hostname: attempt.domain.hostname
      }
    )
    
    if (attempt.attempt >= attempt.maxAttempts) {
      // Max attempts reached - mark as failed
      await prisma.verificationAttempt.update({
        where: { id: attemptId },
        data: {
          status: 'failed',
          error: errorMessage
        }
      })

      // Create telemetry event for verification failure
      await createTelemetryEvent(
        attempt.domainId,
        'verification_failed',
        'error',
        'Domain verification failed after maximum attempts',
        {
          attemptId: attemptId,
          attempt: attempt.attempt,
          maxAttempts: attempt.maxAttempts,
          finalError: errorMessage
        }
      )
      
      return {
        success: true,
        verified: false,
        error: errorMessage
      }
    } else {
      // Schedule retry with error
      const nextRetryAt = new Date(Date.now() + calculateNextRetryDelay(attempt.attempt + 1))
      
      await prisma.verificationAttempt.update({
        where: { id: attemptId },
        data: {
          attempt: attempt.attempt + 1,
          nextRetryAt,
          error: errorMessage,
          updatedAt: new Date()
        }
      })
      
      return {
        success: false,
        verified: false,
        error: errorMessage,
        nextRetryAt
      }
    }
  }
}

/**
 * Processes all pending verification attempts
 */
export async function processPendingVerifications(): Promise<{
  processed: number
  verified: number
  failed: number
  retried: number
}> {
  const pendingAttempts = await prisma.verificationAttempt.findMany({
    where: {
      status: 'pending',
      nextRetryAt: {
        lte: new Date()
      }
    },
    include: {
      domain: true
    }
  })
  
  let processed = 0
  let verified = 0
  let failed = 0
  let retried = 0
  
  for (const attempt of pendingAttempts) {
    try {
      const result = await processVerificationAttempt(attempt.id)
      processed++
      
      if (result.verified) {
        verified++
      } else if (result.success && !result.verified) {
        failed++
      } else if (!result.success) {
        retried++
      }
    } catch (error) {
      console.error(`Error processing verification attempt ${attempt.id}:`, error)
      processed++
      failed++
    }
  }
  
  return { processed, verified, failed, retried }
}

/**
 * Gets verification status for a domain
 */
export async function getDomainVerificationStatus(domainId: string): Promise<{
  status: 'verified' | 'pending' | 'failed' | 'timeout' | 'not_started'
  attempt?: VerificationAttempt
  nextRetryAt?: Date
  error?: string
}> {
  const latestAttempt = await prisma.verificationAttempt.findFirst({
    where: { domainId },
    orderBy: { createdAt: 'desc' }
  })
  
  if (!latestAttempt) {
    return { status: 'not_started' }
  }
  
  return {
    status: latestAttempt.status as 'verified' | 'pending' | 'failed' | 'timeout' | 'not_started',
    attempt: {
      ...latestAttempt,
      status: latestAttempt.status as 'pending' | 'verified' | 'failed' | 'timeout',
      error: latestAttempt.error || undefined
    },
    nextRetryAt: latestAttempt.status === 'pending' ? latestAttempt.nextRetryAt : undefined,
    error: latestAttempt.error || undefined
  }
}

/**
 * Cancels a verification attempt
 */
export async function cancelVerificationAttempt(domainId: string): Promise<void> {
  await prisma.verificationAttempt.updateMany({
    where: {
      domainId,
      status: 'pending'
    },
    data: {
      status: 'failed',
      error: 'Cancelled by user'
    }
  })
}

/**
 * Gets all active verification attempts
 */
export async function getActiveVerificationAttempts(): Promise<VerificationAttempt[]> {
  const attempts = await prisma.verificationAttempt.findMany({
    where: {
      status: 'pending'
    },
    include: {
      domain: true
    },
    orderBy: {
      nextRetryAt: 'asc'
    }
  })

  return attempts.map(attempt => ({
    ...attempt,
    status: attempt.status as 'pending' | 'verified' | 'failed' | 'timeout',
    error: attempt.error || undefined
  }))
}
