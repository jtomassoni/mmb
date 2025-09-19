import { FullConfig } from '@playwright/test'

async function globalTeardown(config: FullConfig) {
  console.log('🧹 Starting global teardown for variant testing...')
  
  try {
    // Clean up any temporary files or resources
    console.log('🗑️ Cleaning up temporary files...')
    
    // Log test completion
    console.log('✅ All variant tests completed')
    console.log('📊 Check the playwright-report/variants directory for detailed results')
    console.log('📸 Screenshots saved in test-results/variants/ directory')
    
  } catch (error) {
    console.error('❌ Global teardown failed:', error)
    // Don't throw error in teardown to avoid masking test failures
  }
  
  console.log('✅ Global teardown completed')
}

export default globalTeardown
