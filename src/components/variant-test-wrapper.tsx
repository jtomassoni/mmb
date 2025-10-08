'use client'

import { useEffect, useState } from 'react'
import { BusinessVariant } from '../lib/design-tokens'
import { useDesignTokens } from '../hooks/use-design-tokens'
import HeroSection from './hero-section'
import TodaySectionComponent from './today-section'
import JsonLdWrapper from './json-ld-wrapper'
import { BusinessInfo } from '../lib/json-ld-presets'

interface VariantTestWrapperProps {
  variant: BusinessVariant
  businessInfo: BusinessInfo
  children: React.ReactNode
}

export default function VariantTestWrapper({
  variant,
  businessInfo,
  children
}: VariantTestWrapperProps) {
  const [isLoaded, setIsLoaded] = useState(false)
  const { tokens, getCSS, isLoaded: tokensLoaded } = useDesignTokens({ variant })
  
  useEffect(() => {
    if (tokensLoaded) {
      setIsLoaded(true)
      
      // Apply variant-specific CSS custom properties
      const root = document.documentElement
      const cssVariables = getCSS('root')
      
      Object.entries(cssVariables).forEach(([property, value]) => {
        root.style.setProperty(property, value as string)
      })
      
      // Add variant class to body for additional styling
      document.body.className = `variant-${variant}`
      
      // Cleanup on unmount
      return () => {
        document.body.className = ''
        Object.keys(cssVariables).forEach(property => {
          root.style.removeProperty(property)
        })
      }
    }
  }, [variant, tokensLoaded, getCSS])
  
  if (!isLoaded) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-gray-500">Loading variant...</div>
      </div>
    )
  }
  
  return (
    <div className={`variant-${variant}`} data-testid={`variant-${variant}`}>
      {/* Apply variant-specific styles */}
      <style jsx global>{`
        .variant-${variant} {
          --variant-primary: ${tokens.colors.primary[600]};
          --variant-secondary: ${tokens.colors.secondary[600]};
          --variant-accent: ${tokens.colors.accent[600]};
          --variant-background: ${tokens.colors.neutral[50]};
          --variant-text: ${tokens.colors.neutral[700]};
          --variant-heading: ${tokens.colors.neutral[900]};
          
          --variant-font-heading: ${tokens.typography.fontFamily.heading};
          --variant-font-body: ${tokens.typography.fontFamily.body};
          --variant-size-heading: ${tokens.typography.fontSize['4xl']};
          --variant-size-body: ${tokens.typography.fontSize.base};
          
          --variant-spacing-xs: ${tokens.spacing.xs};
          --variant-spacing-sm: ${tokens.spacing.sm};
          --variant-spacing-md: ${tokens.spacing.md};
          --variant-spacing-lg: ${tokens.spacing.lg};
          --variant-spacing-xl: ${tokens.spacing.xl};
          
          --variant-radius-sm: ${tokens.borderRadius.sm};
          --variant-radius-md: ${tokens.borderRadius.md};
          --variant-radius-lg: ${tokens.borderRadius.lg};
          
          --variant-shadow-sm: ${tokens.shadows.sm};
          --variant-shadow-md: ${tokens.shadows.md};
          --variant-shadow-lg: ${tokens.shadows.lg};
        }
        
        .variant-${variant} h1,
        .variant-${variant} h2,
        .variant-${variant} h3,
        .variant-${variant} h4,
        .variant-${variant} h5,
        .variant-${variant} h6 {
          font-family: var(--variant-font-heading);
          color: var(--variant-heading);
        }
        
        .variant-${variant} p,
        .variant-${variant} span,
        .variant-${variant} div {
          font-family: var(--variant-font-body);
          color: var(--variant-text);
        }
        
        .variant-${variant} .btn-primary {
          background-color: var(--variant-primary);
          color: white;
          border-radius: var(--variant-radius-md);
          padding: var(--variant-spacing-sm) var(--variant-spacing-md);
          box-shadow: var(--variant-shadow-sm);
        }
        
        .variant-${variant} .btn-secondary {
          background-color: var(--variant-secondary);
          color: white;
          border-radius: var(--variant-radius-md);
          padding: var(--variant-spacing-sm) var(--variant-spacing-md);
          box-shadow: var(--variant-shadow-sm);
        }
        
        .variant-${variant} .card {
          background-color: var(--variant-background);
          border-radius: var(--variant-radius-lg);
          padding: var(--variant-spacing-lg);
          box-shadow: var(--variant-shadow-md);
        }
        
        .variant-${variant} .highlight {
          background-color: var(--variant-accent);
          color: white;
          border-radius: var(--variant-radius-sm);
          padding: var(--variant-spacing-xs) var(--variant-spacing-sm);
        }
      `}</style>
      
      {/* Include JSON-LD structured data */}
      <JsonLdWrapper
        variant={variant}
        businessInfo={businessInfo}
      />
      
      {/* Render children with variant context */}
      {children}
    </div>
  )
}

// Helper component for testing hero sections
export function VariantHeroTest({ variant, businessInfo }: { variant: BusinessVariant; businessInfo: BusinessInfo }) {
  return (
    <VariantTestWrapper variant={variant} businessInfo={businessInfo}>
      <HeroSection
        variant={variant}
        businessName={businessInfo.name}
        location={businessInfo.address.addressLocality}
        specialties={['Sample Specialty 1', 'Sample Specialty 2']}
        customImage={businessInfo.image}
      />
    </VariantTestWrapper>
  )
}

