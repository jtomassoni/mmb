import { test, expect } from '@playwright/test'
import { BusinessVariant } from '../../src/lib/design-tokens'

// Test data for each variant
const variantTestData = {
  dive_bar: {
    name: 'The Local Dive',
    description: 'Where locals come to unwind with cold beer and hot food',
    location: 'Downtown Denver',
    specialties: ['Buffalo Wings', 'Pool Tables', 'Live Music'],
    heroImage: '/pics/monaghans-billiards.jpg',
    todayHighlights: [
      {
        title: 'Happy Hour All Night',
        description: 'Half-price drinks until 9pm',
        time: '5:00 PM - Close',
        price: '50% off drinks',
        category: 'special',
        urgency: 'high'
      },
      {
        title: 'Live Music: The Local Legends',
        description: 'Rock covers and original songs',
        time: '9:00 PM',
        price: 'No cover charge',
        category: 'event',
        urgency: 'medium'
      }
    ]
  },
  fine_dining: {
    name: 'Chef\'s Table',
    description: 'An exquisite culinary experience with artisanal cuisine',
    location: 'Uptown Denver',
    specialties: ['Chef\'s Tasting Menu', 'Wine Pairings', 'Private Dining'],
    heroImage: '/pics/monaghans-menu-dinner.jpg',
    todayHighlights: [
      {
        title: 'Chef\'s Tasting Menu',
        description: 'Five-course seasonal menu',
        time: '6:00 PM - 10:00 PM',
        price: '$85 per person',
        category: 'special',
        urgency: 'high'
      },
      {
        title: 'Wine Wednesday',
        description: 'Sommelier-guided wine pairing',
        time: '7:00 PM',
        price: '$45 wine pairing',
        category: 'event',
        urgency: 'medium'
      }
    ]
  },
  cafe: {
    name: 'Morning Brew Café',
    description: 'Your daily dose of comfort with fresh coffee and homemade pastries',
    location: 'Capitol Hill',
    specialties: ['Fresh Coffee', 'Homemade Pastries', 'Free WiFi'],
    heroImage: '/pics/monaghans-breakfast-biscut.jpg',
    todayHighlights: [
      {
        title: 'Morning Brew Special',
        description: 'Any espresso drink with a fresh pastry',
        time: '7:00 AM - 11:00 AM',
        price: '$8 combo',
        category: 'special',
        urgency: 'high'
      },
      {
        title: 'Coffee Cupping Session',
        description: 'Guided coffee tasting',
        time: '10:00 AM',
        price: 'Free with purchase',
        category: 'event',
        urgency: 'low'
      }
    ]
  },
  sports_bar: {
    name: 'Game Day Sports Bar',
    description: 'Game day headquarters with big screens and cold beer',
    location: 'LoDo',
    specialties: ['HD TV Screens', 'Game Day Specials', 'Group Packages'],
    heroImage: '/pics/monaghans-billiard-room.jpg',
    todayHighlights: [
      {
        title: 'Broncos vs Raiders',
        description: 'Watch the game on our 20+ HD screens',
        time: '1:00 PM',
        price: 'No cover',
        category: 'event',
        urgency: 'high'
      },
      {
        title: 'Game Day Specials',
        description: 'Wings, nachos, and beer buckets',
        time: '12:00 PM - 6:00 PM',
        price: '20% off',
        category: 'special',
        urgency: 'high'
      }
    ]
  },
  family_restaurant: {
    name: 'Family Table Restaurant',
    description: 'Where families come together for homestyle cooking',
    location: 'Suburbs',
    specialties: ['Kids Menu', 'Homestyle Breakfast', 'Birthday Parties'],
    heroImage: '/pics/monaghans-menu-breakfast.jpg',
    todayHighlights: [
      {
        title: 'Kids Eat Free',
        description: 'One free kids meal with adult entrée',
        time: '4:00 PM - 8:00 PM',
        price: 'Free with adult meal',
        category: 'special',
        urgency: 'high'
      },
      {
        title: 'Homestyle Breakfast All Day',
        description: 'Our famous pancakes, eggs, and bacon',
        time: 'All day',
        price: 'Regular menu prices',
        category: 'feature',
        urgency: 'medium'
      }
    ]
  }
}

