import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db/prisma';

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const project = await prisma.project.findUnique({
      where: { id },
    });

    const defaultEngines = [
      {
        id: 'eng-1',
        engine: 'Google',
        name: 'Google India',
        country: project?.country || 'India',
        countryCode: project?.countryCode || 'in',
        location: project?.primaryLocation || 'India',
        language: (project?.languageCode || 'en').toUpperCase(),
        device: 'Desktop',
        icon: 'google',
        keywordsCount: 354,
      },
    ];

    return NextResponse.json({
      success: true,
      engines: defaultEngines,
    });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Failed to retrieve search engines.';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await req.json();

    const country = body.country || 'India';
    const countryCode = body.countryCode || 'in';
    const location = body.location || country;
    const engine = body.engine || 'Google';

    // Update project with primary search engine if provided
    await prisma.project.update({
      where: { id },
      data: {
        country,
        countryCode: countryCode.toLowerCase(),
        primaryLocation: location,
      },
    }).catch(() => null);

    const newEngine = {
      id: `eng-${Date.now()}`,
      engine,
      name: `${engine} ${country}`,
      country,
      countryCode,
      location,
      language: 'EN',
      device: body.device || 'Desktop',
      icon: engine.toLowerCase(),
      keywordsCount: 0,
    };

    return NextResponse.json({
      success: true,
      engine: newEngine,
    });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Failed to add search engine.';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
