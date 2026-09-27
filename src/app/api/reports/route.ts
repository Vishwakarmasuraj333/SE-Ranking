import { NextResponse } from 'next/server';

// In-memory reports store for runtime persistence
let reportsStore = [
  {
    id: '10075967',
    title: 'zohosocial.com Project Report',
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

  let filtered = [...reportsStore];

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
      scheduled_reports: { used: reportsStore.filter((r) => r.hasSchedule).length, max: 5 },
      ai_summary: { used: 0, max: 10 },
    },
    system_templates: 12,
  });
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { title, domain, frequency, language, period, file_type } = body;

    if (!title || !title.trim()) {
      return NextResponse.json(
        { errors: ['Report title is required'] },
        { status: 400 }
      );
    }

    const scheduledCount = reportsStore.filter((r) => r.hasSchedule).length;
    const isScheduled = frequency && frequency !== 'Without schedule';

    if (isScheduled && scheduledCount >= 5) {
      return NextResponse.json(
        { errors: ['Scheduled reports limit reached (5/5). Upgrade your plan or delete existing scheduled reports.'] },
        { status: 403 }
      );
    }

    const newReport = {
      id: String(Date.now()),
      title: title.trim(),
      domain: domain || 'workcomposer.com',
      updated: 'Sep-27 2026',
      sent: '-',
      frequency: frequency || 'Every week, on: Wednesday',
      language: language || 'English',
      period: period || 'Sep-21 2026 - Sep-27 2026',
      hasSchedule: isScheduled,
      file_type: file_type || 'pdf',
    };

    reportsStore.unshift(newReport);

    return NextResponse.json({
      success: true,
      report: newReport,
      limits: {
        scheduled_reports: { used: reportsStore.filter((r) => r.hasSchedule).length, max: 5 },
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

    reportsStore = reportsStore.filter((r) => r.id !== id);

    return NextResponse.json({
      success: true,
      message: 'Report deleted successfully',
      remaining: reportsStore.length,
      limits: {
        scheduled_reports: { used: reportsStore.filter((r) => r.hasSchedule).length, max: 5 },
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
