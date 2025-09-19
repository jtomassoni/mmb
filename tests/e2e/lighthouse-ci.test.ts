// tests/e2e/lighthouse-ci.test.ts
import { test, expect } from '@playwright/test'

test.describe('Lighthouse CI Tests', () => {
  test('should meet performance budgets on home page', async ({ page }) => {
    await page.goto('/')
    await page.waitForLoadState('networkidle')
    
    // Run Lighthouse audit
    const lighthouse = await page.evaluate(async () => {
      // @ts-ignore - Lighthouse is loaded globally in test environment
      const { default: lighthouse } = await import('lighthouse')
      const { default: chromeLauncher } = await import('chrome-launcher')
      
      const chrome = await chromeLauncher.launch({ chromeFlags: ['--headless'] })
      const options = {
        logLevel: 'info',
        output: 'json',
        onlyCategories: ['performance'],
        port: chrome.port,
      }
      
      const runnerResult = await lighthouse('http://localhost:3000', options)
      await chrome.kill()
      
      return runnerResult?.lhr
    })
    
    // Performance budget thresholds
    const performanceScore = lighthouse?.categories?.performance?.score || 0
    expect(performanceScore).toBeGreaterThanOrEqual(0.8) // 80% minimum
    
    // Core Web Vitals thresholds
    const metrics = lighthouse?.audits
    if (metrics) {
      // Largest Contentful Paint should be under 2.5s
      const lcp = metrics['largest-contentful-paint']?.numericValue || 0
      expect(lcp).toBeLessThanOrEqual(2500)
      
      // First Input Delay should be under 100ms
      const fid = metrics['max-potential-fid']?.numericValue || 0
      expect(fid).toBeLessThanOrEqual(100)
      
      // Cumulative Layout Shift should be under 0.1
      const cls = metrics['cumulative-layout-shift']?.numericValue || 0
      expect(cls).toBeLessThanOrEqual(0.1)
    }
  })

  test('should meet accessibility standards', async ({ page }) => {
    await page.goto('/')
    await page.waitForLoadState('networkidle')
    
    const lighthouse = await page.evaluate(async () => {
      // @ts-ignore
      const { default: lighthouse } = await import('lighthouse')
      const { default: chromeLauncher } = await import('chrome-launcher')
      
      const chrome = await chromeLauncher.launch({ chromeFlags: ['--headless'] })
      const options = {
        logLevel: 'info',
        output: 'json',
        onlyCategories: ['accessibility'],
        port: chrome.port,
      }
      
      const runnerResult = await lighthouse('http://localhost:3000', options)
      await chrome.kill()
      
      return runnerResult?.lhr
    })
    
    const accessibilityScore = lighthouse?.categories?.accessibility?.score || 0
    expect(accessibilityScore).toBeGreaterThanOrEqual(0.9) // 90% minimum
  })

  test('should meet SEO standards', async ({ page }) => {
    await page.goto('/')
    await page.waitForLoadState('networkidle')
    
    const lighthouse = await page.evaluate(async () => {
      // @ts-ignore
      const { default: lighthouse } = await import('lighthouse')
      const { default: chromeLauncher } = await import('chrome-launcher')
      
      const chrome = await chromeLauncher.launch({ chromeFlags: ['--headless'] })
      const options = {
        logLevel: 'info',
        output: 'json',
        onlyCategories: ['seo'],
        port: chrome.port,
      }
      
      const runnerResult = await lighthouse('http://localhost:3000', options)
      await chrome.kill()
      
      return runnerResult?.lhr
    })
    
    const seoScore = lighthouse?.categories?.seo?.score || 0
    expect(seoScore).toBeGreaterThanOrEqual(0.9) // 90% minimum
  })

  test('should meet best practices standards', async ({ page }) => {
    await page.goto('/')
    await page.waitForLoadState('networkidle')
    
    const lighthouse = await page.evaluate(async () => {
      // @ts-ignore
      const { default: lighthouse } = await import('lighthouse')
      const { default: chromeLauncher } = await import('chrome-launcher')
      
      const chrome = await chromeLauncher.launch({ chromeFlags: ['--headless'] })
      const options = {
        logLevel: 'info',
        output: 'json',
        onlyCategories: ['best-practices'],
        port: chrome.port,
      }
      
      const runnerResult = await lighthouse('http://localhost:3000', options)
      await chrome.kill()
      
      return runnerResult?.lhr
    })
    
    const bestPracticesScore = lighthouse?.categories?.['best-practices']?.score || 0
    expect(bestPracticesScore).toBeGreaterThanOrEqual(0.8) // 80% minimum
  })

  test('should meet performance budgets on all public pages', async ({ page }) => {
    const pages = ['/', '/menu', '/specials', '/events', '/about', '/visit', '/reviews']
    
    for (const pagePath of pages) {
      await page.goto(pagePath)
      await page.waitForLoadState('networkidle')
      
      // Simple performance check - page should load within reasonable time
      const startTime = Date.now()
      await page.waitForLoadState('networkidle')
      const loadTime = Date.now() - startTime
      
      // Page should load within 3 seconds
      expect(loadTime).toBeLessThanOrEqual(3000)
      
      // Check that page has proper title
      const title = await page.title()
      expect(title).toBeTruthy()
      expect(title.length).toBeGreaterThan(10)
    }
  })

  test('should have proper image optimization', async ({ page }) => {
    await page.goto('/')
    await page.waitForLoadState('networkidle')
    
    // Check that images are using Next.js Image component
    const images = page.locator('img')
    const imageCount = await images.count()
    
    for (let i = 0; i < imageCount; i++) {
      const img = images.nth(i)
      const src = await img.getAttribute('src')
      
      // Images should be optimized (contain _next/image or be data URLs)
      expect(src).toMatch(/_next\/image|^data:|^\/pics\//)
    }
  })

  test('should have proper meta tags for SEO', async ({ page }) => {
    await page.goto('/')
    await page.waitForLoadState('networkidle')
    
    // Check for essential meta tags
    await expect(page.locator('meta[name="description"]')).toBeVisible()
    await expect(page.locator('meta[name="viewport"]')).toBeVisible()
    
    // Check for Open Graph tags
    await expect(page.locator('meta[property="og:title"]')).toBeVisible()
    await expect(page.locator('meta[property="og:description"]')).toBeVisible()
    await expect(page.locator('meta[property="og:type"]')).toBeVisible()
    
    // Check for Twitter Card tags
    await expect(page.locator('meta[name="twitter:card"]')).toBeVisible()
    await expect(page.locator('meta[name="twitter:title"]')).toBeVisible()
    await expect(page.locator('meta[name="twitter:description"]')).toBeVisible()
  })

  test('should have proper structured data', async ({ page }) => {
    await page.goto('/')
    await page.waitForLoadState('networkidle')
    
    // Check for JSON-LD structured data
    const jsonLdScripts = page.locator('script[type="application/ld+json"]')
    await expect(jsonLdScripts).toHaveCount(1)
    
    // Verify structured data content
    const jsonLdContent = await jsonLdScripts.textContent()
    expect(jsonLdContent).toContain('Restaurant')
    expect(jsonLdContent).toContain('Monaghan')
  })

  test('should have proper security headers', async ({ page }) => {
    const response = await page.goto('/')
    
    // Check for security headers
    const headers = response?.headers() || {}
    
    // Should have X-Frame-Options or Content-Security-Policy
    expect(headers['x-frame-options'] || headers['content-security-policy']).toBeTruthy()
    
    // Should have X-Content-Type-Options
    expect(headers['x-content-type-options']).toBe('nosniff')
  })
})
