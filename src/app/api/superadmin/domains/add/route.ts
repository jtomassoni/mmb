import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '../../../../../lib/auth'
import { prisma } from '../../../../../lib/prisma'
import { addProjectDomain } from '../../../../../lib/vercel'
import { requireVercelEnv, getVercelEnvHelpMessage, validateVercelEnv } from '../../../../../lib/vercel-env'
import { extractVerificationInfo, generateDnsInstructions } from '../../../../../lib/domain-verification'
import { createVerificationAttempt } from '../../../../../lib/domain-verification-service'

export async function POST(request: NextRequest) {
  const session = await getServerSession(authOptions)
  
  if (!session?.user || session.user.role !== 'SUPERADMIN') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const { siteId, hostname } = await request.json()

    if (!siteId || !hostname) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
    }

    // Create domain record
    const domain = await prisma.domain.create({
      data: {
        siteId,
        hostname,
        status: 'PENDING',
        provider: 'VERCEL'
      }
    })

    // Check Vercel environment and try to add domain
    const vercelValidation = validateVercelEnv()
    let vercelSuccess = false
    let vercelError = null

    let vercelDomainResponse = null
    let verificationInfo = null

    if (vercelValidation.isValid) {
      try {
        const vercelConfig = vercelValidation.config!
        vercelDomainResponse = await addProjectDomain({
          projectId: vercelConfig.VERCEL_PROJECT_ID,
          token: vercelConfig.VERCEL_TOKEN,
          hostname
        })
        
        // Extract verification information
        verificationInfo = extractVerificationInfo(vercelDomainResponse)
        
        // Update domain with verification info and Vercel IDs
        await prisma.domain.update({
          where: { id: domain.id },
          data: {
            verificationTxt: verificationInfo.txt,
            verificationRecord: verificationInfo.record,
            verificationHost: verificationInfo.host,
            vercelProjectId: vercelConfig.VERCEL_PROJECT_ID,
            vercelDomainId: vercelDomainResponse.id,
            status: vercelDomainResponse.verified ? 'ACTIVE' : 'PENDING',
            verifiedAt: vercelDomainResponse.verified ? new Date() : null
          }
        })
        
        vercelSuccess = true
      } catch (error) {
        console.error('Failed to add domain to Vercel:', error)
        vercelError = error instanceof Error ? error.message : 'Unknown error'
      }
    } else {
      vercelError = getVercelEnvHelpMessage(vercelValidation)
    }

    // Get updated domain with verification info
    const updatedDomain = await prisma.domain.findUnique({
      where: { id: domain.id }
    })

    // Generate DNS instructions if verification info is available
    let dnsInstructions = null
    if (verificationInfo) {
      dnsInstructions = generateDnsInstructions(hostname, verificationInfo)
    }

    // Start automatic verification if domain was added to Vercel
    let verificationAttempt = null
    if (vercelSuccess && !vercelDomainResponse?.verified) {
      try {
        verificationAttempt = await createVerificationAttempt(updatedDomain!.id)
      } catch (error) {
        console.error('Failed to start verification attempt:', error)
        // Don't fail the whole request if verification start fails
      }
    }

    return NextResponse.json({ 
      domain: updatedDomain,
      vercel: {
        success: vercelSuccess,
        error: vercelError,
        autoProvisioned: vercelSuccess,
        domainId: vercelDomainResponse?.id,
        verified: vercelDomainResponse?.verified || false
      },
      verification: verificationInfo ? {
        txt: verificationInfo.txt,
        record: verificationInfo.record,
        host: verificationInfo.host,
        type: verificationInfo.type,
        instructions: dnsInstructions
      } : null,
      verificationAttempt: verificationAttempt ? {
        id: verificationAttempt.id,
        attempt: verificationAttempt.attempt,
        maxAttempts: verificationAttempt.maxAttempts,
        nextRetryAt: verificationAttempt.nextRetryAt,
        status: verificationAttempt.status
      } : null,
      dnsSteps: vercelSuccess ? {
        subdomain: 'CNAME → cname.vercel-dns.com',
        apex: 'A/ALIAS records from Vercel response',
        verification: verificationInfo ? 'TXT record for verification' : null
      } : {
        manual: 'Add domain manually in Vercel dashboard',
        subdomain: 'CNAME → cname.vercel-dns.com',
        apex: 'A/ALIAS records from Vercel response'
      }
    })
  } catch (error) {
    console.error('Error adding domain:', error)
    return NextResponse.json({ error: 'Failed to add domain' }, { status: 500 })
  }
}
