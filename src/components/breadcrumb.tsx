'use client'

import Link from 'next/link'
import { useRouter } from 'next/navigation'

interface BreadcrumbItem {
  label: string
  href?: string
  current?: boolean
}

interface BreadcrumbProps {
  items: BreadcrumbItem[]
  className?: string
}

export function Breadcrumb({ items, className = '' }: BreadcrumbProps) {
  const router = useRouter()

  const handleBackClick = () => {
    router.back()
  }

  return (
    <nav className={`flex items-center space-x-2 text-sm ${className}`} aria-label="Breadcrumb">
      {/* Back Button */}
      <button
        onClick={handleBackClick}
        className="flex items-center space-x-1 text-gray-500 hover:text-gray-700 transition-colors duration-200 group h-6"
        title="Go back"
      >
        <svg className="w-4 h-4 transition-transform duration-200 group-hover:-translate-x-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
        </svg>
        <span className="font-medium leading-none">Back</span>
      </button>

      {/* Breadcrumb Items */}
      <div className="flex items-center space-x-2">
        {items.map((item, index) => (
          <div key={index} className="flex items-center space-x-2">
            <svg className="w-4 h-4 text-gray-300 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
            {item.href && !item.current ? (
              <Link
                href={item.href}
                className="text-gray-600 hover:text-gray-900 transition-colors duration-200 font-medium leading-none h-6 flex items-center"
              >
                {item.label}
              </Link>
            ) : (
              <span className={`font-medium leading-none h-6 flex items-center ${item.current ? 'text-gray-900' : 'text-gray-600'}`}>
                {item.label}
              </span>
            )}
          </div>
        ))}
      </div>
    </nav>
  )
}

// Predefined breadcrumb configurations for common pages
export const breadcrumbConfigs = {
  admin: [
    { label: 'Admin Dashboard', href: '/admin', current: true }
  ],
  calendar: [
    { label: 'Admin Dashboard', href: '/admin' },
    { label: 'Calendar Management', current: true }
  ],
  users: [
    { label: 'Admin Dashboard', href: '/admin' },
    { label: 'User Management', current: true }
  ],
  menu: [
    { label: 'Admin Dashboard', href: '/admin' },
    { label: 'Menu Management', current: true }
  ],
  specials: [
    { label: 'Admin Dashboard', href: '/admin' },
    { label: 'Specials Management', current: true }
  ],
  events: [
    { label: 'Admin Dashboard', href: '/admin' },
    { label: 'Events Management', current: true }
  ],
  settings: [
    { label: 'Admin Dashboard', href: '/admin' },
    { label: 'Company Info', current: true }
  ],
  analytics: [
    { label: 'Admin Dashboard', href: '/admin' },
    { label: 'Analytics', current: true }
  ],
  backup: [
    { label: 'Admin Dashboard', href: '/admin' },
    { label: 'Backup & Restore', current: true }
  ],
  activityLog: [
    { label: 'Admin Dashboard', href: '/admin' },
    { label: 'Activity Log', current: true }
  ],
  adminDashboard: [
    { label: 'Admin Dashboard', current: true }
  ]
}
