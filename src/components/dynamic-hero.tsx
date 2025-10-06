'use client'

import { useState, useEffect } from 'react'
import { getBroncosGameToday } from '@/lib/broncos-schedule'
import { SpecialDatesService } from '../lib/special-dates'

interface Event {
  id: string
  title: string
  description: string
  time?: string
  type: 'food' | 'drink' | 'entertainment' | 'broncos' | 'special'
  priority: 'high' | 'medium' | 'low'
}

interface DailySnapshot {
  isOpen: boolean
  status: string
  nextOpenTime?: string
  foodSpecial: string
  drinkSpecial: string
  events: Event[]
  isSpecialDay: boolean
  specialDayInfo?: string
}

export function DynamicHero({ siteDescription, siteName }: { siteDescription?: string; siteName?: string }) {
  const [dailySnapshot, setDailySnapshot] = useState<DailySnapshot | null>(null)
  const [currentTime, setCurrentTime] = useState(new Date())

  const getTodaysStructuredEvents = (): Event[] => {
    const today = new Date()
    const dayOfWeek = today.getDay() // 0 = Sunday, 1 = Monday, etc.
    
    const events: Event[] = []
    
    // Monday - Poker Night
    if (dayOfWeek === 1) {
      events.push({
        id: 'monday-poker',
        title: 'Poker Night',
        description: 'Weekly tournament with cash prizes',
        time: '7:00 PM',
        type: 'entertainment',
        priority: 'high'
      })
    }
    
    // Tuesday - Taco Tuesday
    if (dayOfWeek === 2) {
      events.push({
        id: 'tuesday-tacos',
        title: 'Taco Tuesday',
        description: 'Beef $1.50, chicken/carnitas $2, fish $3',
        type: 'food',
        priority: 'high'
      })
    }
    
    // Wednesday - Whiskey Wednesday
    if (dayOfWeek === 3) {
      events.push({
        id: 'wednesday-whiskey',
        title: 'Whiskey Wednesday',
        description: '$1 off all whiskey drinks',
        type: 'drink',
        priority: 'medium'
      })
    }
    
    // Thursday - Thirsty Thursday
    if (dayOfWeek === 4) {
      events.push({
        id: 'thursday-tequila',
        title: 'Thirsty Thursday',
        description: '$1 off tequila + Philly cheesesteak',
        type: 'drink',
        priority: 'high'
      })
      events.push({
        id: 'thursday-bingo',
        title: 'Music Bingo',
        description: 'Cash prizes and great music',
        time: '8:00 PM',
        type: 'entertainment',
        priority: 'medium'
      })
    }
    
    // NFL Watch Parties (typically Thursday/Sunday)
    if (dayOfWeek === 4 || dayOfWeek === 0) {
      events.push({
        id: 'nfl-watch',
        title: 'NFL Watch Party',
        description: 'Join us for the game',
        type: 'entertainment',
        priority: 'low'
      })
    }
    
    // Karaoke (typically weekends)
    if (dayOfWeek === 5 || dayOfWeek === 6) {
      events.push({
        id: 'weekend-karaoke',
        title: 'Karaoke Night',
        description: 'Sing your heart out',
        time: '9:00 PM',
        type: 'entertainment',
        priority: 'medium'
      })
    }
    
    // Broncos Games - Check if there's a Broncos game today
    const broncosGameToday = getBroncosGameToday()
    if (broncosGameToday) {
      events.push({
        id: broncosGameToday.id,
        title: `Broncos vs ${broncosGameToday.opponent}`,
        description: broncosGameToday.description,
        time: broncosGameToday.time,
        type: 'broncos',
        priority: 'high'
      })
    }
    
    return events
  }

  // Calculate initial snapshot immediately
  const calculateDailySnapshot = (): DailySnapshot => {
    const now = new Date()
    const dayOfWeek = now.getDay() // 0 = Sunday, 1 = Monday, etc.
    
    // Use special dates service to get hours
    const hoursInfo = SpecialDatesService.calculateHoursForDate(now)
    const isOpen = SpecialDatesService.isCurrentlyOpen(now)

    // Daily food specials
    const foodSpecials = {
      0: "Sunday Funday - Open until sports games end",
      1: "Chimichangas Special - Crispy chimichangas with rice and beans",
      2: "Taco Tuesday - Beef $1.50, chicken/carnitas $2, fish $3",
      3: "Southwest Eggrolls - Crispy eggrolls with rice and beans",
      4: "Philly Cheesesteak - Classic Philly with peppers and onions",
      5: "Friday Night Specials - Check our menu",
      6: "Saturday Specials - Check our menu"
    }

    // Daily drink specials
    const drinkSpecials = {
      0: "Mexican Beer Specials - Dos Equis, Modelo, Pacifico, Corona $4",
      1: "BOGO first round during happy hour",
      2: "Mexican Beer Specials - Dos Equis, Modelo, Pacifico, Corona $4",
      3: "Whiskey Wednesday - $1 off all whiskey drinks",
      4: "Thirsty Thursday - $1 off all tequila drinks",
      5: "BOGO first round during happy hour",
      6: "BOGO first round during happy hour"
    }

    // Get structured events (exclude daily specials which are already shown above)
    const allEvents = getTodaysStructuredEvents()
    const events = allEvents.filter(event => 
      !event.title.toLowerCase().includes('thirsty thursday') &&
      !event.title.toLowerCase().includes('whiskey wednesday') &&
      !event.title.toLowerCase().includes('taco tuesday') &&
      !event.title.toLowerCase().includes('philly cheesesteak') &&
      !event.title.toLowerCase().includes('chimichangas') &&
      !event.title.toLowerCase().includes('southwest eggrolls')
    )

    let status = isOpen ? "We're Open!" : "We're Closed"
    let nextOpenTime = ""

    if (!isOpen) {
      // Calculate next opening time
      const tomorrow = new Date(now)
      tomorrow.setDate(tomorrow.getDate() + 1)
      const tomorrowHours = SpecialDatesService.calculateHoursForDate(tomorrow)
      
      if (tomorrowHours.open !== '00:00') {
        nextOpenTime = SpecialDatesService.formatTime(tomorrowHours.open)
      }
    }

    return {
      isOpen,
      status,
      nextOpenTime,
      foodSpecial: foodSpecials[dayOfWeek as keyof typeof foodSpecials],
      drinkSpecial: drinkSpecials[dayOfWeek as keyof typeof drinkSpecials],
      events,
      isSpecialDay: hoursInfo.isSpecial,
      specialDayInfo: hoursInfo.isSpecial ? `Special hours: ${SpecialDatesService.formatTime(hoursInfo.open)} - ${SpecialDatesService.formatTime(hoursInfo.close)}` : undefined
    }
  }

  // Initialize with immediate calculation
  const initialSnapshot = calculateDailySnapshot()

  useEffect(() => {
    // Update time every minute
    const timer = setInterval(() => {
      setCurrentTime(new Date())
    }, 60000)

    setDailySnapshot(initialSnapshot)

    return () => clearInterval(timer)
  }, [])

  // Use initial snapshot if state hasn't been set yet
  const snapshot = dailySnapshot || initialSnapshot

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'food': return 'Food'
      case 'drink': return 'Drink'
      case 'entertainment': return 'Entertainment'
      case 'broncos': return 'Sports'
      case 'special': return 'Special'
      default: return 'Event'
    }
  }

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'food': return 'text-orange-400'
      case 'drink': return 'text-green-400'
      case 'entertainment': return 'text-purple-400'
      case 'broncos': return 'text-blue-400'
      case 'special': return 'text-yellow-400'
      default: return 'text-gray-400'
    }
  }

  return (
    <section className="relative min-h-screen flex flex-col overflow-hidden">
      {/* Background Image */}
      <div className="absolute inset-0 z-0">
        <img
          src="/pics/monaghans-beer-and-shot.jpg"
          alt="Monaghan's Bar & Grill - Beer and Shot"
          className="w-full h-full object-cover object-center"
        />
        <div className="absolute inset-0 bg-black/60 backdrop-blur-sm"></div>
      </div>

      {/* Spacer for header */}
      <div className="relative z-20 h-16"></div>

      {/* Main Content */}
      <div className="relative z-10 flex-1 flex items-center">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
            
            {/* Left Side - Brand & Status */}
            <div className="text-white space-y-10">
              <div>
                <h1 className="text-7xl lg:text-8xl font-black mb-8 leading-none tracking-tight font-display">
                  <span className="block font-light">{siteName?.split(' ')[0] || "Monaghan's"}</span>
                  <span className="block text-green-400 font-black">{siteName?.split(' ').slice(1).join(' ') || "BAR & GRILL"}</span>
                </h1>
                <p className="text-xl text-gray-300 font-light tracking-wide font-sans">{siteDescription || "Where Denver comes to eat, drink, and play"}</p>
              </div>

              {/* Special Day Notice */}
              {snapshot.isSpecialDay && snapshot.specialDayInfo && (
                <div className="bg-yellow-500/20 backdrop-blur-sm rounded-lg p-4 border border-yellow-400/30">
                  <p className="text-yellow-100 font-medium">Special Hours Today</p>
                  <p className="text-yellow-100 text-sm">{snapshot.specialDayInfo}</p>
                </div>
              )}

              {/* Quick Actions */}
              <div className="flex gap-4">
                <a 
                  href="/menu" 
                  className="bg-green-600 text-white px-8 py-4 rounded-lg font-semibold hover:bg-green-700 hover:shadow-2xl hover:shadow-green-500/30 transition-all duration-300 hover:brightness-110"
                >
                  View Menu
                </a>
              </div>
            </div>

            {/* Right Side - Daily Info Card */}
            <div className="bg-white/5 backdrop-blur-sm rounded-lg p-6 border border-white/10 hover:bg-white/10 hover:border-white/20 hover:shadow-lg hover:shadow-white/5 transition-all duration-300">
              
              {/* Status */}
              <div className="flex items-center mb-4 pb-4 border-b border-white/20">
                <div className={`w-3 h-3 rounded-full mr-3 ${snapshot.isOpen ? 'bg-green-400' : 'bg-red-400'}`}></div>
                <h3 className="text-lg font-semibold text-white">
                  {snapshot.status}
                  {!snapshot.isOpen && snapshot.nextOpenTime && (
                    <span className="ml-2 text-gray-300 text-sm">• Opens {snapshot.nextOpenTime}</span>
                  )}
                </h3>
              </div>

              <div className="space-y-3">
                <div>
                  <h4 className="text-sm font-medium text-white/90 mb-1">Food Special</h4>
                  <p className="text-white text-sm">{snapshot.foodSpecial}</p>
                </div>

                <div>
                  <h4 className="text-sm font-medium text-white/90 mb-1">Drink Special</h4>
                  <p className="text-white text-sm">{snapshot.drinkSpecial}</p>
                </div>

                <div>
                  <h4 className="text-sm font-medium text-white/90 mb-1">Happy Hour</h4>
                  <p className="text-white text-sm">10am-12pm & 3pm-7pm daily</p>
                </div>

                {snapshot.events.length > 0 && (
                  <div>
                    <h4 className="text-sm font-medium text-white/90 mb-2">Events Today</h4>
                    <div className="space-y-1">
                      {snapshot.events.map((event, index) => (
                        <div key={index} className="flex items-center text-sm text-gray-300">
                          <span className="text-xs text-gray-400 mr-2">{getTypeIcon(event.type)}</span>
                          <span className="flex-1">{event.title}</span>
                          {event.time && (
                            <span className="text-xs text-gray-400 ml-2">{event.time}</span>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}