import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db/prisma';

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    const project = await prisma.project.findFirst({
      where: { OR: [{ id }, { domain: id }] },
      include: {
        keywords: {
          where: { deletedAt: null },
          orderBy: { createdAt: 'desc' },
        },
      },
    });

    if (!project) {
      return NextResponse.json({ error: 'Project not found' }, { status: 404 });
    }

    const headers = [
      'Keyword',
      'Current Position',
      'Previous Position',
      'Dynamics',
      'Search Volume',
      'CPC (USD)',
      'Difficulty',
      'Group',
      'Target URL',
      'Date Checked',
    ];

    const escapeCsv = (val: string | number | null | undefined): string => {
      if (val === null || val === undefined) return '';
      const s = String(val).replace(/"/g, '""');
      return `"${s}"`;
    };

    const rows = project.keywords.map((k) => [
      escapeCsv(k.keywordText),
      escapeCsv(k.currentPosition ? (k.currentPosition > 100 ? '>100' : k.currentPosition) : '—'),
      escapeCsv(k.previousPosition ? (k.previousPosition > 100 ? '>100' : k.previousPosition) : '—'),
      escapeCsv(k.positionChange != null ? (k.positionChange > 0 ? `+${k.positionChange}` : k.positionChange) : '0'),
      escapeCsv(k.monthlySearchVolume || 0),
      escapeCsv(k.cpcUsd ? `$${k.cpcUsd.toFixed(2)}` : '$0.00'),
      escapeCsv(k.keywordDifficulty || 0),
      escapeCsv(k.groupName || 'General'),
      escapeCsv(k.targetUrl || `https://${project.domain}`),
      escapeCsv(k.updatedAt ? new Date(k.updatedAt).toISOString().split('T')[0] : 'Today'),
    ]);

    const csvContent = [headers.join(','), ...rows.map((r) => r.join(','))].join('\r\n');

    return new NextResponse(csvContent, {
      status: 200,
      headers: {
        'Content-Type': 'text/csv; charset=utf-8',
        'Content-Disposition': `attachment; filename="${project.domain}_rankings_export.csv"`,
      },
    });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : 'Failed to export CSV.';
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
