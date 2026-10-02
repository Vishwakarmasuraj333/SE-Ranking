import { NextRequest, NextResponse } from 'next/server';
import { verifyRecaptcha } from '@/lib/recaptcha';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json().catch(() => ({}));
    const { token } = body;

    const result = await verifyRecaptcha(token);

    return NextResponse.json({
      success: result.success,
      data: result,
      siteKey: process.env.NEXT_PUBLIC_RECAPTCHA_SITE_KEY || '6LfVttotAAAAAA0SVYMq-0KRG78ZA-z-sygL494G',
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message || 'Captcha verification failed' },
      { status: 500 }
    );
  }
}
