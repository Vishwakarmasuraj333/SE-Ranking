import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db/prisma';
import { getAuthSession } from '@/lib/server/auth';
import { normalizeDomain, normalizeUrl } from '@/lib/validation/schemas';
import { getCountryInfo } from '@/lib/countryUtils';

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    const project = await prisma.project.findFirst({
      where: {
        OR: [{ id }, { domain: id }],
      },
      include: {
        searchEngines: true,
        _count: {
          select: {
            keywords: { where: { deletedAt: null } },
            projectCompetitors: { where: { deletedAt: null } },
            auditIssues: { where: { deletedAt: null } },
            tasks: { where: { deletedAt: null } },
            locations: { where: { deletedAt: null } },
            reports: { where: { deletedAt: null } },
          },
        },
      },
    });

    if (!project) {
      return NextResponse.json({ error: 'Project not found' }, { status: 404 });
    }

    return NextResponse.json({
      success: true,
      project: {
        ...project,
        primaryDomain: project.domain,
        keywordsCount: project._count.keywords,
        competitorsCount: project._count.projectCompetitors,
        auditIssuesCount: project._count.auditIssues,
        tasksCount: project._count.tasks,
        locationsCount: project._count.locations,
        reportsCount: project._count.reports,
      },
    });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Failed to retrieve project.';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await req.json();

    const existing = await prisma.project.findFirst({
      where: { OR: [{ id }, { domain: id }] },
    });

    if (!existing) {
      return NextResponse.json({ error: 'Project not found' }, { status: 404 });
    }

    const updateData: any = {};
    if (body.name !== undefined) updateData.name = String(body.name).trim();
    if (body.brandName !== undefined) updateData.brandName = String(body.brandName).trim();
    if (body.isArchived !== undefined) updateData.isArchived = Boolean(body.isArchived);
    if (body.projectColor !== undefined || body.color !== undefined) {
      updateData.projectColor = body.projectColor || body.color;
    }
    if (body.country !== undefined || body.countryCode !== undefined) {
      const cInfo = getCountryInfo(body.countryCode || body.country);
      if (cInfo) {
        updateData.country = cInfo.name;
        updateData.countryCode = cInfo.flagCode;
      }
    }
    if (body.websiteUrl !== undefined) {
      updateData.websiteUrl = normalizeUrl(body.websiteUrl);
      updateData.domain = normalizeDomain(body.websiteUrl);
    }
    if (body.weeklyReport !== undefined) updateData.weeklyReport = Boolean(body.weeklyReport);
    if (body.websiteAudit !== undefined) updateData.websiteAudit = Boolean(body.websiteAudit);
    if (body.backlinkReport !== undefined) updateData.backlinkReport = Boolean(body.backlinkReport);

    // Restore action
    if (body.action === 'restore') {
      updateData.deletedAt = null;
      updateData.deletedBy = null;
    }

    const updated = await prisma.project.update({
      where: { id: existing.id },
      data: updateData,
    });

    return NextResponse.json({ success: true, project: updated });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Failed to update project.';
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
    const permanent = searchParams.get('permanent') === 'true';

    const existing = await prisma.project.findFirst({
      where: { OR: [{ id }, { domain: id }] },
    });

    if (!existing) {
      return NextResponse.json({ error: 'Project not found' }, { status: 404 });
    }

    if (permanent) {
      await prisma.project.delete({
        where: { id: existing.id },
      });
      return NextResponse.json({ success: true, message: 'Project permanently deleted.' });
    }

    // Soft delete to Trash
    await prisma.project.update({
      where: { id: existing.id },
      data: {
        deletedAt: new Date(),
        deletedBy: auth?.user?.email || 'admin',
      },
    });

    return NextResponse.json({ success: true, message: 'Project moved to trash.' });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Failed to delete project.';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
