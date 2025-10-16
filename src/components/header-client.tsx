'use client'

import { useSession, signOut } from 'next-auth/react'
import Link from 'next/link'
import { useState, useEffect } from 'react'
import { getRedirectUrl } from '../lib/redirect'
import { AccessibilityDropdown } from './accessibility-dropdown'
import { useCart } from './cart-context'
import { CartSidebar } from './cart-sidebar'

export function HeaderClient({ siteName }: { siteName?: string }) {
  const { data: session, status } = useSession()
  const { totalItems, isOpen, setIsOpen } = useCart()
  const [dynamicSiteName, setDynamicSiteName] = useState(siteName)
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  // Fetch site data on client side
  useEffect(() => {
    const fetchSiteData = async () => {
      try {
        const response = await fetch('/api/admin/site-settings')
        if (response.ok) {
          const data = await response.json()
          setDynamicSiteName(data.name)
        }
      } catch (error) {
        console.error('Failed to fetch site data:', error)
      }
    }
    
    fetchSiteData()
  }, [])

  return (
    <>
      <header className="bg-gradient-to-r from-amber-900 via-amber-800 to-amber-900 shadow-lg border-b-2 border-amber-700 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-14 sm:h-16">
            {/* Logo/Brand */}
            <div className="flex-shrink-0">
              <Link href="/" className="text-lg sm:text-xl font-bold text-amber-100 hover:text-white transition-colors duration-300 font-serif">
                <span className="hidden sm:inline">{dynamicSiteName || siteName || "Monaghan's Bar & Grill"}</span>
                <span className="sm:hidden">{dynamicSiteName?.split(' ')[0] || "Monaghan's"}</span>
              </Link>
            </div>

            {/* Navigation - Hidden on very small screens */}
            <nav className="hidden lg:flex space-x-1">
              <Link href="/" className="relative text-amber-100 hover:text-white px-3 py-2 text-sm font-medium transition-all duration-300 rounded-md group overflow-hidden hover:bg-amber-700/30">
                <span className="relative z-10">Home</span>
              </Link>
              <Link href="/menu" className="relative text-amber-100 hover:text-white px-3 py-2 text-sm font-medium transition-all duration-300 rounded-md group overflow-hidden hover:bg-amber-700/30">
                <span className="relative z-10">Menu</span>
              </Link>
              <Link href="/events" className="relative text-amber-100 hover:text-white px-3 py-2 text-sm font-medium transition-all duration-300 rounded-md group overflow-hidden hover:bg-amber-700/30">
                <span className="relative z-10">Events</span>
              </Link>
              <Link href="/about" className="relative text-amber-100 hover:text-white px-3 py-2 text-sm font-medium transition-all duration-300 rounded-md group overflow-hidden hover:bg-amber-700/30">
                <span className="relative z-10">About Us</span>
              </Link>
              <Link href="/#contact" className="relative text-amber-100 hover:text-white px-3 py-2 text-sm font-medium transition-all duration-300 rounded-md group overflow-hidden hover:bg-amber-700/30">
                <span className="relative z-10">Contact</span>
              </Link>
            </nav>

            {/* Right Side Actions */}
            <div className="flex items-center space-x-2 sm:space-x-4">
              {/* Mobile menu button */}
              <div className="lg:hidden">
                <button
                  onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                  className="text-amber-100 hover:text-white p-2 border border-amber-600 rounded-md hover:bg-amber-700/30"
                  aria-label="Toggle mobile menu"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    {mobileMenuOpen ? (
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    ) : (
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                    )}
                  </svg>
                </button>
              </div>
              
              {/* Accessibility Options - Hidden on small screens */}
              <div className="hidden sm:block">
                <AccessibilityDropdown />
              </div>
              
              {status === 'loading' ? (
                <div className="flex items-center space-x-2 sm:space-x-3">
                  <div className="animate-pulse bg-gray-200 h-7 w-16 sm:h-8 sm:w-20 rounded"></div>
                  <div className="animate-pulse bg-gray-200 h-7 w-12 sm:h-8 sm:w-16 rounded"></div>
                </div>
              ) : session ? (
                /* Logged-in User Actions */
                <div className="flex items-center space-x-2 sm:space-x-3">
                  <span className="text-xs sm:text-sm text-gray-600 hidden md:block">
                    {session.user?.name || session.user?.email}
                  </span>
                  <div className="flex items-center space-x-1 sm:space-x-2">
                    <a
                      href={getRedirectUrl(session.user?.role || 'STAFF')}
                      className="relative bg-indigo-600 text-white px-3 py-1.5 sm:px-4 sm:py-2 rounded-lg text-xs sm:text-sm font-medium transition-all duration-300 hover:bg-indigo-700 hover:shadow-lg hover:shadow-indigo-500/25 hover:scale-105 group overflow-hidden"
                    >
                      <span className="relative z-10">Dashboard</span>
                      <div className="absolute inset-0 bg-gradient-to-r from-indigo-500 to-indigo-700 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                    </a>
                    <button
                      onClick={() => signOut({ callbackUrl: window.location.origin + '/' })}
                      className="relative text-xs sm:text-sm text-gray-500 hover:text-gray-700 px-2 py-1 sm:px-3 sm:py-2 rounded-lg hover:bg-gray-100 transition-all duration-300 hover:shadow-md group overflow-hidden"
                    >
                      <span className="relative z-10">Sign Out</span>
                      <div className="absolute inset-0 bg-gradient-to-r from-gray-50 to-gray-100 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                    </button>
                  </div>
                </div>
              ) : (
                /* Anonymous User Actions - Clean navigation */
                <div className="flex items-center space-x-1 sm:space-x-2">
                  {/* Future: Add cart/login when online ordering is implemented */}
                </div>
              )}
            </div>
          </div>
        </div>
      </header>

      {/* Mobile Menu */}
      {mobileMenuOpen && (
        <div className="lg:hidden bg-gradient-to-b from-amber-800 to-amber-900 border-b-2 border-amber-700 shadow-lg">
          <div className="px-4 py-2 space-y-1">
            <Link href="/" className="block px-3 py-2 text-amber-100 hover:text-white hover:bg-amber-700/30 rounded-md border border-transparent hover:border-amber-600 transition-all duration-300">
              Home
            </Link>
            <Link href="/menu" className="block px-3 py-2 text-amber-100 hover:text-white hover:bg-amber-700/30 rounded-md border border-transparent hover:border-amber-600 transition-all duration-300">
              Menu
            </Link>
            <Link href="/events" className="block px-3 py-2 text-amber-100 hover:text-white hover:bg-amber-700/30 rounded-md border border-transparent hover:border-amber-600 transition-all duration-300">
              Events
            </Link>
            <Link href="/about" className="block px-3 py-2 text-amber-100 hover:text-white hover:bg-amber-700/30 rounded-md border border-transparent hover:border-amber-600 transition-all duration-300">
              About Us
            </Link>
            <Link href="/#contact" className="block px-3 py-2 text-amber-100 hover:text-white hover:bg-amber-700/30 rounded-md border border-transparent hover:border-amber-600 transition-all duration-300">
              Contact
            </Link>
          </div>
        </div>
      )}

      {/* Cart Sidebar */}
      <CartSidebar isOpen={isOpen} onClose={() => setIsOpen(false)} />
    </>
  )
}
