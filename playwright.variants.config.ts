import { defineConfig, devices } from '@playwright/test'

/**
 * Playwright configuration specifically for variant snapshot testing
 * @see https://playwright.dev/docs/test-configuration
 */
export default defineConfig({
  testDir: './tests/e2e',
  testMatch: 'variant-snapshots.test.ts',
  
  /* Run tests in files in parallel */
  fullyParallel: true,
  
  /* Fail the build on CI if you accidentally left test.only in the source code. */
  forbidOnly: !!process.env.CI,
  
  /* Retry on CI only */
  retries: process.env.CI ? 2 : 0,
  
  /* Opt out of parallel tests on CI. */
  workers: process.env.CI ? 1 : undefined,
  
  /* Reporter to use. See https://playwright.dev/docs/test-reporters */
  reporter: [
    ['html', { outputFolder: 'playwright-report/variants' }],
    ['json', { outputFile: 'test-results/variants-results.json' }],
    ['junit', { outputFile: 'test-results/variants-results.xml' }]
  ],
  
  /* Shared settings for all the projects below. See https://playwright.dev/docs/api/class-testoptions. */
  use: {
    /* Base URL to use in actions like `await page.goto('/')`. */
    baseURL: 'http://localhost:3000',
    
    /* Collect trace when retrying the failed test. See https://playwright.dev/docs/trace-viewer */
    trace: 'on-first-retry',
    
    /* Take screenshot on failure */
    screenshot: 'only-on-failure',
    
    /* Record video on failure */
    video: 'retain-on-failure',
    
    /* Disable animations for consistent snapshots */
    reducedMotion: 'reduce',
    
    /* Set consistent viewport for snapshots */
    viewport: { width: 1200, height: 800 },
    
    /* Set consistent color scheme */
    colorScheme: 'light',
    
    /* Set consistent locale */
    locale: 'en-US',
    
    /* Set consistent timezone */
    timezoneId: 'America/Denver'
  },
  
  /* Configure projects for major browsers */
  projects: [
    {
      name: 'chromium-variants',
      use: { 
        ...devices['Desktop Chrome'],
        // Override viewport for consistent snapshots
        viewport: { width: 1200, height: 800 }
      },
    },
    
    {
      name: 'firefox-variants',
      use: { 
        ...devices['Desktop Firefox'],
        viewport: { width: 1200, height: 800 }
      },
    },
    
    {
      name: 'webkit-variants',
      use: { 
        ...devices['Desktop Safari'],
        viewport: { width: 1200, height: 800 }
      },
    },
    
    /* Test against mobile viewports for responsive snapshots */
    {
      name: 'mobile-chrome-variants',
      use: { 
        ...devices['Pixel 5'],
        // Override viewport for consistent mobile snapshots
        viewport: { width: 375, height: 667 }
      },
    },
    
    {
      name: 'mobile-safari-variants',
      use: { 
        ...devices['iPhone 12'],
        viewport: { width: 375, height: 667 }
      },
    },
    
    /* Test against tablet viewports */
    {
      name: 'tablet-chrome-variants',
      use: { 
        ...devices['iPad Pro'],
        viewport: { width: 768, height: 1024 }
      },
    },
    
    /* Test dark mode variants */
    {
      name: 'dark-mode-variants',
      use: { 
        ...devices['Desktop Chrome'],
        colorScheme: 'dark',
        viewport: { width: 1200, height: 800 }
      },
    }
  ],
  
  /* Run your local dev server before starting the tests */
  webServer: {
    command: 'npm run dev',
    url: 'http://localhost:3000',
    reuseExistingServer: !process.env.CI,
    timeout: 120 * 1000, // 2 minutes
  },
  
  /* Global test timeout */
  timeout: 30 * 1000, // 30 seconds
  
  /* Expect timeout for assertions */
  expect: {
    timeout: 10 * 1000, // 10 seconds
  },
  
  /* Output directory for test artifacts */
  outputDir: 'test-results/variants/',
  
  /* Global setup and teardown */
  globalSetup: require.resolve('./tests/e2e/global-setup.ts'),
  globalTeardown: require.resolve('./tests/e2e/global-teardown.ts'),
})
