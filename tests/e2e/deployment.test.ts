import { test, expect } from '@playwright/test'

test.describe('Deployment Readiness', () => {
  test('should serve platform admin interface', async ({ page }) => {
    await page.goto('/resto-admin')
    
    // Should redirect to login for unauthenticated users
    await expect(page).toHaveURL(/.*\/login/)
    
    // Login form should be present
    await expect(page.locator('h2').filter({ hasText: 'Sign in to your account' })).toBeVisible()
    await expect(page.locator('input[type="email"]')).toBeVisible()
    await expect(page.locator('input[type="password"]')).toBeVisible()
  })

  test('should serve restaurant site', async ({ page }) => {
    await page.goto('/')
    
    // Should show Monaghan's content
    await expect(page.locator('h1')).toContainText('Monaghan')
    await expect(page.locator('img[alt*="Monaghan"]')).toBeVisible()
  })

  test('should handle domain management APIs', async ({ page }) => {
    // Test domain listing API
    const domainsResponse = await page.request.get('/api/superadmin/domains')
    expect(domainsResponse.status()).toBe(401) // Unauthorized without auth
    
    // Test sites listing API
    const sitesResponse = await page.request.get('/api/superadmin/sites')
    expect(sitesResponse.status()).toBe(401) // Unauthorized without auth
  })

  test('should serve health check endpoints', async ({ page }) => {
    // Test health ping
    const pingResponse = await page.request.get('/api/health/ping')
    expect(pingResponse.status()).toBe(200)
    
    const pingData = await pingResponse.json()
    expect(pingData).toHaveProperty('status', 'ok')
    expect(pingData).toHaveProperty('timestamp')
    
    // Test health stats
    const statsResponse = await page.request.get('/api/health/stats')
    expect(statsResponse.status()).toBe(200)
    
    const statsData = await statsResponse.json()
    expect(statsData).toHaveProperty('activeSites')
    expect(statsData).toHaveProperty('uptimePings')
  })

  test('should serve events and specials APIs', async ({ page }) => {
    // Test events API
    const eventsResponse = await page.request.get('/api/events')
    expect(eventsResponse.status()).toBe(200)
    
    const eventsData = await eventsResponse.json()
    expect(Array.isArray(eventsData)).toBe(true)
    
    // Test specials API
    const specialsResponse = await page.request.get('/api/specials')
    expect(specialsResponse.status()).toBe(200)
    
    const specialsData = await specialsResponse.json()
    expect(Array.isArray(specialsData)).toBe(true)
  })

  test('should handle image optimization', async ({ page }) => {
    await page.goto('/')
    
    // Check that images are optimized
    const images = page.locator('img')
    const imageCount = await images.count()
    
    expect(imageCount).toBeGreaterThan(0)
    
    // Check that images have proper alt text
    for (let i = 0; i < imageCount; i++) {
      const alt = await images.nth(i).getAttribute('alt')
      expect(alt).toBeTruthy()
      expect(alt).not.toBe('')
    }
  })

  test('should serve proper meta tags for SEO', async ({ page }) => {
    await page.goto('/')
    
    // Check title
    const title = await page.title()
    expect(title).toContain('Monaghan')
    
    // Check meta description
    const description = await page.locator('meta[name="description"]').getAttribute('content')
    expect(description).toBeTruthy()
    expect(description).toContain('Denver')
  })

  test('should handle 404 errors gracefully', async ({ page }) => {
    const response = await page.goto('/non-existent-page')
    expect(response?.status()).toBe(404)
    
    // Should show 404 page
    await expect(page.locator('h1')).toContainText('404')
  })

  test('should serve sitemap and robots.txt', async ({ page }) => {
    // Test sitemap
    const sitemapResponse = await page.request.get('/sitemap.xml')
    expect(sitemapResponse.status()).toBe(200)
    
    // Test robots.txt
    const robotsResponse = await page.request.get('/robots.txt')
    expect(robotsResponse.status()).toBe(200)
  })
})
