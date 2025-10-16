'use client'

import { useState, useRef, useEffect } from 'react'
import Image from 'next/image'

interface HeroProps {
  title: string
  subhead: string
  proof?: string[]
  primaryCta: {
    label: string
    href: string
  }
  secondaryCta?: {
    label: string
    href: string
  }
  media: {
    type: 'image' | 'video'
    src: string
    poster?: string
    alt?: string
  }
  isOpen?: boolean
  openHeadline?: string
}

export function Hero({
  title,
  subhead,
  proof = [],
  primaryCta,
  secondaryCta,
  media,
  isOpen = false,
  openHeadline = "We're Open!"
}: HeroProps) {
  const [isVideoPlaying, setIsVideoPlaying] = useState(true)
  const [isVideoPaused, setIsVideoPaused] = useState(false)
  const videoRef = useRef<HTMLVideoElement>(null)

  const handleVideoToggle = () => {
    if (videoRef.current) {
      if (isVideoPaused) {
        videoRef.current.play()
        setIsVideoPaused(false)
      } else {
        videoRef.current.pause()
        setIsVideoPaused(true)
      }
    }
  }

  useEffect(() => {
    // Respect prefers-reduced-motion
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    if (prefersReducedMotion && media.type === 'video') {
      setIsVideoPlaying(false)
      if (videoRef.current) {
        videoRef.current.pause()
      }
    }
  }, [media.type])

  return (
    <header 
      role="banner" 
      className="relative min-h-[calc(100vh-3.5rem)] flex items-center justify-center overflow-hidden"
    >
      {/* Background Media */}
      <div className="absolute inset-0 z-0">
        {media.type === 'image' ? (
          <Image
            src={media.src}
            alt={media.alt || title}
            fill
            className="object-cover"
            priority
            sizes="100vw"
          />
        ) : (
          <video
            ref={videoRef}
            className="w-full h-full object-cover"
            autoPlay
            muted
            loop
            playsInline
            poster={media.poster}
            onPlay={() => setIsVideoPlaying(true)}
            onPause={() => setIsVideoPlaying(false)}
          >
            <source src={media.src} type="video/mp4" />
            {/* Fallback image */}
            <Image
              src={media.poster || media.src}
              alt={media.alt || title}
              fill
              className="object-cover"
            />
          </video>
        )}
      </div>

      {/* Gradient Overlay */}
      <div className="absolute inset-0 bg-gradient-to-br from-black/60 via-black/20 to-transparent z-10" />
      
      {/* Vignette Overlay */}
      <div className="absolute inset-0 bg-gradient-radial from-transparent via-transparent to-black/30 z-20" />

      {/* Video Controls */}
      {media.type === 'video' && (
        <button
          onClick={handleVideoToggle}
          className="absolute top-4 right-4 z-30 bg-black/50 hover:bg-black/70 text-white p-2 rounded-full transition-colors"
          aria-label={isVideoPaused ? 'Play video' : 'Pause video'}
        >
          {isVideoPaused ? (
            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
              <path d="M8 5v10l8-5-8-5z" />
            </svg>
          ) : (
            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
              <path d="M6 4h2v12H6V4zm6 0h2v12h-2V4z" />
            </svg>
          )}
        </button>
      )}

      {/* Content Container */}
      <div className="relative z-30 w-full max-w-screen-md mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center lg:text-left">
          {/* Status Pill */}
          {isOpen && (
            <div 
              className="inline-flex items-center gap-2 bg-emerald-500/20 backdrop-blur-sm border border-emerald-400/30 rounded-full px-3 py-1 mb-6"
              aria-live="polite"
            >
              <div className="w-2 h-2 bg-emerald-400 rounded-full animate-pulse" />
              <span className="text-emerald-100 text-sm font-medium">{openHeadline}</span>
            </div>
          )}

          {/* Main Content */}
          <div className="bg-white/8 backdrop-blur-md rounded-2xl p-6 sm:p-8 ring-1 ring-white/10 shadow-lg">
            <h1 className="text-[clamp(2rem,4vw,4.5rem)] font-bold text-white mb-4 leading-tight">
              {title}
            </h1>
            
            <p className="text-[clamp(1rem,2vw,1.25rem)] text-white/90 mb-6 leading-relaxed">
              {subhead}
            </p>

            {/* Micro-proof Row */}
            {proof.length > 0 && (
              <div className="flex flex-wrap gap-2 mb-6">
                {proof.map((item, index) => (
                  <span 
                    key={index}
                    className="inline-flex items-center px-3 py-1 bg-white/10 rounded-full text-white/80 text-sm"
                  >
                    {item}
                  </span>
                ))}
              </div>
            )}

            {/* CTAs */}
            <div className="flex flex-col sm:flex-row gap-3">
              <a
                href={primaryCta.href}
                className="inline-flex items-center justify-center px-6 py-3 bg-emerald-500 hover:bg-emerald-400 text-black font-semibold rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-emerald-400 focus:ring-offset-2 focus:ring-offset-black/20"
              >
                {primaryCta.label}
              </a>
              
              {secondaryCta && (
                <a
                  href={secondaryCta.href}
                  className="inline-flex items-center justify-center px-6 py-3 border border-white/30 hover:border-white/50 text-white font-semibold rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-white/30 focus:ring-offset-2 focus:ring-offset-black/20"
                >
                  {secondaryCta.label}
                </a>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Safe Area Padding */}
      <div className="absolute inset-0 pointer-events-none" style={{ paddingTop: 'env(safe-area-inset-top)', paddingBottom: 'env(safe-area-inset-bottom)' }} />
    </header>
  )
}
