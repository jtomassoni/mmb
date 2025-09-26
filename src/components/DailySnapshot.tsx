'use client'

import { useState, useEffect } from 'react'
import Image from 'next/image'

// Data Types
type Special = { 
  title: string
  desc?: string
  price?: string
  imageUrl?: string
  icon?: string
}

type EventItem = { 
  title: string
  type?: "Entertainment" | "Sport" | "Other"
  time?: string
}

type DayPlan = { 
  foodSpecial?: Special
  drinkSpecial?: Special
  events?: EventItem[]
}

type SnapshotData = {
  isOpen: boolean
  openHeadline?: string
  foodSpecial?: Special
  drinkSpecial?: Special
  happyHour?: { windows: string[] }
  eventsToday?: EventItem[]
  week?: Record<"Mon" | "Tue" | "Wed" | "Thu" | "Fri" | "Sat" | "Sun", DayPlan>
  cta?: { label: string; href: string }
}

type DailySnapshotProps = {
  variant: "stickyMarquee" | "heroSpecial" | "todayTimeline" | "tabbedWeek"
  data: SnapshotData
}

// Utility Functions
const parseTime = (timeStr: string): Date => {
  const now = new Date()
  const [time, period] = timeStr.split(' ')
  const [hours, minutes] = time.split(':').map(Number)
  
  const date = new Date(now)
  date.setHours(period === 'PM' && hours !== 12 ? hours + 12 : hours, minutes, 0, 0)
  
  return date
}

const getStatus = (now: Date, start: Date): "Upcoming" | "Live" | "Done" => {
  const end = new Date(start.getTime() + 3 * 60 * 60 * 1000) // 3 hours duration
  
  if (now < start) return "Upcoming"
  if (now >= start && now <= end) return "Live"
  return "Done"
}

const getEventIcon = (type?: string): string => {
  switch (type) {
    case "Entertainment": return "🎵"
    case "Sport": return "🏈"
    default: return "📅"
  }
}

const getCurrentTime = (): string => {
  return new Date().toLocaleTimeString('en-US', { 
    hour: 'numeric', 
    minute: '2-digit',
    hour12: true 
  })
}

// Sticky Marquee Variant
function StickyMarquee({ data }: { data: SnapshotData }) {
  const [isVisible, setIsVisible] = useState(true)
  
  useEffect(() => {
    const stored = sessionStorage.getItem('marquee-closed')
    if (stored === 'true') {
      setIsVisible(false)
    }
  }, [])

  const handleClose = () => {
    setIsVisible(false)
    sessionStorage.setItem('marquee-closed', 'true')
  }

  if (!isVisible) return null

  const headlineDeal = data.foodSpecial || data.drinkSpecial

  return (
    <div className="sticky top-0 z-50 bg-emerald-500 text-black py-2 px-4">
      <div className="max-w-7xl mx-auto flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="font-semibold">Today's Deal:</span>
          <span>{headlineDeal?.title}</span>
          {headlineDeal?.price && <span className="font-bold">{headlineDeal.price}</span>}
        </div>
        <button
          onClick={handleClose}
          className="text-black/70 hover:text-black transition-colors"
          aria-label="Close marquee"
        >
          <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
            <path d="M6 6l8 8M14 6l-8 8" />
          </svg>
        </button>
      </div>
    </div>
  )
}

