import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

// Public pages that do NOT require authentication
const PUBLIC_PATHS = [
  '/',
  '/login',
  '/signup',
  '/register',
  '/forgot',
  '/terms',
  '/privacy',
  '/landing',
  '/for-agencies',
  '/agencies',
  '/enterprise',
  '/growing-business',
  '/small-business',
  '/keyword-rank-tracker',
  '/rank-tracker',
  '/keyword-tool',
  '/keyword-research',
  '/on-page-seo-checker',
  '/website-audit-tool',
  '/competitor-analysis-tool',
  '/competitor-analysis',
  '/backlink-checker',
  '/backlinks-checker',
  '/pricing',
  '/podcast',
  '/academy',
  '/help',
  '/whats-new',
  '/logout',
];

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // 1. Allow Next.js internals, static assets, images, and public API endpoints
  if (
    pathname.startsWith('/_next') ||
    pathname.startsWith('/api/auth') ||
    pathname.startsWith('/favicon.ico') ||
    pathname.startsWith('/icon.svg') ||
    pathname.match(/\.(png|jpg|jpeg|gif|svg|webp|ico|css|js|woff|woff2|ttf)$/)
  ) {
    return NextResponse.next();
  }

  // 2. Allow API docs
  if (pathname.startsWith('/api-docs')) {
    return NextResponse.next();
  }

  // 3. Allow explicitly public landing and informational pages
  const isPublicPage = PUBLIC_PATHS.some(
    (p) => pathname === p || (p !== '/' && pathname.startsWith(p))
  );

  const authCookie = request.cookies.get('seranking_auth_status')?.value;
  const isAuthenticated = authCookie === 'logged_in';

  // 4. If visitor is already authenticated and visits /login or /signup, direct them to dashboard
  if (isAuthenticated && (pathname === '/login' || pathname === '/signup')) {
    return NextResponse.redirect(new URL('/projects', request.url));
  }

  // 5. If it is a public page, let them through
  if (isPublicPage) {
    return NextResponse.next();
  }

  // 6. STRICT PROTECTION: Any dashboard/studio route requires authentication
  // No direct access allowed!
  if (!isAuthenticated) {
    const loginUrl = new URL('/login', request.url);
    loginUrl.searchParams.set('redirect', pathname);
    return NextResponse.redirect(loginUrl);
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api/auth (auth API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico, icon.svg
     */
    '/((?!api/auth|_next/static|_next/image|favicon.ico|icon.svg).*)',
  ],
};
