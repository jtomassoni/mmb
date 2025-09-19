// tests/e2e/smoke-flows.test.ts
import { test, expect } from '@playwright/test'

test.describe('Public Smoke Flows', () => {
  test('should navigate through all public pages', async ({ page }) => {
    // Start at home page
    await page.goto('/')
    await page.waitForLoadState('networkidle')
    
    // Verify home page loads correctly
    await expect(page.locator('h1')).toContainText("Monaghan's Bar & Grill")
    await expect(page.locator('text=Where Denver comes to eat, drink, and play')).toBeVisible()
    
    // Test navigation to menu page via header
    await page.click('nav a[href="/menu"]')
    await page.waitForLoadState('networkidle')
    await expect(page.locator('h1')).toContainText('Menu')
    
    // Test navigation to specials page via header
    await page.click('nav a[href="/specials"]')
    await page.waitForLoadState('networkidle')
    await expect(page.locator('h1')).toContainText('Daily Specials')
    
    // Test navigation to events page via header
    await page.click('nav a[href="/events"]')
    await page.waitForLoadState('networkidle')
    await expect(page.locator('h1')).toContainText('Events & Entertainment')
    
    // Test navigation to about page via header
    await page.click('nav a[href="/about"]')
    await page.waitForLoadState('networkidle')
    await expect(page.locator('h1')).toContainText('About')
    
    // Test navigation to visit page via header
    await page.click('nav a[href="/visit"]')
    await page.waitForLoadState('networkidle')
    await expect(page.locator('h1')).toContainText('Visit')
    
    // Test navigation to reviews page via content link (not in header)
    await page.goto('/')
    await page.waitForLoadState('networkidle')
    await page.click('a[href="/reviews"]')
    await page.waitForLoadState('networkidle')
    await expect(page.locator('h1')).toContainText('Reviews')
  })

  test('should display specials correctly on home page', async ({ page }) => {
    await page.goto('/')
    await page.waitForLoadState('networkidle')
    
    // Check that specials section exists
    await expect(page.locator('text=Today\'s Specials')).toBeVisible()
    
    // Check that specials cards are displayed (at least one)
    const specialsSection = page.locator('section').filter({ hasText: "Today's Specials" })
    await expect(specialsSection).toBeVisible()
    
    // Check that "View All Specials" button works
    await page.click('a[href="/specials"]')
    await page.waitForLoadState('networkidle')
    await expect(page.locator('h1')).toContainText('Daily Specials')
  })

  test('should display events correctly', async ({ page }) => {
    await page.goto('/events')
    await page.waitForLoadState('networkidle')
    
    // Check that events section loads
    await expect(page.locator('h1')).toContainText('Events & Entertainment')
    
    // Check for private events section
    await expect(page.locator('text=Private Events')).toBeVisible()
    
    // Check for phone number link
    await expect(page.locator('a[href="tel:3035550123"]')).toBeVisible()
  })

  test('should have working contact information', async ({ page }) => {
    await page.goto('/visit')
    await page.waitForLoadState('networkidle')
    
    // Check for address
    await expect(page.locator('text=1234 Main Street')).toBeVisible()
    
    // Check for phone number
    await expect(page.locator('text=(303) 555-0123')).toBeVisible()
    
    // Check for email
    await expect(page.locator('text=info@monaghansbargrill.com')).toBeVisible()
  })

  test('should have proper meta tags and SEO', async ({ page }) => {
    await page.goto('/')
    await page.waitForLoadState('networkidle')
    
    // Check for title
    await expect(page).toHaveTitle(/Monaghan/)
    
    // Check for meta description
    const metaDescription = page.locator('meta[name="description"]')
    await expect(metaDescription).toHaveAttribute('content', /Denver/)
    
    // Check for JSON-LD structured data
    const jsonLd = page.locator('script[type="application/ld+json"]')
    await expect(jsonLd).toHaveCount(1)
  })

  test('should handle image loading correctly', async ({ page }) => {
    await page.goto('/')
    await page.waitForLoadState('networkidle')
    
    // Check that hero image loads (first one with Monaghan's in alt)
    const heroImage = page.locator('img[alt*="Monaghan\'s Bar & Grill"]').first()
    await expect(heroImage).toBeVisible()
    
    // Check that gallery images load
    const galleryImages = page.locator('img[alt*="Pool tables"], img[alt*="Bar area"], img[alt*="Breakfast"], img[alt*="patio"]')
    await expect(galleryImages).toHaveCount(4)
    
    // Check that specials images load (at least one)
    const specialsImages = page.locator('img[alt*="Fish"], img[alt*="Taco"], img[alt*="Quesadilla"]')
    await expect(specialsImages.first()).toBeVisible()
  })
})

