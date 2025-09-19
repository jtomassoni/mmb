'use client'

import { useSession, signOut } from 'next-auth/react'
import Link from 'next/link'
import { getRedirectUrl } from '../lib/redirect'

export function Header() {
  const { data: session, status } = useSession()

  return (
    <header className="bg-white shadow-sm border-b">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo/Brand */}
          <div className="flex-shrink-0">
            <Link href="/" className="text-xl font-bold text-gray-900">
              Monaghan&apos;s Bar & Grill
            </Link>
          </div>

          {/* Navigation */}
          <nav className="hidden md:flex space-x-8">
            <Link href="/menu" className="text-gray-600 hover:text-gray-900 px-3 py-2 text-sm font-medium">
              Menu
            </Link>
            <Link href="/specials" className="text-gray-600 hover:text-gray-900 px-3 py-2 text-sm font-medium">
              Specials
            </Link>
            <Link href="/events" className="text-gray-600 hover:text-gray-900 px-3 py-2 text-sm font-medium">
              Events
            </Link>
            <Link href="/about" className="text-gray-600 hover:text-gray-900 px-3 py-2 text-sm font-medium">
              About
            </Link>
            <Link href="/visit" className="text-gray-600 hover:text-gray-900 px-3 py-2 text-sm font-medium">
              Visit
            </Link>
          </nav>

          {/* Login/Auth Section */}
          <div className="flex items-center space-x-4">
            {status === 'loading' ? (
              <div className="text-sm text-gray-500">Loading...</div>
            ) : session ? (
              <div className="flex items-center space-x-4">
                <span className="text-sm text-gray-700">
                  Welcome, {session.user?.name || session.user?.email}
                </span>
                <div className="flex items-center space-x-2">
                  <a
                    href={getRedirectUrl(session.user?.role || 'STAFF')}
                    className="text-sm text-indigo-600 hover:text-indigo-500"
                  >
                    {session.user?.role === 'SUPERADMIN' ? 'Superadmin' : 'Admin'} Dashboard
                  </a>
                  <button
                    onClick={() => signOut({ callbackUrl: '/' })}
                    className="text-sm text-gray-600 hover:text-gray-900"
                  >
                    Sign Out
                  </button>
                </div>
              </div>
            ) : (
              <Link
                href="/login"
                className="text-sm text-indigo-600 hover:text-indigo-500 font-medium"
              >
                Owner / Staff Login
              </Link>
            )}
          </div>
        </div>
      </div>
    </header>
  )
}
