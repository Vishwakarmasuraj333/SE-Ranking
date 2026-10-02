import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db/prisma';
import { normalizeDomain } from '@/lib/validation/schemas';
import { getAuthSession } from '@/lib/server/auth';

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    const project = await prisma.project.findFirst({
      where: { OR: [{ id }, { domain: id }] },
    });

    if (!project) {
      return NextResponse.json({ error: 'Project not found' }, { status: 404 });
    }

    const competitors = await prisma.projectCompetitor.findMany({
      where: {
        projectId: project.id,
        deletedAt: null,
      },
      orderBy: { createdAt: 'desc' },
    });

    return NextResponse.json({
      success: true,
      statusCode: 200,
      timestamp: new Date().toISOString(),
      data: competitors,
      totalCount: competitors.length,
      projectId: project.id,
    });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Failed to fetch competitors.';
    return NextResponse.json({ success: false, error: message }, { status: 500 });
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

    const name = String(body.name || '').trim();
    const rawDomain = String(body.domain || '').trim();
    const notes = body.notes ? String(body.notes).trim() : null;

    if (!rawDomain) {
      return NextResponse.json(
        { success: false, message: 'Competitor domain is required.' },
        { status: 400 }
      );
    }

    const cleanDomain = normalizeDomain(rawDomain);
    const competitorName = name || cleanDomain;

    // Check duplicate
    const existing = await prisma.projectCompetitor.findFirst({
      where: {
        projectId: project.id,
        domain: cleanDomain,
        deletedAt: null,
      },
    });

    if (existing) {
      return NextResponse.json(
        { success: false, message: `Competitor "${cleanDomain}" already added.` },
        { status: 409 }
      );
    }

    const competitor = await prisma.projectCompetitor.create({
      data: {
        projectId: project.id,
        name: competitorName,
        domain: cleanDomain,
        notes,
        visibilityScore: 0,
        avgPosition: 0,
        commonKeywordsCount: 0,
        totalKeywords: 0,
      },
    });

    return NextResponse.json({
      success: true,
      statusCode: 201,
      message: 'Competitor added successfully.',
      data: competitor,
    });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Failed to add competitor.';
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}

export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: _projectId } = await params;
    const body = await req.json();
    const competitorId = body.id;

    if (!competitorId) {
      return NextResponse.json({ success: false, message: 'Competitor ID is required.' }, { status: 400 });
    }

    const updated = await prisma.projectCompetitor.update({
      where: { id: competitorId },
      data: {
        name: body.name !== undefined ? String(body.name).trim() : undefined,
        domain: body.domain !== undefined ? normalizeDomain(body.domain) : undefined,
        notes: body.notes !== undefined ? String(body.notes).trim() : undefined,
      },
    });

    return NextResponse.json({
      success: true,
      data: updated,
    });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Failed to update competitor.';
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: _projectId } = await params;
    const auth = await getAuthSession(req);
    const { searchParams } = new URL(req.url);
    const competitorId = searchParams.get('id') || (await req.json().catch(() => ({}))).id;

    if (!competitorId) {
      return NextResponse.json({ success: false, message: 'Competitor ID is required.' }, { status: 400 });
    }

    await prisma.projectCompetitor.update({
      where: { id: competitorId },
      data: {
        deletedAt: new Date(),
        deletedBy: auth?.user?.email || 'admin',
      },
    });

    return NextResponse.json({
      success: true,
      message: 'Competitor removed successfully.',
    });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Failed to delete competitor.';
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}
