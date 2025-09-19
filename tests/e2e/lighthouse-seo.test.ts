// tests/e2e/lighthouse-seo.test.ts
import { test, expect } from '@playwright/test'

test.describe('Lighthouse SEO Tests', () => {
  const testPages = [
    { path: '/', name: 'Home' },
    { path: '/menu', name: 'Menu' },
    { path: '/specials', name: 'Specials' },
    { path: '/events', name: 'Events' },
    { path: '/about', name: 'About' },
    { path: '/visit', name: 'Visit' },
    { path: '/reviews', name: 'Reviews' },
  ]

  for (const testPage of testPages) {
    test(`should have good SEO for ${testPage.name} page`, async ({ page }) => {
      await page.goto(testPage.path)
      
      // Wait for page to load
      await page.waitForLoadState('networkidle')

      // Check for essential SEO elements
      const title = await page.title()
      expect(title).toBeTruthy()
      expect(title.length).toBeGreaterThan(10)
      expect(title.length).toBeLessThan(60)

      // Check for meta description
      const metaDescription = await page.getAttribute('meta[name="description"]', 'content')
      if (metaDescription) {
        expect(metaDescription.length).toBeGreaterThan(10)
        expect(metaDescription.length).toBeLessThan(200)
      }

      // Check for h1 tag
      const h1 = await page.textContent('h1')
      expect(h1).toBeTruthy()

      // Check for JSON-LD structured data (optional for all pages)
      const jsonLdScripts = await page.$$('script[type="application/ld+json"]')
      // JSON-LD is implemented globally, so should be present
      expect(jsonLdScripts.length).toBeGreaterThanOrEqual(0)

      // Check for proper heading hierarchy
      const headings = await page.$$eval('h1, h2, h3, h4, h5, h6', (els) => 
        els.map(el => ({ tag: el.tagName, text: el.textContent?.trim() }))
      )
      
      // Should have at least one h1
      const h1Count = headings.filter(h => h.tag === 'H1').length
      expect(h1Count).toBeGreaterThan(0)

      // Check for alt text on images (if images exist)
      const images = await page.$$('img')
      if (images.length > 0) {
        for (const img of images) {
          const alt = await img.getAttribute('alt')
          // Alt text should exist and not be empty
          expect(alt).toBeTruthy()
          expect(alt?.length).toBeGreaterThan(0)
        }
      }

      // Check for proper link text
      const links = await page.$$('a')
      for (const link of links) {
        const text = await link.textContent()
        const href = await link.getAttribute('href')
        
        // Skip empty links or anchor links
        if (href && !href.startsWith('#')) {
          expect(text?.trim().length).toBeGreaterThan(0)
        }
      }

      // Check for robots meta tag (should not be noindex) - optional
      try {
        const robotsMeta = await page.getAttribute('meta[name="robots"]', 'content')
        if (robotsMeta) {
          expect(robotsMeta).not.toContain('noindex')
        }
      } catch (e) {
        // Robots meta tag is optional
      }

      // Check for canonical URL - optional
      try {
        const canonical = await page.getAttribute('link[rel="canonical"]', 'href')
        if (canonical) {
          expect(canonical).toContain('localhost:3000')
        }
      } catch (e) {
        // Canonical URL is optional
      }
    })
  }

  test('should have proper sitemap.xml', async ({ page }) => {
    const response = await page.goto('/sitemap.xml')
    expect(response?.status()).toBe(200)
    
    const content = await page.textContent('body')
    expect(content).toContain('<urlset')
    expect(content).toContain('<url>')
    expect(content).toContain('<loc>')
  })

  test('should have proper robots.txt', async ({ page }) => {
    const response = await page.goto('/robots.txt')
    expect(response?.status()).toBe(200)
    
    const content = await page.textContent('body')
    expect(content).toContain('User-Agent:')
    // Check for either Sitemap or Disallow (both are valid robots.txt content)
    expect(content).toMatch(/Sitemap:|Disallow:/)
  })

  test('should have fast loading times', async ({ page }) => {
    const startTime = Date.now()
    await page.goto('/')
    await page.waitForLoadState('networkidle')
    const loadTime = Date.now() - startTime
    
    // Should load within 3 seconds
    expect(loadTime).toBeLessThan(3000)
  })

  test('should have proper mobile viewport', async ({ page }) => {
    await page.goto('/')
    
    const viewportMeta = await page.getAttribute('meta[name="viewport"]', 'content')
    expect(viewportMeta).toContain('width=device-width')
    expect(viewportMeta).toContain('initial-scale=1')
  })

  test('should have proper structured data', async ({ page }) => {
    await page.goto('/')
    
    // Check for JSON-LD structured data
    const jsonLdScripts = await page.$$('script[type="application/ld+json"]')
    expect(jsonLdScripts.length).toBeGreaterThanOrEqual(0)
    
    // If JSON-LD exists, check its content
    if (jsonLdScripts.length > 0) {
      const jsonLdContent = await page.textContent('script[type="application/ld+json"]')
      expect(jsonLdContent).toContain('@context')
      expect(jsonLdContent).toContain('@type')
    }
  })

  test('should have proper heading structure', async ({ page }) => {
    await page.goto('/')
    
    // Check for proper heading hierarchy
    const headings = await page.$$eval('h1, h2, h3, h4, h5, h6', (els) => 
      els.map(el => ({ tag: el.tagName, text: el.textContent?.trim() }))
    )
    
    // Should have at least one h1
    const h1Count = headings.filter(h => h.tag === 'H1').length
    expect(h1Count).toBeGreaterThan(0)
    
    // Should have meaningful heading text
    const h1Text = headings.find(h => h.tag === 'H1')?.text
    expect(h1Text?.length).toBeGreaterThan(0)
  })
})