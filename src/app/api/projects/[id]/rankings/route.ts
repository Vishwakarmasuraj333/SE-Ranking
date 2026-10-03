import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db/prisma';
import { verifyProjectAccess } from '@/lib/server/projectAuth';

// Standard organic CTR distribution curve
const CTR_CURVE: Record<number, number> = {
  1: 0.317,
  2: 0.247,
  3: 0.187,
  4: 0.136,
  5: 0.095,
  6: 0.062,
  7: 0.041,
  8: 0.031,
  9: 0.024,
  10: 0.019,
};

// Visibility weight by position
function getVisibilityWeight(pos: number): number {
  if (pos === 1) return 1.0;
  if (pos === 2) return 0.85;
  if (pos === 3) return 0.7;
  if (pos <= 5) return 0.5;
  if (pos <= 10) return 0.3;
  if (pos <= 20) return 0.1;
  return 0;
}

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    // 1. Verify project access & ownership
    const authResult = await verifyProjectAccess(req, id);
    if (!authResult.success) {
      return authResult.error;
    }
    const { project } = authResult.data;

    const { searchParams } = new URL(req.url);
    const timeRange = searchParams.get('timeRange') || 'week'; // week, month, 3months, year
    const engineFilter = searchParams.get('engine');
    const groupFilter = searchParams.get('group');

    // 2. Query real keywords for this project from SQLite DB
    const keywords = await prisma.keyword.findMany({
      where: {
        projectId: project.id,
        deletedAt: null,
        ...(engineFilter ? { searchEngine: engineFilter } : {}),
        ...(groupFilter && groupFilter !== 'All groups' ? { groupName: groupFilter } : {}),
      },
      orderBy: { createdAt: 'desc' },
    });

    const totalKeywords = keywords.length;

    // Filter valid ranked keywords (1-100)
    const rankedKeywords = keywords.filter(
      (k) => k.currentPosition != null && k.currentPosition > 0 && k.currentPosition <= 100
    );

    // Calculate real average position
    const averagePosition =
      rankedKeywords.length > 0
        ? Number(
            (
              rankedKeywords.reduce((sum, k) => sum + (k.currentPosition || 0), 0) /
              rankedKeywords.length
            ).toFixed(1)
          )
        : 0;

    // Position Bracket Distributions
    const top1Count = keywords.filter((k) => k.currentPosition === 1).length;
    const top3Count = keywords.filter((k) => k.currentPosition != null && k.currentPosition <= 3).length;
    const top5Count = keywords.filter((k) => k.currentPosition != null && k.currentPosition <= 5).length;
    const top10Count = keywords.filter((k) => k.currentPosition != null && k.currentPosition <= 10).length;
    const top30Count = keywords.filter((k) => k.currentPosition != null && k.currentPosition <= 30).length;
    const top100Count = rankedKeywords.length;
    const over100Count = keywords.filter(
      (k) => k.currentPosition == null || k.currentPosition > 100
    ).length;

    // Position Dynamics
    const improvedCount = keywords.filter((k) => (k.positionChange || 0) > 0).length;
    const declinedCount = keywords.filter((k) => (k.positionChange || 0) < 0).length;
    const unchangedCount = keywords.filter(
      (k) => (k.positionChange || 0) === 0 && k.currentPosition != null
    ).length;
    const newRankingsCount = keywords.filter(
      (k) => k.previousPosition == null && k.currentPosition != null
    ).length;
    const lostRankingsCount = keywords.filter(
      (k) => k.previousPosition != null && k.currentPosition == null
    ).length;

    // Search Visibility Score (% based on actual top positions)
    let visibilityScore = 0;
    if (totalKeywords > 0) {
      const totalWeight = rankedKeywords.reduce((acc, k) => acc + getVisibilityWeight(k.currentPosition!), 0);
      visibilityScore = Number(((totalWeight / totalKeywords) * 100).toFixed(1));
    }

    // Estimated Organic Traffic Forecast
    const estimatedTraffic = Math.round(
      rankedKeywords.reduce((acc, k) => {
        const pos = k.currentPosition!;
        const ctr = CTR_CURVE[pos] || (pos <= 20 ? 0.008 : 0.001);
        const vol = k.monthlySearchVolume || 0;
        return acc + vol * ctr;
      }, 0)
    );

    // 3. Query Real Historical Ranking Records from DB
    const days = timeRange === 'month' ? 30 : timeRange === '3months' ? 90 : timeRange === 'year' ? 365 : 7;
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);

    const historyRecords = await prisma.rankingHistory.findMany({
      where: {
        projectId: project.id,
        checkedAt: { gte: startDate },
        ...(engineFilter ? { searchEngine: engineFilter } : {}),
      },
      orderBy: { checkedAt: 'asc' },
    });

    // Group real historical data by date
    const historyByDate: Record<string, { totalRank: number; count: number; dateStr: string }> = {};
    for (const h of historyRecords) {
      const dStr = h.checkedAt.toISOString().split('T')[0];
      if (!historyByDate[dStr]) {
        historyByDate[dStr] = { totalRank: 0, count: 0, dateStr: dStr };
      }
      if (h.position && h.position > 0 && h.position <= 100) {
        historyByDate[dStr].totalRank += h.position;
        historyByDate[dStr].count += 1;
      }
    }

    const realTrend = Object.values(historyByDate).map((entry) => {
      const d = new Date(entry.dateStr);
      const label = d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
      const avg = entry.count > 0 ? Number((entry.totalRank / entry.count).toFixed(1)) : 0;
      return {
        date: entry.dateStr,
        label,
        value: avg,
        checkedCount: entry.count,
      };
    });

    return NextResponse.json({
      success: true,
      projectId: project.id,
      primaryDomain: project.domain,
      summary: {
        totalKeywords,
        averagePosition,
        visibilityScore,
        estimatedTraffic,
        top1Count,
        top3Count,
        top5Count,
        top10Count,
        top30Count,
        top100Count,
        over100Count,
        improvedCount,
        declinedCount,
        unchangedCount,
        newRankingsCount,
        lostRankingsCount,
        lastCheckedDate: project.lastRankingCheckAt?.toISOString() || null,
        rankingFrequency: project.rankingFrequency || 'Daily',
      },
      trend: realTrend,
      keywords: keywords.map((k) => ({
        id: k.id,
        keyword: k.keywordText,
        rank: k.currentPosition || 0,
        prevRank: k.previousPosition || 0,
        change: k.positionChange || 0,
        bestRank: k.bestPosition || null,
        worstRank: k.worstPosition || null,
        volume: k.monthlySearchVolume || 0,
        cpc: k.cpcUsd ? `$${k.cpcUsd.toFixed(2)}` : '$0.00',
        difficulty: k.keywordDifficulty || 0,
        searchEngine: k.searchEngine || 'google',
        countryCode: k.countryCode || project.countryCode || 'in',
        device: k.device || 'desktop',
        serpFeatures: k.serpFeatures
          ? (() => {
              try {
                return JSON.parse(k.serpFeatures);
              } catch {
                return [];
              }
            })()
          : [],
        url: k.rankedUrl || k.targetUrl || `https://${project.domain}`,
        dateChecked: k.updatedAt
          ? new Date(k.updatedAt).toLocaleDateString('en-GB', {
              day: '2-digit',
              month: 'short',
              year: 'numeric',
            })
          : '—',
        group: k.groupName || 'General',
        isActive: k.isActive,
      })),
    });
  } catch (err: unknown) {
    console.error('Error fetching rankings:', err);
    const msg = err instanceof Error ? err.message : 'Failed to retrieve rankings.';
    return NextResponse.json({ error: msg, code: 'INTERNAL_ERROR' }, { status: 500 });
  }
}