test.describe('Admin Smoke Flows', () => {
  test('should redirect unauthenticated users to login', async ({ page }) => {
    // Try to access admin pages without authentication
    await page.goto('/admin')
    await page.waitForLoadState('networkidle')
    
    // Should redirect to login page
    await expect(page.url()).toContain('/login')
    await expect(page.locator('h2').filter({ hasText: 'Sign in to your account' })).toBeVisible()
  })

  test('should redirect unauthenticated users from admin events', async ({ page }) => {
    await page.goto('/admin/events')
    await page.waitForLoadState('networkidle')
    
    // Should redirect to login page
    await expect(page.url()).toContain('/login')
  })

  test('should redirect unauthenticated users from admin specials', async ({ page }) => {
    await page.goto('/admin/specials')
    await page.waitForLoadState('networkidle')
    
    // Should redirect to login page
    await expect(page.url()).toContain('/login')
  })

  test('should display login form correctly', async ({ page }) => {
    await page.goto('/login')
    await page.waitForLoadState('networkidle')
    
    // Check login form elements
    await expect(page.locator('input[type="email"]')).toBeVisible()
    await expect(page.locator('input[type="password"]')).toBeVisible()
    await expect(page.locator('button[type="submit"]')).toBeVisible()
    
    // Check form labels (be more specific)
    await expect(page.locator('label[for="email"]')).toContainText('Email')
    await expect(page.locator('label[for="password"]')).toContainText('Password')
  })

  test('should handle login form validation', async ({ page }) => {
    await page.goto('/login')
    await page.waitForLoadState('networkidle')
    
    // Try to submit empty form
    await page.click('button[type="submit"]')
    
    // Should show validation errors
    await expect(page.locator('input[type="email"]')).toHaveAttribute('required')
    await expect(page.locator('input[type="password"]')).toHaveAttribute('required')
  })
})

test.describe('API Smoke Tests', () => {
  test('should serve events API', async ({ request }) => {
    const response = await request.get('/api/events')
    expect(response.status()).toBe(200)
    
    const data = await response.json()
    expect(data).toHaveProperty('events')
    expect(data).toHaveProperty('count')
    expect(Array.isArray(data.events)).toBe(true)
  })

  test('should serve specials API', async ({ request }) => {
    const response = await request.get('/api/specials')
    expect(response.status()).toBe(200)
    
    const data = await response.json()
    expect(data).toHaveProperty('specials')
    expect(data).toHaveProperty('count')
    expect(Array.isArray(data.specials)).toBe(true)
  })

  test('should serve health stats API', async ({ request }) => {
    const response = await request.get('/api/health/stats')
    expect(response.status()).toBe(200)
    
    const data = await response.json()
    expect(data).toHaveProperty('activeSites')
    expect(data).toHaveProperty('last7dEdits')
    expect(data).toHaveProperty('eventsThisWeek')
    expect(data).toHaveProperty('specialsCount')
    expect(data).toHaveProperty('uptimePings')
  })

  test('should serve health ping API', async ({ request }) => {
    const response = await request.get('/api/health/ping')
    expect(response.status()).toBe(200)
    
    const data = await response.json()
    expect(data).toHaveProperty('recentPings')
    expect(data).toHaveProperty('siteStats')
    expect(data).toHaveProperty('timestamp')
  })
})

test.describe('Error Handling', () => {
  test('should handle 404 pages gracefully', async ({ page }) => {
    const response = await page.goto('/nonexistent-page')
    expect(response?.status()).toBe(404)
  })

  test('should handle API errors gracefully', async ({ request }) => {
    // Test invalid API endpoint
    const response = await request.get('/api/nonexistent')
    expect(response.status()).toBe(404)
  })
})
