import { NextRequest, NextResponse } from "next/server";
import { CompetitorKeywordsResponseDto } from "@/lib/types";

const MOCK_COMPETITORS = [
  { id: "comp-1", name: "Hubstaff", domain: "hubstaff.com" },
  { id: "comp-2", name: "Time Doctor", domain: "timedoctor.com" },
  { id: "comp-3", name: "ActivTrak", domain: "activtrak.com" },
];

const MOCK_KEYWORDS = [
  {
    keywordId: "kw-mat-1",
    keywordText: "employee tracking software",
    searchVolume: 18100,
    targetPosition: 4,
    targetPositionChange: 1,
    competitorRanks: {
      "comp-1": { position: 1, positionChange: 0 },
      "comp-2": { position: 3, positionChange: -1 },
      "comp-3": { position: 7, positionChange: 2 },
    },
  },
  {
    keywordId: "kw-mat-2",
    keywordText: "remote employee monitoring",
    searchVolume: 12400,
    targetPosition: 11,
    targetPositionChange: -2,
    competitorRanks: {
      "comp-1": { position: 2, positionChange: 1 },
      "comp-2": { position: 4, positionChange: 0 },
      "comp-3": { position: 5, positionChange: 1 },
    },
  },
  {
    keywordId: "kw-mat-3",
    keywordText: "workforce productivity analytics",
    searchVolume: 8800,
    targetPosition: 2,
    targetPositionChange: 2,
    competitorRanks: {
      "comp-1": { position: 6, positionChange: -2 },
      "comp-2": { position: 8, positionChange: 0 },
      "comp-3": { position: 1, positionChange: 3 },
    },
  },
  {
    keywordId: "kw-mat-4",
    keywordText: "time tracking with screenshots",
    searchVolume: 6600,
    targetPosition: null,
    targetPositionChange: null,
    competitorRanks: {
      "comp-1": { position: 3, positionChange: 0 },
      "comp-2": { position: 2, positionChange: 1 },
      "comp-3": { position: 12, positionChange: -3 },
    },
  },
  {
    keywordId: "kw-mat-5",
    keywordText: "automatic attendance system",
    searchVolume: 5200,
    targetPosition: 18,
    targetPositionChange: 4,
    competitorRanks: {
      "comp-1": { position: 5, positionChange: -1 },
      "comp-2": { position: 7, positionChange: 2 },
      "comp-3": { position: 15, positionChange: 0 },
    },
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
    const page = Math.max(1, parseInt(searchParams.get("page") || "1", 10));
    const pageSize = Math.max(1, parseInt(searchParams.get("pageSize") || "25", 10));

    let filtered = [...MOCK_KEYWORDS];

    if (search) {
      filtered = filtered.filter((item) =>
        item.keywordText.toLowerCase().includes(search)
      );
    }

    const totalCount = filtered.length;
    const startIndex = (page - 1) * pageSize;
    const paginatedItems = filtered.slice(startIndex, startIndex + pageSize);

    const responseData: CompetitorKeywordsResponseDto = {
      items: paginatedItems,
      competitors: MOCK_COMPETITORS,
      totalCount,
      pageNumber: page,
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
    const message = err instanceof Error ? err.message : "Failed to fetch keyword matrix.";
    return NextResponse.json({ success: false, message }, { status: 500 });
  }
}
