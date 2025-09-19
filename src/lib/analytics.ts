// src/lib/analytics.ts
import { prisma } from './prisma'
import crypto from 'crypto'

export interface AnalyticsEventData {
  eventType: 'pageview' | 'click' | 'cta_click' | 'special_view' | 'menu_view' | 'event_view' | 'custom'
  eventName: string
  page: string
  element?: string
  elementId?: string
  elementText?: string
  url: string
  referrer?: string
  userAgent?: string
  ipAddress?: string
  sessionId?: string
  userId?: string
  metadata?: Record<string, any>
}

export interface AnalyticsSummary {
  siteId: string
  date: Date
  period: 'daily' | 'weekly' | 'monthly'
  pageviews: number
  uniqueVisitors: number
  sessions: number
  avgSessionDuration: number
  ctaClicks: number
  specialViews: number
  menuViews: number
  eventViews: number
  topPages: Array<{ page: string; views: number }>
  topSpecials: Array<{ specialId: string; views: number }>
  topEvents: Array<{ eventId: string; views: number }>
  deviceTypes: Array<{ type: string; count: number }>
  browsers: Array<{ browser: string; count: number }>
}

export class AnalyticsService {
  /**
   * Track an analytics event
   */
  static async trackEvent(siteId: string, eventData: AnalyticsEventData): Promise<void> {
    try {
      // Privacy and bot filtering
      if (eventData.userAgent && this.isBot(eventData.userAgent)) {
        console.log('Bot detected, skipping analytics event:', eventData.userAgent)
        return
      }
      
      if (eventData.ipAddress && this.isKnownBotIp(eventData.ipAddress)) {
        console.log('Known bot IP detected, skipping analytics event:', eventData.ipAddress)
        return
      }
      
      if (eventData.ipAddress && eventData.userAgent) {
        const isSuspicious = await this.isSuspiciousRequest(
          siteId,
          eventData.ipAddress,
          eventData.userAgent,
          eventData.sessionId
        )
        
        if (isSuspicious) {
          console.log('Suspicious request detected, skipping analytics event')
          return
        }
      }
      
      // Hash IP address for privacy
      const hashedIp = eventData.ipAddress ? this.hashIp(eventData.ipAddress) : null
      
      // Parse user agent for device/browser info
      const userAgentInfo = eventData.userAgent ? this.parseUserAgent(eventData.userAgent) : null
      
      await prisma.analyticsEvent.create({
        data: {
          siteId,
          eventType: eventData.eventType,
          eventName: eventData.eventName,
          page: eventData.page,
          element: eventData.element,
          elementId: eventData.elementId,
          elementText: eventData.elementText,
          url: eventData.url,
          referrer: eventData.referrer,
          userAgent: eventData.userAgent,
          ipAddress: hashedIp,
          sessionId: eventData.sessionId,
          userId: eventData.userId,
          metadata: eventData.metadata ? JSON.stringify(eventData.metadata) : null
        }
      })
    } catch (error) {
      console.error('Failed to track analytics event:', error)
      // Don't throw - analytics failures shouldn't break the app
    }
  }

  /**
   * Track a pageview
   */
  static async trackPageview(
    siteId: string,
    page: string,
    url: string,
    userAgent?: string,
    ipAddress?: string,
    sessionId?: string,
    userId?: string,
    referrer?: string
  ): Promise<void> {
    await this.trackEvent(siteId, {
      eventType: 'pageview',
      eventName: 'page_view',
      page,
      url,
      userAgent,
      ipAddress,
      sessionId,
      userId,
      referrer
    })
  }

  /**
   * Track a CTA click
   */
  static async trackCtaClick(
    siteId: string,
    ctaName: string,
    page: string,
    url: string,
    element?: string,
    elementId?: string,
    elementText?: string,
    userAgent?: string,
    ipAddress?: string,
    sessionId?: string,
    userId?: string
  ): Promise<void> {
    await this.trackEvent(siteId, {
      eventType: 'cta_click',
      eventName: ctaName,
      page,
      element,
      elementId,
      elementText,
      url,
      userAgent,
      ipAddress,
      sessionId,
      userId
    })
  }

