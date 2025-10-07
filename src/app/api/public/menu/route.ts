import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET() {
  try {
    // Get categories ordered by sortOrder
    const categories = await prisma.menuCategory.findMany({
      orderBy: { sortOrder: 'asc' }
    })

    // Get all available menu items ordered by category and sortOrder
    const items = await prisma.menuItem.findMany({
      where: { isAvailable: true },
      orderBy: [
        { category: 'asc' },
        { sortOrder: 'asc' }
      ]
    })

    // Group items by category
    const categoriesWithItems = categories.map(category => ({
      id: category.id,
      name: category.name,
      description: category.description,
      items: items
        .filter(item => item.category === category.name)
        .map(item => ({
          id: item.id,
          name: item.name,
          description: item.description,
          price: `$${item.price.toFixed(2)}`,
          category: item.category,
          isAvailable: item.isAvailable
        }))
    }))

    return NextResponse.json({ categories: categoriesWithItems })
  } catch (error) {
    console.error('Error fetching public menu:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

