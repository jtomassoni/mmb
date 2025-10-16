import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET() {
  try {
    // Get the first site (single-tenant)
    const site = await prisma.site.findFirst()
    
    if (!site) {
      return NextResponse.json({ specialDays: [] })
    }

    // Get special days that are today or in the future
    const today = new Date()
    today.setHours(0, 0, 0, 0)

    const specialDays = await prisma.specialDay.findMany({
      where: {
        siteId: site.id,
        date: {
          gte: today
        }
      },
      orderBy: {
        date: 'asc'
      }
    })

    // Ensure dates are serialized as ISO strings
    const serializedSpecialDays = specialDays.map(day => ({
      ...day,
      date: day.date.toISOString(),
      createdAt: day.createdAt.toISOString(),
      updatedAt: day.updatedAt.toISOString()
    }))

    return NextResponse.json({ specialDays: serializedSpecialDays })
  } catch (error) {
    console.error('Error fetching special days:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

