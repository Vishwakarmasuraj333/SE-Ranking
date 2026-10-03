import { NextRequest, NextResponse } from 'next/server';
import { verifyProjectAccess } from '@/lib/server/projectAuth';
import { crawlProjectWebsite } from '@/lib/audit/crawler';

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    const authResult = await verifyProjectAccess(req, id);
    if (!authResult.success) {
      return authResult.error;
    }
    const { project } = authResult.data;

    const body = await req.json().catch(() => ({}));
    const maxPages = Math.min(30, Math.max(5, body.maxPages || 15));

    // Execute real technical SEO crawl
    const crawlResult = await crawlProjectWebsite(project.id, project.domain, {
      maxPages,
      maxDepth: 2,
      timeoutMs: 7000,
    });

    return NextResponse.json({
      success: true,
      message: `Audit completed: crawled ${crawlResult.pagesCrawled} pages in ${(crawlResult.durationMs / 1000).toFixed(1)}s.`,
      result: crawlResult,
    });
  } catch (err: unknown) {
    console.error('Audit crawl error:', err);
    const message = err instanceof Error ? err.message : 'Audit crawler execution failed.';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
