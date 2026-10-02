import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db/prisma';

export interface ReportItem {
  id: string;
  title: string;
  domain: string;
  updated: string;
  sent: string;
  frequency: string;
  language: string;
  period: string;
  hasSchedule: boolean;
  file_type: string;
}

// User specified: ONLY workcomposer.com Project Report, no extra other projects
let memoryReports: ReportItem[] = [
  {
    id: '10075967',
    title: 'workcomposer.com Project Report',
    domain: 'workcomposer.com',
    updated: 'Oct-01 2026',
    sent: 'Sep-30 2026',
    frequency: 'Every week, on: Wednesday',
    language: 'English',
    period: 'Sep-24 2026 - Sep-30 2026',
    hasSchedule: true,
    file_type: 'pdf',
  },
];

let myTemplates = [
  {
    id: 'tpl-1',
    name: 'WorkComposer Weekly SEO Digest',
    created: 'Sep 25, 2026',
    desc: 'Automated weekly rankings, competitor movements, and organic traffic snapshot for workcomposer.com',
  },
];

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const type = searchParams.get('type') || 'all';
  const query = searchParams.get('q') || '';

  let dbReports: ReportItem[] = [];
  try {
    const fetched = await prisma.report.findMany({
      include: { project: true },
      orderBy: { createdAt: 'desc' },
    });
    if (fetched.length > 0) {
      // Filter exclusively to workcomposer.com as requested by user
      dbReports = fetched
        .filter((r) => !r.project?.domain || r.project?.domain.includes('workcomposer') || r.name.toLowerCase().includes('workcomposer'))
        .map((r) => ({
          id: r.id,
          title: r.name,
          domain: 'workcomposer.com',
          updated: r.updatedAt.toLocaleDateString('en-US', { month: 'short', day: '2-digit', year: 'numeric' }),
          sent: 'Sep-30 2026',
          frequency: r.schedule || 'Every week, on: Wednesday',
          language: 'English',
          period: 'Sep-24 2026 - Sep-30 2026',
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
    success: true,
    reports: filtered,
    total: filtered.length,
    templates: myTemplates,
    limits: {
      scheduled_reports: { used: allReports.filter((r) => r.hasSchedule).length, max: 5 },
      ai_summary: { used: 0, max: 10 },
    },
    system_templates: 12,
  });
}

export async function POST(req: Request) {
  try {
    const body = await req.json().catch(() => ({}));

    // Check if this is a template creation request
    if (body.type === 'template' || body.action === 'createTemplate') {
      const newTpl = {
        id: `tpl-${Date.now()}`,
        name: (body.name && body.name.trim()) || 'Untitled template',
        created: 'Oct 02, 2026',
        desc: body.desc || `${body.exportFormat || 'PDF'} template (${body.orientation || 'Vertical'})`,
        exportFormat: body.exportFormat || 'PDF',
        orientation: body.orientation || 'Vertical',
        language: body.language || 'English',
        sections: body.sections || ['Cover page', 'Rankings overview', 'Organic traffic'],
      };
      myTemplates.unshift(newTpl);
      return NextResponse.json({
        success: true,
        message: 'Template created successfully!',
        template: newTpl,
        templates: myTemplates,
      });
    }

    const { title, frequency, language, period, file_type } = body;

    const reportTitle = (title && title.trim()) || 'workcomposer.com Project Report';
    const isScheduled = frequency && frequency !== 'Without schedule';

    const newReport: ReportItem = {
      id: String(Date.now()),
      title: reportTitle,
      domain: 'workcomposer.com',
      updated: 'Oct-02 2026',
      sent: '-',
      frequency: frequency || 'Every week, on: Wednesday',
      language: language || 'English',
      period: period || 'Sep-25 2026 - Oct-01 2026',
      hasSchedule: isScheduled,
      file_type: (file_type || 'pdf').toLowerCase(),
    };

    memoryReports.unshift(newReport);

    return NextResponse.json({
      success: true,
      message: 'Report created successfully!',
      report: newReport,
      reports: memoryReports,
      limits: {
        scheduled_reports: { used: memoryReports.filter((r) => r.hasSchedule).length, max: 5 },
      },
    });
  } catch (err: any) {
    return NextResponse.json(
      { success: false, error: err?.message || 'Internal server error processing report' },
      { status: 500 }
    );
  }
}

export async function PUT(req: Request) {
  try {
    const body = await req.json();
    const { id, action, title, recipientEmail, templateName } = body;

    const reportIndex = memoryReports.findIndex((r) => r.id === id);

    if (action === 'toggleSchedule') {
      if (reportIndex >= 0) {
        const current = memoryReports[reportIndex];
        const nextScheduleState = !current.hasSchedule;
        memoryReports[reportIndex] = {
          ...current,
          hasSchedule: nextScheduleState,
          frequency: nextScheduleState ? 'Every week, on: Wednesday' : 'Without schedule',
        };
        return NextResponse.json({
          success: true,
          message: nextScheduleState ? 'Sending schedule activated' : 'Sending schedule stopped',
          report: memoryReports[reportIndex],
          reports: memoryReports,
        });
      }
    }

    if (action === 'rename') {
      if (reportIndex >= 0 && title && title.trim()) {
        memoryReports[reportIndex] = {
          ...memoryReports[reportIndex],
          title: title.trim(),
        };
        return NextResponse.json({
          success: true,
          message: 'Report renamed successfully!',
          report: memoryReports[reportIndex],
          reports: memoryReports,
        });
      }
    }

    if (action === 'duplicate') {
      if (reportIndex >= 0) {
        const source = memoryReports[reportIndex];
        const copy: ReportItem = {
          ...source,
          id: String(Date.now()),
          title: `${source.title} (Copy)`,
          updated: 'Today',
        };
        memoryReports.splice(reportIndex + 1, 0, copy);
        return NextResponse.json({
          success: true,
          message: 'Report duplicated successfully!',
          report: copy,
          reports: memoryReports,
        });
      }
    }

    if (action === 'email') {
      if (reportIndex >= 0) {
        memoryReports[reportIndex].sent = 'Today';
        return NextResponse.json({
          success: true,
          message: `Report sent to ${recipientEmail || 'recipient'} successfully!`,
          report: memoryReports[reportIndex],
          reports: memoryReports,
        });
      }
    }

    if (action === 'generateTemplate') {
      const reportName = reportIndex >= 0 ? memoryReports[reportIndex].title : 'workcomposer.com Project Report';
      const newTpl = {
        id: `tpl-${Date.now()}`,
        name: templateName || `${reportName} Template`,
        created: 'Today',
        desc: `Custom modular template based on ${reportName}`,
      };
      myTemplates.unshift(newTpl);
      return NextResponse.json({
        success: true,
        message: 'Template generated successfully and saved to My Templates!',
        template: newTpl,
        templates: myTemplates,
      });
    }

    return NextResponse.json({ success: false, error: 'Unknown action' }, { status: 400 });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err?.message }, { status: 500 });
  }
}

export async function DELETE(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json({ success: false, error: 'Report ID is required' }, { status: 400 });
    }

    try {
      await prisma.report.delete({
        where: { id },
      });
    } catch (e) {
      console.warn('Prisma report delete fallback to memory');
    }

    memoryReports = memoryReports.filter((r) => r.id !== id);

    return NextResponse.json({
      success: true,
      message: 'Report deleted successfully',
      reports: memoryReports,
      remaining: memoryReports.length,
      limits: {
        scheduled_reports: { used: memoryReports.filter((r) => r.hasSchedule).length, max: 5 },
      },
    });
  } catch (err: any) {
    return NextResponse.json(
      { success: false, error: 'Failed to delete report' },
      { status: 500 }
    );
  }
}
