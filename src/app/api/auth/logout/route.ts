import { NextRequest, NextResponse } from 'next/server';
import { SESSION_COOKIE_NAME, invalidateSession, clearSessionCookie } from '@/lib/server/auth';

export async function POST(req: NextRequest) {
  try {
    const sessionToken = req.cookies.get(SESSION_COOKIE_NAME)?.value;

    if (sessionToken) {
      await invalidateSession(sessionToken);
    }

    const response = NextResponse.json({
      success: true,
      message: 'Signed out successfully.',
    });

    return clearSessionCookie(response);
  } catch (error: any) {
    console.error('Logout error:', error);
    const response = NextResponse.json({
      success: true,
      message: 'Signed out.',
    });
    return clearSessionCookie(response);
  }
}
