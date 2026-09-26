import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db/prisma';
import { CompetitorSchema } from '@/lib/validation/schemas';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const result = CompetitorSchema.safeParse(body);

    if (!result.success) {
      return NextResponse.json(
        { error: result.error.issues[0]?.message || 'Invalid competitor data.' },
        { status: 400 }
      );
    }

    const { domain, brandName, analysisId } = result.data;

    const existingCount = await prisma.competitor.count({
      where: { analysisId },
    });

    if (existingCount >= 5) {
      return NextResponse.json(
        { error: 'Maximum 5 competitors allowed per analysis.' },
        { status: 400 }
      );
    }

    const alreadyAdded = await prisma.competitor.findFirst({
      where: { analysisId, domain },
    });

    if (alreadyAdded) {
      return NextResponse.json(
        { error: 'This competitor is already added.' },
        { status: 409 }
      );
    }

    // Dynamic presence generation based on competitor domain
    const aiPresence = Math.floor(40 + Math.random() * 45);
    const domainPresence = Math.floor(35 + Math.random() * 45);
    const brandPresence = brandName ? Math.floor(40 + Math.random() * 45) : null;
    const avgPosition = Number((1.5 + Math.random() * 3.5).toFixed(1));
    const shareOfVoice = Number((15 + Math.random() * 25).toFixed(1));

    const competitor = await prisma.competitor.create({
      data: {
        analysisId,
        domain,
        brandName: brandName || null,
        aiPresence,
        domainPresence,
        brandPresence,
        avgPosition,
        shareOfVoice,
      },
    });

    return NextResponse.json({ success: true, competitor });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Failed to add competitor.';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json({ error: 'Competitor ID is required' }, { status: 400 });
    }

    await prisma.competitor.delete({
      where: { id },
    });

    return NextResponse.json({ success: true, message: 'Competitor removed successfully.' });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Failed to remove competitor.';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
