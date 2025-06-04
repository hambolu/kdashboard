import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export function middleware(request: NextRequest) {
  // Add required headers for optimized client-side navigation
  const response = NextResponse.next();
  response.headers.set('x-middleware-cache', 'no-cache');
  response.headers.set('x-middleware-prefetch', '1');
  response.headers.set('Cache-Control', 'no-store, must-revalidate');
  response.headers.set('x-middleware-cache-control', 'no-store, must-revalidate');
  response.headers.set('Pragma', 'no-cache');
  response.headers.set('Expires', '0');
  
  const token = request.cookies.get('token') || { value: localStorage.getItem('token') }
  const isAuthenticated = !!token?.value
  
  // Get the current path
  const currentPath = request.nextUrl.pathname

  // Paths that don't require authentication
  const publicPaths = ['/signin', '/signup', '/forgot-password']

  // If the user is on a public path but is authenticated, redirect to dashboard
  if (isAuthenticated && publicPaths.includes(currentPath)) {
    return NextResponse.redirect(new URL('/dashboard', request.url))
  }

  // If the user is not authenticated and tries to access a protected route
  if (!isAuthenticated && !publicPaths.includes(currentPath)) {
    return NextResponse.redirect(new URL('/signin', request.url))
  }

  // Always redirect root to appropriate page
  if (currentPath === '/') {
    return NextResponse.redirect(new URL(isAuthenticated ? '/dashboard' : '/signin', request.url))
  }

  // Protected routes (dashboard and its sub-routes)
  if (currentPath.startsWith('/dashboard')) {
    if (!isAuthenticated) {
      const signinUrl = new URL('/signin', request.url)
      signinUrl.searchParams.set('from', currentPath)
      return NextResponse.redirect(signinUrl)
    }
    return NextResponse.next()
  }

  // Auth pages (signin, signup, etc)
  if (publicPaths.includes(currentPath)) {
    if (isAuthenticated) {
      return NextResponse.redirect(new URL('/dashboard', request.url))
    }
    return NextResponse.next()
  }

  return NextResponse.next()
}

export const config = {
  matcher: [
    /*
     * Match all request paths except:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.png (favicon file)
     * - public folder
     */
    '/((?!api|_next/static|_next/image|favicon.png|public/).*)',
  ],
}
