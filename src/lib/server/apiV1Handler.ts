import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db/prisma";

function successResponse<T>(data: T, status = 200) {
  return NextResponse.json(
    {
      success: true,
      data,
      errors: [],
    },
    { status }
  );
}

function errorResponse(message: string, status = 400) {
  return NextResponse.json(
    {
      success: false,
      data: null,
      errors: [message],
    },
    { status }
  );
}

// Helper to resolve project by id or friendly slug (workco, portal, domain, etc.)
async function resolveProject(idOrSlug?: string) {
  if (!idOrSlug) {
    return await prisma.project.findFirst({ orderBy: { createdAt: "asc" } });
  }

  const query = idOrSlug.toLowerCase().trim();
  const project = await prisma.project.findFirst({
    where: {
      OR: [
        { id: query },
        { domain: { contains: query } },
        { name: { contains: query } },
      ],
    },
  });

  if (project) return project;
  return await prisma.project.findFirst({ orderBy: { createdAt: "asc" } });
}

export async function handleApiV1(request: NextRequest, slug: string[]) {
  const method = request.method;
  const path = slug.join("/");
  const { searchParams } = new URL(request.url);

  // 1. HEALTH CHECKS
  if (path === "health") {
    return successResponse({
      status: "Healthy",
      engine: "Next.js Unified Full-Stack SEO Platform",
      uptimeSeconds: Math.floor(process.uptime()),
      timestamp: new Date().toISOString(),
    });
  }

  // 2. AUTHENTICATION
  if (path === "auth/login") {
    if (method !== "POST") return errorResponse("Method not allowed", 405);
    try {
      const body = await request.json();
      const { email, password } = body || {};
      if (!email) return errorResponse("Email is required.", 400);

      const cleanEmail = email.toLowerCase().trim();
      let user = await prisma.user.findUnique({ where: { email: cleanEmail } });
      if (!user) {
        user = await prisma.user.create({
          data: {
            email: cleanEmail,
            name: cleanEmail === "admin@seranking.com" ? "System Administrator" : cleanEmail.split("@")[0],
            role: cleanEmail.includes("admin") ? "SuperAdmin" : "user",
          },
        });
      }

      const token = `token-${user.id}-${Date.now()}`;
      return successResponse({
        accessToken: token,
        refreshToken: `refresh-${user.id}`,
        expiresAt: new Date(Date.now() + 86400000 * 7).toISOString(),
        user: {
          id: user.id,
          email: user.email,
          fullName: user.name || user.email.split("@")[0],
          role: user.role,
        },
      });
    } catch (e: any) {
      return errorResponse(e?.message || "Failed to sign in", 500);
    }
  }

  if (path === "auth/me") {
    const user = (await prisma.user.findFirst({ orderBy: { createdAt: "asc" } })) || {
      id: "usr_admin",
      email: "admin@seranking.com",
      name: "System Administrator",
      role: "SuperAdmin",
    };
    return successResponse({
      id: user.id,
      email: user.email,
      fullName: user.name || "Administrator",
      role: user.role,
    });
  }

  if (path === "auth/refresh") {
    return successResponse({
      accessToken: `token-refresh-${Date.now()}`,
      refreshToken: `refresh-${Date.now()}`,
      expiresAt: new Date(Date.now() + 86400000 * 7).toISOString(),
    });
  }

  // 3. GLOBAL DASHBOARD (/api/v1/dashboard & /api/v1/dashboard/global)
  if (path === "dashboard" || path === "dashboard/global") {
    try {
      const dbProjects = await prisma.project.findMany({
        where: { isArchived: false },
        include: {
          _count: { select: { keywords: true, tasks: true } },
        },
      });

      const globalProjects = dbProjects.map((p, idx) => ({
        projectId: p.id,
        name: p.name,
        primaryDomain: p.domain,
        healthScore: 88,
        trackedKeywords: p._count.keywords || (idx === 0 ? 450 : 20),
        openTasks: p._count.tasks || (idx === 0 ? 5 : 2),
        overdueTasks: 0,
        lastCrawledAt: new Date().toISOString(),
        lastSyncedAt: new Date().toISOString(),
        gscSyncStatus: "Active",
      }));

      return successResponse({
        totalProjects: globalProjects.length,
        totalTrackedKeywords: globalProjects.reduce((acc, p) => acc + p.trackedKeywords, 0),
        averageHealthScore: 86,
        totalOpenTasks: globalProjects.reduce((acc, p) => acc + p.openTasks, 0),
        totalOverdueTasks: 0,
        projects: globalProjects,
      });
    } catch (e: any) {
      return errorResponse(e?.message || "Failed to fetch dashboard", 500);
    }
  }

  // 4. PROJECTS (/api/v1/projects)
  if (path === "projects") {
    if (method === "GET") {
      const search = searchParams.get("search")?.toLowerCase() || "";
      const page = Math.max(1, parseInt(searchParams.get("page") || "1", 10));
      const pageSize = Math.min(100, Math.max(1, parseInt(searchParams.get("pageSize") || "20", 10)));

      const dbProjects = await prisma.project.findMany({
        where: {
          isArchived: false,
          ...(search ? { OR: [{ name: { contains: search } }, { domain: { contains: search } }] } : {}),
        },
        include: { _count: { select: { keywords: true, tasks: true } } },
        orderBy: { createdAt: "desc" },
      });

      const totalCount = dbProjects.length;
      const items = dbProjects.slice((page - 1) * pageSize, page * pageSize).map((p) => ({
        id: p.id,
        name: p.name,
        primaryDomain: p.domain,
        protocol: p.protocol || "https://",
        countryCode: p.countryCode || "US",
        languageCode: p.languageCode || "en",
        timezone: p.timezone || "America/New_York",
        defaultSearchEngine: p.defaultSearchEngine || "google",
        defaultDevice: p.defaultDevice || "desktop",
        status: p.status || "Active",
        createdAt: p.createdAt.toISOString(),
        updatedAt: p.updatedAt.toISOString(),
        memberCount: 3,
        userAccessLevel: "Owner",
      }));

      return successResponse({
        items,
        page,
        pageSize,
        totalCount,
        totalPages: Math.ceil(totalCount / pageSize) || 1,
      });
    }

    if (method === "POST") {
      try {
        const body = await request.json();
        const { name, primaryDomain, protocol = "https://", countryCode = "US" } = body || {};
        if (!name || !primaryDomain) return errorResponse("Project name and primary domain are required.");

        const cleanDomain = primaryDomain.replace(/^https?:\/\//, "").replace(/\/$/, "");
        const newProject = await prisma.project.create({
          data: {
            name,
            domain: cleanDomain,
            protocol,
            countryCode,
            status: "Active",
          },
        });

        return successResponse(
          {
            id: newProject.id,
            name: newProject.name,
            primaryDomain: newProject.domain,
            protocol: newProject.protocol,
            countryCode: newProject.countryCode,
            status: newProject.status,
            createdAt: newProject.createdAt.toISOString(),
            updatedAt: newProject.updatedAt.toISOString(),
            memberCount: 1,
            userAccessLevel: "Owner",
          },
          201
        );
      } catch (e: any) {
        return errorResponse(e?.message || "Failed to create project", 500);
      }
    }
  }

  // 5. SINGLE PROJECT ROUTES: /api/v1/projects/:id/...
  if (slug[0] === "projects" && slug.length >= 2) {
    const projectId = slug[1];
    const subPath = slug.slice(2).join("/");
    const project = await resolveProject(projectId);

    if (!project) {
      return errorResponse("Project not found", 404);
    }

    // GET /api/v1/projects/:id
    if (!subPath) {
      if (method === "GET") {
        return successResponse({
          id: project.id,
          name: project.name,
          primaryDomain: project.domain,
          protocol: project.protocol || "https://",
          countryCode: project.countryCode || "US",
          status: project.status || "Active",
          createdAt: project.createdAt.toISOString(),
          updatedAt: project.updatedAt.toISOString(),
          memberCount: 3,
          userAccessLevel: "Owner",
        });
      }
      if (method === "PUT") {
        const body = await request.json();
        const updated = await prisma.project.update({
          where: { id: project.id },
          data: {
            name: body.name || undefined,
            domain: body.primaryDomain || body.domain || undefined,
            status: body.status || undefined,
          },
        });
        return successResponse(updated);
      }
      if (method === "DELETE") {
        await prisma.project.delete({ where: { id: project.id } });
        return successResponse(true);
      }
    }

    // GET /api/v1/projects/:id/members
    if (subPath === "members") {
      const users = await prisma.user.findMany({ take: 3 });
      return successResponse(
        users.map((u, i) => ({
          id: `mem-${i}`,
          projectId: project.id,
          userId: u.id,
          email: u.email,
          fullName: u.name || u.email.split("@")[0],
          role: u.role,
          accessLevel: i === 0 ? "Owner" : "Member",
          assignedAt: new Date().toISOString(),
        }))
      );
    }

    // GET /api/v1/projects/:id/dashboard
    if (subPath === "dashboard") {
      const kws = await prisma.keyword.findMany({ where: { projectId: project.id } });
      const totalKeywords = kws.length || 450;
      const rankedKeywords = kws.filter((k) => k.currentPosition != null && k.currentPosition <= 100);
      const avgPos =
        rankedKeywords.length > 0
          ? Number((rankedKeywords.reduce((acc, k) => acc + (k.currentPosition || 100), 0) / rankedKeywords.length).toFixed(1))
          : 8.4;

      return successResponse({
        projectId: project.id,
        projectName: project.name,
        primaryDomain: project.domain,
        freshness: {
          isRankingsStale: false,
          lastRankCheckAt: new Date(Date.now() - 3600 * 1000 * 14).toISOString(),
          lastAuditCrawlAt: new Date(Date.now() - 3600 * 1000 * 28).toISOString(),
          lastGscSyncAt: new Date(Date.now() - 3600 * 1000 * 4).toISOString(),
          gscSyncStatus: "Active",
        },
        health: { healthScore: 88, errorsCount: 4, warningsCount: 18, totalUrlsCrawled: 245 },
        rankings: {
          totalKeywords,
          averagePosition: avgPos,
          searchVisibility: 74.2,
          top3Count: kws.filter((k) => k.currentPosition && k.currentPosition <= 3).length || 24,
          top10Count: kws.filter((k) => k.currentPosition && k.currentPosition <= 10).length || 82,
          top20Count: kws.filter((k) => k.currentPosition && k.currentPosition <= 20).length || 145,
          top100Count: rankedKeywords.length || 388,
          improvedCount: 38,
          declinedCount: 12,
          unchangedCount: 400,
        },
        gsc: {
          syncStatus: "Active",
          lastSyncedAt: new Date().toISOString(),
          totalClicks: 14850,
          totalImpressions: 215400,
          averageCtr: 0.0689,
          averagePosition: 6.2,
          startDate: "2026-08-20",
          endDate: "2026-09-17",
          dailySeries: Array.from({ length: 28 }, (_, i) => ({
            date: new Date(Date.now() - (27 - i) * 86400 * 1000).toISOString().substring(5, 10),
            clicks: Math.round(420 + Math.sin(i / 3) * 120 + (i % 5) * 20),
            impressions: Math.round((420 + Math.sin(i / 3) * 120 + (i % 5) * 20) * 15),
          })),
        },
        tasks: { totalCount: 18, openCount: 5, inProgressCount: 4, readyForVerificationCount: 3, closedCount: 6, overdueCount: 1 },
        criticalIssues: [
          { id: "issue-1", ruleCode: "HTTP_5XX_SERVER_ERROR", firstSeenAt: new Date().toISOString(), affectedUrl: `https://${project.domain}/api/v1/health-check` },
          { id: "issue-2", ruleCode: "CANONICAL_POINTS_TO_404", firstSeenAt: new Date().toISOString(), affectedUrl: `https://${project.domain}/features/team-tracking` },
        ],
      });
    }

    // RANKINGS: /api/v1/projects/:id/rankings/...
    if (subPath.startsWith("rankings")) {
      const kws = await prisma.keyword.findMany({ where: { projectId: project.id } });
      const totalKeywords = kws.length || 450;
      const inTop10 = kws.filter((k) => k.currentPosition && k.currentPosition <= 10).length;
      const top10Pct = kws.length > 0 ? Math.round((inTop10 / kws.length) * 100) : 75;

      if (subPath === "rankings/overview") {
        return successResponse({
          projectId: project.id,
          primaryDomain: project.domain,
          metrics: [
            { id: "average_position", name: "Average Position", status: "supported", value: 3.4, formattedValue: "3.4", change: 0.6, isPositive: true },
            { id: "search_visibility", name: "Search Visibility", status: "supported", value: 74.8, formattedValue: "74.8%", change: 3.2, isPositive: true },
            { id: "top_10", name: "In Top 10", status: "supported", value: top10Pct, formattedValue: `${top10Pct}%`, change: 5, isPositive: true },
            { id: "traffic_forecast", name: "Traffic Forecast", status: "supported", value: 1240, formattedValue: "1,240", change: 84, isPositive: true },
          ],
          websitesSummary: [
            { id: "w-1", domain: project.domain, isPrimary: true, status: "active", top5: 4, top10: 6, top30: 8, keywordsCount: totalKeywords, averagePosition: 3.4, lastUpdated: "Today, 06:00" },
          ],
          trend: [
            { date: "2026-09-24", label: "Sep 24", value: 4.8 },
            { date: "2026-09-25", label: "Sep 25", value: 4.2 },
            { date: "2026-09-26", label: "Sep 26", value: 4.0 },
            { date: "2026-09-27", label: "Sep 27", value: 3.8 },
            { date: "2026-09-28", label: "Sep 28", value: 3.6 },
            { date: "2026-09-29", label: "Sep 29", value: 3.5 },
            { date: "2026-09-30", label: "Sep 30", value: 3.4 },
          ],
          timeRange: searchParams.get("timeRange") || "week",
          groupBy: "days",
          selectedMetric: "average_position",
        });
      }

      if (subPath === "rankings/summary") {
        return successResponse({
          projectId: project.id,
          primaryDomain: project.domain,
          totalKeywordsTracked: totalKeywords,
          totalKeywordsInSerp: Math.round(totalKeywords * 0.95),
          searchVisibility: 74.2,
          searchVisibilityChange: 4.8,
          averagePosition: 3.4,
          averagePositionChange: 0.8,
          isStale: false,
          distribution: { top1: 12, top2_3: 28, top4_5: 35, top6_10: 42, top11_30: 55, top31_100: 80, greaterThan100: 10 },
          movement: { jumpedCount: 38, jumpedPercentage: 25, droppedCount: 12, droppedPercentage: 8, unchangedCount: 100, unchangedPercentage: 67 },
          topKeywords: kws.slice(0, 5).map((k) => ({ keywordId: k.id, keywordText: k.keywordText, searchVolume: k.monthlySearchVolume || 2400, position: k.currentPosition || 1 })),
          topPages: [{ url: `https://${project.domain}/`, totalKeywords: 8, averagePosition: 3.2, top10Count: 6 }],
          competitors: [{ competitorId: "comp-1", name: "Hootsuite", domain: "hootsuite.com", searchVisibility: 68.5 }],
        });
      }

      if (subPath === "rankings/check" && method === "POST") {
        for (const kw of kws) {
          const prev = kw.currentPosition || Math.floor(Math.random() * 20) + 1;
          const delta = ((kw.keywordText.charCodeAt(0) + Date.now() % 5) % 5) - 2;
          const newPos = Math.max(1, prev + delta);
          await prisma.keyword.update({
            where: { id: kw.id },
            data: {
              previousPosition: prev,
              currentPosition: newPos,
              positionChange: prev - newPos,
              updatedAt: new Date(),
            },
          });
        }
        return successResponse({ checkedCount: kws.length, message: `Checked ${kws.length} keywords.` });
      }

      if (subPath === "rankings/detailed" || subPath === "rankings/historical") {
        return successResponse({
          items: kws,
          totalCount: kws.length,
          dates: ["Sep 24", "Sep 25", "Sep 26", "Sep 27", "Sep 28", "Sep 29", "Sep 30"],
        });
      }
    }

    // KEYWORDS: /api/v1/projects/:id/keywords
    if (subPath.startsWith("keywords")) {
      const keywordParts = subPath.split("/");
      if (keywordParts.length === 1) {
        if (method === "GET") {
          const search = searchParams.get("search")?.toLowerCase() || "";
          const page = Math.max(1, parseInt(searchParams.get("page") || "1", 10));
          const pageSize = Math.min(100, Math.max(1, parseInt(searchParams.get("pageSize") || "20", 10)));

          const kws = await prisma.keyword.findMany({
            where: {
              projectId: project.id,
              deletedAt: null,
              ...(search ? { keywordText: { contains: search } } : {}),
            },
            orderBy: { createdAt: "desc" },
          });

          return successResponse({
            items: kws,
            page,
            pageSize,
            totalCount: kws.length,
            totalPages: Math.ceil(kws.length / pageSize) || 1,
          });
        }

        if (method === "POST") {
          const body = await request.json();
          const { keywordText, monthlySearchVolume = 2400, groupName = "General" } = body || {};
          if (!keywordText) return errorResponse("Keyword text is required.");

          const newKw = await prisma.keyword.create({
            data: {
              projectId: project.id,
              keywordText,
              monthlySearchVolume,
              groupName,
              keywordDifficulty: Math.floor(Math.random() * 50) + 15,
              cpcUsd: parseFloat((Math.random() * 5 + 0.5).toFixed(2)),
              currentPosition: Math.floor(Math.random() * 20) + 1,
              previousPosition: Math.floor(Math.random() * 25) + 1,
              positionChange: Math.floor(Math.random() * 5) - 2,
            },
          });
          return successResponse(newKw, 201);
        }
      }

      if ((keywordParts[1] === "bulk" || keywordParts[1] === "import-csv" || keywordParts[1] === "import") && method === "POST") {
        const body = await request.json();
        const incoming: string[] = Array.isArray(body.keywords)
          ? body.keywords.map((k: any) => (typeof k === "string" ? k : k.keywordText || k.keyword)).filter(Boolean)
          : typeof body.keywords === "string"
          ? body.keywords.split("\n").map((k: string) => k.trim()).filter(Boolean)
          : [];

        if (incoming.length === 0) {
          return errorResponse("No keywords provided", 400);
        }

        const existing = await prisma.keyword.findMany({
          where: { projectId: project.id, deletedAt: null },
          select: { keywordText: true },
        });
        const existingSet = new Set(existing.map((e) => e.keywordText.toLowerCase()));
        const unique = incoming.filter((k) => !existingSet.has(k.toLowerCase()));

        if (unique.length > 0) {
          await prisma.keyword.createMany({
            data: unique.map((kw) => ({
              projectId: project.id,
              keywordText: kw,
              groupName: body.groupName || "General",
              monthlySearchVolume: Math.floor(Math.random() * 8000) + 800,
              keywordDifficulty: Math.floor(Math.random() * 50) + 15,
              cpcUsd: parseFloat((Math.random() * 4 + 0.5).toFixed(2)),
              currentPosition: Math.floor(Math.random() * 25) + 1,
              previousPosition: Math.floor(Math.random() * 30) + 1,
              positionChange: Math.floor(Math.random() * 5) - 2,
            })),
          });
        }

        return successResponse({
          importedCount: unique.length,
          duplicateCount: incoming.length - unique.length,
          totalCount: existing.length + unique.length,
        });
      }

      if (keywordParts.length === 2 && method === "DELETE") {
        const keywordId = keywordParts[1];
        await prisma.keyword.delete({ where: { id: keywordId } }).catch(() => null);
        return successResponse(true);
      }
    }

    // COMPETITORS: /api/v1/projects/:id/competitors/...
    if (subPath.startsWith("competitors")) {
      if (subPath === "competitors" && method === "GET") {
        const comps = await prisma.projectCompetitor.findMany({ where: { projectId: project.id } });
        return successResponse(comps);
      }
      if (subPath === "competitors" && method === "POST") {
        const body = await request.json();
        const created = await prisma.projectCompetitor.create({
          data: {
            projectId: project.id,
            name: body.name || body.domain || "Competitor",
            domain: (body.domain || "competitor.com").replace(/^https?:\/\//, "").split("/")[0],
            visibilityScore: 75,
            avgPosition: 4.5,
            commonKeywordsCount: 30,
          },
        });
        return successResponse(created, 201);
      }
      if (subPath === "competitors/gap") {
        return successResponse({
          gapKeywords: [
            { id: "gap-1", keyword: "seo rank tracking tool", volume: 3600, competitorRank: 4, yourRank: null, opportunityScore: 88 },
            { id: "gap-2", keyword: "enterprise backlink monitor", volume: 1400, competitorRank: 2, yourRank: 18, opportunityScore: 74 },
          ],
          totalCount: 2,
        });
      }
      if (subPath === "competitors/visibility") {
        const comps = await prisma.projectCompetitor.findMany({ where: { projectId: project.id } });
        return successResponse({ competitors: comps });
      }
    }

    // AUDIT: /api/v1/projects/:id/audit/...
    if (subPath.startsWith("audit")) {
      const issues = await prisma.auditIssue.findMany({ where: { projectId: project.id } });
      return successResponse({
        items: issues,
        page: 1,
        pageSize: 20,
        totalCount: issues.length,
        totalPages: 1,
      });
    }

    // TASKS: /api/v1/projects/:id/tasks
    if (subPath.startsWith("tasks")) {
      if (method === "GET") {
        const tasks = await prisma.task.findMany({ where: { projectId: project.id } });
        return successResponse({ items: tasks, page: 1, pageSize: 20, totalCount: tasks.length, totalPages: 1 });
      }
      if (method === "POST") {
        const body = await request.json();
        const newTask = await prisma.task.create({
          data: {
            projectId: project.id,
            title: body.title || "Remediation Task",
            description: body.description || null,
            priority: body.priority || "Medium",
            status: body.status || "Todo",
          },
        });
        return successResponse(newTask, 201);
      }
    }

    // REPORTS: /api/v1/projects/:id/reports
    if (subPath.startsWith("reports")) {
      const reports = await prisma.report.findMany({ where: { projectId: project.id } });
      return successResponse({ items: reports, page: 1, pageSize: 20, totalCount: reports.length, totalPages: 1 });
    }

    // GA4 & GSC INTEGRATIONS: /api/v1/projects/:id/ga4/...
    if (subPath.startsWith("ga4") || subPath.startsWith("settings/integrations")) {
      return successResponse({
        isConnected: true,
        propertyId: "properties/39812401",
        propertyName: `${project.name} Web Stream`,
        lastSyncedAt: new Date().toISOString(),
        totalUsers: 48920,
        activeUsers: 34100,
        sessions: 62410,
        bounceRate: 0.324,
      });
    }
  }

  // 6. ADMIN ROUTES (/api/v1/admin/users, /api/v1/admin/activity-logs)
  if (path === "admin/users") {
    const users = await prisma.user.findMany();
    return successResponse({ items: users, page: 1, pageSize: 20, totalCount: users.length, totalPages: 1 });
  }

  if (path === "admin/activity-logs") {
    const logs = await prisma.activityLog.findMany({ take: 50, orderBy: { createdAt: "desc" } });
    return successResponse({ items: logs, page: 1, pageSize: 20, totalCount: logs.length, totalPages: 1 });
  }

  // 7. NOTIFICATIONS
  if (path === "notifications" || path === "notifications/unread-count") {
    return successResponse({ items: [], unreadCount: 0 });
  }

  return errorResponse(`Endpoint /api/v1/${path} not found`, 404);
}
