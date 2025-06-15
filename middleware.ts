import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
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

  // For protected routes, let the client-side handle authentication
  // This prevents the middleware from causing redirect loops during page reloads
  // The client-side auth context will handle the redirect after proper loading
  if (isProtectedRoute) {
    // Don't redirect here - let client-side handle it
    return NextResponse.next();
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
