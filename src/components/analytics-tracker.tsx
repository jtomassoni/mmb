'use client'

import { useEffect, useCallback } from 'react'
import { useSession } from 'next-auth/react'

interface AnalyticsTrackerProps {
  page: string
  children: React.ReactNode
}

export default function AnalyticsTracker({ page, children }: AnalyticsTrackerProps) {
  const { data: session } = useSession()

  // Track pageview on mount
  useEffect(() => {
    trackPageview()
  }, [page])

  // Check analytics consent
  const hasAnalyticsConsent = useCallback(() => {
    if (typeof window === 'undefined') return false
    const consent = localStorage.getItem('analytics-consent')
    return consent === 'true'
  }, [])

  // Track pageview
  const trackPageview = useCallback(async () => {
    if (!hasAnalyticsConsent()) {
      return // Don't track if user hasn't consented
    }

    try {
      await fetch('/api/analytics/track', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          eventType: 'pageview',
          eventName: 'page_view',
          page,
          metadata: {
            userId: session?.user?.id,
            userRole: (session?.user as any)?.role
          }
        }),
      })
    } catch (error) {
      console.error('Failed to track pageview:', error)
    }
  }, [page, session, hasAnalyticsConsent])

  // Track CTA click
  const trackCtaClick = useCallback(async (
    ctaName: string,
    element?: string,
    elementId?: string,
    elementText?: string
  ) => {
    if (!hasAnalyticsConsent()) {
      return // Don't track if user hasn't consented
    }

    try {
      await fetch('/api/analytics/track', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          eventType: 'cta_click',
          eventName: ctaName,
          page,
          element,
          elementId,
          elementText,
          metadata: {
            userId: session?.user?.id,
            userRole: (session?.user as any)?.role
          }
        }),
      })
    } catch (error) {
      console.error('Failed to track CTA click:', error)
    }
  }, [page, session, hasAnalyticsConsent])

  // Track special view
  const trackSpecialView = useCallback(async (specialId: string, specialName: string) => {
    if (!hasAnalyticsConsent()) {
      return // Don't track if user hasn't consented
    }

    try {
      await fetch('/api/analytics/track', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          eventType: 'special_view',
          eventName: `special_${specialId}`,
          page,
          metadata: {
            specialId,
            specialName,
            userId: session?.user?.id,
            userRole: (session?.user as any)?.role
          }
        }),
      })
    } catch (error) {
      console.error('Failed to track special view:', error)
    }
  }, [page, session, hasAnalyticsConsent])

  // Track menu view
  const trackMenuView = useCallback(async (menuCategory: string) => {
    if (!hasAnalyticsConsent()) {
      return // Don't track if user hasn't consented
    }

    try {
      await fetch('/api/analytics/track', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          eventType: 'menu_view',
          eventName: `menu_${menuCategory}`,
          page,
          metadata: {
            menuCategory,
            userId: session?.user?.id,
            userRole: (session?.user as any)?.role
          }
        }),
      })
    } catch (error) {
      console.error('Failed to track menu view:', error)
    }
  }, [page, session, hasAnalyticsConsent])

  // Track event view
  const trackEventView = useCallback(async (eventId: string, eventName: string) => {
    if (!hasAnalyticsConsent()) {
      return // Don't track if user hasn't consented
    }

    try {
      await fetch('/api/analytics/track', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          eventType: 'event_view',
          eventName: `event_${eventId}`,
          page,
          metadata: {
            eventId,
            eventName,
            userId: session?.user?.id,
            userRole: (session?.user as any)?.role
          }
        }),
      })
    } catch (error) {
      console.error('Failed to track event view:', error)
    }
  }, [page, session, hasAnalyticsConsent])

  // Make tracking functions available globally for this page
  useEffect(() => {
    if (typeof window !== 'undefined') {
      (window as any).analytics = {
        trackCtaClick,
        trackSpecialView,
        trackMenuView,
        trackEventView
      }
    }
  }, [trackCtaClick, trackSpecialView, trackMenuView, trackEventView])

  return <>{children}</>
}

// Hook for tracking analytics events
export function useAnalytics() {
  const trackCtaClick = useCallback(async (
    ctaName: string,
    element?: string,
    elementId?: string,
    elementText?: string
  ) => {
    if (typeof window !== 'undefined' && (window as any).analytics) {
      await (window as any).analytics.trackCtaClick(ctaName, element, elementId, elementText)
    }
  }, [])

  const trackSpecialView = useCallback(async (specialId: string, specialName: string) => {
    if (typeof window !== 'undefined' && (window as any).analytics) {
      await (window as any).analytics.trackSpecialView(specialId, specialName)
    }
  }, [])

  const trackMenuView = useCallback(async (menuCategory: string) => {
    if (typeof window !== 'undefined' && (window as any).analytics) {
      await (window as any).analytics.trackMenuView(menuCategory)
    }
  }, [])

  const trackEventView = useCallback(async (eventId: string, eventName: string) => {
    if (typeof window !== 'undefined' && (window as any).analytics) {
      await (window as any).analytics.trackEventView(eventId, eventName)
    }
  }, [])

  return {
    trackCtaClick,
    trackSpecialView,
    trackMenuView,
    trackEventView
  }
}
