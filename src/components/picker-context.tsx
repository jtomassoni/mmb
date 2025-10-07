'use client'

import React, { createContext, useContext, useState, useRef, useEffect } from 'react'

interface PickerContextType {
  activePicker: string | null
  setActivePicker: (pickerId: string | null) => void
}

const PickerContext = createContext<PickerContextType | undefined>(undefined)

export function PickerProvider({ children }: { children: React.ReactNode }) {
  const [activePicker, setActivePicker] = useState<string | null>(null)

  return (
    <PickerContext.Provider value={{ activePicker, setActivePicker }}>
      {children}
    </PickerContext.Provider>
  )
}

export function usePicker() {
  const context = useContext(PickerContext)
  if (context === undefined) {
    throw new Error('usePicker must be used within a PickerProvider')
  }
  return context
}
