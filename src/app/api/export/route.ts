import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db/prisma';

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const analysisId = searchParams.get('analysisId');
    const format = searchParams.get('format') || 'csv';
    const type = searchParams.get('type') || 'prompts'; // 'prompts' | 'citations' | 'competitors'

    if (!analysisId) {
      return NextResponse.json({ error: 'analysisId is required' }, { status: 400 });
    }

    const analysis = await prisma.analysis.findUnique({
      where: { id: analysisId },
      include: {
        prompts: true,
        citations: true,
        competitors: true,
      },
    });

    if (!analysis) {
      return NextResponse.json({ error: 'Analysis not found' }, { status: 404 });
    }

    if (format === 'json') {
      return new NextResponse(JSON.stringify(analysis, null, 2), {
        headers: {
          'Content-Type': 'application/json',
          'Content-Disposition': `attachment; filename="${analysis.domain}_${type}_export.json"`,
        },
      });
    }

    // Generate CSV
    let csv = '';
    if (type === 'prompts') {
      csv = 'Prompt,Topic,Engine,Mention,Link,Ads,Visibility,Answer Date\n';
      analysis.prompts.forEach((p) => {
        const cleanPrompt = `"${p.prompt.replace(/"/g, '""')}"`;
        const cleanTopic = `"${p.topic.replace(/"/g, '""')}"`;
        const date = p.answerDate ? p.answerDate.toISOString().split('T')[0] : '';
        csv += `${cleanPrompt},${cleanTopic},${p.engine},${p.mention},${p.link},${p.ads},${p.visibility},${date}\n`;
      });
    } else if (type === 'citations') {
      csv = 'Domain,URL,Citation Share,Visibility,Topics,Domain Trust,Page Trust,Organic Traffic\n';
      analysis.citations.forEach((c) => {
        const cleanUrl = `"${c.url.replace(/"/g, '""')}"`;
        csv += `${c.domain},${cleanUrl},${c.citationShare ?? ''},${c.visibility ?? ''},"${c.topics ?? ''}",${c.domainTrust ?? ''},${c.pageTrust ?? ''},${c.organicTraffic ?? ''}\n`;
      });
    } else if (type === 'competitors') {
      csv = 'Domain,Brand,AI Presence,Domain Presence,Brand Presence,Avg Position,Share of Voice\n';
      analysis.competitors.forEach((cp) => {
        csv += `${cp.domain},${cp.brandName ?? ''},${cp.aiPresence ?? ''},${cp.domainPresence ?? ''},${cp.brandPresence ?? ''},${cp.avgPosition ?? ''},${cp.shareOfVoice ?? ''}\n`;
      });
    }

    return new NextResponse(csv, {
      headers: {
        'Content-Type': 'text/csv; charset=utf-8',
        'Content-Disposition': `attachment; filename="${analysis.domain}_${type}_export.csv"`,
      },
    });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Export failed';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
