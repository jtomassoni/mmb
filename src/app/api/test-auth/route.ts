import { NextRequest, NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

export async function POST(request: NextRequest) {
  try {
    const { email, password } = await request.json()
    
    console.log('Test auth attempt:', { email, password })
    
    const user = await prisma.user.findUnique({
      where: { email }
    })
    
    console.log('User found:', user ? { email: user.email, password: user.password } : 'Not found')
    
    if (!user || password !== user.password) {
      return NextResponse.json({ success: false, error: 'Invalid credentials' }, { status: 401 })
    }
    
    return NextResponse.json({ 
      success: true, 
      user: { id: user.id, email: user.email, name: user.name, role: user.role }
    })
  } catch (error) {
    console.error('Test auth error:', error)
    return NextResponse.json({ success: false, error: error.message }, { status: 500 })
  } finally {
    await prisma.$disconnect()
  }
}
