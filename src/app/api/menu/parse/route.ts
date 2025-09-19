import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '../../../../lib/auth'
import { prisma } from '../../../../lib/prisma'
import { extractTextFromImage, parseMenuFromOCR, validateMenu, ParsedMenu } from '../../../../lib/menu-parser'

export async function POST(request: NextRequest) {
  const session = await getServerSession(authOptions)
  
  if (!session?.user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const formData = await request.formData()
    const file = formData.get('file') as File
    const siteId = formData.get('siteId') as string

    if (!file) {
      return NextResponse.json({ error: 'No file provided' }, { status: 400 })
    }

    if (!siteId) {
      return NextResponse.json({ error: 'No site ID provided' }, { status: 400 })
    }

    // Verify user has access to this site
    const membership = await prisma.membership.findFirst({
      where: {
        userId: session.user.id,
        siteId: siteId
      }
    })

    if (!membership && session.user.role !== 'SUPERADMIN') {
      return NextResponse.json({ error: 'Access denied to this site' }, { status: 403 })
    }

    // Get site information
    const site = await prisma.site.findUnique({
      where: { id: siteId }
    })

    if (!site) {
      return NextResponse.json({ error: 'Site not found' }, { status: 404 })
    }

    // Convert file to buffer
    const buffer = Buffer.from(await file.arrayBuffer())
    
    // Extract text using OCR
    const ocrResult = await extractTextFromImage(buffer)
    
    // Parse menu from OCR result
    const parsedMenu = parseMenuFromOCR(ocrResult, site.name)
    
    // Validate parsed menu
    const validation = validateMenu(parsedMenu)
    
    if (!validation.isValid) {
      return NextResponse.json({
        error: 'Menu parsing failed',
        details: validation.errors,
        parsedMenu // Return partial results for debugging
      }, { status: 400 })
    }

    // Create menu items in database
    const createdItems = []
    
    for (const section of parsedMenu.sections) {
      for (const item of section.items) {
        const menuItem = await prisma.menuItem.create({
          data: {
            siteId: siteId,
            name: item.name,
            description: item.description || null,
            price: item.price,
            category: section.name,
            isAvailable: item.isAvailable,
            allergens: item.allergens || [],
            calories: item.calories || null,
            imageUrl: item.imageUrl || null,
            source: 'ocr'
          }
        })
        createdItems.push(menuItem)
      }
    }

    // Create audit log
    await prisma.auditLog.create({
      data: {
        userId: session.user.id,
        siteId: siteId,
        action: 'PARSE_MENU',
        details: JSON.stringify({
          fileName: file.name,
          fileSize: file.size,
          fileType: file.type,
          itemsCreated: createdItems.length,
          sections: parsedMenu.sections.length,
          confidence: ocrResult.confidence
        })
      }
    })

    return NextResponse.json({
      success: true,
      parsedMenu,
      createdItems: createdItems.length,
      message: `Successfully parsed ${createdItems.length} menu items from ${parsedMenu.sections.length} sections`
    })

  } catch (error) {
    console.error('Error parsing menu:', error)
    return NextResponse.json({ error: 'Failed to parse menu' }, { status: 500 })
  }
}

export async function GET(request: NextRequest) {
  const session = await getServerSession(authOptions)
  
  if (!session?.user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const { searchParams } = new URL(request.url)
    const siteId = searchParams.get('siteId')

    if (!siteId) {
      return NextResponse.json({ error: 'Site ID required' }, { status: 400 })
    }

    // Verify user has access to this site
    const membership = await prisma.membership.findFirst({
      where: {
        userId: session.user.id,
        siteId: siteId
      }
    })

    if (!membership && session.user.role !== 'SUPERADMIN') {
      return NextResponse.json({ error: 'Access denied to this site' }, { status: 403 })
    }

    // Get menu items for the site
    const menuItems = await prisma.menuItem.findMany({
      where: { siteId: siteId },
      orderBy: [
        { category: 'asc' },
        { name: 'asc' }
      ]
    })

    // Group by category
    const sections = menuItems.reduce((acc, item) => {
      if (!acc[item.category]) {
        acc[item.category] = []
      }
      acc[item.category].push(item)
      return acc
    }, {} as Record<string, any[]>)

    return NextResponse.json({
      sections,
      totalItems: menuItems.length,
      categories: Object.keys(sections)
    })

  } catch (error) {
    console.error('Error fetching menu:', error)
    return NextResponse.json({ error: 'Failed to fetch menu' }, { status: 500 })
  }
}
