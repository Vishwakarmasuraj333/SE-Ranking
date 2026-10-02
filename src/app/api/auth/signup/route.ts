import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db/prisma';
import { SignupSchema } from '@/lib/validation/schemas';
import { hashPassword, createSession, setSessionCookie, sanitizeUser } from '@/lib/server/auth';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const result = SignupSchema.safeParse(body);

    if (!result.success) {
      return NextResponse.json(
        { error: result.error.issues[0]?.message || 'Invalid registration details.' },
        { status: 400 }
      );
    }

    const { email, password, firstName, lastName } = result.data;
    const cleanEmail = email.toLowerCase().trim();

    // Check if user already exists
    const existing = await prisma.user.findUnique({
      where: { email: cleanEmail },
    });

    if (existing) {
      return NextResponse.json(
        { error: 'An account with this email address already exists. Please sign in.' },
        { status: 409 }
      );
    }

    const fullName = `${firstName || ''} ${lastName || ''}`.trim() || cleanEmail.split('@')[0];
    const passwordHash = hashPassword(password);

    // Create user in database
    const user = await prisma.user.create({
      data: {
        email: cleanEmail,
        name: fullName,
        passwordHash,
        role: 'OWNER',
        status: 'active',
      },
    });

    // Create database session
    const { sessionToken, expiresAt } = await createSession(user.id, req);

    const safeUser = sanitizeUser(user);
    const response = NextResponse.json({
      success: true,
      message: 'Account created successfully!',
      user: safeUser,
      token: sessionToken,
    });

    return setSessionCookie(response, sessionToken, expiresAt);
  } catch (error: any) {
    console.error('Registration error:', error);
    return NextResponse.json(
      { error: 'Registration failed. Please try again.' },
      { status: 500 }
    );
  }
}
