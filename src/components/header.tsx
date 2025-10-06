'use client'

import { useSession, signOut } from 'next-auth/react'
import Link from 'next/link'
import { getRedirectUrl } from '../lib/redirect'
import { AccessibilityDropdown } from './accessibility-dropdown'
import { useCart } from './cart-context'
import { CartSidebar } from './cart-sidebar'

export function HeaderClient({ siteName }: { siteName?: string }) {
  const { data: session, status } = useSession()
  const { totalItems, isOpen, setIsOpen } = useCart()

  return (
    <>
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            {/* Logo/Brand */}
            <div className="flex-shrink-0">
              <Link href="/" className="text-xl font-bold text-gray-900 hover:text-green-600 transition-all duration-300 hover:scale-105 hover:drop-shadow-lg relative group">
                {siteName || "Monaghan's Bar & Grill"}
                <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-green-600 transition-all duration-300 group-hover:w-full"></span>
              </Link>
            </div>

            {/* Navigation */}
            <nav className="hidden md:flex space-x-2">
              <Link href="/" className="relative text-gray-600 hover:text-green-600 px-4 py-2 text-sm font-medium transition-all duration-300 rounded-lg group overflow-hidden">
                <span className="relative z-10">Home</span>
                <div className="absolute inset-0 bg-gradient-to-r from-green-50 to-green-100 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                <div className="absolute bottom-0 left-0 w-full h-0.5 bg-green-600 transform scale-x-0 group-hover:scale-x-100 transition-transform duration-300 origin-left"></div>
              </Link>
              <Link href="/menu" className="relative text-gray-600 hover:text-green-600 px-4 py-2 text-sm font-medium transition-all duration-300 rounded-lg group overflow-hidden">
                <span className="relative z-10">Menu</span>
                <div className="absolute inset-0 bg-gradient-to-r from-green-50 to-green-100 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                <div className="absolute bottom-0 left-0 w-full h-0.5 bg-green-600 transform scale-x-0 group-hover:scale-x-100 transition-transform duration-300 origin-left"></div>
              </Link>
              <Link href="/whats-happening" className="relative text-gray-600 hover:text-green-600 px-4 py-2 text-sm font-medium transition-all duration-300 rounded-lg group overflow-hidden">
                <span className="relative z-10">What's Happening</span>
                <div className="absolute inset-0 bg-gradient-to-r from-green-50 to-green-100 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                <div className="absolute bottom-0 left-0 w-full h-0.5 bg-green-600 transform scale-x-0 group-hover:scale-x-100 transition-transform duration-300 origin-left"></div>
              </Link>
              <Link href="/about" className="relative text-gray-600 hover:text-green-600 px-4 py-2 text-sm font-medium transition-all duration-300 rounded-lg group overflow-hidden">
                <span className="relative z-10">Visit</span>
                <div className="absolute inset-0 bg-gradient-to-r from-green-50 to-green-100 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                <div className="absolute bottom-0 left-0 w-full h-0.5 bg-green-600 transform scale-x-0 group-hover:scale-x-100 transition-transform duration-300 origin-left"></div>
              </Link>
            </nav>

            {/* Right Side Actions */}
            <div className="flex items-center space-x-4">
              {/* Accessibility Options */}
              <AccessibilityDropdown />
              
              {status === 'loading' ? (
                <div className="flex items-center space-x-3">
                  <div className="animate-pulse bg-gray-200 h-8 w-20 rounded"></div>
                  <div className="animate-pulse bg-gray-200 h-8 w-16 rounded"></div>
                </div>
              ) : session ? (
                /* Logged-in User Actions */
                <div className="flex items-center space-x-3">
                  <span className="text-sm text-gray-600 hidden sm:block">
                    {session.user?.name || session.user?.email}
                  </span>
                  <div className="flex items-center space-x-2">
                    <a
                      href={getRedirectUrl(session.user?.role || 'STAFF')}
                      className="relative bg-indigo-600 text-white px-4 py-2 rounded-lg text-sm font-medium transition-all duration-300 hover:bg-indigo-700 hover:shadow-lg hover:shadow-indigo-500/25 hover:scale-105 group overflow-hidden"
                    >
                      <span className="relative z-10">Dashboard</span>
                      <div className="absolute inset-0 bg-gradient-to-r from-indigo-500 to-indigo-700 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                    </a>
                    <button
                      onClick={() => signOut({ callbackUrl: '/' })}
                      className="relative text-sm text-gray-500 hover:text-gray-700 px-3 py-2 rounded-lg hover:bg-gray-100 transition-all duration-300 hover:shadow-md group overflow-hidden"
                    >
                      <span className="relative z-10">Sign Out</span>
                      <div className="absolute inset-0 bg-gradient-to-r from-gray-50 to-gray-100 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                    </button>
                  </div>
                </div>
              ) : (
                /* Anonymous User Actions - Future Online Ordering */
                <div className="flex items-center space-x-3">
                  {/* Cart Button - Future Online Ordering */}
                  <button 
                    className="relative bg-orange-600 text-white px-4 py-2 rounded-lg text-sm font-medium transition-all duration-300 hover:bg-orange-700 hover:shadow-lg hover:shadow-orange-500/25 hover:scale-105 group overflow-hidden"
                    onClick={() => setIsOpen(true)}
                  >
                    <span className="relative z-10 flex items-center space-x-2">
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4m0 0L7 13m0 0l-2.5 5M7 13l2.5 5m6-5v6a2 2 0 01-2 2H9a2 2 0 01-2-2v-6m8 0V9a2 2 0 00-2-2H9a2 2 0 00-2 2v4.01" />
                      </svg>
                      <span>Cart</span>
                      {totalItems > 0 && (
                        <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                          {totalItems}
                        </span>
                      )}
                    </span>
                    <div className="absolute inset-0 bg-gradient-to-r from-orange-500 to-orange-700 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                  </button>

                  {/* Login Button */}
                  <Link
                    href="/login"
                    className="relative bg-green-600 text-white px-4 py-2 rounded-lg text-sm font-medium transition-all duration-300 hover:bg-green-700 hover:shadow-lg hover:shadow-green-500/25 hover:scale-105 group overflow-hidden"
                  >
                    <span className="relative z-10">Login</span>
                    <div className="absolute inset-0 bg-gradient-to-r from-green-500 to-green-700 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                  </Link>
                </div>
              )}
            </div>
          </div>
        </div>
      </header>

      {/* Cart Sidebar */}
      <CartSidebar isOpen={isOpen} onClose={() => setIsOpen(false)} />
    </>
  )
}
