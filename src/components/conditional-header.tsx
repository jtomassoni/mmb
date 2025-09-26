'use client'

import { usePathname } from 'next/navigation'
import { Header } from './header'

export function ConditionalHeader() {
  // Always show header for consistent navigation
  return <Header />
}
