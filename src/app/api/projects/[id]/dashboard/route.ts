import { NextRequest, NextResponse } from 'next/server';
import { ProjectDashboardDto } from '@/lib/types';
import { prisma } from '@/lib/db/prisma';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    const project = await prisma.project.findFirst({
      where: {
        id,
        deletedAt: null,
      },
      include: {
        keywords: {
          where: { deletedAt: null },
        },
        tasks: {
          where: { deletedAt: null },
        },
        auditIssues: {
          where: { deletedAt: null },
        },
        integrations: true,
      },
    });

    if (!project) {
      return NextResponse.json(
        {
          success: false,
          statusCode: 404,
          timestamp: new Date().toISOString(),
          message: 'Project not found',
        },
        { status: 404 }
      );
    }

    const domainName = project.domain;
    const projectName = project.name || project.domain;
    const cleanDomain = domainName.replace(/^https?:\/\//, '').replace(/\/$/, '');

    const pKeywords = project.keywords || [];
    const totalKeywords = pKeywords.length;

    const top3 = pKeywords.filter((k) => k.currentPosition && k.currentPosition <= 3).length;
    const top10 = pKeywords.filter((k) => k.currentPosition && k.currentPosition <= 10).length;
    const top20 = pKeywords.filter((k) => k.currentPosition && k.currentPosition <= 20).length;
    const top100 = pKeywords.filter((k) => k.currentPosition && k.currentPosition <= 100).length;
    const improved = pKeywords.filter((k) => (k.positionChange || 0) > 0).length;
    const declined = pKeywords.filter((k) => (k.positionChange || 0) < 0).length;
    const unchanged = Math.max(0, totalKeywords - improved - declined);

    const validPositions = pKeywords.map((k) => k.currentPosition).filter((p): p is number => typeof p === 'number' && p > 0);
    const averagePosition = validPositions.length > 0
      ? Number((validPositions.reduce((a, b) => a + b, 0) / validPositions.length).toFixed(1))
      : 0;
    const searchVisibility = totalKeywords > 0
      ? Number(((top10 / totalKeywords) * 100).toFixed(1))
      : 0;

    const openTasks = project.tasks.filter((t) => t.status === 'Todo').length;
    const inProgressTasks = project.tasks.filter((t) => t.status === 'InProgress').length;
    const reviewTasks = project.tasks.filter((t) => t.status === 'Review').length;
    const closedTasks = project.tasks.filter((t) => t.status === 'Done').length;

    const gscIntegration = project.integrations.find(
      (i) => (i.provider === 'google_search_console' || i.provider === 'gsc') && i.status === 'connected'
    );

    const errorIssues = project.auditIssues.filter((i) => i.severity === 'Error');
    const warningIssues = project.auditIssues.filter((i) => i.severity === 'Warning');
    const calculatedHealth = Math.max(0, 100 - (errorIssues.length * 10 + warningIssues.length * 2));

    const data: ProjectDashboardDto = {
      projectId: project.id,
      projectName,
      primaryDomain: cleanDomain,
      freshness: {
        isRankingsStale: false,
        lastRankCheckAt: project.updatedAt.toISOString(),
        lastAuditCrawlAt: null,
        lastGscSyncAt: gscIntegration?.updatedAt?.toISOString() || null,
        gscSyncStatus: gscIntegration ? 'Active' : 'Not Connected',
      },
      health: {
        healthScore: calculatedHealth,
        errorsCount: errorIssues.length,
        warningsCount: warningIssues.length,
        totalUrlsCrawled: 0,
      },
      rankings: {
        totalKeywords,
        averagePosition,
        searchVisibility,
        top3Count: top3,
        top10Count: top10,
        top20Count: top20,
        top100Count: top100,
        improvedCount: improved,
        declinedCount: declined,
        unchangedCount: unchanged,
      },
      gsc: {
        syncStatus: gscIntegration ? 'Active' : 'Not Connected',
        lastSyncedAt: gscIntegration?.updatedAt?.toISOString() || null,
        totalClicks: 0,
        totalImpressions: 0,
        averageCtr: 0,
        averagePosition: 0,
        startDate: '',
        endDate: '',
        dailySeries: [],
      },
      tasks: {
        totalCount: project.tasks.length,
        openCount: openTasks,
        inProgressCount: inProgressTasks,
        readyForVerificationCount: reviewTasks,
        closedCount: closedTasks,
        overdueCount: 0,
      },
      criticalIssues: errorIssues.map((issue) => ({
        id: issue.id,
        ruleCode: issue.ruleId || 'ISSUE',
        firstSeenAt: (issue.foundAt || new Date()).toISOString(),
        affectedUrl: issue.url || `https://${cleanDomain}`,
      })),
    };

    return NextResponse.json({
      success: true,
      statusCode: 200,
      timestamp: new Date().toISOString(),
      data,
    });
  } catch (error: any) {
    return NextResponse.json(
      {
        success: false,
        statusCode: 500,
        timestamp: new Date().toISOString(),
        message: error?.message || 'Failed to fetch project dashboard',
      },
      { status: 500 }
    );
  }
}
