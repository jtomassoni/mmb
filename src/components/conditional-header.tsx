'use client'

import { usePathname } from 'next/navigation'
import { HeaderClient } from './header'

export function ConditionalHeader() {
  // Always show header for consistent navigation
  return <HeaderClient />
}
