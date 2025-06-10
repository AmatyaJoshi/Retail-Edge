import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  // Temporarily disable authentication for development
  return NextResponse.next();

  // const user = request.cookies.get('user');
  // const isAuthPage = request.nextUrl.pathname.startsWith('/auth');

  // if (!user && !isAuthPage) {
  //   // Redirect to login if trying to access protected route without authentication
  //   return NextResponse.redirect(new URL('/auth/login', request.url));
  // }

  // if (user && isAuthPage) {
  //   // Redirect to dashboard if trying to access auth pages while authenticated
  //   return NextResponse.redirect(new URL('/dashboard', request.url));
  // }

  // return NextResponse.next();
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