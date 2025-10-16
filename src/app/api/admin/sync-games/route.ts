import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { logAuditEvent } from '@/lib/audit-log'
import { espnService } from '@/lib/espn-api'

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Get the site to check if home team is set
    const site = await prisma.site.findFirst({
      where: { slug: 'monaghans-bargrill' }
    })

    if (!site) {
      return NextResponse.json({ error: 'Site not found' }, { status: 404 })
    }

    if (!site.homeTeam) {
      return NextResponse.json({ 
        error: 'No home team selected', 
        message: 'Please select a home team in site settings first' 
      }, { status: 400 })
    }

    // Get Broncos games from ESPN
    const games = await espnService.getBroncosGames()
    
    if (!games || games.length === 0) {
      return NextResponse.json({ 
        error: 'No games found', 
        message: 'No games were found for the selected team' 
      }, { status: 404 })
    }

    // Get or create "Sports" event type
    let sportsEventType = await prisma.eventType.findFirst({
      where: { 
        siteId: site.id,
        name: 'Sports'
      }
    })

    if (!sportsEventType) {
      sportsEventType = await prisma.eventType.create({
        data: {
          siteId: site.id,
          name: 'Sports',
          description: 'Sports events and watch parties',
          icon: 'Sports',
          color: '#1f2937', // gray-800
          isActive: true
        }
      })
    }

    const syncedGames = []
    const skippedGames = []

    for (const game of games) {
      // Check if event already exists for this game
      const existingEvent = await prisma.event.findFirst({
        where: {
          siteId: site.id,
          name: {
            contains: game.opponent
          },
          startDate: {
            gte: new Date(game.date + 'T00:00:00'),
            lt: new Date(game.date + 'T23:59:59')
          }
        }
      })

      if (existingEvent) {
        skippedGames.push({
          game: `${game.opponent} (${game.date})`,
          reason: 'Event already exists'
        })
        continue
      }

      // Create event for the game
      const gameDate = new Date(game.date + 'T' + game.time)
      const eventTitle = `Broncos vs ${game.opponent}`
      const eventDescription = `Watch the Denver Broncos take on the ${game.opponent}${game.homeAway === 'home' ? ' at home' : ' on the road'}. Game starts at ${game.time}.`

      const event = await prisma.event.create({
        data: {
          siteId: site.id,
          eventTypeId: sportsEventType.id,
          name: eventTitle,
          description: eventDescription,
          startDate: gameDate,
          endDate: gameDate,
          startTime: game.time,
          endTime: '23:59', // Assume games end late
          location: game.homeAway === 'home' ? 'Monaghan\'s Bar & Grill' : 'Watch Party at Monaghan\'s',
          isActive: true
        }
      })

      syncedGames.push({
        game: `${game.opponent} (${game.date})`,
        eventId: event.id,
        eventTitle: eventTitle
      })
    }

    // Log the sync action
    await logAuditEvent({
      action: 'CREATE',
      resource: 'events_sync',
      resourceId: site.id,
      userId: session.user.id,
      changes: {
        syncedGames: syncedGames.length,
        skippedGames: skippedGames.length,
        homeTeam: site.homeTeam
      },
      metadata: { 
        description: `Synced ${syncedGames.length} games to events calendar`,
        games: syncedGames.map(g => g.game)
      }
    })

    return NextResponse.json({
      success: true,
      message: `Successfully synced ${syncedGames.length} games to events calendar`,
      syncedGames,
      skippedGames,
      totalGames: games.length
    })

  } catch (error) {
    console.error('Error syncing games to events:', error)
    return NextResponse.json({ 
      error: 'Internal server error',
      message: 'Failed to sync games to events calendar' 
    }, { status: 500 })
  }
}
