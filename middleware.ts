import { NextResponse } from 'next/server';
const PLATFORM_HOST = process.env.PLATFORM_HOST!; // "www.byte-by-bite.com"
export function middleware(req: Request) {
  const url = new URL(req.url);
  const host = (req.headers.get('host')||'').toLowerCase();
  if (url.pathname.startsWith('/resto-admin') && host !== PLATFORM_HOST) {
    url.host = PLATFORM_HOST; return NextResponse.redirect(url);
  }
  return NextResponse.next();
}
export const config = { matcher: ['/:path*'] };
