# Things to Never Do

## Content Guidelines
- **No emojis** in any content, code, or documentation
- **No dashes** in content or documentation (use proper formatting instead)
- **No excessive punctuation** (avoid multiple exclamation marks or question marks)
- **No all caps** unless absolutely necessary for technical reasons

## Code Guidelines
- **No console.log statements** in production code
- **No hardcoded values** that should be configurable
- **No commented out code** (remove it instead of commenting)
- **No TODO comments** in code (use markdown files instead)

## UI/UX Guidelines
- **No auto-playing videos** or audio
- **No pop-ups** or modal dialogs without user consent
- **No infinite scroll** without proper pagination
- **No dark patterns** or misleading UI elements

## Security Guidelines
- **No sensitive data** in client-side code
- **No hardcoded API keys** or secrets
- **No SQL injection** vulnerabilities
- **No XSS vulnerabilities** from user input

## Performance Guidelines
- **No large images** without optimization
- **No unnecessary API calls** or database queries
- **No blocking operations** on the main thread
- **No memory leaks** from event listeners

## Accessibility Guidelines
- **No missing alt text** on images
- **No keyboard navigation** issues
- **No color-only** information conveyance
- **No missing ARIA labels** on interactive elements

## Testing Guidelines
- **No tests without assertions**
- **No flaky tests** that pass/fail randomly
- **No tests that depend on external services**
- **No tests that modify production data**

## Documentation Guidelines
- **No outdated documentation**
- **No missing README files**
- **No unclear commit messages**
- **No missing error handling documentation**
