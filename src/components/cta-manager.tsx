'use client'

import React, { useState } from 'react'

interface CTA {
  id?: string
  text: string
  url: string
  type: 'external' | 'facebook' | 'phone' | 'email'
  isActive: boolean
}

interface CTAManagerProps {
  ctas: CTA[]
  onChange: (ctas: CTA[]) => void
  className?: string
}

export function CTAManager({ ctas, onChange, className = '' }: CTAManagerProps) {
  const [newCTA, setNewCTA] = useState<CTA>({
    text: '',
    url: '',
    type: 'external',
    isActive: true
  })

  const addCTA = () => {
    if (newCTA.text && newCTA.url) {
      const ctaWithId = { ...newCTA, id: `cta_${Date.now()}` }
      onChange([...ctas, ctaWithId])
      setNewCTA({ text: '', url: '', type: 'external', isActive: true })
    }
  }

  const removeCTA = (id: string) => {
    onChange(ctas.filter(cta => cta.id !== id))
  }

  const updateCTA = (id: string, field: keyof CTA, value: any) => {
    onChange(ctas.map(cta => 
      cta.id === id ? { ...cta, [field]: value } : cta
    ))
  }

  return (
    <div className={className}>
      <label className="block text-sm font-medium text-gray-700 mb-2">
        Call-to-Action Buttons
      </label>
      
      {/* Existing CTAs */}
      <div className="space-y-3 mb-4">
        {ctas.map((cta) => (
          <div key={cta.id} className="flex items-center gap-3 p-3 border border-gray-200 rounded-lg">
            <div className="flex-1 grid grid-cols-1 md:grid-cols-3 gap-2">
              <input
                type="text"
                value={cta.text}
                onChange={(e) => updateCTA(cta.id!, 'text', e.target.value)}
                placeholder="Button text (e.g., Get Tickets)"
                className="px-3 py-2 border border-gray-300 rounded text-sm focus:ring-2 focus:ring-green-500 focus:border-green-500 text-gray-900 placeholder-gray-500"
              />
              <input
                type="url"
                value={cta.url}
                onChange={(e) => updateCTA(cta.id!, 'url', e.target.value)}
                placeholder="URL (e.g., https://tickets.com)"
                className="px-3 py-2 border border-gray-300 rounded text-sm focus:ring-2 focus:ring-green-500 focus:border-green-500 text-gray-900 placeholder-gray-500"
              />
              <select
                value={cta.type}
                onChange={(e) => updateCTA(cta.id!, 'type', e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded text-sm focus:ring-2 focus:ring-green-500 focus:border-green-500 text-gray-900"
              >
                <option value="external">External Link</option>
                <option value="facebook">Facebook</option>
                <option value="phone">Phone</option>
                <option value="email">Email</option>
              </select>
            </div>
            <div className="flex items-center gap-2">
              <label className="flex items-center">
                <input
                  type="checkbox"
                  checked={cta.isActive}
                  onChange={(e) => updateCTA(cta.id!, 'isActive', e.target.checked)}
                  className="w-4 h-4 text-green-600 border-gray-300 rounded focus:ring-green-500"
                />
                <span className="ml-1 text-xs text-gray-600">Active</span>
              </label>
              <button
                type="button"
                onClick={() => removeCTA(cta.id!)}
                className="text-red-600 hover:text-red-800 text-sm"
              >
                Remove
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Add New CTA */}
      <div className="border-2 border-dashed border-gray-300 rounded-lg p-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-2 mb-3">
          <input
            type="text"
            value={newCTA.text}
            onChange={(e) => setNewCTA({ ...newCTA, text: e.target.value })}
            placeholder="Button text (e.g., Get Tickets)"
            className="px-3 py-2 border border-gray-300 rounded text-sm focus:ring-2 focus:ring-green-500 focus:border-green-500 text-gray-900 placeholder-gray-500"
          />
          <input
            type="url"
            value={newCTA.url}
            onChange={(e) => setNewCTA({ ...newCTA, url: e.target.value })}
            placeholder="URL (e.g., https://tickets.com)"
            className="px-3 py-2 border border-gray-300 rounded text-sm focus:ring-2 focus:ring-green-500 focus:border-green-500 text-gray-900 placeholder-gray-500"
          />
          <select
            value={newCTA.type}
            onChange={(e) => setNewCTA({ ...newCTA, type: e.target.value as CTA['type'] })}
            className="px-3 py-2 border border-gray-300 rounded text-sm focus:ring-2 focus:ring-green-500 focus:border-green-500 text-gray-900"
          >
            <option value="external">External Link</option>
            <option value="facebook">Facebook</option>
            <option value="phone">Phone</option>
            <option value="email">Email</option>
          </select>
        </div>
        <button
          type="button"
          onClick={addCTA}
          disabled={!newCTA.text || !newCTA.url}
          className="px-4 py-2 bg-green-600 text-white rounded text-sm hover:bg-green-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
        >
          Add CTA Button
        </button>
      </div>
    </div>
  )
}
