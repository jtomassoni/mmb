import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '../../../lib/auth'
import { SPECIAL_DATES_API, SpecialDate, SpecialDateRule } from '../../../lib/special-dates'

// GET /api/special-dates - Get special dates for a date range
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const startDate = searchParams.get('startDate')
    const endDate = searchParams.get('endDate')

    if (!startDate || !endDate) {
      return NextResponse.json({ error: 'startDate and endDate are required' }, { status: 400 })
    }

    const specialDates = await SPECIAL_DATES_API.getSpecialDates(startDate, endDate)
    const rules = await SPECIAL_DATES_API.getSpecialDateRules()

    return NextResponse.json({
      specialDates,
      rules,
      count: specialDates.length
    })
  } catch (error) {
    console.error('Special dates API error:', error)
    return NextResponse.json({ 
      error: 'Failed to fetch special dates',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}

// POST /api/special-dates - Create a new special date
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Check if user has admin permissions
    if (!['SUPERADMIN', 'SITE_OWNER'].includes(session.user.role || '')) {
      return NextResponse.json({ error: 'Insufficient permissions' }, { status: 403 })
    }

    const body = await request.json()
    const { type, date, title, description, customHours, closureReason, isRecurring, recurringPattern } = body

    // Validate required fields
    if (!type || !date || !title) {
      return NextResponse.json({ error: 'type, date, and title are required' }, { status: 400 })
    }

    // Validate date format
    const dateRegex = /^\d{4}-\d{2}-\d{2}$/
    if (!dateRegex.test(date)) {
      return NextResponse.json({ error: 'date must be in YYYY-MM-DD format' }, { status: 400 })
    }

    // Validate custom hours format
    if (customHours) {
      const timeRegex = /^([01]?[0-9]|2[0-3]):[0-5][0-9]$/
      if (!timeRegex.test(customHours.open) || !timeRegex.test(customHours.close)) {
        return NextResponse.json({ error: 'customHours must be in HH:MM format' }, { status: 400 })
      }
    }

    const specialDate: Omit<SpecialDate, 'id' | 'createdAt' | 'updatedAt'> = {
      type,
      date,
      title,
      description,
      customHours,
      closureReason,
      isRecurring,
      recurringPattern
    }

    const createdSpecialDate = await SPECIAL_DATES_API.createSpecialDate(specialDate)

    return NextResponse.json({
      specialDate: createdSpecialDate,
      message: 'Special date created successfully'
    })
  } catch (error) {
    console.error('Create special date error:', error)
    return NextResponse.json({ 
      error: 'Failed to create special date',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}

// PUT /api/special-dates - Update an existing special date
export async function PUT(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Check if user has admin permissions
    if (!['SUPERADMIN', 'SITE_OWNER'].includes(session.user.role || '')) {
      return NextResponse.json({ error: 'Insufficient permissions' }, { status: 403 })
    }

    const body = await request.json()
    const { id, ...updates } = body

    if (!id) {
      return NextResponse.json({ error: 'id is required' }, { status: 400 })
    }

    const updatedSpecialDate = await SPECIAL_DATES_API.updateSpecialDate(id, updates)

    return NextResponse.json({
      specialDate: updatedSpecialDate,
      message: 'Special date updated successfully'
    })
  } catch (error) {
    console.error('Update special date error:', error)
    return NextResponse.json({ 
      error: 'Failed to update special date',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}

// DELETE /api/special-dates - Delete a special date
export async function DELETE(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Check if user has admin permissions
    if (!['SUPERADMIN', 'SITE_OWNER'].includes(session.user.role || '')) {
      return NextResponse.json({ error: 'Insufficient permissions' }, { status: 403 })
    }

    const { searchParams } = new URL(request.url)
    const id = searchParams.get('id')

    if (!id) {
      return NextResponse.json({ error: 'id is required' }, { status: 400 })
    }

    await SPECIAL_DATES_API.deleteSpecialDate(id)

    return NextResponse.json({
      message: 'Special date deleted successfully'
    })
  } catch (error) {
    console.error('Delete special date error:', error)
    return NextResponse.json({ 
      error: 'Failed to delete special date',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}