  /**
   * Track a special view
   */
  static async trackSpecialView(
    siteId: string,
    specialId: string,
    specialName: string,
    page: string,
    url: string,
    userAgent?: string,
    ipAddress?: string,
    sessionId?: string,
    userId?: string
  ): Promise<void> {
    await this.trackEvent(siteId, {
      eventType: 'special_view',
      eventName: `special_${specialId}`,
      page,
      url,
      userAgent,
      ipAddress,
      sessionId,
      userId,
      metadata: { specialId, specialName }
    })
  }

  /**
   * Track a menu view
   */
  static async trackMenuView(
    siteId: string,
    menuCategory: string,
    page: string,
    url: string,
    userAgent?: string,
    ipAddress?: string,
    sessionId?: string,
    userId?: string
  ): Promise<void> {
    await this.trackEvent(siteId, {
      eventType: 'menu_view',
      eventName: `menu_${menuCategory}`,
      page,
      url,
      userAgent,
      ipAddress,
      sessionId,
      userId,
      metadata: { menuCategory }
    })
  }

  /**
   * Track an event view
   */
  static async trackEventView(
    siteId: string,
    eventId: string,
    eventName: string,
    page: string,
    url: string,
    userAgent?: string,
    ipAddress?: string,
    sessionId?: string,
    userId?: string
  ): Promise<void> {
    await this.trackEvent(siteId, {
      eventType: 'event_view',
      eventName: `event_${eventId}`,
      page,
      url,
      userAgent,
      ipAddress,
      sessionId,
      userId,
      metadata: { eventId, eventName }
    })
  }

  /**
   * Get analytics data for a site
   */
  static async getAnalytics(
    siteId: string,
    startDate: Date,
    endDate: Date,
    period: 'daily' | 'weekly' | 'monthly' = 'daily'
  ): Promise<AnalyticsSummary[]> {
    const summaries = await prisma.analyticsSummary.findMany({
      where: {
        siteId,
        date: {
          gte: startDate,
          lte: endDate
        },
        period
      },
      orderBy: {
        date: 'asc'
      }
    })

    return summaries.map(summary => ({
      siteId: summary.siteId,
      date: summary.date,
      period: summary.period as 'daily' | 'weekly' | 'monthly',
      pageviews: summary.pageviews,
      uniqueVisitors: summary.uniqueVisitors,
      sessions: summary.sessions,
      avgSessionDuration: summary.avgSessionDuration,
      ctaClicks: summary.ctaClicks,
      specialViews: summary.specialViews,
      menuViews: summary.menuViews,
      eventViews: summary.eventViews,
      topPages: JSON.parse(summary.topPages),
      topSpecials: JSON.parse(summary.topSpecials),
      topEvents: JSON.parse(summary.topEvents),
      deviceTypes: JSON.parse(summary.deviceTypes),
      browsers: JSON.parse(summary.browsers)
    }))
  }

