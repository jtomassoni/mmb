'use client'

import { useSession, signOut } from 'next-auth/react'
import Link from 'next/link'
import { getRedirectUrl } from '../lib/redirect'
import { AccessibilityDropdown } from './accessibility-dropdown'

export function Header() {
  const { data: session, status } = useSession()

  return (
    <header className="bg-white shadow-sm border-b">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo/Brand */}
          <div className="flex-shrink-0">
            <Link href="/" className="text-xl font-bold text-gray-900 hover:text-green-600 transition-all duration-300 hover:drop-shadow-lg">
              Monaghan&apos;s Bar & Grill
            </Link>
          </div>

          {/* Navigation */}
          <nav className="hidden md:flex space-x-8">
            <Link href="/" className="text-gray-600 hover:text-gray-900 px-3 py-2 text-sm font-medium transition-all duration-300 hover:shadow-lg hover:shadow-gray-200 rounded-md">
              Home
            </Link>
            <Link href="/menu" className="text-gray-600 hover:text-gray-900 px-3 py-2 text-sm font-medium transition-all duration-300 hover:shadow-lg hover:shadow-gray-200 rounded-md">
              Menu
            </Link>
            <Link href="/whats-happening" className="text-gray-600 hover:text-gray-900 px-3 py-2 text-sm font-medium transition-all duration-300 hover:shadow-lg hover:shadow-gray-200 rounded-md">
              What's Happening
            </Link>
            <Link href="/about" className="text-gray-600 hover:text-gray-900 px-3 py-2 text-sm font-medium transition-all duration-300 hover:shadow-lg hover:shadow-gray-200 rounded-md">
              Visit
            </Link>
          </nav>

          {/* Login/Auth Section */}
          <div className="flex items-center space-x-4">
            {/* Accessibility Options */}
            <AccessibilityDropdown />
            
            {status === 'loading' ? (
              <div className="text-sm text-gray-500">Loading...</div>
            ) : session ? (
              <div className="flex items-center space-x-3">
                <span className="text-sm text-gray-600">
                  {session.user?.name || session.user?.email}
                </span>
                <div className="flex items-center space-x-2">
                  <a
                    href={getRedirectUrl(session.user?.role || 'STAFF')}
                    className="bg-indigo-600 text-white px-3 py-1 rounded text-sm hover:bg-indigo-700 transition-colors"
                  >
                    Dashboard
                  </a>
                  <button
                    onClick={() => signOut({ callbackUrl: '/' })}
                    className="text-sm text-gray-500 hover:text-gray-700 px-2 py-1 rounded hover:bg-gray-100 transition-colors"
                  >
                    Sign Out
                  </button>
                </div>
              </div>
            ) : (
              <div></div>
            )}
          </div>
        </div>
      </div>
    </header>
  )
}
