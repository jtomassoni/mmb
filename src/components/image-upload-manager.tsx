'use client'

import React, { useState, useRef } from 'react'

interface EventImage {
  id?: string
  url: string
  alt: string
  caption: string
  sortOrder: number
}

interface ImageUploadManagerProps {
  images: EventImage[]
  onChange: (images: EventImage[]) => void
  className?: string
}

export function ImageUploadManager({ images, onChange, className = '' }: ImageUploadManagerProps) {
  const [uploading, setUploading] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleFileUpload = async (files: FileList) => {
    setUploading(true)
    
    try {
      const uploadPromises = Array.from(files).map(async (file, index) => {
        // Create a mock URL for now - in production, you'd upload to a service
        const mockUrl = URL.createObjectURL(file)
        
        return {
          id: `img_${Date.now()}_${index}`,
          url: mockUrl,
          alt: file.name.split('.')[0],
          caption: '',
          sortOrder: images.length + index
        }
      })

      const newImages = await Promise.all(uploadPromises)
      onChange([...images, ...newImages])
    } catch (error) {
      console.error('Error uploading images:', error)
      alert('Failed to upload images')
    } finally {
      setUploading(false)
    }
  }

  const removeImage = (id: string) => {
    onChange(images.filter(img => img.id !== id))
  }

  const updateImage = (id: string, field: keyof EventImage, value: any) => {
    onChange(images.map(img => 
      img.id === id ? { ...img, [field]: value } : img
    ))
  }

  const moveImage = (id: string, direction: 'up' | 'down') => {
    const currentIndex = images.findIndex(img => img.id === id)
    if (currentIndex === -1) return

    const newIndex = direction === 'up' ? currentIndex - 1 : currentIndex + 1
    if (newIndex < 0 || newIndex >= images.length) return

    const newImages = [...images]
    const [movedImage] = newImages.splice(currentIndex, 1)
    newImages.splice(newIndex, 0, movedImage)

    // Update sort orders
    const updatedImages = newImages.map((img, index) => ({
      ...img,
      sortOrder: index
    }))

    onChange(updatedImages)
  }

  return (
    <div className={className}>
      <label className="block text-sm font-medium text-gray-700 mb-2">
        Event Images
      </label>

      {/* Upload Area */}
      <div className="mb-4">
        <div
          className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-gray-400 transition-colors cursor-pointer"
          onClick={() => fileInputRef.current?.click()}
        >
          <input
            ref={fileInputRef}
            type="file"
            multiple
            accept="image/*"
            onChange={(e) => e.target.files && handleFileUpload(e.target.files)}
            className="hidden"
          />
          <div className="text-gray-500">
            <svg className="mx-auto h-12 w-12 text-gray-400" stroke="currentColor" fill="none" viewBox="0 0 48 48">
              <path d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8m-12 4h.02" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
            <p className="mt-2 text-sm">
              {uploading ? 'Uploading...' : 'Click to upload images or drag and drop'}
            </p>
            <p className="text-xs text-gray-400">PNG, JPG, GIF up to 10MB each</p>
          </div>
        </div>
      </div>

      {/* Image List */}
      <div className="space-y-3">
        {images.map((image, index) => (
          <div key={image.id} className="flex items-center gap-3 p-3 border border-gray-200 rounded-lg">
            <div className="flex-shrink-0">
              <img
                src={image.url}
                alt={image.alt}
                className="w-16 h-16 object-cover rounded"
              />
            </div>
            
            <div className="flex-1 grid grid-cols-1 md:grid-cols-2 gap-2">
              <input
                type="text"
                value={image.alt}
                onChange={(e) => updateImage(image.id!, 'alt', e.target.value)}
                placeholder="Alt text for accessibility"
                className="px-3 py-2 border border-gray-300 rounded text-sm focus:ring-2 focus:ring-green-500 focus:border-green-500 text-gray-900 placeholder-gray-500"
              />
              <input
                type="text"
                value={image.caption}
                onChange={(e) => updateImage(image.id!, 'caption', e.target.value)}
                placeholder="Image caption (optional)"
                className="px-3 py-2 border border-gray-300 rounded text-sm focus:ring-2 focus:ring-green-500 focus:border-green-500 text-gray-900 placeholder-gray-500"
              />
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => moveImage(image.id!, 'up')}
                disabled={index === 0}
                className="p-1 text-gray-400 hover:text-gray-600 disabled:opacity-50 disabled:cursor-not-allowed"
                title="Move up"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" />
                </svg>
              </button>
              <button
                type="button"
                onClick={() => moveImage(image.id!, 'down')}
                disabled={index === images.length - 1}
                className="p-1 text-gray-400 hover:text-gray-600 disabled:opacity-50 disabled:cursor-not-allowed"
                title="Move down"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </button>
              <button
                type="button"
                onClick={() => removeImage(image.id!)}
                className="p-1 text-red-600 hover:text-red-800"
                title="Remove image"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
          </div>
        ))}
      </div>

      {images.length === 0 && (
        <p className="text-sm text-gray-500 text-center py-4">
          No images uploaded yet. Upload images to enhance your event.
        </p>
      )}
    </div>
  )
}