  /**
   * Get real-time analytics data
   */
  static async getRealtimeAnalytics(siteId: string, hours: number = 24): Promise<{
    pageviews: number
    uniqueVisitors: number
    topPages: Array<{ page: string; views: number }>
    topSpecials: Array<{ specialId: string; views: number }>
    topEvents: Array<{ eventId: string; views: number }>
  }> {
    const startTime = new Date(Date.now() - hours * 60 * 60 * 1000)

    const events = await prisma.analyticsEvent.findMany({
      where: {
        siteId,
        timestamp: {
          gte: startTime
        }
      }
    })

    // Count pageviews
    const pageviews = events.filter(e => e.eventType === 'pageview').length

    // Count unique visitors (by sessionId)
    const uniqueVisitors = new Set(
      events
        .filter(e => e.sessionId)
        .map(e => e.sessionId)
    ).size

    // Top pages
    const pageViews = events.filter(e => e.eventType === 'pageview')
    const pageCounts = pageViews.reduce((acc, event) => {
      acc[event.page] = (acc[event.page] || 0) + 1
      return acc
    }, {} as Record<string, number>)
    const topPages = Object.entries(pageCounts)
      .map(([page, views]) => ({ page, views }))
      .sort((a, b) => b.views - a.views)
      .slice(0, 10)

    // Top specials
    const specialViews = events.filter(e => e.eventType === 'special_view')
    const specialCounts = specialViews.reduce((acc, event) => {
      const metadata = event.metadata ? JSON.parse(event.metadata) : {}
      const specialId = metadata.specialId || 'unknown'
      acc[specialId] = (acc[specialId] || 0) + 1
      return acc
    }, {} as Record<string, number>)
    const topSpecials = Object.entries(specialCounts)
      .map(([specialId, views]) => ({ specialId, views }))
      .sort((a, b) => b.views - a.views)
      .slice(0, 10)

    // Top events
    const eventViews = events.filter(e => e.eventType === 'event_view')
    const eventCounts = eventViews.reduce((acc, event) => {
      const metadata = event.metadata ? JSON.parse(event.metadata) : {}
      const eventId = metadata.eventId || 'unknown'
      acc[eventId] = (acc[eventId] || 0) + 1
      return acc
    }, {} as Record<string, number>)
    const topEvents = Object.entries(eventCounts)
      .map(([eventId, views]) => ({ eventId, views }))
      .sort((a, b) => b.views - a.views)
      .slice(0, 10)

    return {
      pageviews,
      uniqueVisitors,
      topPages,
      topSpecials,
      topEvents
    }
  }

