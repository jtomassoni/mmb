/**
 * Smooth scroll utility with custom easing
 */

export interface SmoothScrollOptions {
  duration?: number
  offset?: number
  focusAfterScroll?: boolean
  easing?: 'easeInOutCubic' | 'easeOutQuart' | 'easeInOutQuart'
}

/**
 * Smooth scroll to an element with custom easing
 */
export function smoothScrollToElement(
  element: Element,
  options: SmoothScrollOptions = {}
): Promise<void> {
  const {
    duration = 800,
    offset = 0,
    focusAfterScroll = true,
    easing = 'easeInOutCubic'
  } = options

  return new Promise((resolve) => {
    const rect = element.getBoundingClientRect()
    const elementTop = rect.top + window.pageYOffset
    const targetY = elementTop - (window.innerHeight / 2) + (rect.height / 2) + offset
    
    const startTime = performance.now()
    const startY = window.pageYOffset
    const distance = targetY - startY

    // Add a subtle highlight effect to the element
    const originalClass = element.className
    element.className = originalClass + ' ring-2 ring-red-400 ring-opacity-50'
    
    // Remove the highlight after animation
    setTimeout(() => {
      element.className = originalClass
    }, duration + 200)

    // Easing functions
    const easingFunctions = {
      easeInOutCubic: (t: number): number => {
        return t < 0.5 ? 4 * t * t * t : (t - 1) * (2 * t - 2) * (2 * t - 2) + 1
      },
      easeOutQuart: (t: number): number => {
        return 1 - Math.pow(1 - t, 4)
      },
      easeInOutQuart: (t: number): number => {
        return t < 0.5 ? 8 * t * t * t * t : 1 - Math.pow(-2 * t + 2, 4) / 2
      }
    }

    const ease = easingFunctions[easing]

    const animateScroll = (currentTime: number) => {
      const elapsed = currentTime - startTime
      const progress = Math.min(elapsed / duration, 1)
      const easedProgress = ease(progress)
      
      window.scrollTo(0, startY + (distance * easedProgress))
      
      if (progress < 1) {
        requestAnimationFrame(animateScroll)
      } else {
        // Focus the element after scroll completes
        if (focusAfterScroll) {
          if (element instanceof HTMLInputElement || 
              element instanceof HTMLTextAreaElement || 
              element instanceof HTMLSelectElement) {
            element.focus()
          }
        }
        resolve()
      }
    }
    
    requestAnimationFrame(animateScroll)
  })
}

/**
 * Smooth scroll to the first error field on the page
 */
export function scrollToFirstError(options: SmoothScrollOptions = {}): Promise<void> {
  const firstErrorField = document.querySelector('.border-red-300')
  if (firstErrorField) {
    return smoothScrollToElement(firstErrorField, options)
  }
  return Promise.resolve()
}

/**
 * Smooth scroll to a specific selector
 */
export function scrollToSelector(
  selector: string,
  options: SmoothScrollOptions = {}
): Promise<void> {
  const element = document.querySelector(selector)
  if (element) {
    return smoothScrollToElement(element, options)
  }
  return Promise.resolve()
}