// Hero Special Variant
function HeroSpecial({ data }: { data: SnapshotData }) {
  return (
    <section className="py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        <h2 className="text-3xl font-bold text-gray-900 mb-8 text-center">Today at Monaghan's</h2>
        
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Main Special Card */}
          <div className="bg-white/8 backdrop-blur-md rounded-2xl ring-1 ring-white/10 shadow-lg overflow-hidden">
            {data.foodSpecial?.imageUrl ? (
              <div className="relative h-48">
                <Image
                  src={data.foodSpecial.imageUrl}
                  alt={data.foodSpecial.title}
                  fill
                  className="object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
              </div>
            ) : (
              <div className="h-48 bg-gradient-to-br from-emerald-500 to-emerald-600 flex items-center justify-center">
                <span className="text-6xl">{data.foodSpecial?.icon || "🍽️"}</span>
              </div>
            )}
            
            <div className="p-6">
              <h3 className="text-xl font-semibold text-white mb-2">{data.foodSpecial?.title}</h3>
              <p className="text-white/80 mb-3">{data.foodSpecial?.desc}</p>
              {data.foodSpecial?.price && (
                <span className="inline-block bg-emerald-500 text-black px-3 py-1 rounded-full text-sm font-semibold">
                  {data.foodSpecial.price}
                </span>
              )}
            </div>
          </div>

          {/* Side Grid */}
          <div className="space-y-4">
            {/* Happy Hour */}
            <div className="bg-white/8 backdrop-blur-md rounded-2xl ring-1 ring-white/10 shadow-lg p-6">
              <h3 className="text-lg font-semibold text-white mb-3 flex items-center gap-2">
                <span className="text-amber-400">🍺</span>
                Happy Hour
              </h3>
              <div className="space-y-2">
                {data.happyHour?.windows.map((window, index) => (
                  <div key={index} className="text-white/80 text-sm">{window}</div>
                ))}
              </div>
            </div>

            {/* Quick Facts */}
            <div className="bg-white/8 backdrop-blur-md rounded-2xl ring-1 ring-white/10 shadow-lg p-6">
              <h3 className="text-lg font-semibold text-white mb-3">Quick Facts</h3>
              <div className="space-y-2 text-sm text-white/80">
                <div>📍 3889 S King St, Denver, CO</div>
                <div>📞 (303) 555-0123</div>
                <div>🕒 Open until 2 AM</div>
              </div>
            </div>

            {/* CTA */}
            {data.cta && (
              <div className="bg-white/8 backdrop-blur-md rounded-2xl ring-1 ring-white/10 shadow-lg p-6">
                <a
                  href={data.cta.href}
                  className="block w-full bg-emerald-500 hover:bg-emerald-400 text-black font-semibold py-3 px-6 rounded-lg text-center transition-colors"
                >
                  {data.cta.label}
                </a>
              </div>
            )}
          </div>
        </div>

        {/* Timestamp */}
        <div className="text-right mt-4">
          <span className="text-xs text-gray-500 font-mono">as of {getCurrentTime()}</span>
        </div>
      </div>
    </section>
  )
}

// Today Timeline Variant
function TodayTimeline({ data }: { data: SnapshotData }) {
  const [currentTime, setCurrentTime] = useState(new Date())

  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 60000)
    return () => clearInterval(timer)
  }, [])

  const allItems = [
    ...(data.foodSpecial ? [{ ...data.foodSpecial, type: "Food" as const }] : []),
    ...(data.drinkSpecial ? [{ ...data.drinkSpecial, type: "Drink" as const }] : []),
    ...(data.eventsToday || [])
  ]

  return (
    <section className="py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        <h2 className="text-2xl font-bold text-gray-900 mb-6">Today's Timeline</h2>
        
        <div className="overflow-x-auto snap-x snap-mandatory">
          <div className="flex gap-4 pb-4" style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}>
            {allItems.map((item, index) => {
              const startTime = item.time ? parseTime(item.time) : null
              const status = startTime ? getStatus(currentTime, startTime) : "Upcoming"
              
              return (
                <div
                  key={index}
                  className="flex-shrink-0 snap-start bg-white rounded-xl shadow-lg p-4 min-w-[200px] border-l-4 border-emerald-400"
                >
                  <div className="flex items-center gap-2 mb-2">
                    <span className="text-lg">{getEventIcon(item.type)}</span>
                    <span className={`text-xs px-2 py-1 rounded-full font-medium ${
                      status === "Live" ? "bg-red-500 text-white" :
                      status === "Upcoming" ? "bg-emerald-500 text-white" :
                      "bg-gray-500 text-white"
                    }`}>
                      {status}
                    </span>
                  </div>
                  
                  <h3 className="font-semibold text-gray-900 mb-1">{item.title}</h3>
                  <p className="text-sm text-gray-600 mb-2">{item.desc}</p>
                  
                  {item.time && (
                    <div className="text-sm text-gray-500">{item.time}</div>
                  )}
                  
                  {item.price && (
                    <div className="text-sm font-semibold text-emerald-600">{item.price}</div>
                  )}
                </div>
              )
            })}
          </div>
        </div>

        {/* Timestamp */}
        <div className="text-right mt-4">
          <span className="text-xs text-gray-500 font-mono">as of {getCurrentTime()}</span>
        </div>
      </div>
    </section>
  )
}

