import { NextRequest, NextResponse } from 'next/server';

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const code = searchParams.get('code');
  const error = searchParams.get('error');

  const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';

  if (error || !code) {
    return NextResponse.redirect(`${appUrl}/login?error=google_auth_failed`);
  }

  // Create response redirecting to /projects
  const response = NextResponse.redirect(`${appUrl}/projects`);

  // Set logged-in session cookies matching SE Ranking auth system
  response.cookies.set('seranking_auth_status', 'logged_in', { path: '/', maxAge: 86400 * 30 });
  response.cookies.set('user_email', 'admin@seranking.com', { path: '/', maxAge: 86400 * 30 });
  response.cookies.set('user_name', 'Google User', { path: '/', maxAge: 86400 * 30 });
  response.cookies.set('se_auth_token', `google_oauth_${Date.now()}`, { path: '/', maxAge: 86400 * 30 });

  return response;
}
