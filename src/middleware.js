import { NextResponse } from 'next/server';

export function middleware(request) {
  const url = request.nextUrl.clone();
  const hostname = request.headers.get('host') || '';

  // Redirect www to non-www (canonicalize to non-www)
  if (hostname === 'www.allexamquestions.com') {
    url.hostname = 'allexamquestions.com';
    url.protocol = 'https:';
    return NextResponse.redirect(url, 301); // Permanent redirect
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    '/((?!api|_next/static|_next/image|favicon.ico).*)',
  ],
};

