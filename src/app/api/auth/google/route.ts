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

export async function GET() {
  const clientId = process.env.GOOGLE_CLIENT_ID || process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID || '';
  const redirectUri = `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/api/auth/google/callback`;

  const authUrl = `https://accounts.google.com/o/oauth2/v2/auth?client_id=${clientId}&redirect_uri=${encodeURIComponent(
    redirectUri
  )}&response_type=code&scope=openid%20email%20profile&access_type=offline&prompt=consent`;

  return NextResponse.json({
    success: true,
    authUrl,
  });
}
