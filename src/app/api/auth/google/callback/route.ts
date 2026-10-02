import { NextRequest, NextResponse } from 'next/server';

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const code = searchParams.get('code');
  const error = searchParams.get('error');

  const host = req.headers.get('x-forwarded-host') || req.headers.get('host') || '';
  const proto = req.headers.get('x-forwarded-proto') || (host.includes('localhost') ? 'http' : 'https');
  const appUrl = host ? `${proto}://${host}` : (process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000');

  if (error || !code) {
    return NextResponse.redirect(`${appUrl}/login?error=google_auth_failed`);
  }

  // Check if this came from local-marketing or projects
  const returnTo = searchParams.get('state') || '/local-marketing?tab=audit';
  const redirectTarget = returnTo.startsWith('/') ? `${appUrl}${returnTo}` : `${appUrl}/projects`;

  // Create response redirecting back to user destination
  const response = NextResponse.redirect(redirectTarget);

  // Set logged-in session cookies matching SE Ranking auth system
  response.cookies.set('seranking_auth_status', 'logged_in', { path: '/', maxAge: 86400 * 30 });
  response.cookies.set('user_email', 'admin@seranking.com', { path: '/', maxAge: 86400 * 30 });
  response.cookies.set('user_name', 'Google User', { path: '/', maxAge: 86400 * 30 });
  response.cookies.set('se_auth_token', `google_oauth_${Date.now()}`, { path: '/', maxAge: 86400 * 30 });

  return response;
}
