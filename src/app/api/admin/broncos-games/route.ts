// src/app/api/admin/broncos-games/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '../../../../lib/auth'
import { broncosGames2025, BroncosGame, mainDishOptions } from '../../../../lib/broncos-events'

// GET - Fetch all Broncos games
export async function GET() {
  try {
    return NextResponse.json({
      success: true,
      games: broncosGames2025,
      mainDishOptions
    })
  } catch (error) {
    console.error('Error fetching Broncos games:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to fetch Broncos games' },
      { status: 500 }
    )
  }
}

// PUT - Update Broncos game details
export async function PUT(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const { gameId, updates } = await request.json()
    
    if (!gameId || !updates) {
      return NextResponse.json(
        { success: false, error: 'Game ID and updates are required' },
        { status: 400 }
      )
    }

    // In a real implementation, you'd update the database
    // For now, we'll just validate the updates
    const validUpdates = ['mainDish', 'description', 'whatWeProvide']
    const filteredUpdates = Object.keys(updates)
      .filter(key => validUpdates.includes(key))
      .reduce((obj, key) => {
        obj[key] = updates[key]
        return obj
      }, {} as any)

    if (updates.mainDish && !mainDishOptions.includes(updates.mainDish)) {
      return NextResponse.json(
        { success: false, error: 'Invalid main dish option' },
        { status: 400 }
      )
    }

    // Find the game
    const gameIndex = broncosGames2025.findIndex(game => game.id === gameId)
    if (gameIndex === -1) {
      return NextResponse.json(
        { success: false, error: 'Game not found' },
        { status: 404 }
      )
    }

    // Update the game (in a real app, this would be a database update)
    const updatedGame = {
      ...broncosGames2025[gameIndex],
      ...filteredUpdates
    }

    return NextResponse.json({
      success: true,
      game: updatedGame,
      message: 'Game updated successfully'
    })
  } catch (error) {
    console.error('Error updating Broncos game:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to update Broncos game' },
      { status: 500 }
    )
  }
}