  /**
   * Generate daily analytics summary
   */
  static async generateDailySummary(siteId: string, date: Date): Promise<void> {
    const startOfDay = new Date(date)
    startOfDay.setHours(0, 0, 0, 0)
    
    const endOfDay = new Date(date)
    endOfDay.setHours(23, 59, 59, 999)

    const events = await prisma.analyticsEvent.findMany({
      where: {
        siteId,
        timestamp: {
          gte: startOfDay,
          lte: endOfDay
        }
      }
    })

    // Calculate metrics
    const pageviews = events.filter(e => e.eventType === 'pageview').length
    const uniqueVisitors = new Set(events.filter(e => e.sessionId).map(e => e.sessionId)).size
    const sessions = new Set(events.filter(e => e.sessionId).map(e => e.sessionId)).size
    const ctaClicks = events.filter(e => e.eventType === 'cta_click').length
    const specialViews = events.filter(e => e.eventType === 'special_view').length
    const menuViews = events.filter(e => e.eventType === 'menu_view').length
    const eventViews = events.filter(e => e.eventType === 'event_view').length

    // Calculate session duration (simplified)
    const sessionDurations = new Map<string, { start: Date; end: Date }>()
    events.forEach(event => {
      if (event.sessionId) {
        if (!sessionDurations.has(event.sessionId)) {
          sessionDurations.set(event.sessionId, { start: event.timestamp, end: event.timestamp })
        } else {
          const session = sessionDurations.get(event.sessionId)!
          if (event.timestamp < session.start) session.start = event.timestamp
          if (event.timestamp > session.end) session.end = event.timestamp
        }
      }
    })
    
    const avgSessionDuration = Array.from(sessionDurations.values())
      .reduce((sum, session) => sum + (session.end.getTime() - session.start.getTime()) / 1000, 0) / sessions || 0

    // Top pages
    const pageCounts = events
      .filter(e => e.eventType === 'pageview')
      .reduce((acc, event) => {
        acc[event.page] = (acc[event.page] || 0) + 1
        return acc
      }, {} as Record<string, number>)
    const topPages = Object.entries(pageCounts)
      .map(([page, views]) => ({ page, views }))
      .sort((a, b) => b.views - a.views)
      .slice(0, 10)

    // Top specials
    const specialCounts = events
      .filter(e => e.eventType === 'special_view')
      .reduce((acc, event) => {
        const metadata = event.metadata ? JSON.parse(event.metadata) : {}
        const specialId = metadata.specialId || 'unknown'
        acc[specialId] = (acc[specialId] || 0) + 1
        return acc
      }, {} as Record<string, number>)
    const topSpecials = Object.entries(specialCounts)
      .map(([specialId, views]) => ({ specialId, views }))
      .sort((a, b) => b.views - a.views)
      .slice(0, 10)

    // Top events
    const eventCounts = events
      .filter(e => e.eventType === 'event_view')
      .reduce((acc, event) => {
        const metadata = event.metadata ? JSON.parse(event.metadata) : {}
        const eventId = metadata.eventId || 'unknown'
        acc[eventId] = (acc[eventId] || 0) + 1
        return acc
      }, {} as Record<string, number>)
    const topEvents = Object.entries(eventCounts)
      .map(([eventId, views]) => ({ eventId, views }))
      .sort((a, b) => b.views - a.views)
      .slice(0, 10)

    // Device types and browsers
    const deviceTypes = events
      .filter(e => e.userAgent)
      .reduce((acc, event) => {
        const deviceInfo = this.parseUserAgent(event.userAgent!)
        const type = deviceInfo.device || 'unknown'
        acc[type] = (acc[type] || 0) + 1
        return acc
      }, {} as Record<string, number>)
    const deviceTypesArray = Object.entries(deviceTypes)
      .map(([type, count]) => ({ type, count }))
      .sort((a, b) => b.count - a.count)

    const browsers = events
      .filter(e => e.userAgent)
      .reduce((acc, event) => {
        const browserInfo = this.parseUserAgent(event.userAgent!)
        const browser = browserInfo.browser || 'unknown'
        acc[browser] = (acc[browser] || 0) + 1
        return acc
      }, {} as Record<string, number>)
    const browsersArray = Object.entries(browsers)
      .map(([browser, count]) => ({ browser, count }))
      .sort((a, b) => b.count - a.count)

    // Upsert the summary
    await prisma.analyticsSummary.upsert({
      where: {
        siteId_date_period: {
          siteId,
          date: startOfDay,
          period: 'daily'
        }
      },
      update: {
        pageviews,
        uniqueVisitors,
        sessions,
        avgSessionDuration: Math.round(avgSessionDuration),
        ctaClicks,
        specialViews,
        menuViews,
        eventViews,
        topPages: JSON.stringify(topPages),
        topSpecials: JSON.stringify(topSpecials),
        topEvents: JSON.stringify(topEvents),
        deviceTypes: JSON.stringify(deviceTypesArray),
        browsers: JSON.stringify(browsersArray)
      },
      create: {
        siteId,
        date: startOfDay,
        period: 'daily',
        pageviews,
        uniqueVisitors,
        sessions,
        avgSessionDuration: Math.round(avgSessionDuration),
        ctaClicks,
        specialViews,
        menuViews,
        eventViews,
        topPages: JSON.stringify(topPages),
        topSpecials: JSON.stringify(topSpecials),
        topEvents: JSON.stringify(topEvents),
        deviceTypes: JSON.stringify(deviceTypesArray),
        browsers: JSON.stringify(browsersArray)
      }
    })
  }

  /**
   * Hash IP address for privacy
   */
  private static hashIp(ip: string): string {
    return crypto.createHash('sha256').update(ip + process.env.ANALYTICS_SALT || 'default-salt').digest('hex').substring(0, 16)
  }

