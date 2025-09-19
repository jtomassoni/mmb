import { chromium, FullConfig } from '@playwright/test'

async function globalSetup(config: FullConfig) {
  console.log('🚀 Starting global setup for variant testing...')
  
  // Launch browser for setup
  const browser = await chromium.launch()
  const page = await browser.newPage()
  
  try {
    // Wait for the dev server to be ready
    console.log('⏳ Waiting for dev server to be ready...')
    await page.goto('http://localhost:3000', { waitUntil: 'networkidle' })
    
    // Verify the test variants page is accessible
    console.log('🔍 Verifying test variants page...')
    await page.goto('http://localhost:3000/test-variants', { waitUntil: 'networkidle' })
    
    // Check that all variants are available
    const variantSelect = await page.locator('select').first()
    const options = await variantSelect.locator('option').all()
    
    console.log(`✅ Found ${options.length} variants available for testing`)
    
    // Take a baseline screenshot of the test page
    await page.screenshot({ 
      path: 'test-results/variants/test-variants-page.png',
      fullPage: true 
    })
    
    console.log('📸 Baseline screenshot captured')
    
  } catch (error) {
    console.error('❌ Global setup failed:', error)
    throw error
  } finally {
    await browser.close()
  }
  
  console.log('✅ Global setup completed successfully')
}

export default globalSetup