// Tabbed Week Variant
function TabbedWeek({ data }: { data: SnapshotData }) {
  const [activeTab, setActiveTab] = useState<string>("")
  
  useEffect(() => {
    // Set today as default
    const today = new Date().toLocaleDateString('en-US', { weekday: 'short' })
    const stored = sessionStorage.getItem('last-tab')
    setActiveTab(stored || today)
  }, [])

  const handleTabChange = (tab: string) => {
    setActiveTab(tab)
    sessionStorage.setItem('last-tab', tab)
  }

  const days = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"] as const

  return (
    <section className="py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        <h2 className="text-2xl font-bold text-gray-900 mb-6">This Week at Monaghan's</h2>
        
        {/* Tabs */}
        <div className="flex gap-2 mb-6 overflow-x-auto">
          {days.map((day) => (
            <button
              key={day}
              onClick={() => handleTabChange(day)}
              className={`flex-shrink-0 px-4 py-2 rounded-lg font-medium transition-colors ${
                activeTab === day
                  ? "bg-emerald-500 text-white"
                  : "bg-gray-100 text-gray-700 hover:bg-gray-200"
              }`}
            >
              {day}
            </button>
          ))}
        </div>

        {/* Tab Content */}
        {activeTab && data.week?.[activeTab] && (
          <div className="bg-white rounded-2xl shadow-lg p-6">
            <h3 className="text-xl font-semibold text-gray-900 mb-4">{activeTab}day Specials</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Food Special */}
              {data.week[activeTab].foodSpecial && (
                <div className="bg-gray-50 rounded-xl p-4">
                  <h4 className="font-semibold text-gray-900 mb-2">Food Special</h4>
                  <div className="text-gray-700">
                    <div className="font-medium">{data.week[activeTab].foodSpecial?.title}</div>
                    {data.week[activeTab].foodSpecial?.desc && (
                      <div className="text-sm mt-1">{data.week[activeTab].foodSpecial?.desc}</div>
                    )}
                    {data.week[activeTab].foodSpecial?.price && (
                      <div className="text-emerald-600 font-semibold mt-1">{data.week[activeTab].foodSpecial?.price}</div>
                    )}
                  </div>
                </div>
              )}

              {/* Drink Special */}
              {data.week[activeTab].drinkSpecial && (
                <div className="bg-gray-50 rounded-xl p-4">
                  <h4 className="font-semibold text-gray-900 mb-2">Drink Special</h4>
                  <div className="text-gray-700">
                    <div className="font-medium">{data.week[activeTab].drinkSpecial?.title}</div>
                    {data.week[activeTab].drinkSpecial?.desc && (
                      <div className="text-sm mt-1">{data.week[activeTab].drinkSpecial?.desc}</div>
                    )}
                    {data.week[activeTab].drinkSpecial?.price && (
                      <div className="text-emerald-600 font-semibold mt-1">{data.week[activeTab].drinkSpecial?.price}</div>
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* Events */}
            {data.week[activeTab].events && data.week[activeTab].events!.length > 0 && (
              <div className="mt-6">
                <h4 className="font-semibold text-gray-900 mb-3">Events</h4>
                <div className="space-y-2">
                  {data.week[activeTab].events!.map((event, index) => (
                    <div key={index} className="flex items-center gap-3 bg-gray-50 rounded-lg p-3">
                      <span className="text-lg">{getEventIcon(event.type)}</span>
                      <div className="flex-1">
                        <div className="font-medium text-gray-900">{event.title}</div>
                        {event.time && <div className="text-sm text-gray-600">{event.time}</div>}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* Timestamp */}
        <div className="text-right mt-4">
          <span className="text-xs text-gray-500 font-mono">as of {getCurrentTime()}</span>
        </div>
      </div>
    </section>
  )
}

// Main Component
export function DailySnapshot({ variant, data }: DailySnapshotProps) {
  switch (variant) {
    case "stickyMarquee":
      return <StickyMarquee data={data} />
    case "heroSpecial":
      return <HeroSpecial data={data} />
    case "todayTimeline":
      return <TodayTimeline data={data} />
    case "tabbedWeek":
      return <TabbedWeek data={data} />
    default:
      return null
  }
}
