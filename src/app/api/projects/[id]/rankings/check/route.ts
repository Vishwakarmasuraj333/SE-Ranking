import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { prisma } from '@/lib/db/prisma';
import { verifyProjectAccess } from '@/lib/server/projectAuth';
import { getRankingProvider, KeywordCheckRequest, SearchEngineType, DeviceType } from '@/lib/rankings';

const CheckRankingsBodySchema = z.object({
  keywordIds: z.array(z.string()).optional(),
  searchEngine: z
    .enum([
      'google',
      'google-ai-overview',
      'google-ai-mode',
      'bing',
      'yahoo',
      'yandex',
      'duckduckgo',
      'youtube',
      'chatgpt',
    ])
    .optional(),
  countryCode: z.string().min(2).max(5).optional(),
  languageCode: z.string().min(2).max(5).optional(),
  device: z.enum(['desktop', 'mobile']).optional(),
});

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    // 1. Authenticate user & verify project ownership
    const authResult = await verifyProjectAccess(req, id);
    if (!authResult.success) {
      return authResult.error;
    }
    const { project } = authResult.data;

    // 2. Validate request payload with Zod
    const rawBody = await req.json().catch(() => ({}));
    const parseResult = CheckRankingsBodySchema.safeParse(rawBody);
    if (!parseResult.success) {
      return NextResponse.json(
        {
          error: 'Invalid ranking check request payload.',
          details: parseResult.error.flatten(),
        },
        { status: 400 }
      );
    }
    const { keywordIds, searchEngine, countryCode, languageCode, device } = parseResult.data;

    // 3. Query target keywords belonging to this project
    const keywords = await prisma.keyword.findMany({
      where: {
        projectId: project.id,
        deletedAt: null,
        ...(keywordIds && keywordIds.length > 0 ? { id: { in: keywordIds } } : {}),
      },
      orderBy: { createdAt: 'desc' },
    });

    if (keywords.length === 0) {
      return NextResponse.json({
        success: true,
        message: 'No keywords found for ranking check.',
        checkedCount: 0,
        rankedCount: 0,
        unrankedCount: 0,
        results: [],
      });
    }

    // 4. Resolve live provider
    const provider = getRankingProvider();

    // Check if provider is configured - never generate fake data
    if (!provider.isConfigured()) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: 'PROVIDER_UNCONFIGURED',
            message: `Ranking provider "${provider.id}" is not configured. Please set ${
              provider.id === 'dataforseo'
                ? 'DATAFORSEO_LOGIN and DATAFORSEO_PASSWORD'
                : 'SERPAPI_API_KEY'
            } in your environment variables to enable live SERP rank tracking.`,
            provider: provider.id,
          },
          provider: provider.id,
          checkedCount: 0,
        },
        { status: 400 }
      );
    }

    // 5. Construct provider check requests
    const checkRequests: KeywordCheckRequest[] = keywords.map((kw) => ({
      keywordId: kw.id,
      keyword: kw.keywordText,
      targetDomain: project.domain,
      searchEngine: (searchEngine || kw.searchEngine || project.defaultSearchEngine || 'google') as SearchEngineType,
      countryCode: countryCode || kw.countryCode || project.countryCode || 'in',
      languageCode: languageCode || kw.language || project.languageCode || 'en',
      device: (device || kw.device || project.defaultDevice || 'desktop') as DeviceType,
    }));

    // 6. Execute live check against real provider
    const providerResponse = await provider.checkRankings(checkRequests, { timeoutMs: 25000 });

    if (!providerResponse.success) {
      return NextResponse.json(
        {
          success: false,
          error: providerResponse.error,
          provider: provider.id,
        },
        { status: providerResponse.error?.statusCode || 500 }
      );
    }

    const checkTimestamp = new Date();
    const updatedKeywordRecords = [];

    // 7. Save ranking results, update position dynamics and ranking history
    for (const res of providerResponse.results) {
      const existingKw = keywords.find((k) => k.id === res.keywordId);
      if (!existingKw) continue;

      const prevPos = existingKw.currentPosition;
      const newPos = res.position; // 1-100 or null

      let posChange: number | null = null;
      if (prevPos !== null && prevPos !== undefined && newPos !== null && newPos !== undefined) {
        // In rankings, lower rank number is better (e.g. 10 -> 4 is +6 improvement)
        posChange = prevPos - newPos;
      }

      // Calculate best & worst positions
      let bestPos = existingKw.bestPosition;
      let worstPos = existingKw.worstPosition;
      if (newPos !== null) {
        bestPos = bestPos ? Math.min(bestPos, newPos) : newPos;
        worstPos = worstPos ? Math.max(worstPos, newPos) : newPos;
      }

      // Update Keyword record in DB
      const updatedKw = await prisma.keyword.update({
        where: { id: existingKw.id },
        data: {
          previousPosition: prevPos,
          currentPosition: newPos,
          positionChange: posChange,
          bestPosition: bestPos,
          worstPosition: worstPos,
          rankedUrl: res.rankedUrl || existingKw.rankedUrl,
          serpFeatures: res.serpFeatures.length > 0 ? JSON.stringify(res.serpFeatures) : existingKw.serpFeatures,
          updatedAt: checkTimestamp,
        },
      });
      updatedKeywordRecords.push(updatedKw);

      // Create RankingHistory entry in DB
      await prisma.rankingHistory.create({
        data: {
          projectId: project.id,
          keywordId: existingKw.id,
          searchEngine: res.searchEngine,
          country: res.countryCode,
          language: existingKw.language || 'en',
          device: res.device,
          position: newPos,
          previousPosition: prevPos,
          positionChange: posChange || 0,
          searchVolume: existingKw.monthlySearchVolume || 0,
          url: res.rankedUrl,
          serpFeatures: JSON.stringify(res.serpFeatures),
          checkedAt: checkTimestamp,
        },
      });
    }

    // 8. Update Project metadata
    await prisma.project.update({
      where: { id: project.id },
      data: {
        lastRankingCheckAt: checkTimestamp,
        updatedAt: checkTimestamp,
      },
    });

    return NextResponse.json({
      success: true,
      message: `Successfully checked rankings for ${providerResponse.checkedCount} keywords using ${provider.name}.`,
      provider: provider.id,
      checkedCount: providerResponse.checkedCount,
      rankedCount: providerResponse.rankedCount,
      unrankedCount: providerResponse.unrankedCount,
      checkedAt: checkTimestamp.toISOString(),
      results: providerResponse.results,
    });
  } catch (err: unknown) {
    console.error('Rankings check error:', err);
    const msg = err instanceof Error ? err.message : 'Internal error during live ranking check.';
    return NextResponse.json({ error: msg, code: 'INTERNAL_ERROR' }, { status: 500 });
  }
}
