// lighthouserc.js
module.exports = {
  ci: {
    collect: {
      url: [
        'http://localhost:3000',
        'http://localhost:3000/menu',
        'http://localhost:3000/specials',
        'http://localhost:3000/events',
        'http://localhost:3000/about',
        'http://localhost:3000/visit',
        'http://localhost:3000/reviews',
      ],
      startServerCommand: 'npm run dev',
      startServerReadyPattern: 'ready - started server on',
      startServerReadyTimeout: 30000,
    },
    assert: {
      assertions: {
        'categories:seo': ['error', { minScore: 0.9 }],
        'categories:performance': ['warn', { minScore: 0.8 }],
        'categories:accessibility': ['warn', { minScore: 0.8 }],
        'categories:best-practices': ['warn', { minScore: 0.8 }],
      },
    },
    upload: {
      target: 'temporary-public-storage',
    },
  },
}