// Helper function to set up variant-specific test data
async function setupVariantTest(page: any, variant: BusinessVariant) {
  const testData = variantTestData[variant]
  
  // Mock the API responses for this variant
  await page.route('**/api/events', async route => {
    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify([
        {
          id: 1,
          name: testData.todayHighlights[1]?.title || 'Sample Event',
          description: testData.todayHighlights[1]?.description || 'Sample event description',
          startDate: '2024-01-01T19:00:00Z',
          endDate: '2024-01-01T21:00:00Z',
          price: testData.todayHighlights[1]?.price || 'Free',
          site: { name: testData.name }
        }
      ])
    })
  })
  
  await page.route('**/api/specials', async route => {
    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify([
        {
          id: 1,
          name: testData.todayHighlights[0]?.title || 'Sample Special',
          description: testData.todayHighlights[0]?.description || 'Sample special description',
          price: testData.todayHighlights[0]?.price || '$10',
          startDate: '2024-01-01T00:00:00Z',
          endDate: '2024-01-31T23:59:59Z',
          site: { name: testData.name }
        }
      ])
    })
  })
  
  // Set variant-specific environment variables
  await page.addInitScript((variant: BusinessVariant) => {
    window.__VARIANT_TEST_DATA__ = {
      variant,
      businessInfo: {
        name: variantTestData[variant].name,
        description: variantTestData[variant].description,
        url: `https://${variantTestData[variant].name.toLowerCase().replace(/\s+/g, '')}.com`,
        address: {
          streetAddress: '123 Test St',
          addressLocality: variantTestData[variant].location,
          addressRegion: 'CO',
          postalCode: '80202',
          addressCountry: 'US'
        },
        telephone: '+1-555-123-4567',
        email: `info@${variantTestData[variant].name.toLowerCase().replace(/\s+/g, '')}.com`
      }
    }
  }, variant)
}

// Test each variant
const variants: BusinessVariant[] = ['dive_bar', 'fine_dining', 'cafe', 'sports_bar', 'family_restaurant']

