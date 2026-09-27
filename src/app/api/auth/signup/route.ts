import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db/prisma';

// Known personal/disposable free email providers that business SaaS trials reject
const FREE_EMAIL_DOMAINS = new Set([
  'gmail.com',
  'googlemail.com',
  'yahoo.com',
  'yahoo.co.in',
  'yahoo.co.uk',
  'yahoo.ca',
  'ymail.com',
  'rocketmail.com',
  'hotmail.com',
  'hotmail.co.uk',
  'hotmail.fr',
  'hotmail.es',
  'outlook.com',
  'outlook.in',
  'live.com',
  'live.in',
  'msn.com',
  'aol.com',
  'aim.com',
  'icloud.com',
  'me.com',
  'mac.com',
  'mail.com',
  'email.com',
  'zoho.com',
  'zohomail.com',
  'protonmail.com',
  'proton.me',
  'pm.me',
  'yandex.com',
  'yandex.ru',
  'gmx.com',
  'gmx.de',
  'gmx.net',
  'web.de',
  'mail.ru',
  'inbox.ru',
  'list.ru',
  'bk.ru',
  'rediffmail.com',
  'tutanota.com',
  'tuta.io',
  'fastmail.com',
  'tempmail.com',
  '10minutemail.com',
  'throwawaymail.com',
  'guerrillamail.com',
  'mailinator.com',
]);

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { firstName, lastName, email, password } = body;

    if (!email || typeof email !== 'string') {
      return NextResponse.json(
        { error: 'Work email is required.' },
        { status: 400 }
      );
    }

    const cleanEmail = email.trim().toLowerCase();
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(cleanEmail)) {
      return NextResponse.json(
        { error: 'Please enter a valid email address.' },
        { status: 400 }
      );
    }

    const domain = cleanEmail.split('@')[1];
    const isFree =
      FREE_EMAIL_DOMAINS.has(domain) ||
      ['gmail', 'googlemail', 'yahoo', 'hotmail', 'outlook', 'live', 'msn', 'icloud', 'aol'].some(
        (prefix) => domain === prefix || domain.startsWith(`${prefix}.`)
      );

    if (isFree) {
      return NextResponse.json(
        {
          error:
            'Please use your company or work email address (e.g. name@company.com). Personal email providers like Gmail, Yahoo, or Outlook are not supported for business trials.',
          isFreeEmail: true,
          domain,
        },
        { status: 422 }
      );
    }

    if (!password || password.length < 8) {
      return NextResponse.json(
        { error: 'Password must be at least 8 characters long.' },
        { status: 400 }
      );
    }

    const fullName = `${firstName || ''} ${lastName || ''}`.trim() || cleanEmail.split('@')[0];

    // Find or create user
    let user = await prisma.user.findUnique({
      where: { email: cleanEmail },
    });

    if (!user) {
      user = await prisma.user.create({
        data: {
          email: cleanEmail,
          name: fullName,
          role: 'user',
        },
      });
    }

    // Automatically create business project for their domain if not exists
    let project = await prisma.project.findFirst({
      where: { domain },
    });

    if (!project) {
      const brandName = domain.split('.')[0];
      const formattedBrand = brandName.charAt(0).toUpperCase() + brandName.slice(1);
      project = await prisma.project.create({
        data: {
          name: formattedBrand,
          domain,
          brandName: formattedBrand,
          userId: user.id,
        },
      });
    }

    const res = NextResponse.json({
      success: true,
      message: '14-Day Free Trial activated successfully!',
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
      },
      project: {
        id: project.id,
        domain: project.domain,
        name: project.name,
      },
    });

    // Set cookie for session
    res.cookies.set('user_email', cleanEmail, { path: '/', maxAge: 60 * 60 * 24 * 14 });
    res.cookies.set('user_name', fullName, { path: '/', maxAge: 60 * 60 * 24 * 14 });
    res.cookies.set('user_domain', domain, { path: '/', maxAge: 60 * 60 * 24 * 14 });

    return res;
  } catch (error: any) {
    console.error('Signup error:', error);
    return NextResponse.json(
      { error: error?.message || 'Failed to create trial account' },
      { status: 500 }
    );
  }
}
