'use client'

import { ReactNode } from 'react'
import { Breadcrumb, BreadcrumbItem } from './breadcrumb'

interface AdminLayoutProps {
  children: ReactNode
  breadcrumbItems: BreadcrumbItem[]
  title: string
  subtitle?: string
}

export function AdminLayout({ children, breadcrumbItems, title, subtitle }: AdminLayoutProps) {
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Breadcrumb */}
        <div className="mb-6">
          <Breadcrumb items={breadcrumbItems} />
        </div>

        {/* Page Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">{title}</h1>
          {subtitle && (
            <p className="text-gray-600 mt-2">{subtitle}</p>
          )}
        </div>

        {/* Page Content */}
        {children}
      </div>
    </div>
  )
}