variants.forEach(variant => {
  test.describe(`${variant} variant snapshots`, () => {
    test.beforeEach(async ({ page }) => {
      await setupVariantTest(page, variant)
    })

    test(`should render ${variant} home page correctly`, async ({ page }) => {
      await page.goto('/')
      
      // Wait for the page to load completely
      await page.waitForLoadState('networkidle')
      
      // Take full page screenshot
      await expect(page).toHaveScreenshot(`home-page-${variant}.png`, {
        fullPage: true,
        animations: 'disabled'
      })
    })

    test(`should render ${variant} hero section correctly`, async ({ page }) => {
      await page.goto('/')
      
      // Wait for hero section to load
      await page.waitForSelector('section:has(h1)', { timeout: 10000 })
      
      // Take hero section screenshot
      const heroSection = page.locator('section:has(h1)').first()
      await expect(heroSection).toHaveScreenshot(`hero-section-${variant}.png`, {
        animations: 'disabled'
      })
    })

    test(`should render ${variant} today section correctly`, async ({ page }) => {
      await page.goto('/')
      
      // Wait for today section to load
      await page.waitForSelector('section:has(h2)', { timeout: 10000 })
      
      // Take today section screenshot
      const todaySection = page.locator('section:has(h2)').first()
      await expect(todaySection).toHaveScreenshot(`today-section-${variant}.png`, {
        animations: 'disabled'
      })
    })

    test(`should render ${variant} navigation correctly`, async ({ page }) => {
      await page.goto('/')
      
      // Wait for navigation to load
      await page.waitForSelector('nav', { timeout: 10000 })
      
      // Take navigation screenshot
      const navigation = page.locator('nav')
      await expect(navigation).toHaveScreenshot(`navigation-${variant}.png`, {
        animations: 'disabled'
      })
    })

    test(`should render ${variant} footer correctly`, async ({ page }) => {
      await page.goto('/')
      
      // Wait for footer to load
      await page.waitForSelector('footer', { timeout: 10000 })
      
      // Take footer screenshot
      const footer = page.locator('footer')
      await expect(footer).toHaveScreenshot(`footer-${variant}.png`, {
        animations: 'disabled'
      })
    })

    test(`should render ${variant} events page correctly`, async ({ page }) => {
      await page.goto('/events')
      
      // Wait for events page to load
      await page.waitForLoadState('networkidle')
      
      // Take full page screenshot
      await expect(page).toHaveScreenshot(`events-page-${variant}.png`, {
        fullPage: true,
        animations: 'disabled'
      })
    })

    test(`should render ${variant} specials page correctly`, async ({ page }) => {
      await page.goto('/specials')
      
      // Wait for specials page to load
      await page.waitForLoadState('networkidle')
      
      // Take full page screenshot
      await expect(page).toHaveScreenshot(`specials-page-${variant}.png`, {
        fullPage: true,
        animations: 'disabled'
      })
    })

    test(`should render ${variant} menu page correctly`, async ({ page }) => {
      await page.goto('/menu')
      
      // Wait for menu page to load
      await page.waitForLoadState('networkidle')
      
      // Take full page screenshot
      await expect(page).toHaveScreenshot(`menu-page-${variant}.png`, {
        fullPage: true,
        animations: 'disabled'
      })
    })

    test(`should render ${variant} about page correctly`, async ({ page }) => {
      await page.goto('/about')
      
      // Wait for about page to load
      await page.waitForLoadState('networkidle')
      
      // Take full page screenshot
      await expect(page).toHaveScreenshot(`about-page-${variant}.png`, {
        fullPage: true,
        animations: 'disabled'
      })
    })

    test(`should render ${variant} visit page correctly`, async ({ page }) => {
      await page.goto('/visit')
      
      // Wait for visit page to load
      await page.waitForLoadState('networkidle')
      
      // Take full page screenshot
      await expect(page).toHaveScreenshot(`visit-page-${variant}.png`, {
        fullPage: true,
        animations: 'disabled'
      })
    })

    test(`should render ${variant} reviews page correctly`, async ({ page }) => {
      await page.goto('/reviews')
      
      // Wait for reviews page to load
      await page.waitForLoadState('networkidle')
      
      // Take full page screenshot
      await expect(page).toHaveScreenshot(`reviews-page-${variant}.png`, {
        fullPage: true,
        animations: 'disabled'
      })
    })

    test(`should render ${variant} admin login page correctly`, async ({ page }) => {
      await page.goto('/login')
      
      // Wait for login page to load
      await page.waitForLoadState('networkidle')
      
      // Take full page screenshot
      await expect(page).toHaveScreenshot(`login-page-${variant}.png`, {
        fullPage: true,
        animations: 'disabled'
      })
    })

    test(`should render ${variant} mobile view correctly`, async ({ page }) => {
      // Set mobile viewport
      await page.setViewportSize({ width: 375, height: 667 })
      
      await page.goto('/')
      
      // Wait for page to load
      await page.waitForLoadState('networkidle')
      
      // Take mobile screenshot
      await expect(page).toHaveScreenshot(`mobile-home-${variant}.png`, {
        fullPage: true,
        animations: 'disabled'
      })
    })

    test(`should render ${variant} tablet view correctly`, async ({ page }) => {
      // Set tablet viewport
      await page.setViewportSize({ width: 768, height: 1024 })
      
      await page.goto('/')
      
      // Wait for page to load
      await page.waitForLoadState('networkidle')
      
      // Take tablet screenshot
      await expect(page).toHaveScreenshot(`tablet-home-${variant}.png`, {
        fullPage: true,
        animations: 'disabled'
      })
    })

    test(`should render ${variant} dark mode correctly`, async ({ page }) => {
      // Enable dark mode
      await page.emulateMedia({ colorScheme: 'dark' })
      
      await page.goto('/')
      
      // Wait for page to load
      await page.waitForLoadState('networkidle')
      
      // Take dark mode screenshot
      await expect(page).toHaveScreenshot(`dark-mode-home-${variant}.png`, {
        fullPage: true,
        animations: 'disabled'
      })
    })

    test(`should render ${variant} accessibility toolbar correctly`, async ({ page }) => {
      await page.goto('/')
      
      // Wait for accessibility toolbar to load
      await page.waitForSelector('[data-testid="accessibility-toolbar"]', { timeout: 10000 })
      
      // Take accessibility toolbar screenshot
      const toolbar = page.locator('[data-testid="accessibility-toolbar"]')
      await expect(toolbar).toHaveScreenshot(`accessibility-toolbar-${variant}.png`, {
        animations: 'disabled'
      })
    })

    test(`should render ${variant} JSON-LD structured data correctly`, async ({ page }) => {
      await page.goto('/')
      
      // Wait for page to load
      await page.waitForLoadState('networkidle')
      
      // Check that JSON-LD scripts are present
      const jsonLdScripts = await page.locator('script[type="application/ld+json"]').count()
      expect(jsonLdScripts).toBeGreaterThan(0)
      
      // Get JSON-LD content
      const jsonLdContent = await page.locator('script[type="application/ld+json"]').first().textContent()
      expect(jsonLdContent).toBeTruthy()
      
      // Parse and validate JSON-LD
      const jsonLd = JSON.parse(jsonLdContent!)
      expect(jsonLd['@context']).toBe('https://schema.org')
      expect(jsonLd['@type']).toBeDefined()
      expect(jsonLd.name).toBeTruthy()
    })
  })
})

