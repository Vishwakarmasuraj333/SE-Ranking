import { NextRequest, NextResponse } from "next/server";
import { CompetitorOverviewDto } from "@/lib/types";

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: projectId } = await params;
    const { searchParams } = new URL(req.url);
    const days = parseInt(searchParams.get("days") || "30", 10);

    const overviewData: CompetitorOverviewDto = {
      totalKeywordsCount: 50,
      isStale: false,
      lastCheckedAt: new Date(Date.now() - 3600 * 1000 * 2).toISOString(),
      summaries: [
        {
          competitorId: null,
          name: "WorkComposer",
          domain: "workcomposer.com",
          isTargetDomain: true,
          currentVisibility: days === 7 ? 44.1 : days === 90 ? 39.8 : 42.5,
          currentAveragePosition: 8.2,
          currentRankedCount: 38,
          top20OverlapCount: 28,
          top20OverlapPercentage: 56,
          top3Count: 6,
          top10Count: 16,
          top20Count: 28,
          top100Count: 38,
          unrankedCount: 12,
        },
        {
          competitorId: "comp-1",
          name: "Hubstaff",
          domain: "hubstaff.com",
          isTargetDomain: false,
          currentVisibility: days === 7 ? 70.2 : days === 90 ? 65.1 : 68.4,
          currentAveragePosition: 4.8,
          currentRankedCount: 46,
          top20OverlapCount: 24,
          top20OverlapPercentage: 48,
          top3Count: 14,
          top10Count: 26,
          top20Count: 36,
          top100Count: 46,
          unrankedCount: 4,
        },
        {
          competitorId: "comp-2",
          name: "Time Doctor",
          domain: "timedoctor.com",
          isTargetDomain: false,
          currentVisibility: days === 7 ? 56.4 : days === 90 ? 51.7 : 54.0,
          currentAveragePosition: 6.9,
          currentRankedCount: 41,
          top20OverlapCount: 19,
          top20OverlapPercentage: 38,
          top3Count: 9,
          top10Count: 21,
          top20Count: 31,
          top100Count: 41,
          unrankedCount: 9,
        },
        {
          competitorId: "comp-3",
          name: "ActivTrak",
          domain: "activtrak.com",
          isTargetDomain: false,
          currentVisibility: days === 7 ? 49.8 : days === 90 ? 46.2 : 48.0,
          currentAveragePosition: 7.6,
          currentRankedCount: 36,
          top20OverlapCount: 17,
          top20OverlapPercentage: 34,
          top3Count: 5,
          top10Count: 18,
          top20Count: 27,
          top100Count: 36,
          unrankedCount: 14,
        },
      ],
    };

    return NextResponse.json({
      success: true,
      statusCode: 200,
      timestamp: new Date().toISOString(),
      data: overviewData,
      projectId,
    });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Failed to fetch visibility overview.";
    return NextResponse.json({ success: false, message }, { status: 500 });
  }
}
