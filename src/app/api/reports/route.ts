import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db/prisma';

let memoryReports = [
  {
    id: '10075967',
    title: 'workco.com Project Report',
    domain: 'workcomposer.com',
    updated: 'Sep-23 2026',
    sent: '-',
    frequency: 'Every week, on: Wednesday',
    language: 'English',
    period: 'Sep-21 2026 - Sep-27 2026',
    hasSchedule: true,
    file_type: 'pdf',
  },
];

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const type = searchParams.get('type') || 'all';
  const query = searchParams.get('q') || '';

  let dbReports: any[] = [];
  try {
    const fetched = await prisma.report.findMany({
      include: { project: true },
      orderBy: { createdAt: 'desc' },
    });
    if (fetched.length > 0) {
      dbReports = fetched.map((r) => ({
        id: r.id,
        title: r.name,
        domain: r.project?.domain || 'workcomposer.com',
        updated: r.updatedAt.toLocaleDateString('en-US', { month: 'short', day: '2-digit', year: 'numeric' }),
        sent: '-',
        frequency: r.schedule || 'Without schedule',
        language: 'English',
        period: 'Last 30 Days',
        hasSchedule: Boolean(r.schedule && r.schedule !== 'Without schedule'),
        file_type: (r.format || 'pdf').toLowerCase(),
      }));
    }
  } catch (e) {
    console.warn('Prisma report findMany failed, using memory store:', e);
  }

  const allReports = dbReports.length > 0 ? dbReports : memoryReports;
  let filtered = [...allReports];

  if (type === 'scheduled') {
    filtered = filtered.filter((r) => r.hasSchedule);
  } else if (type === 'manual') {
    filtered = filtered.filter((r) => !r.hasSchedule);
  }

  if (query.trim()) {
    filtered = filtered.filter((r) =>
      r.title.toLowerCase().includes(query.toLowerCase())
    );
  }

  return NextResponse.json({
    reports: filtered,
    total: filtered.length,
    limits: {
      scheduled_reports: { used: allReports.filter((r) => r.hasSchedule).length, max: 5 },
      ai_summary: { used: 0, max: 10 },
    },
    system_templates: 12,
  });
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { title, domain, frequency, language, period, file_type, projectId } = body;

    if (!title || !title.trim()) {
      return NextResponse.json(
        { errors: ['Report title is required'] },
        { status: 400 }
      );
    }

    const isScheduled = frequency && frequency !== 'Without schedule';

    let savedReport = null;
    try {
      let resolvedProjectId = projectId;
      if (!resolvedProjectId) {
        const p = await prisma.project.findFirst({
          where: domain ? { domain: { contains: domain } } : undefined,
        });
        resolvedProjectId = p?.id;
      }

      if (resolvedProjectId) {
        const created = await prisma.report.create({
          data: {
            projectId: resolvedProjectId,
            name: title.trim(),
            type: 'Overview',
            schedule: isScheduled ? frequency : null,
            format: file_type || 'PDF',
            status: 'Ready',
          },
        });
        savedReport = {
          id: created.id,
          title: created.name,
          domain: domain || 'workcomposer.com',
          updated: 'Today',
          sent: '-',
          frequency: frequency || 'Without schedule',
          language: language || 'English',
          period: period || 'Last 30 Days',
          hasSchedule: isScheduled,
          file_type: file_type || 'pdf',
        };
      }
    } catch (e) {
      console.warn('Prisma create report failed, falling back to memory:', e);
    }

    if (!savedReport) {
      savedReport = {
        id: String(Date.now()),
        title: title.trim(),
        domain: domain || 'workcomposer.com',
        updated: 'Today',
        sent: '-',
        frequency: frequency || 'Every week, on: Wednesday',
        language: language || 'English',
        period: period || 'Last 30 Days',
        hasSchedule: isScheduled,
        file_type: file_type || 'pdf',
      };
      memoryReports.unshift(savedReport);
    }

    return NextResponse.json({
      success: true,
      report: savedReport,
      limits: {
        scheduled_reports: { used: memoryReports.filter((r) => r.hasSchedule).length, max: 5 },
        ai_summary: { used: 0, max: 10 },
      },
    });
  } catch (err: any) {
    return NextResponse.json(
      { errors: ['Internal server error processing report'] },
      { status: 500 }
    );
  }
}

export async function DELETE(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json({ errors: ['Report ID is required'] }, { status: 400 });
    }

    try {
      await prisma.report.delete({
        where: { id },
      });
    } catch (e) {
      console.warn('Prisma report delete failed:', e);
    }

    memoryReports = memoryReports.filter((r) => r.id !== id);

    return NextResponse.json({
      success: true,
      message: 'Report deleted successfully',
      remaining: memoryReports.length,
      limits: {
        scheduled_reports: { used: memoryReports.filter((r) => r.hasSchedule).length, max: 5 },
        ai_summary: { used: 0, max: 10 },
      },
    });
  } catch (err: any) {
    return NextResponse.json(
      { errors: ['Failed to delete report'] },
      { status: 500 }
    );
  }
}
