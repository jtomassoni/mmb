'use client'

import { SessionProvider } from "next-auth/react"
import { CartProvider } from "./cart-context"
import { ToastProvider } from "./toast"

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <SessionProvider>
      <CartProvider>
        <ToastProvider>
          {children}
        </ToastProvider>
      </CartProvider>
    </SessionProvider>
  )
}
