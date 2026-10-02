import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db/prisma';
import { getCountryInfo } from '@/lib/countryUtils';

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const project = await prisma.project.findFirst({
      where: { OR: [{ id }, { domain: id }] },
      include: {
        searchEngines: {
          orderBy: { createdAt: 'asc' },
        },
      },
    });

    if (!project) {
      return NextResponse.json({ error: 'Project not found' }, { status: 404 });
    }

    const formatted = project.searchEngines.map((eng) => {
      const cInfo = getCountryInfo(eng.countryCode);
      return {
        id: eng.id,
        engine: eng.engine,
        name: `${eng.engine.toUpperCase()} ${cInfo?.name || eng.country}`,
        country: cInfo?.name || eng.country,
        countryCode: eng.countryCode.toLowerCase(),
        location: eng.location || cInfo?.name || eng.country,
        language: eng.language || 'English',
        languageCode: eng.languageCode || 'en',
        device: eng.device || 'desktop',
        isActive: eng.isActive,
        icon: eng.engine.toLowerCase(),
      };
    });

    return NextResponse.json({
      success: true,
      engines: formatted,
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

    const project = await prisma.project.findFirst({
      where: { OR: [{ id }, { domain: id }] },
    });

    if (!project) {
      return NextResponse.json({ error: 'Project not found' }, { status: 404 });
    }

    const cInfo = getCountryInfo(body.countryCode || body.country);
    const country = cInfo?.name || body.country || 'India';
    const countryCode = cInfo?.flagCode || body.countryCode || 'in';
    const location = body.location || country;
    const engine = body.engine || 'google';
    const language = body.language || 'English';
    const languageCode = body.languageCode || 'en';
    const device = body.device || 'desktop';

    const created = await prisma.searchEngineConfig.create({
      data: {
        projectId: project.id,
        engine,
        country,
        countryCode,
        location,
        language,
        languageCode,
        device,
        isActive: true,
      },
    });

    return NextResponse.json({
      success: true,
      engine: {
        id: created.id,
        engine: created.engine,
        name: `${created.engine.toUpperCase()} ${country}`,
        country,
        countryCode,
        location,
        language,
        languageCode,
        device,
        isActive: true,
        icon: created.engine.toLowerCase(),
      },
    });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Failed to add search engine.';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: _projectId } = await params;
    const { searchParams } = new URL(req.url);
    const engineId = searchParams.get('id');

    if (!engineId) {
      return NextResponse.json({ error: 'Search engine ID is required' }, { status: 400 });
    }

    await prisma.searchEngineConfig.delete({
      where: { id: engineId },
    });

    return NextResponse.json({ success: true, message: 'Search engine removed.' });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Failed to delete search engine.';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