  /**
   * Check if user agent is likely a bot
   */
  private static isBot(userAgent: string): boolean {
    const botPatterns = [
      /bot/i, /crawler/i, /spider/i, /scraper/i, /crawling/i,
      /facebookexternalhit/i, /twitterbot/i, /linkedinbot/i,
      /whatsapp/i, /telegrambot/i, /slackbot/i,
      /googlebot/i, /bingbot/i, /yandexbot/i, /baiduspider/i,
      /duckduckbot/i, /applebot/i, /ia_archiver/i,
      /wayback/i, /archive/i, /wget/i, /curl/i,
      /python/i, /java/i, /php/i, /ruby/i, /perl/i,
      /headless/i, /phantom/i, /selenium/i, /puppeteer/i,
      /chrome-lighthouse/i, /gtmetrix/i, /pingdom/i,
      /uptimerobot/i, /monitor/i, /check/i, /test/i
    ]
    
    return botPatterns.some(pattern => pattern.test(userAgent))
  }

  /**
   * Check if IP is from a known bot/proxy service
   */
  private static isKnownBotIp(ip: string): boolean {
    // Common bot/proxy IP ranges (simplified check)
    const botIpRanges = [
      '66.249.', // Googlebot
      '207.46.', // Microsoft bots
      '157.55.', // Microsoft bots
      '40.77.', // Microsoft bots
      '52.167.', // Microsoft bots
      '13.107.', // Microsoft bots
      '54.36.', // Ahrefs
      '185.220.', // Tor exit nodes
      '198.96.', // Known proxy ranges
    ]
    
    return botIpRanges.some(range => ip.startsWith(range))
  }

  /**
   * Check if request is suspicious (high frequency, etc.)
   */
  private static async isSuspiciousRequest(
    siteId: string,
    ipAddress: string,
    userAgent: string,
    sessionId?: string
  ): Promise<boolean> {
    try {
      const fiveMinutesAgo = new Date(Date.now() - 5 * 60 * 1000)
      
      // Check for high frequency requests from same IP
      const recentRequests = await prisma.analyticsEvent.count({
        where: {
          siteId,
          ipAddress: this.hashIp(ipAddress),
          timestamp: {
            gte: fiveMinutesAgo
          }
        }
      })
      
      // If more than 50 requests in 5 minutes, likely suspicious
      if (recentRequests > 50) {
        return true
      }
      
      // Check for requests without proper session tracking
      if (!sessionId && userAgent) {
        const requestsWithoutSession = await prisma.analyticsEvent.count({
          where: {
            siteId,
            ipAddress: this.hashIp(ipAddress),
            sessionId: null,
            timestamp: {
              gte: fiveMinutesAgo
            }
          }
        })
        
        // If many requests without session, likely automated
        if (requestsWithoutSession > 20) {
          return true
        }
      }
      
      return false
    } catch (error) {
      console.error('Error checking suspicious request:', error)
      return false // Default to allowing if check fails
    }
  }

  /**
   * Parse user agent string
   */
  private static parseUserAgent(userAgent: string): { browser: string; device: string; os: string } {
    const ua = userAgent.toLowerCase()
    
    // Browser detection
    let browser = 'unknown'
    if (ua.includes('chrome')) browser = 'Chrome'
    else if (ua.includes('firefox')) browser = 'Firefox'
    else if (ua.includes('safari')) browser = 'Safari'
    else if (ua.includes('edge')) browser = 'Edge'
    else if (ua.includes('opera')) browser = 'Opera'

    // Device detection
    let device = 'desktop'
    if (ua.includes('mobile')) device = 'mobile'
    else if (ua.includes('tablet')) device = 'tablet'

    // OS detection
    let os = 'unknown'
    if (ua.includes('windows')) os = 'Windows'
    else if (ua.includes('mac')) os = 'macOS'
    else if (ua.includes('linux')) os = 'Linux'
    else if (ua.includes('android')) os = 'Android'
    else if (ua.includes('ios')) os = 'iOS'

    return { browser, device, os }
  }
}
