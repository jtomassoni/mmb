// tests/e2e/accessibility.test.ts
import { test, expect } from '@playwright/test'
import AxeBuilder from '@axe-core/playwright'

test.describe('Accessibility Tests', () => {
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
    test(`should pass accessibility tests for ${testPage.name} page`, async ({ page }) => {
      await page.goto(testPage.path)
      await page.waitForLoadState('networkidle')

      // Run Axe accessibility tests
      const accessibilityScanResults = await new AxeBuilder({ page })
        .withTags(['wcag2a', 'wcag2aa', 'wcag21aa'])
        .analyze()

      // Check for accessibility violations
      expect(accessibilityScanResults.violations).toEqual([])
      
      // Log any violations for debugging
      if (accessibilityScanResults.violations.length > 0) {
        console.log(`Accessibility violations on ${testPage.name}:`, accessibilityScanResults.violations)
      }
    })
  }

  test('should have proper keyboard navigation', async ({ page }) => {
    await page.goto('/')
    await page.waitForLoadState('networkidle')

    // Test skip link functionality
    await page.keyboard.press('Tab')
    const skipLink = page.locator('.skip-link')
    await expect(skipLink).toBeFocused()
    
    // Test that skip link works
    await page.keyboard.press('Enter')
    await expect(page.locator('#main-content')).toBeFocused()
  })

  test('should have proper focus management', async ({ page }) => {
    await page.goto('/')
    await page.waitForLoadState('networkidle')

    // Test focus rings are visible
    await page.keyboard.press('Tab')
    const focusedElement = page.locator(':focus')
    await expect(focusedElement).toBeVisible()
    
    // Check that focus styles are applied
    const focusStyles = await focusedElement.evaluate((el) => {
      const styles = window.getComputedStyle(el)
      return {
        outline: styles.outline,
        outlineOffset: styles.outlineOffset
      }
    })
    
    expect(focusStyles.outline).not.toBe('none')
    expect(focusStyles.outlineOffset).toBe('2px')
  })

  test('should have proper ARIA labels and roles', async ({ page }) => {
    await page.goto('/')
    await page.waitForLoadState('networkidle')

    // Check for proper ARIA labels on interactive elements
    const buttons = await page.$$('button')
    for (const button of buttons) {
      const ariaLabel = await button.getAttribute('aria-label')
      const ariaLabelledBy = await button.getAttribute('aria-labelledby')
      const textContent = await button.textContent()
      
      // Button should have either aria-label, aria-labelledby, or visible text
      expect(ariaLabel || ariaLabelledBy || textContent?.trim()).toBeTruthy()
    }

    // Check for proper form labels
    const inputs = await page.$$('input')
    for (const input of inputs) {
      const type = await input.getAttribute('type')
      if (type !== 'hidden') {
        const ariaLabel = await input.getAttribute('aria-label')
        const ariaLabelledBy = await input.getAttribute('aria-labelledby')
        const id = await input.getAttribute('id')
        
        // Input should have proper labeling
        expect(ariaLabel || ariaLabelledBy || id).toBeTruthy()
      }
    }
  })

  test('should have proper color contrast', async ({ page }) => {
    await page.goto('/')
    await page.waitForLoadState('networkidle')

    // Run color contrast tests with Axe
    const accessibilityScanResults = await new AxeBuilder({ page })
      .withTags(['color-contrast'])
      .analyze()

    expect(accessibilityScanResults.violations).toEqual([])
  })

  test('should work with accessibility toolbar', async ({ page }) => {
    await page.goto('/')
    await page.waitForLoadState('networkidle')

    // Test accessibility toolbar functionality
    const toolbar = page.locator('.accessibility-toolbar')
    await expect(toolbar).toBeVisible()

    // Test font scaling
    const largeFontButton = toolbar.locator('button[aria-label="Large font size (+20%)"]')
    await largeFontButton.click()
    
    // Check that font scale is applied
    const fontScale = await page.evaluate(() => {
      return getComputedStyle(document.documentElement).getPropertyValue('--font-scale')
    })
    expect(fontScale).toBe('1.2')

    // Test high contrast toggle
    const highContrastCheckbox = toolbar.locator('input[aria-label="Toggle high contrast mode"]')
    await highContrastCheckbox.check()
    
    // Check that high contrast class is applied
    const hasHighContrast = await page.evaluate(() => {
      return document.documentElement.classList.contains('high-contrast')
    })
    expect(hasHighContrast).toBe(true)

    // Test reduced motion toggle
    const reducedMotionCheckbox = toolbar.locator('input[aria-label="Toggle reduced motion"]')
    await reducedMotionCheckbox.check()
    
    // Check that reduced motion class is applied
    const hasReducedMotion = await page.evaluate(() => {
      return document.documentElement.classList.contains('reduced-motion')
    })
    expect(hasReducedMotion).toBe(true)

    // Test dyslexia font toggle
    const dyslexiaFontCheckbox = toolbar.locator('input[aria-label="Toggle dyslexia-friendly font"]')
    await dyslexiaFontCheckbox.check()
    
    // Check that dyslexia font class is applied
    const hasDyslexiaFont = await page.evaluate(() => {
      return document.documentElement.classList.contains('dyslexia-font')
    })
    expect(hasDyslexiaFont).toBe(true)
  })

  test('should have proper heading hierarchy', async ({ page }) => {
    await page.goto('/')
    await page.waitForLoadState('networkidle')

    // Check heading hierarchy
    const headings = await page.$$eval('h1, h2, h3, h4, h5, h6', (els) => 
      els.map(el => ({ 
        tag: el.tagName.toLowerCase(), 
        text: el.textContent?.trim(),
        level: parseInt(el.tagName.charAt(1))
      }))
    )

    // Should have at least one h1
    const h1Count = headings.filter(h => h.tag === 'h1').length
    expect(h1Count).toBeGreaterThan(0)

    // Check for proper heading hierarchy (no skipping levels)
    let lastLevel = 1 // Start with h1 as the base level
    for (const heading of headings) {
      if (heading.level > lastLevel + 1) {
        throw new Error(`Heading hierarchy violation: ${heading.tag} follows h${lastLevel}`)
      }
      lastLevel = Math.max(lastLevel, heading.level)
    }
  })

  test('should have proper image alt text', async ({ page }) => {
    await page.goto('/')
    await page.waitForLoadState('networkidle')

    const images = await page.$$('img')
    for (const img of images) {
      const alt = await img.getAttribute('alt')
      const src = await img.getAttribute('src')
      
      // All images should have alt text
      expect(alt).toBeTruthy()
      expect(alt?.length).toBeGreaterThan(0)
      
      // Alt text should be descriptive, not just the filename
      if (src && alt) {
        const filename = src.split('/').pop()?.split('.')[0]
        expect(alt).not.toBe(filename)
      }
    }
  })

  test('should have proper link text', async ({ page }) => {
    await page.goto('/')
    await page.waitForLoadState('networkidle')

    const links = await page.$$('a')
    for (const link of links) {
      const text = await link.textContent()
      const href = await link.getAttribute('href')
      const ariaLabel = await link.getAttribute('aria-label')
      
      // Skip anchor links
      if (href && !href.startsWith('#')) {
        // Link should have either visible text or aria-label
        expect(text?.trim() || ariaLabel).toBeTruthy()
        
        // Link text should be descriptive
        if (text) {
          expect(text.trim().length).toBeGreaterThan(0)
          expect(text.trim()).not.toMatch(/^(click here|read more|here)$/i)
        }
      }
    }
  })
})
