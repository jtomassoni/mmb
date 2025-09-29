import { NextResponse } from 'next/server';

const PLATFORM_HOST = process.env.PLATFORM_HOST || 'www.byte-by-bite.com';

export function middleware(req: Request) {
  try {
    const url = new URL(req.url);
    const host = (req.headers.get('host') || '').toLowerCase();
    
    // Redirect /resto-admin requests to platform host
    if (url.pathname.startsWith('/resto-admin') && host !== PLATFORM_HOST) {
      const redirectUrl = new URL(url.pathname + url.search, `https://${PLATFORM_HOST}`);
      return NextResponse.redirect(redirectUrl);
    }
    
    // Redirect platform host root to login
    if (host === PLATFORM_HOST && url.pathname === '/') {
      const redirectUrl = new URL('/login', url.origin);
      return NextResponse.redirect(redirectUrl);
    }
    
    return NextResponse.next();
  } catch (error) {
    console.error('Middleware error:', error);
    return NextResponse.next();
  }
}

export const config = { 
  matcher: ['/resto-admin/:path*', '/'] 
};