// Cross-variant comparison tests
test.describe('Cross-variant comparisons', () => {
  test('should have consistent layout structure across variants', async ({ page }) => {
    const layouts: Record<string, any> = {}
    
    for (const variant of variants) {
      await setupVariantTest(page, variant)
      await page.goto('/')
      await page.waitForLoadState('networkidle')
      
      // Get layout information
      const heroSection = page.locator('section:has(h1)').first()
      const todaySection = page.locator('section:has(h2)').first()
      const navigation = page.locator('nav')
      const footer = page.locator('footer')
      
      layouts[variant] = {
        heroExists: await heroSection.count() > 0,
        todayExists: await todaySection.count() > 0,
        navExists: await navigation.count() > 0,
        footerExists: await footer.count() > 0
      }
    }
    
    // All variants should have the same basic structure
    for (const variant of variants) {
      expect(layouts[variant].heroExists).toBe(true)
      expect(layouts[variant].todayExists).toBe(true)
      expect(layouts[variant].navExists).toBe(true)
      expect(layouts[variant].footerExists).toBe(true)
    }
  })

  test('should have variant-specific content differences', async ({ page }) => {
    const content: Record<string, any> = {}
    
    for (const variant of variants) {
      await setupVariantTest(page, variant)
      await page.goto('/')
      await page.waitForLoadState('networkidle')
      
      // Get content information
      const heroTitle = await page.locator('h1').first().textContent()
      const heroSubtitle = await page.locator('h2').first().textContent()
      const todayTitle = await page.locator('section:has(h2) h2').first().textContent()
      
      content[variant] = {
        heroTitle,
        heroSubtitle,
        todayTitle
      }
    }
    
    // Variants should have different content
    const diveBarContent = content.dive_bar
    const fineDiningContent = content.fine_dining
    const cafeContent = content.cafe
    
    expect(diveBarContent.heroTitle).not.toBe(fineDiningContent.heroTitle)
    expect(diveBarContent.heroTitle).not.toBe(cafeContent.heroTitle)
    expect(fineDiningContent.heroTitle).not.toBe(cafeContent.heroTitle)
  })

  test('should have consistent responsive behavior across variants', async ({ page }) => {
    const responsiveData: Record<string, any> = {}
    
    for (const variant of variants) {
      await setupVariantTest(page, variant)
      
      // Test mobile viewport
      await page.setViewportSize({ width: 375, height: 667 })
      await page.goto('/')
      await page.waitForLoadState('networkidle')
      
      const mobileHero = page.locator('section:has(h1)').first()
      const mobileHeroVisible = await mobileHero.isVisible()
      
      // Test desktop viewport
      await page.setViewportSize({ width: 1200, height: 800 })
      await page.waitForTimeout(500) // Wait for layout to adjust
      
      const desktopHero = page.locator('section:has(h1)').first()
      const desktopHeroVisible = await desktopHero.isVisible()
      
      responsiveData[variant] = {
        mobileHeroVisible,
        desktopHeroVisible
      }
    }
    
    // All variants should behave consistently across viewports
    for (const variant of variants) {
      expect(responsiveData[variant].mobileHeroVisible).toBe(true)
      expect(responsiveData[variant].desktopHeroVisible).toBe(true)
    }
  })
})

// Performance tests for each variant
test.describe('Variant performance tests', () => {
  variants.forEach(variant => {
    test(`${variant} variant should load within performance budget`, async ({ page }) => {
      await setupVariantTest(page, variant)
      
      const startTime = Date.now()
      await page.goto('/')
      await page.waitForLoadState('networkidle')
      const loadTime = Date.now() - startTime
      
      // Performance budget: 3 seconds
      expect(loadTime).toBeLessThan(3000)
      
      // Check Core Web Vitals
      const metrics = await page.evaluate(() => {
        return new Promise((resolve) => {
          new PerformanceObserver((list) => {
            const entries = list.getEntries()
            const vitals = {
              LCP: 0,
              FID: 0,
              CLS: 0
            }
            
            entries.forEach((entry) => {
              if (entry.entryType === 'largest-contentful-paint') {
                vitals.LCP = entry.startTime
              } else if (entry.entryType === 'first-input') {
                vitals.FID = entry.processingStart - entry.startTime
              } else if (entry.entryType === 'layout-shift') {
                vitals.CLS += (entry as any).value
              }
            })
            
            resolve(vitals)
          }).observe({ entryTypes: ['largest-contentful-paint', 'first-input', 'layout-shift'] })
          
          // Resolve after 5 seconds if no metrics collected
          setTimeout(() => resolve({ LCP: 0, FID: 0, CLS: 0 }), 5000)
        })
      })
      
      // Core Web Vitals thresholds
      expect((metrics as any).LCP).toBeLessThan(2500) // LCP < 2.5s
      expect((metrics as any).FID).toBeLessThan(100) // FID < 100ms
      expect((metrics as any).CLS).toBeLessThan(0.1) // CLS < 0.1
    })
  })
})
