import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db/prisma';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json().catch(() => ({}));
    const { credential, email, name, picture, googleId } = body;

    const userEmail = email || `google_user_${Date.now()}@gmail.com`;
    const userName = name || 'Google User';
    const sub = googleId || `gid_${Date.now()}`;

    // Look up or create user in Prisma DB
    let user = await prisma.user.findUnique({
      where: { email: userEmail },
    }).catch(() => null);

    if (!user) {
      user = await prisma.user.create({
        data: {
          email: userEmail,
          name: userName,
          role: 'user',
        },
      });
    }

    // Link or update GoogleAccount
    await (prisma as any).googleAccount.upsert({
      where: { googleId: sub },
      update: {
        email: userEmail,
        name: userName,
        picture,
      },
      create: {
        googleId: sub,
        email: userEmail,
        name: userName,
        picture,
      },
    }).catch(() => null);

    const res = NextResponse.json({
      success: true,
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
      },
    });

    // Set auth cookie
    res.cookies.set('se_auth_token', `jwt_google_${user.id}`, {
      httpOnly: false,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
      maxAge: 60 * 60 * 24 * 30, // 30 days
    });

    return res;
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : 'Google OAuth authentication failed';
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}

export async function GET(req: NextRequest) {
  const clientId = process.env.GOOGLE_CLIENT_ID || process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID || '';
  
  // Resolve base URL dynamically from request or env (supports localhost and https://seranking.vercel.app)
  const host = req.headers.get('x-forwarded-host') || req.headers.get('host') || '';
  const proto = req.headers.get('x-forwarded-proto') || (host.includes('localhost') ? 'http' : 'https');
  const dynamicOrigin = host ? `${proto}://${host}` : (process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000');
  
  const redirectUri =
    process.env.GOOGLE_REDIRECT_URI ||
    process.env.NEXT_PUBLIC_GOOGLE_REDIRECT_URI ||
    `${dynamicOrigin}/api/auth/google/callback`;

  const authUrl = `https://accounts.google.com/o/oauth2/v2/auth?client_id=${clientId}&redirect_uri=${encodeURIComponent(
    redirectUri
  )}&response_type=code&scope=openid%20email%20profile%20https://www.googleapis.com/auth/business.manage&access_type=offline&prompt=consent`;

  const { searchParams } = new URL(req.url);
  if (searchParams.get('format') === 'json') {
    return NextResponse.json({
      success: true,
      authUrl,
      redirectUri,
    });
  }

  return NextResponse.redirect(authUrl);
}
