import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db/prisma';
import { ProjectSchema, normalizeDomain, normalizeUrl } from '@/lib/validation/schemas';
import { getAuthSession } from '@/lib/server/auth';
import { getCountryInfo } from '@/lib/countryUtils';

export async function GET(req: NextRequest) {
  try {
    const auth = await getAuthSession(req);
    const { searchParams } = new URL(req.url);
    const includeArchived = searchParams.get('archived') === 'true';
    const includeTrash = searchParams.get('trash') === 'true';

    // Query filters
    const whereClause: any = {};

    if (includeTrash) {
      whereClause.deletedAt = { not: null };
    } else {
      whereClause.deletedAt = null;
      if (!includeArchived) {
        whereClause.isArchived = false;
      }
    }

    if (auth?.user?.id) {
      // If user is not superadmin/owner, filter by userId
      if (auth.user.role === 'MEMBER' || auth.user.role === 'CLIENT') {
        whereClause.userId = auth.user.id;
      }
    }

    const projectDb = (prisma as any).project;
    const projects: any[] = await projectDb.findMany({
      where: whereClause,
      orderBy: { createdAt: 'desc' },
      include: {
        searchEngines: true,
        _count: {
          select: {
            keywords: true,
            projectCompetitors: true,
            auditIssues: true,
            tasks: true,
            locations: true,
            reports: true,
          },
        },
      },
    });

    const formatted = projects.map((p: any) => {
      const cleanDomain = (p.domain || '').replace(/^https?:\/\//i, '').replace(/^www\./i, '').split('/')[0].toLowerCase();
      return {
        id: p.id,
        name: p.name,
        websiteUrl: p.websiteUrl || `https://${p.domain}`,
        domain: p.domain,
        brandName: p.brandName || p.name,
        logoUrl: `https://www.google.com/s2/favicons?domain=${cleanDomain}&sz=64`,
        color: p.projectColor || '#1054E2',
        country: p.country,
        countryCode: p.countryCode,
        languageCode: p.languageCode,
        defaultSearchEngine: p.defaultSearchEngine,
        defaultDevice: p.defaultDevice,
        status: p.status,
        isArchived: p.isArchived,
        deletedAt: p.deletedAt,
        createdAt: p.createdAt ? new Date(p.createdAt).toISOString() : new Date().toISOString(),
        updatedAt: p.updatedAt ? new Date(p.updatedAt).toISOString() : new Date().toISOString(),
        keywordsCount: p._count?.keywords || 0,
        competitorsCount: p._count?.projectCompetitors || 0,
        auditIssuesCount: p._count?.auditIssues || 0,
        tasksCount: p._count?.tasks || 0,
        locationsCount: p._count?.locations || 0,
        reportsCount: p._count?.reports || 0,
        searchEngines: p.searchEngines || [],
      };
    });

    return NextResponse.json({ success: true, projects: formatted });
  } catch (err: unknown) {
    console.error('Error in GET /api/projects:', err);
    return NextResponse.json({ error: 'Failed to retrieve projects' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const auth = await getAuthSession(req);
    const body = await req.json();

    // Check if this is wizard format or simple format
    let name = '';
    let rawWebsiteUrl = '';
    let color = body.color || body.projectColor || '#1054E2';
    let country = body.country || 'India';
    let countryCode = body.countryCode || 'in';
    let searchEngine = body.searchEngine || 'google';
    let language = body.language || 'English';
    let languageCode = body.languageCode || 'en';
    let device = body.device || 'desktop';
    let weeklyReport = Boolean(body.weeklyReport);
    let websiteAudit = body.websiteAudit !== false;
    let backlinkReport = Boolean(body.backlinkReport);

    let initialKeywords: string[] = [];
    let initialCompetitors: Array<{ domain: string; name?: string }> = [];

    if (body.general) {
      // Wizard format
      rawWebsiteUrl = body.general.websiteUrl || '';
      name = body.general.projectName || '';
      color = body.general.projectColor || color;
      weeklyReport = Boolean(body.general.weeklyReport);
      websiteAudit = body.general.websiteAudit !== false;
      backlinkReport = Boolean(body.general.backlinkReport);

      if (Array.isArray(body.searchEngines) && body.searchEngines.length > 0) {
        const se = body.searchEngines[0];
        searchEngine = se.engine || searchEngine;
        countryCode = se.countryCode || countryCode;
        country = se.country || country;
        language = se.language || language;
        languageCode = se.languageCode || languageCode;
        device = se.device || device;
      }

      if (Array.isArray(body.keywords)) {
        initialKeywords = body.keywords.map((k: any) => (typeof k === 'string' ? k : k.keyword)).filter(Boolean);
      }

      if (Array.isArray(body.competitors)) {
        initialCompetitors = body.competitors.filter((c: any) => Boolean(c.domain));
      }
    } else {
      // Simple / standard format
      rawWebsiteUrl = body.websiteUrl || body.domain || '';
      name = body.name || '';
      if (body.keywords) {
        initialKeywords = Array.isArray(body.keywords)
          ? body.keywords
          : String(body.keywords).split('\n').map((k) => k.trim()).filter(Boolean);
      }
    }

    if (!rawWebsiteUrl.trim()) {
      return NextResponse.json({ error: 'Website URL is required.' }, { status: 400 });
    }

    const cleanDomain = normalizeDomain(rawWebsiteUrl);
    if (!cleanDomain || cleanDomain.length < 3) {
      return NextResponse.json({ error: 'Please enter a valid website URL or domain.' }, { status: 400 });
    }

    const normalizedWebUrl = normalizeUrl(rawWebsiteUrl);
    const projectName = name.trim() || cleanDomain;
    const countryInfo = getCountryInfo(countryCode) || getCountryInfo(country);
    const resolvedCountryCode = countryInfo?.flagCode || 'in';
    const resolvedCountry = countryInfo?.name || country;

    const projectDb = (prisma as any).project;

    // Check if duplicate project already exists for this domain
    const existing = await projectDb.findFirst({
      where: {
        domain: cleanDomain,
        deletedAt: null,
      },
    });

    if (existing) {
      return NextResponse.json(
        { error: `A project with domain "${cleanDomain}" already exists.` },
        { status: 409 }
      );
    }

    // Determine owner
    const userId = auth?.user?.id || (await prisma.user.findFirst({ select: { id: true } }))?.id || null;

    // Create project in database
    const projectData: any = {
      name: projectName,
      websiteUrl: normalizedWebUrl,
      normalizedUrl: normalizedWebUrl,
      domain: cleanDomain,
      brandName: projectName,
      projectColor: color,
      country: resolvedCountry,
      countryCode: resolvedCountryCode,
      languageCode,
      defaultSearchEngine: searchEngine,
      defaultDevice: device,
      weeklyReport,
      websiteAudit,
      backlinkReport,
      userId,
      createdBy: auth?.user?.email || 'admin',
      searchEngines: {
        create: {
          engine: searchEngine,
          country: resolvedCountry,
          countryCode: resolvedCountryCode,
          language,
          languageCode,
          device,
          isActive: true,
        },
      },
    };

    const createdProject: any = await projectDb.create({
      data: projectData,
      include: {
        searchEngines: true,
      },
    });

    // Bulk insert initial keywords if provided
    if (initialKeywords.length > 0) {
      await prisma.keyword.createMany({
        data: initialKeywords.map((kw) => ({
          projectId: createdProject.id,
          keywordText: kw.trim(),
          searchEngine,
          countryCode: resolvedCountryCode,
          device,
          groupName: 'General',
          isActive: true,
        })),
      });
    }

    // Bulk insert competitors if provided
    if (initialCompetitors.length > 0) {
      await prisma.projectCompetitor.createMany({
        data: initialCompetitors.map((c) => ({
          projectId: createdProject.id,
          domain: normalizeDomain(c.domain),
          name: c.name || normalizeDomain(c.domain),
        })),
      });
    }

    return NextResponse.json({
      success: true,
      message: 'Project created successfully!',
      project: {
        ...createdProject,
        keywordsCount: initialKeywords.length,
        competitorsCount: initialCompetitors.length,
      },
    });
  } catch (err: unknown) {
    console.error('Fatal error in POST /api/projects:', err);
    const message = err instanceof Error ? err.message : 'Failed to create project.';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
