import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '../../../../../lib/auth'
import { prisma } from '../../../../../lib/prisma'
import { createVerificationAttempt, getDomainVerificationStatus } from '../../../../../lib/domain-verification-service'

export async function POST(request: NextRequest) {
  const session = await getServerSession(authOptions)
  
  if (!session?.user || session.user.role !== 'SUPERADMIN') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const { domainId } = await request.json()

    if (!domainId) {
      return NextResponse.json({ error: 'Missing domainId' }, { status: 400 })
    }

    // Check if domain exists
    const domain = await prisma.domain.findUnique({
      where: { id: domainId }
    })

    if (!domain) {
      return NextResponse.json({ error: 'Domain not found' }, { status: 404 })
    }

    // Check if verification is already in progress
    const existingStatus = await getDomainVerificationStatus(domainId)
    
    if (existingStatus.status === 'pending') {
      return NextResponse.json({
        success: false,
        message: 'Verification already in progress',
        status: existingStatus.status,
        attempt: existingStatus.attempt,
        nextRetryAt: existingStatus.nextRetryAt
      })
    }

    if (existingStatus.status === 'verified') {
      return NextResponse.json({
        success: false,
        message: 'Domain is already verified',
        status: existingStatus.status,
        attempt: existingStatus.attempt
      })
    }

    // Start new verification attempt
    const attempt = await createVerificationAttempt(domainId)

    return NextResponse.json({
      success: true,
      message: 'Domain verification started',
      attempt: {
        id: attempt.id,
        attempt: attempt.attempt,
        maxAttempts: attempt.maxAttempts,
        nextRetryAt: attempt.nextRetryAt,
        status: attempt.status
      },
      domain: {
        id: domain.id,
        hostname: domain.hostname,
        status: domain.status
      }
    })
  } catch (error) {
    console.error('Error starting domain verification:', error)
    return NextResponse.json({ error: 'Failed to start domain verification' }, { status: 500 })
  }
}

export async function GET(request: NextRequest) {
  const session = await getServerSession(authOptions)
  
  if (!session?.user || session.user.role !== 'SUPERADMIN') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const { searchParams } = new URL(request.url)
    const domainId = searchParams.get('domainId')

    if (!domainId) {
      return NextResponse.json({ error: 'Missing domainId parameter' }, { status: 400 })
    }

    // Get verification status
    const status = await getDomainVerificationStatus(domainId)

    return NextResponse.json({
      success: true,
      status: status.status,
      attempt: status.attempt,
      nextRetryAt: status.nextRetryAt,
      error: status.error
    })
  } catch (error) {
    console.error('Error getting domain verification status:', error)
    return NextResponse.json({ error: 'Failed to get domain verification status' }, { status: 500 })
  }
}
