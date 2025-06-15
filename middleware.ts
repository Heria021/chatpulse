import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  // Temporarily disable all middleware logic for debugging
  return NextResponse.next();

  const { pathname } = request.nextUrl;

  // Get session token from cookies or headers
  const sessionToken = request.cookies.get('chatnow_session_token')?.value ||
                      request.headers.get('authorization')?.replace('Bearer ', '') ||
                      '';

  // Define protected routes that require authentication
  const protectedRoutes = ['/chat'];

  // Define auth routes that should redirect if already authenticated
  const authRoutes = ['/auth/signin', '/auth/signup', '/auth/guest'];

  // Check if current path is a protected route
  const isProtectedRoute = protectedRoutes.some(route =>
    pathname.startsWith(route)
  );

  // Check if current path is an auth route
  const isAuthRoute = authRoutes.some(route =>
    pathname.startsWith(route)
  );

  // If accessing protected route without session token, redirect to signin
  if (isProtectedRoute && (!sessionToken || sessionToken.length < 10)) {
    const signInUrl = new URL('/auth/signin', request.url);
    signInUrl.searchParams.set('redirect', pathname);
    return NextResponse.redirect(signInUrl);
  }

  // If accessing auth route with valid session token, redirect to chat
  // Only redirect if we have a substantial session token that looks valid
  if (isAuthRoute && sessionToken && sessionToken.length > 30 && sessionToken.includes('_')) {
    return NextResponse.redirect(new URL('/chat', request.url));
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
     * - public files (public folder)
     */
    '/((?!api|_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
};
