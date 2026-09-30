import { NextRequest, NextResponse } from "next/server";
import { CompetitorGapItemDto, CompetitorGapResponseDto } from "@/lib/types";

const MOCK_GAP_ITEMS: CompetitorGapItemDto[] = [
  {
    keywordId: "kw-gap-101",
    keywordText: "employee monitoring software",
    keywordDifficulty: 74,
    cpcUsd: 5.6,
    isActive: false,
    searchVolume: 18100,
    bestCompetitorId: "comp-1",
    bestCompetitorName: "Hubstaff",
    bestCompetitorDomain: "hubstaff.com",
    bestCompetitorPosition: 2,
    targetPosition: null,
    opportunityScore: 89.2,
  },
  {
    keywordId: "kw-gap-102",
    keywordText: "time tracking with screenshots",
    keywordDifficulty: 58,
    cpcUsd: 4.15,
    isActive: false,
    searchVolume: 12400,
    bestCompetitorId: "comp-2",
    bestCompetitorName: "Time Doctor",
    bestCompetitorDomain: "timedoctor.com",
    bestCompetitorPosition: 3,
    targetPosition: 38,
    opportunityScore: 82.5,
  },
  {
    keywordId: "kw-gap-103",
    keywordText: "remote work productivity tracker",
    keywordDifficulty: 48,
    cpcUsd: 3.5,
    isActive: false,
    searchVolume: 8800,
    bestCompetitorId: "comp-1",
    bestCompetitorName: "Hubstaff",
    bestCompetitorDomain: "hubstaff.com",
    bestCompetitorPosition: 1,
    targetPosition: null,
    opportunityScore: 79.4,
  },
  {
    keywordId: "kw-gap-104",
    keywordText: "workforce analytics software",
    keywordDifficulty: 65,
    cpcUsd: 6.2,
    isActive: true,
    searchVolume: 7200,
    bestCompetitorId: "comp-3",
    bestCompetitorName: "ActivTrak",
    bestCompetitorDomain: "activtrak.com",
    bestCompetitorPosition: 4,
    targetPosition: 24,
    opportunityScore: 71.8,
  },
  {
    keywordId: "kw-gap-105",
    keywordText: "automatic attendance management system",
    keywordDifficulty: 35,
    cpcUsd: 1.85,
    isActive: false,
    searchVolume: 5900,
    bestCompetitorId: "comp-2",
    bestCompetitorName: "Time Doctor",
    bestCompetitorDomain: "timedoctor.com",
    bestCompetitorPosition: 5,
    targetPosition: null,
    opportunityScore: 66.3,
  },
  {
    keywordId: "kw-gap-106",
    keywordText: "desktop activity logger",
    keywordDifficulty: 42,
    cpcUsd: 2.4,
    isActive: false,
    searchVolume: 3600,
    bestCompetitorId: "comp-3",
    bestCompetitorName: "ActivTrak",
    bestCompetitorDomain: "activtrak.com",
    bestCompetitorPosition: 6,
    targetPosition: 54,
    opportunityScore: 58.0,
  },
];

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: projectId } = await params;
    const { searchParams } = new URL(req.url);

    const search = searchParams.get("search")?.toLowerCase().trim() || "";
    const competitorId = searchParams.get("competitorId") || "";
    const sort = searchParams.get("sort") || "opportunityscore";
    const page = Math.max(1, parseInt(searchParams.get("page") || "1", 10));
    const pageSize = Math.max(1, parseInt(searchParams.get("pageSize") || "25", 10));

    let filtered = [...MOCK_GAP_ITEMS];

    if (search) {
      filtered = filtered.filter((item) =>
        item.keywordText.toLowerCase().includes(search)
      );
    }

    if (competitorId) {
      filtered = filtered.filter((item) => item.bestCompetitorId === competitorId);
    }

    // Sort
    filtered.sort((a, b) => {
      switch (sort) {
        case "opportunityscore":
          return b.opportunityScore - a.opportunityScore;
        case "searchvolume":
          return (b.searchVolume || 0) - (a.searchVolume || 0);
        case "bestcompetitorrank":
          return a.bestCompetitorPosition - b.bestCompetitorPosition;
        case "keyword":
          return a.keywordText.localeCompare(b.keywordText);
        default:
          return b.opportunityScore - a.opportunityScore;
      }
    });

    const totalCount = filtered.length;
    const startIndex = (page - 1) * pageSize;
    const paginatedItems = filtered.slice(startIndex, startIndex + pageSize);

    const responseData: CompetitorGapResponseDto = {
      items: paginatedItems,
      totalCount,
      page,
      pageSize,
      isStale: false,
    };

    return NextResponse.json({
      success: true,
      statusCode: 200,
      timestamp: new Date().toISOString(),
      data: responseData,
      projectId,
    });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Failed to fetch gap analysis.";
    return NextResponse.json({ success: false, message }, { status: 500 });
  }
}
