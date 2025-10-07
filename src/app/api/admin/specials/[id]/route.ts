import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { logAuditEvent } from '@/lib/audit-log'

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions)
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { name, description, price, originalPrice, startDate, endDate, isActive, image } = body

    const { id: specialId } = await params
    const existingSpecial = await prisma.special.findUnique({
      where: { id: specialId }
    })

    if (!existingSpecial) {
      return NextResponse.json({ error: 'Special not found' }, { status: 404 })
    }

    const special = await prisma.special.update({
      where: { id: specialId },
      data: {
        name,
        description: description || '',
        price: price ? parseFloat(price) : null,
        originalPrice: originalPrice ? parseFloat(originalPrice) : null,
        startDate: new Date(startDate),
        endDate: new Date(endDate),
        isActive: isActive !== false,
        image: image || null
      }
    })

    // Find only the fields that actually changed
    const changes: Record<string, any> = {}
    const previousValues: Record<string, any> = {}
    
    if (existingSpecial.name !== name) {
      changes.name = name
      previousValues.name = existingSpecial.name
    }
    
    const newPrice = price ? parseFloat(price) : null
    if (existingSpecial.price !== newPrice) {
      changes.price = newPrice
      previousValues.price = existingSpecial.price
    }
    
    const newOriginalPrice = originalPrice ? parseFloat(originalPrice) : null
    if (existingSpecial.originalPrice !== newOriginalPrice) {
      changes.originalPrice = newOriginalPrice
      previousValues.originalPrice = existingSpecial.originalPrice
    }
    
    const newStartDate = new Date(startDate)
    if (existingSpecial.startDate.getTime() !== newStartDate.getTime()) {
      changes.startDate = newStartDate
      previousValues.startDate = existingSpecial.startDate
    }
    
    const newEndDate = new Date(endDate)
    if (existingSpecial.endDate.getTime() !== newEndDate.getTime()) {
      changes.endDate = newEndDate
      previousValues.endDate = existingSpecial.endDate
    }
    
    const newIsActive = isActive !== false
    if (existingSpecial.isActive !== newIsActive) {
      changes.isActive = newIsActive
      previousValues.isActive = existingSpecial.isActive
    }
    
    const newDescription = description || ''
    if (existingSpecial.description !== newDescription) {
      changes.description = newDescription
      previousValues.description = existingSpecial.description
    }
    
    const newImage = image || null
    if (existingSpecial.image !== newImage) {
      changes.image = newImage
      previousValues.image = existingSpecial.image
    }

    // Only log if there were actual changes
    if (Object.keys(changes).length > 0) {
      await logAuditEvent({
        action: 'UPDATE',
        resource: 'specials',
        resourceId: special.id,
        userId: session.user.id,
        changes,
        previousValues,
        metadata: { specialName: name }
      })
    }

    return NextResponse.json({ special })
  } catch (error) {
    console.error('Error updating special:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions)
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { id: specialId } = await params
    const existingSpecial = await prisma.special.findUnique({
      where: { id: specialId }
    })

    if (!existingSpecial) {
      return NextResponse.json({ error: 'Special not found' }, { status: 404 })
    }

    await prisma.special.delete({
      where: { id: specialId }
    })

    // Log the deletion
    await logAuditEvent({
      action: 'DELETE',
      resource: 'specials',
      resourceId: specialId,
      userId: session.user.id,
      changes: { 
        name: existingSpecial.name,
        price: existingSpecial.price,
        originalPrice: existingSpecial.originalPrice,
        startDate: existingSpecial.startDate,
        endDate: existingSpecial.endDate,
        deleted: true 
      },
      metadata: { 
        description: existingSpecial.description,
        wasActive: existingSpecial.isActive
      }
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error deleting special:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
