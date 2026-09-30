import { NextRequest, NextResponse } from 'next/server';
import { ProjectDashboardDto } from '@/lib/types';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    const data: ProjectDashboardDto = {
      projectId: id,
      projectName: 'WorkComposer Enterprise',
      primaryDomain: 'workcomposer.com',
      freshness: {
        isRankingsStale: false,
        lastRankCheckAt: new Date(Date.now() - 3600 * 1000 * 14).toISOString(),
        lastAuditCrawlAt: new Date(Date.now() - 3600 * 1000 * 28).toISOString(),
        lastGscSyncAt: new Date(Date.now() - 3600 * 1000 * 4).toISOString(),
        gscSyncStatus: 'Active',
      },
      health: {
        healthScore: 88,
        errorsCount: 4,
        warningsCount: 18,
        totalUrlsCrawled: 245,
      },
      rankings: {
        totalKeywords: 450,
        averagePosition: 8.4,
        searchVisibility: 52.8,
        top3Count: 24,
        top10Count: 82,
        top20Count: 145,
        top100Count: 388,
        improvedCount: 38,
        declinedCount: 12,
        unchangedCount: 400,
      },
      gsc: {
        syncStatus: 'Active',
        lastSyncedAt: new Date(Date.now() - 3600 * 1000 * 4).toISOString(),
        totalClicks: 14850,
        totalImpressions: 215400,
        averageCtr: 0.0689,
        averagePosition: 6.2,
        startDate: '2026-08-20',
        endDate: '2026-09-17',
        dailySeries: Array.from({ length: 28 }, (_, i) => {
          const d = new Date(Date.now() - (27 - i) * 86400 * 1000);
          const dateStr = d.toISOString().substring(5, 10);
          const clicks = Math.round(420 + Math.sin(i / 3) * 120 + (i % 5) * 20);
          return {
            date: dateStr,
            clicks,
            impressions: clicks * 15,
          };
        }),
      },
      tasks: {
        totalCount: 18,
        openCount: 5,
        inProgressCount: 4,
        readyForVerificationCount: 3,
        closedCount: 6,
        overdueCount: 1,
      },
      criticalIssues: [
        {
          id: 'issue-1',
          ruleCode: 'HTTP_5XX_SERVER_ERROR',
          firstSeenAt: new Date(Date.now() - 3600 * 1000 * 24).toISOString(),
          affectedUrl: 'https://workcomposer.com/api/v1/health-check',
        },
        {
          id: 'issue-2',
          ruleCode: 'CANONICAL_POINTS_TO_404',
          firstSeenAt: new Date(Date.now() - 3600 * 1000 * 48).toISOString(),
          affectedUrl: 'https://workcomposer.com/features/team-tracking',
        },
        {
          id: 'issue-3',
          ruleCode: 'TITLE_TAG_MISSING',
          firstSeenAt: new Date(Date.now() - 3600 * 1000 * 72).toISOString(),
          affectedUrl: 'https://workcomposer.com/downloads/changelog-v4',
        },
      ],
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
