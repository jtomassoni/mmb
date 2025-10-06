/**
 * Utility functions for handling cross-host redirects
 */

export function getPlatformHost(): string {
  return process.env.NEXT_PUBLIC_PLATFORM_HOST || 'https://www.byte-by-bite.com'
}

export function getCurrentHost(): string {
  if (typeof window !== 'undefined') {
    return window.location.origin
  }
  return process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'
}

export function getRedirectUrl(role: string, currentHost?: string): string {
  const host = currentHost || getCurrentHost()
  
  // All roles go to admin on current host
  return `${host}/admin`
}

export function isPlatformHost(host?: string): boolean {
  const checkHost = host || getCurrentHost()
  const platformHost = getPlatformHost()
  
  // Remove protocol for comparison
  const cleanCheckHost = checkHost.replace(/^https?:\/\//, '')
  const cleanPlatformHost = platformHost.replace(/^https?:\/\//, '')
  
  return cleanCheckHost === cleanPlatformHost
}
