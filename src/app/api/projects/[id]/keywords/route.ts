import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db/prisma';
import { getAuthSession } from '@/lib/server/auth';

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const { searchParams } = new URL(req.url);
    const query = searchParams.get('q') || searchParams.get('search') || '';
    const group = searchParams.get('group');

    const project = await prisma.project.findFirst({
      where: { OR: [{ id }, { domain: id }] },
    });

    if (!project) {
      return NextResponse.json({ error: 'Project not found' }, { status: 404 });
    }

    const whereClause: any = {
      projectId: project.id,
      deletedAt: null,
    };

    if (group && group !== 'All') {
      whereClause.groupName = group;
    }

    if (query.trim()) {
      whereClause.keywordText = { contains: query.trim() };
    }

    const keywords = await prisma.keyword.findMany({
      where: whereClause,
      orderBy: { createdAt: 'desc' },
    });

    const groups = await prisma.keyword.findMany({
      where: { projectId: project.id, deletedAt: null },
      select: { groupName: true },
      distinct: ['groupName'],
    });

    return NextResponse.json({
      success: true,
      totalCount: keywords.length,
      groups: groups.map((g) => g.groupName || 'General').filter(Boolean),
      keywords: keywords.map((k) => ({
        id: k.id,
        keyword: k.keywordText,
        keywordText: k.keywordText,
        searchEngine: k.searchEngine || 'google',
        location: k.countryCode ? k.countryCode.toUpperCase() : 'Global',
        countryCode: k.countryCode || 'us',
        device: k.device || 'desktop',
        language: 'EN',
        searchVolume: k.monthlySearchVolume ? k.monthlySearchVolume.toLocaleString() : null,
        monthlySearchVolume: k.monthlySearchVolume || null,
        keywordDifficulty: k.keywordDifficulty || null,
        cpcUsd: k.cpcUsd || null,
        currentPosition: k.currentPosition || null,
        previousPosition: k.previousPosition || null,
        positionChange: k.positionChange || null,
        targetUrl: k.targetUrl || null,
        searchIntent: k.searchIntent || null,
        group: k.groupName || 'General',
        groupName: k.groupName || 'General',
        isActive: k.isActive,
        createdAt: k.createdAt.toISOString(),
      })),
    });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Failed to retrieve keywords.';
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

    const keywordsToAdd: string[] = Array.isArray(body.keywords)
      ? body.keywords.map((k: any) => (typeof k === 'string' ? k.trim() : k.keywordText || k.keyword)).filter(Boolean)
      : typeof body.keywords === 'string'
      ? body.keywords.split('\n').map((k: string) => k.trim()).filter(Boolean)
      : body.keyword
      ? [String(body.keyword).trim()]
      : [];

    if (keywordsToAdd.length === 0) {
      return NextResponse.json({ error: 'No keywords provided' }, { status: 400 });
    }

    const group = body.group || body.groupName || 'General';
    const countryCode = (body.countryCode || project.countryCode || 'in').toLowerCase();
    const searchEngine = body.searchEngine || project.defaultSearchEngine || 'google';
    const device = body.device || project.defaultDevice || 'desktop';

    // Avoid duplicates within the project
    const existingKeywords = await prisma.keyword.findMany({
      where: {
        projectId: project.id,
        deletedAt: null,
        keywordText: { in: keywordsToAdd },
      },
      select: { keywordText: true },
    });

    const existingSet = new Set(existingKeywords.map((k) => k.keywordText.toLowerCase()));
    const uniqueToAdd = keywordsToAdd.filter((k) => !existingSet.has(k.toLowerCase()));

    if (uniqueToAdd.length > 0) {
      await prisma.keyword.createMany({
        data: uniqueToAdd.map((kw) => ({
          projectId: project.id,
          keywordText: kw,
          searchEngine,
          countryCode,
          device,
          groupName: group,
          isActive: true,
        })),
      });
    }

    const allKeywords = await prisma.keyword.findMany({
      where: { projectId: project.id, deletedAt: null },
      orderBy: { createdAt: 'desc' },
    });

    return NextResponse.json({
      success: true,
      addedCount: uniqueToAdd.length,
      skippedCount: keywordsToAdd.length - uniqueToAdd.length,
      totalCount: allKeywords.length,
      keywords: allKeywords.map((k) => ({
        id: k.id,
        keyword: k.keywordText,
        keywordText: k.keywordText,
        searchEngine: k.searchEngine,
        countryCode: k.countryCode,
        device: k.device,
        group: k.groupName || 'General',
        groupName: k.groupName || 'General',
        isActive: k.isActive,
      })),
    });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Failed to add keywords.';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await req.json();
    const keywordId = body.id || body.keywordId;

    if (!keywordId) {
      return NextResponse.json({ error: 'Keyword ID is required' }, { status: 400 });
    }

    const updated = await prisma.keyword.update({
      where: { id: keywordId },
      data: {
        groupName: body.groupName !== undefined ? body.groupName : undefined,
        targetUrl: body.targetUrl !== undefined ? body.targetUrl : undefined,
        searchIntent: body.searchIntent !== undefined ? body.searchIntent : undefined,
        isActive: body.isActive !== undefined ? Boolean(body.isActive) : undefined,
      },
    });

    return NextResponse.json({ success: true, keyword: updated });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Failed to update keyword.';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const auth = await getAuthSession(req);
    const { searchParams } = new URL(req.url);
    const keywordId = searchParams.get('id') || (await req.json().catch(() => ({}))).keywordId;

    if (!keywordId) {
      return NextResponse.json({ error: 'Keyword ID is required' }, { status: 400 });
    }

    await prisma.keyword.update({
      where: { id: keywordId },
      data: {
        deletedAt: new Date(),
        deletedBy: auth?.user?.email || 'admin',
      },
    });

    return NextResponse.json({ success: true, message: 'Keyword removed successfully.' });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Failed to delete keyword.';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
