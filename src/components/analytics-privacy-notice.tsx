'use client'

import { useState, useEffect } from 'react'

interface AnalyticsPrivacyNoticeProps {
  onAccept?: () => void
  onDecline?: () => void
  className?: string
}

export default function AnalyticsPrivacyNotice({ 
  onAccept, 
  onDecline, 
  className = '' 
}: AnalyticsPrivacyNoticeProps) {
  const [showNotice, setShowNotice] = useState(false)
  const [hasConsent, setHasConsent] = useState<boolean | null>(null)

  useEffect(() => {
    // Check if user has already given consent
    const consent = localStorage.getItem('analytics-consent')
    if (consent === null) {
      setShowNotice(true)
    } else {
      setHasConsent(consent === 'true')
    }
  }, [])

  const handleAccept = () => {
    localStorage.setItem('analytics-consent', 'true')
    setHasConsent(true)
    setShowNotice(false)
    onAccept?.()
  }

  const handleDecline = () => {
    localStorage.setItem('analytics-consent', 'false')
    setHasConsent(false)
    setShowNotice(false)
    onDecline?.()
  }

  const handleRevokeConsent = () => {
    localStorage.removeItem('analytics-consent')
    setHasConsent(null)
    setShowNotice(true)
  }

  // Don't render if user has declined or notice is not shown
  if (hasConsent === false || !showNotice) {
    return null
  }

  return (
    <div className={`fixed bottom-4 right-4 max-w-md bg-white border border-gray-200 rounded-lg shadow-lg p-4 z-50 ${className}`}>
      <div className="flex items-start space-x-3">
        <div className="flex-shrink-0">
          <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
            <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
            </svg>
          </div>
        </div>
        
        <div className="flex-1 min-w-0">
          <h3 className="text-sm font-medium text-gray-900 mb-1">
            Analytics & Privacy
          </h3>
          <p className="text-xs text-gray-600 mb-3">
            We use analytics to understand how visitors interact with our website. 
            Your IP address is hashed for privacy, and we filter out bots and suspicious traffic.
          </p>
          
          <div className="flex space-x-2">
            <button
              onClick={handleAccept}
              className="px-3 py-1 text-xs bg-blue-600 text-white rounded-md hover:bg-blue-700"
            >
              Accept
            </button>
            <button
              onClick={handleDecline}
              className="px-3 py-1 text-xs bg-gray-200 text-gray-700 rounded-md hover:bg-gray-300"
            >
              Decline
            </button>
          </div>
          
          <button
            onClick={() => window.open('/privacy', '_blank')}
            className="text-xs text-blue-600 hover:text-blue-800 mt-2 block"
          >
            Learn more about our privacy practices
          </button>
        </div>
        
        <button
          onClick={handleDecline}
          className="flex-shrink-0 text-gray-400 hover:text-gray-600"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>
    </div>
  )
}

// Hook to check analytics consent
export function useAnalyticsConsent() {
  const [hasConsent, setHasConsent] = useState<boolean | null>(null)

  useEffect(() => {
    const consent = localStorage.getItem('analytics-consent')
    setHasConsent(consent === 'true')
  }, [])

  const revokeConsent = () => {
    localStorage.removeItem('analytics-consent')
    setHasConsent(null)
  }

  return { hasConsent, revokeConsent }
}
