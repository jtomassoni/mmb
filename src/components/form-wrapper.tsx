'use client'

import React from 'react'
import { PickerProvider } from './picker-context'

interface FormWrapperProps {
  children: React.ReactNode
  className?: string
}

export function FormWrapper({ children, className = '' }: FormWrapperProps) {
  return (
    <PickerProvider>
      <div className={className}>
        {children}
      </div>
    </PickerProvider>
  )
}