// Helper component for testing today sections
export function VariantTodayTest({ variant, businessInfo }: { variant: BusinessVariant; businessInfo: BusinessInfo }) {
  const todayHighlights = [
    {
      title: 'Sample Special',
      description: 'A sample special for testing',
      time: 'All day',
      price: '$10',
      category: 'special' as const,
      urgency: 'medium' as const
    },
    {
      title: 'Sample Event',
      description: 'A sample event for testing',
      time: '7:00 PM',
      price: 'Free',
      category: 'event' as const,
      urgency: 'low' as const
    }
  ]
  
  return (
    <VariantTestWrapper variant={variant} businessInfo={businessInfo}>
      <TodaySectionComponent
        variant={variant}
        businessName={businessInfo.name}
        specialties={['Sample Specialty 1', 'Sample Specialty 2']}
        customHighlights={todayHighlights}
      />
    </VariantTestWrapper>
  )
}

// Helper component for testing full page layouts
export function VariantPageTest({ 
  variant, 
  businessInfo, 
  pageType = 'home' 
}: { 
  variant: BusinessVariant
  businessInfo: BusinessInfo
  pageType?: 'home' | 'about' | 'menu' | 'events' | 'specials' | 'reviews' | 'visit'
}) {
  return (
    <VariantTestWrapper variant={variant} businessInfo={businessInfo}>
      <div className="min-h-screen bg-gray-50">
        {/* Header */}
        <header className="bg-white shadow-sm">
          <nav className="container mx-auto px-6 py-4">
            <div className="flex items-center justify-between">
              <h1 className="text-2xl font-bold" style={{ color: 'var(--variant-primary)' }}>
                {businessInfo.name}
              </h1>
              <div className="space-x-4">
                <a href="/menu" className="btn-primary">Menu</a>
                <a href="/events" className="btn-secondary">Events</a>
              </div>
            </div>
          </nav>
        </header>
        
        {/* Main Content */}
        <main className="container mx-auto px-6 py-8">
          {pageType === 'home' && (
            <>
              <HeroSection
                variant={variant}
                businessName={businessInfo.name}
                location={businessInfo.address.addressLocality}
                specialties={['Sample Specialty 1', 'Sample Specialty 2']}
              />
              <div className="my-8">
                <TodaySectionComponent
                  variant={variant}
                  businessName={businessInfo.name}
                  specialties={['Sample Specialty 1', 'Sample Specialty 2']}
                />
              </div>
            </>
          )}
          
          {pageType === 'about' && (
            <div className="card">
              <h2 className="text-3xl font-bold mb-4">About {businessInfo.name}</h2>
              <p className="text-lg mb-4">{businessInfo.description}</p>
              <div className="highlight">
                <p>Located in {businessInfo.address.addressLocality}, {businessInfo.address.addressRegion}</p>
              </div>
            </div>
          )}
          
          {pageType === 'menu' && (
            <div className="card">
              <h2 className="text-3xl font-bold mb-4">Our Menu</h2>
              <p className="text-lg mb-4">Discover our delicious offerings</p>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="highlight">Appetizers</div>
                <div className="highlight">Main Courses</div>
                <div className="highlight">Desserts</div>
                <div className="highlight">Beverages</div>
              </div>
            </div>
          )}
          
          {pageType === 'events' && (
            <div className="card">
              <h2 className="text-3xl font-bold mb-4">Upcoming Events</h2>
              <p className="text-lg mb-4">Join us for these special occasions</p>
              <div className="space-y-4">
                <div className="highlight">Live Music Night</div>
                <div className="highlight">Wine Tasting</div>
                <div className="highlight">Special Dinner</div>
              </div>
            </div>
          )}
          
          {pageType === 'specials' && (
            <div className="card">
              <h2 className="text-3xl font-bold mb-4">Today's Specials</h2>
              <p className="text-lg mb-4">Don't miss these great deals</p>
              <div className="space-y-4">
                <div className="highlight">Happy Hour</div>
                <div className="highlight">Daily Special</div>
                <div className="highlight">Weekend Special</div>
              </div>
            </div>
          )}
          
          {pageType === 'reviews' && (
            <div className="card">
              <h2 className="text-3xl font-bold mb-4">Customer Reviews</h2>
              <p className="text-lg mb-4">What our customers are saying</p>
              <div className="space-y-4">
                <div className="highlight">⭐⭐⭐⭐⭐ Great food and service!</div>
                <div className="highlight">⭐⭐⭐⭐⭐ Amazing atmosphere!</div>
                <div className="highlight">⭐⭐⭐⭐⭐ Will definitely come back!</div>
              </div>
            </div>
          )}
          
          {pageType === 'visit' && (
            <div className="card">
              <h2 className="text-3xl font-bold mb-4">Visit Us</h2>
              <p className="text-lg mb-4">We'd love to see you!</p>
              <div className="space-y-4">
                <div className="highlight">
                  <strong>Address:</strong> {businessInfo.address.streetAddress}, {businessInfo.address.addressLocality}, {businessInfo.address.addressRegion} {businessInfo.address.postalCode}
                </div>
                <div className="highlight">
                  <strong>Phone:</strong> {businessInfo.telephone}
                </div>
                <div className="highlight">
                  <strong>Email:</strong> {businessInfo.email}
                </div>
              </div>
            </div>
          )}
        </main>
        
        {/* Footer */}
        <footer className="bg-gray-800 text-white py-8">
          <div className="container mx-auto px-6">
            <div className="text-center">
              <p>&copy; 2025 {businessInfo.name}. All rights reserved.</p>
            </div>
          </div>
        </footer>
      </div>
    </VariantTestWrapper>
  )
}
