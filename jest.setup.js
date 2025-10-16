// jest.setup.js
// Optional: configure or set up a testing framework before each test.
// If you delete this file, remove `setupFilesAfterEnv` from `jest.config.js`

// Mock Next.js modules that might cause issues in tests
jest.mock('next/headers', () => ({
  headers: jest.fn(),
}))

// Mock environment variables
process.env.PLATFORM_HOST = 'mmb-five.vercel.app'
process.env.NEXTAUTH_URL = 'http://localhost:3000'
process.env.NEXTAUTH_SECRET = 'test-secret'
