import { NextRequest, NextResponse } from 'next/server';

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    return NextResponse.json({
      success: true,
      statusCode: 200,
      timestamp: new Date().toISOString(),
      data: [],
      projectId: id,
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
    const { id: projectId } = await params;
    const body = await req.json();

    const name = String(body.name || '').trim();
    let rawDomain = String(body.domain || '').trim();
    const notes = body.notes ? String(body.notes).trim() : undefined;

    if (!name) {
      return NextResponse.json(
        { success: false, message: 'Competitor name is required.' },
        { status: 400 }
      );
    }

    if (!rawDomain) {
      return NextResponse.json(
        { success: false, message: 'Domain is required.' },
        { status: 400 }
      );
    }

    // Normalize domain
    let domain = rawDomain.toLowerCase().replace(/^(https?:\/\/)/, '');
    domain = domain.split('/')[0].replace(/:\d+$/, '');

    const competitor = {
      id: `comp-${Date.now()}`,
      projectId,
      name,
      domain,
      notes,
      visibility: Math.floor(Math.random() * 40) + 30,
      avgPosition: Number((Math.random() * 8 + 5).toFixed(1)),
      commonKeywords: Math.floor(Math.random() * 30) + 15,
      totalKeywords: Math.floor(Math.random() * 20000) + 5000,
      organicTraffic: `${Math.floor(Math.random() * 300) + 50}K`,
      backlinks: `${Math.floor(Math.random() * 800) + 100}K`,
      tag: 'Direct Competitor',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    return NextResponse.json({
      success: true,
      statusCode: 201,
      timestamp: new Date().toISOString(),
      data: competitor,
    });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Failed to add competitor.';
    return NextResponse.json(
      { success: false, message, error: message },
      { status: 500 }
    );
  }
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: _projectId } = await params;
    const { searchParams } = new URL(req.url);
    const competitorId = searchParams.get('id');

    if (!competitorId) {
      return NextResponse.json(
        { success: false, message: 'Competitor ID is required.' },
        { status: 400 }
      );
    }

    return NextResponse.json({
      success: true,
      statusCode: 200,
      timestamp: new Date().toISOString(),
      data: { success: true },
    });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Failed to delete competitor.';
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}

export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: projectId } = await params;
    const { searchParams } = new URL(req.url);
    const body = await req.json();
    const competitorId = searchParams.get('id') || body.id;

    if (!competitorId) {
      return NextResponse.json(
        { success: false, message: 'Competitor ID is required.' },
        { status: 400 }
      );
    }

    const updatedCompetitor = {
      id: competitorId,
      projectId,
      name: body.name || 'Competitor',
      domain: (body.domain || 'competitor.com').toLowerCase().replace(/^https?:\/\//, '').split('/')[0],
      notes: body.notes,
      updatedAt: new Date().toISOString(),
    };

    return NextResponse.json({
      success: true,
      statusCode: 200,
      timestamp: new Date().toISOString(),
      data: updatedCompetitor,
    });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Failed to update competitor.';
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}
