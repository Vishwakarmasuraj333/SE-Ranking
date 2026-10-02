import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db/prisma';
import { LoginSchema } from '@/lib/validation/schemas';
import {
  hashPassword,
  verifyPassword,
  createSession,
  setSessionCookie,
  sanitizeUser,
} from '@/lib/server/auth';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const result = LoginSchema.safeParse(body);

    if (!result.success) {
      return NextResponse.json(
        { error: result.error.issues[0]?.message || 'Email and password are required.' },
        { status: 400 }
      );
    }

    const { email, password } = result.data;
    const cleanEmail = email.toLowerCase().trim();

    let user = await prisma.user.findUnique({
      where: { email: cleanEmail },
      include: {
        projects: {
          where: { isArchived: false },
          take: 1,
        },
      },
    });

    // If user not found, check if it's the verified environment administrator bootstrap
    const demoEmail = process.env.DEMO_WORK_EMAIL || 'admin@seranking.com';
    const demoPass = process.env.DEMO_PASSWORD || 'AdminPassword123#';

    if (!user && cleanEmail === demoEmail.toLowerCase() && password === demoPass) {
      // Bootstrap the initial verified administrator in the database
      user = await prisma.user.create({
        data: {
          email: cleanEmail,
          name: 'Administrator',
          passwordHash: hashPassword(demoPass),
          role: 'OWNER',
        },
        include: {
          projects: {
            where: { isArchived: false },
            take: 1,
          },
        },
      });
    }

    // If user exists without passwordHash from previous migration, set it on first login
    if (user && !user.passwordHash && password.length >= 8) {
      const newHash = hashPassword(password);
      user = await prisma.user.update({
        where: { id: user.id },
        data: { passwordHash: newHash },
        include: {
          projects: {
            where: { isArchived: false },
            take: 1,
          },
        },
      });
    }

    if (!user) {
      return NextResponse.json(
        { error: 'Invalid email or password.' },
        { status: 401 }
      );
    }

    // Verify password hash
    if (!user.passwordHash || !verifyPassword(password, user.passwordHash)) {
      return NextResponse.json(
        { error: 'Invalid email or password.' },
        { status: 401 }
      );
    }

    // Check account status
    const userStatus = (user as { status?: string }).status;
    if (userStatus === 'suspended') {
      return NextResponse.json(
        { error: 'This account has been suspended. Please contact support.' },
        { status: 403 }
      );
    }

    // Update lastLoginAt
    await prisma.user.update({
      where: { id: user.id },
      data: { lastLoginAt: new Date() },
    }).catch(() => null);

    // Create real database session
    const { sessionToken, expiresAt } = await createSession(user.id, req);
    const safeUser = sanitizeUser(user);

    const activeProject = (user as { projects?: Array<{ id: string; name: string; domain: string }> }).projects?.[0] || null;

    const response = NextResponse.json({
      success: true,
      message: 'Signed in successfully!',
      user: safeUser,
      project: activeProject ? { id: activeProject.id, name: activeProject.name, domain: activeProject.domain } : null,
      token: sessionToken,
    });

    return setSessionCookie(response, sessionToken, expiresAt);
  } catch (error: any) {
    console.error('Login error:', error);
    return NextResponse.json(
      { error: 'Authentication failed. Please try again.' },
      { status: 500 }
    );
  }
}
