import express, { Request, Response, NextFunction } from "express";
import cors from "cors";
import {
  users,
  projects,
  keywords,
  auditIssues,
  tasks,
  notifications,
  competitors,
  activityLogs,
  User,
  Project,
  Task,
} from "./data/db";

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors({ origin: true, credentials: true }));
app.use(express.json());

// Correlation ID & Logging Middleware
app.use((req: Request, res: Response, next: NextFunction) => {
  const correlationId = req.headers["x-correlation-id"] || crypto.randomUUID();
  res.setHeader("X-Correlation-ID", correlationId);
  next();
});

// Helper for standard API Envelope
function successResponse<T>(res: Response, data: T, status = 200) {
  return res.status(status).json({
    success: true,
    data,
    errors: [],
  });
}

function errorResponse(res: Response, message: string, status = 400) {
  return res.status(status).json({
    success: false,
    data: null,
    errors: [message],
  });
}

// -------------------------------------------------------------
// 1. HEALTH CHECKS
// -------------------------------------------------------------
app.get(["/health", "/api/health"], (_req: Request, res: Response) => {
  return successResponse(res, {
    status: "Healthy",
    engine: "Node.js Express TypeScript API",
    uptimeSeconds: Math.floor(process.uptime()),
    timestamp: new Date().toISOString(),
  });
});

// -------------------------------------------------------------
// 2. AUTHENTICATION (/api/v1/auth)
// -------------------------------------------------------------
app.post("/api/v1/auth/login", (req: Request, res: Response) => {
  const { email, password } = req.body || {};
  if (!email) return errorResponse(res, "Email is required.", 400);

  const normalized = email.toLowerCase().trim();
  const user = users.find((u) => u.email.toLowerCase() === normalized);

  const validDevPasswords = [
    "AdminPassword123!",
    "Admin@12345!",
    "ExecPassword123!",
    "Exec@12345!",
    "ViewerPassword123!",
    "Viewer@12345!",
    "admin",
  ];

  if (!user || (!validDevPasswords.includes(password) && user.passwordHash !== password)) {
    return errorResponse(res, "Invalid email or password.", 401);
  }

  const authenticatedUser = user || users[0];
  const token = `token-${authenticatedUser.id}-${Date.now()}`;

  return successResponse(res, {
    accessToken: token,
    refreshToken: `refresh-${authenticatedUser.id}`,
    expiresAt: new Date(Date.now() + 86400000 * 7).toISOString(),
    user: authenticatedUser,
  });
});

app.post("/api/v1/auth/refresh", (_req: Request, res: Response) => {
  return successResponse(res, {
    accessToken: `token-refresh-${Date.now()}`,
    refreshToken: `refresh-${Date.now()}`,
    expiresAt: new Date(Date.now() + 86400000 * 7).toISOString(),
    user: users[0],
  });
});

app.get("/api/v1/auth/me", (req: Request, res: Response) => {
  const authHeader = req.headers.authorization;
  if (!authHeader) {
    return successResponse(res, users[0]);
  }
  return successResponse(res, users[0]);
});

// -------------------------------------------------------------
// 3. PROJECTS (/api/v1/projects)
// -------------------------------------------------------------
app.get("/api/v1/projects", (req: Request, res: Response) => {
  const search = typeof req.query.search === "string" ? req.query.search.toLowerCase() : "";
  const status = req.query.status ? String(req.query.status) : "";
  const page = Math.max(1, parseInt(String(req.query.page || "1"), 10));
  const pageSize = Math.min(100, Math.max(1, parseInt(String(req.query.pageSize || "20"), 10)));

  let filtered = projects;
  if (search) {
    filtered = filtered.filter(
      (p) => p.name.toLowerCase().includes(search) || p.primaryDomain.toLowerCase().includes(search)
    );
  }
  if (status) {
    filtered = filtered.filter((p) => String(p.status) === status || (status === "1" && p.status === "Active"));
  }

  const totalCount = filtered.length;
  const items = filtered.slice((page - 1) * pageSize, page * pageSize);

  return successResponse(res, {
    items,
    page,
    pageSize,
    totalCount,
    totalPages: Math.ceil(totalCount / pageSize),
  });
});

app.post("/api/v1/projects", (req: Request, res: Response) => {
  const { name, primaryDomain, protocol = "https://", countryCode = "US", defaultSearchEngine = "google", defaultDevice = "desktop" } = req.body || {};
  if (!name || !primaryDomain) {
    return errorResponse(res, "Project name and primary domain are required.");
  }

  const newProject: Project = {
    id: crypto.randomUUID(),
    name,
    primaryDomain,
    protocol,
    countryCode,
    languageCode: "en",
    timezone: "America/New_York",
    defaultSearchEngine,
    defaultDevice,
    status: "Active",
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    memberCount: 1,
    userAccessLevel: "Owner",
  };

  projects.unshift(newProject);
  return successResponse(res, newProject, 201);
});

// Helper to resolve project by id or friendly slug
function findProject(idOrSlug?: string): Project {
  if (!idOrSlug) return projects[0];
  const query = idOrSlug.toLowerCase().trim();
  const found = projects.find(
    (p) =>
      p.id.toLowerCase() === query ||
      p.primaryDomain.toLowerCase().includes(query) ||
      (query === "workco" && (p.primaryDomain.includes("workco") || p.id === "workco" || p.id.startsWith("bbbb"))) ||
      (query === "portal" && (p.primaryDomain.includes("portal") || p.id === "portal" || p.id.startsWith("aaaa"))) ||
      (query.startsWith("bbbb") && (p.id === "workco" || p.id.startsWith("bbbb") || p.primaryDomain.includes("workco"))) ||
      (query.startsWith("aaaa") && (p.id === "portal" || p.id.startsWith("aaaa") || p.primaryDomain.includes("portal")))
  );
  return found || projects[0];
}

function getProjectKeywords(idOrSlug?: string) {
  const proj = findProject(idOrSlug);
  const filtered = keywords.filter(
    (k) =>
      k.projectId === proj.id ||
      (proj.id === "workco" && (k.projectId === "workco" || k.projectId.startsWith("bbbb"))) ||
      (proj.id === "portal" && (k.projectId === "portal" || k.projectId.startsWith("aaaa")))
  );
  return filtered.length > 0 ? filtered : keywords;
}

app.get("/api/v1/projects/:id", (req: Request, res: Response) => {
  const project = findProject(req.params.id);
  return successResponse(res, project);
});

app.put("/api/v1/projects/:id", (req: Request, res: Response) => {
  const project = findProject(req.params.id);
  const projectIndex = projects.findIndex((p) => p.id === project.id);
  if (projectIndex === -1) {
    return errorResponse(res, "Project not found", 404);
  }
  projects[projectIndex] = { ...projects[projectIndex], ...req.body, updatedAt: new Date().toISOString() };
  return successResponse(res, projects[projectIndex]);
});

app.delete("/api/v1/projects/:id", (req: Request, res: Response) => {
  const project = findProject(req.params.id);
  const index = projects.findIndex((p) => p.id === project.id);
  if (index !== -1) projects.splice(index, 1);
  return successResponse(res, true);
});

app.get("/api/v1/projects/:id/members", (req: Request, res: Response) => {
  const proj = findProject(req.params.id);
  const members = users.map((u, i) => ({
    id: `mem-${i}`,
    projectId: proj.id,
    userId: u.id,
    email: u.email,
    fullName: u.fullName,
    role: u.role,
    accessLevel: i === 0 ? "Owner" : "Member",
    assignedAt: new Date().toISOString(),
  }));
  return successResponse(res, members);
});

// -------------------------------------------------------------
// 4. KEYWORDS (/api/v1/projects/:id/keywords)
// -------------------------------------------------------------
app.get("/api/v1/projects/:id/keywords", (req: Request, res: Response) => {
  const search = typeof req.query.search === "string" ? req.query.search.toLowerCase() : "";
  const page = Math.max(1, parseInt(String(req.query.page || "1"), 10));
  const pageSize = Math.min(100, Math.max(1, parseInt(String(req.query.pageSize || "20"), 10)));

  let filtered = getProjectKeywords(req.params.id);
  if (search) {
    filtered = filtered.filter((k) => k.keywordText.toLowerCase().includes(search));
  }

  const totalCount = filtered.length;
  const items = filtered.slice((page - 1) * pageSize, page * pageSize);

  return successResponse(res, {
    items,
    page,
    pageSize,
    totalCount,
    totalPages: Math.ceil(totalCount / pageSize),
  });
});

app.post("/api/v1/projects/:id/keywords", (req: Request, res: Response) => {
  const proj = findProject(req.params.id);
  const { keywordText, searchEngine = "google", countryCode = "US", device = "desktop", monthlySearchVolume = 1000 } = req.body || {};
  if (!keywordText) return errorResponse(res, "Keyword text is required.");

  const newKw = {
    id: `kw-${Date.now()}`,
    projectId: proj.id,
    keywordText,
    searchEngine,
    countryCode,
    device,
    monthlySearchVolume,
    keywordDifficulty: Math.floor(Math.random() * 50) + 15,
    cpcUsd: parseFloat((Math.random() * 5 + 0.5).toFixed(2)),
    isActive: true,
    currentPosition: Math.floor(Math.random() * 20) + 1,
    previousPosition: Math.floor(Math.random() * 25) + 1,
    positionChange: Math.floor(Math.random() * 5) - 2,
    createdAt: new Date().toISOString(),
  };
  keywords.push(newKw);
  return successResponse(res, newKw, 201);
});

app.post("/api/v1/projects/:id/keywords/import", (_req: Request, res: Response) => {
  return successResponse(res, {
    importedCount: 5,
    duplicateCount: 0,
    invalidCount: 0,
    createdKeywordIds: ["kw-imp-1", "kw-imp-2"],
  });
});

app.delete("/api/v1/projects/:id/keywords/:keywordId", (req: Request, res: Response) => {
  const idx = keywords.findIndex((k) => k.id === req.params.keywordId);
  if (idx !== -1) keywords.splice(idx, 1);
  return successResponse(res, true);
});

app.get("/api/v1/projects/:id/keywords/:keywordId/history", (req: Request, res: Response) => {
  const kw = keywords.find((k) => k.id === req.params.keywordId) || keywords[0];
  return successResponse(res, {
    keywordId: kw.id,
    keywordText: kw.keywordText,
    dataPoints: kw.history || [
      { date: "2026-09-24", position: 5 },
      { date: "2026-09-27", position: 3 },
      { date: "2026-09-30", position: 2 },
    ],
  });
});

app.get("/api/v1/projects/:id/keyword-groups", (_req: Request, res: Response) => {
  return successResponse(res, [
    { id: "grp-brand", name: "Brand", colorHex: "#3B82F6", keywordCount: 2 },
    { id: "grp-features", name: "Core Features", colorHex: "#10B981", keywordCount: 2 },
    { id: "grp-enterprise", name: "Enterprise", colorHex: "#8B5CF6", keywordCount: 1 },
  ]);
});

app.get("/api/v1/projects/:id/tags", (_req: Request, res: Response) => {
  return successResponse(res, [
    { id: "tag-1", name: "p1-core", keywordCount: 3 },
    { id: "tag-2", name: "brand", keywordCount: 2 },
    { id: "tag-3", name: "product", keywordCount: 2 },
  ]);
});

// -------------------------------------------------------------
// 5. RANKINGS (/api/v1/projects/:id/rankings)
// -------------------------------------------------------------
app.get("/api/v1/projects/:id/rankings/overview", (req: Request, res: Response) => {
  const proj = findProject(req.params.id);
  const kws = getProjectKeywords(req.params.id);
  const inTop10 = kws.filter((k) => k.currentPosition && k.currentPosition <= 10).length;
  const top10Pct = kws.length > 0 ? Math.round((inTop10 / kws.length) * 100) : 75;

  return successResponse(res, {
    projectId: proj.id,
    primaryDomain: proj.primaryDomain,
    metrics: [
      { id: "average_position", name: "Average Position", status: "supported", value: 3.4, formattedValue: "3.4", change: 0.6, isPositive: true },
      { id: "search_visibility", name: "Search Visibility", status: "supported", value: 74.8, formattedValue: "74.8%", change: 3.2, isPositive: true },
      { id: "top_10", name: "In Top 10", status: "supported", value: top10Pct, formattedValue: `${top10Pct}%`, change: 5, isPositive: true },
      { id: "traffic_forecast", name: "Traffic Forecast", status: "supported", value: 1240, formattedValue: "1,240", change: 84, isPositive: true },
    ],
    websitesSummary: [
      { id: "w-1", domain: proj.primaryDomain, isPrimary: true, status: "active", top5: 4, top10: 6, top30: 8, keywordsCount: kws.length, averagePosition: 3.4, lastUpdated: "Today, 06:00" },
      { id: "w-2", domain: "brighton-seo.com", isPrimary: false, status: "active", top5: 3, top10: 5, top30: 5, keywordsCount: 5, averagePosition: 4.8, lastUpdated: "Today, 05:45" },
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
    timeRange: "week",
    groupBy: "days",
    selectedMetric: "average_position",
  });
});

app.get("/api/v1/projects/:id/rankings/summary", (req: Request, res: Response) => {
  const proj = findProject(req.params.id);
  const activeKeywords = getProjectKeywords(req.params.id);

  let top1 = 0;
  let top2_3 = 0;
  let top4_5 = 0;
  let top6_10 = 0;
  let top11_30 = 0;
  let top31_100 = 0;
  let greaterThan100 = 0;
  let inSerp = 0;
  let totalPositions = 0;

  activeKeywords.forEach((kw) => {
    const pos = kw.currentPosition;
    if (pos && pos >= 1 && pos <= 100) {
      inSerp++;
      totalPositions += pos;
      if (pos === 1) top1++;
      else if (pos <= 3) top2_3++;
      else if (pos <= 5) top4_5++;
      else if (pos <= 10) top6_10++;
      else if (pos <= 30) top11_30++;
      else top31_100++;
    } else {
      greaterThan100++;
    }
  });

  const totalTracked = activeKeywords.length;
  const avgPos = inSerp > 0 ? parseFloat((totalPositions / inSerp).toFixed(1)) : 3.4;
  const jumped = activeKeywords.filter((k) => (k.positionChange || 0) > 0);
  const dropped = activeKeywords.filter((k) => (k.positionChange || 0) < 0);
  const unchanged = activeKeywords.filter((k) => (k.positionChange || 0) === 0);

  const cleanDomain = proj.primaryDomain.replace(/^https?:\/\//, "").replace(/\/$/, "");

  const summaryData = {
    projectId: proj.id,
    primaryDomain: proj.primaryDomain,
    totalKeywordsTracked: totalTracked,
    totalKeywordsInSerp: inSerp,
    searchVisibility: 74.2,
    searchVisibilityChange: 4.8,
    averagePosition: avgPos,
    averagePositionChange: 0.8,
    isStale: false,
    distribution: {
      top1,
      top2_3,
      top4_5,
      top6_10,
      top11_30,
      top31_100,
      greaterThan100,
    },
    movement: {
      jumpedCount: jumped.length,
      jumpedPercentage: totalTracked > 0 ? Math.round((jumped.length / totalTracked) * 100) : 0,
      droppedCount: dropped.length,
      droppedPercentage: totalTracked > 0 ? Math.round((dropped.length / totalTracked) * 100) : 0,
      unchangedCount: unchanged.length,
      unchangedPercentage: totalTracked > 0 ? Math.round((unchanged.length / totalTracked) * 100) : 0,
      jumpedByBucket: { top1_3: Math.min(jumped.length, 2), top4_10: Math.max(0, jumped.length - 2), top11_30: 0, top31_100: 0 },
      droppedByBucket: { top1_3: 0, top4_10: Math.min(dropped.length, 1), top11_30: Math.max(0, dropped.length - 1), top31_100: 0 },
      unchangedByBucket: { top1_3: Math.min(unchanged.length, 2), top4_10: Math.max(0, unchanged.length - 2), top11_30: 0, top31_100: 0 },
    },
    topKeywords: activeKeywords.slice(0, 5).map((k) => ({
      keywordId: k.id,
      keywordText: k.keywordText,
      searchVolume: k.monthlySearchVolume || 2400,
      position: k.currentPosition || 1,
    })),
    jumpedKeywords: (jumped.length > 0 ? jumped : activeKeywords.slice(0, 2)).slice(0, 3).map((k) => ({
      keywordId: k.id,
      keywordText: k.keywordText,
      position: k.currentPosition || 1,
      previousPosition: k.previousPosition || 3,
      positionChange: k.positionChange || 1,
    })),
    droppedKeywords: dropped.slice(0, 3).map((k) => ({
      keywordId: k.id,
      keywordText: k.keywordText,
      position: k.currentPosition || 12,
      previousPosition: k.previousPosition || 8,
      positionChange: k.positionChange || -4,
    })),
    topPages: [
      { url: `https://${cleanDomain}/`, totalKeywords: 8, averagePosition: 3.2, top10Count: 6 },
      { url: `https://${cleanDomain}/work`, totalKeywords: 4, averagePosition: 5.4, top10Count: 3 },
    ],
    competitors: [
      { competitorId: "comp-1", name: "Brighton SEO", domain: "brighton-seo.com", searchVisibility: 68.5 },
      { competitorId: "comp-2", name: "Apex Agency", domain: "apexagency.com", searchVisibility: 61.2 },
    ],
    algorithmNotes: [
      {
        id: "alg-1",
        title: "Google Core Quality Update",
        category: "Core",
        severity: "notice",
        date: "September 2026",
        description: "SERP re-indexing focused on helpful brand content and UX stability.",
      },
    ],
  };

  return successResponse(res, summaryData);
});

app.get("/api/v1/projects/:id/rankings/detailed", (req: Request, res: Response) => {
  const kws = getProjectKeywords(req.params.id);
  return successResponse(res, {
    items: kws,
    totalCount: kws.length,
    dates: ["Sep 24", "Sep 25", "Sep 26", "Sep 27", "Sep 28", "Sep 29", "Sep 30"],
  });
});

app.get("/api/v1/projects/:id/rankings/historical", (req: Request, res: Response) => {
  const kws = getProjectKeywords(req.params.id);
  return successResponse(res, {
    items: kws,
    series: [
      { date: "Sep 24", top3: 1, top10: 3, top30: 4 },
      { date: "Sep 30", top3: 2, top10: 4, top30: 5 },
    ],
  });
});

// -------------------------------------------------------------
// 6. COMPETITORS (/api/v1/projects/:id/competitors)
// -------------------------------------------------------------
app.get("/api/v1/projects/:id/competitors", (_req: Request, res: Response) => {
  return successResponse(res, competitors);
});

app.post("/api/v1/projects/:id/competitors", (req: Request, res: Response) => {
  const { domain, name } = req.body || {};
  const newComp = {
    id: `comp-${Date.now()}`,
    projectId: req.params.id,
    domain: domain || "new-competitor.com",
    name: name || domain || "Competitor",
    visibilityScore: 75,
    avgPosition: 4.5,
    netSentiment: 50,
    commonKeywordsCount: 30,
    createdAt: new Date().toISOString(),
  };
  competitors.push(newComp);
  return successResponse(res, newComp, 201);
});

app.delete("/api/v1/projects/:id/competitors/:competitorId", (req: Request, res: Response) => {
  const idx = competitors.findIndex((c) => c.id === req.params.competitorId);
  if (idx !== -1) competitors.splice(idx, 1);
  return successResponse(res, true);
});

app.get("/api/v1/projects/:id/competitors/overview", (_req: Request, res: Response) => {
  return successResponse(res, {
    competitors,
    topGaining: competitors.slice(0, 2),
    topLosing: [],
  });
});

app.get("/api/v1/projects/:id/competitors/visibility", (_req: Request, res: Response) => {
  return successResponse(res, {
    competitors,
  });
});

app.get("/api/v1/projects/:id/competitors/gap", (_req: Request, res: Response) => {
  return successResponse(res, {
    gapKeywords: [
      { id: "gap-1", keyword: "seo rank tracking tool", volume: 3600, competitorRank: 4, yourRank: null, opportunityScore: 88 },
      { id: "gap-2", keyword: "enterprise backlink monitor", volume: 1400, competitorRank: 2, yourRank: 18, opportunityScore: 74 },
    ],
    totalCount: 2,
  });
});

app.post("/api/v1/projects/:id/competitors/gap/:keywordId/track", (_req: Request, res: Response) => {
  return successResponse(res, true);
});

// -------------------------------------------------------------
// 7. WEBSITE AUDIT (/api/v1/projects/:id/audit)
// -------------------------------------------------------------
app.get("/api/v1/projects/:id/audit/overview", (req: Request, res: Response) => {
  return successResponse(res, {
    projectId: req.params.id,
    healthScore: 83,
    topCompetitorHealthScore: 94.6,
    crawledPagesCount: 128,
    totalIssuesCount: 312,
    errorsCount: 3,
    warningsCount: 121,
    noticesCount: 188,
    topIssues: auditIssues,
    lastCrawlDate: new Date().toISOString(),
    coreWebVitals: {
      desktop: { lcp: "1.8s", fid: "12ms", cls: "0.04", score: "Good" },
      mobile: { lcp: "2.6s", fid: "24ms", cls: "0.08", score: "Needs Improvement" },
    },
    categoryBreakdown: [
      { category: "Indexability", count: 48 },
      { category: "Content", count: 124 },
      { category: "Links", count: 86 },
      { category: "Security", count: 14 },
      { category: "Performance", count: 40 },
    ],
  });
});

app.post("/api/v1/projects/:id/audit/crawl", (req: Request, res: Response) => {
  return successResponse(res, {
    crawlId: `crawl-${Date.now()}`,
    projectId: req.params.id,
    status: "InProgress",
    startedAt: new Date().toISOString(),
    pagesCrawled: 0,
    maxPages: 100,
  });
});

app.get("/api/v1/projects/:id/audit/issues", (_req: Request, res: Response) => {
  return successResponse(res, {
    items: auditIssues,
    page: 1,
    pageSize: 20,
    totalCount: auditIssues.length,
    totalPages: 1,
  });
});

app.get("/api/v1/projects/:id/audit/settings", (req: Request, res: Response) => {
  return successResponse(res, {
    projectId: req.params.id,
    crawlMaxPages: 100,
    crawlMaxDepth: 5,
    crawlConcurrency: 2,
    crawlRateLimitMs: 100,
    crawlRespectRobotsTxt: true,
    crawlUserAgent: "InternalSEOPlatformBot/1.0",
  });
});

// -------------------------------------------------------------
// 8. TASKS (/api/v1/projects/:id/tasks)
// -------------------------------------------------------------
app.get("/api/v1/projects/:id/tasks", (_req: Request, res: Response) => {
  return successResponse(res, {
    items: tasks,
    page: 1,
    pageSize: 20,
    totalCount: tasks.length,
    totalPages: 1,
  });
});

app.post("/api/v1/projects/:id/tasks", (req: Request, res: Response) => {
  const { title, description, priority = "Medium", status = "Todo" } = req.body || {};
  const newTask: Task = {
    id: `task-${Date.now()}`,
    projectId: req.params.id,
    title: title || "New Remediation Task",
    description,
    priority,
    status,
    createdAt: new Date().toISOString(),
    comments: [],
  };
  tasks.push(newTask);
  return successResponse(res, newTask, 201);
});

app.get("/api/v1/projects/:id/tasks/:taskId", (req: Request, res: Response) => {
  const task = tasks.find((t) => t.id === req.params.taskId) || tasks[0];
  return successResponse(res, task);
});

app.put("/api/v1/projects/:id/tasks/:taskId", (req: Request, res: Response) => {
  const idx = tasks.findIndex((t) => t.id === req.params.taskId);
  if (idx !== -1) {
    tasks[idx] = { ...tasks[idx], ...req.body };
    return successResponse(res, tasks[idx]);
  }
  return errorResponse(res, "Task not found", 404);
});

app.post("/api/v1/projects/:id/tasks/:taskId/comments", (req: Request, res: Response) => {
  const { comment } = req.body || {};
  const task = tasks.find((t) => t.id === req.params.taskId);
  const newComment = {
    id: `comm-${Date.now()}`,
    userId: users[0].id,
    userName: users[0].fullName,
    comment: comment || "",
    createdAt: new Date().toISOString(),
  };
  if (task) {
    task.comments.push(newComment);
  }
  return successResponse(res, newComment);
});

app.post("/api/v1/projects/:id/tasks/:taskId/verify", (req: Request, res: Response) => {
  return successResponse(res, {
    taskId: req.params.taskId,
    verified: true,
    verificationStatus: "VerifiedResolved",
    verifiedAt: new Date().toISOString(),
    message: "Automated crawl verified rule condition no longer triggers.",
  });
});

// -------------------------------------------------------------
// 9. REPORTS (/api/v1/projects/:id/reports)
// -------------------------------------------------------------
app.get("/api/v1/projects/:id/reports", (req: Request, res: Response) => {
  const sampleReports = [
    { id: "rep-1", title: "Monthly Executive SEO Summary", type: "Executive", createdAt: "2026-09-01", status: "Generated" },
    { id: "rep-2", title: "Technical Audit Remediation Progress", type: "Audit", createdAt: "2026-09-15", status: "Generated" },
  ];
  return successResponse(res, {
    items: sampleReports,
    page: 1,
    pageSize: 20,
    totalCount: 2,
    totalPages: 1,
  });
});

app.post("/api/v1/projects/:id/reports", (req: Request, res: Response) => {
  const { title = "New Custom SEO Report" } = req.body || {};
  return successResponse(res, {
    id: `rep-${Date.now()}`,
    projectId: req.params.id,
    title,
    createdAt: new Date().toISOString(),
    status: "Generated",
  }, 201);
});

// -------------------------------------------------------------
// 10. NOTIFICATIONS (/api/v1/notifications)
// -------------------------------------------------------------
app.get("/api/v1/notifications", (_req: Request, res: Response) => {
  return successResponse(res, {
    items: notifications,
    page: 1,
    pageSize: 20,
    totalCount: notifications.length,
    totalPages: 1,
  });
});

app.get("/api/v1/notifications/unread-count", (_req: Request, res: Response) => {
  const count = notifications.filter((n) => !n.isRead).length;
  return successResponse(res, { unreadCount: count });
});

app.patch("/api/v1/notifications/:id/read", (req: Request, res: Response) => {
  const notif = notifications.find((n) => String(n.id) === req.params.id);
  if (notif) notif.isRead = true;
  return successResponse(res, true);
});

app.post("/api/v1/notifications/read-all", (_req: Request, res: Response) => {
  notifications.forEach((n) => (n.isRead = true));
  return successResponse(res, notifications.length);
});

// -------------------------------------------------------------
// 11. INTEGRATIONS (GSC & GA4)
// -------------------------------------------------------------
app.get("/api/v1/projects/:id/settings/integrations/gsc/status", (_req: Request, res: Response) => {
  return successResponse(res, {
    isConnected: true,
    propertyUrl: "sc-domain:portal.company.com",
    lastSyncedAt: new Date().toISOString(),
  });
});

app.get("/api/v1/projects/:id/settings/integrations/ga4/status", (_req: Request, res: Response) => {
  return successResponse(res, {
    isConnected: true,
    propertyId: "properties/39812401",
    propertyName: "Corporate Portal Main Web Stream",
    lastSyncedAt: new Date().toISOString(),
  });
});

app.get("/api/v1/projects/:id/integrations/gsc/overview", (_req: Request, res: Response) => {
  return successResponse(res, {
    totalClicks: 14250,
    totalImpressions: 284100,
    averageCtr: 0.0502,
    averagePosition: 8.4,
  });
});

app.get("/api/v1/projects/:id/integrations/ga4/overview", (_req: Request, res: Response) => {
  return successResponse(res, {
    totalUsers: 48920,
    activeUsers: 34100,
    sessions: 62410,
    bounceRate: 0.324,
    engagementRate: 0.676,
  });
});

// -------------------------------------------------------------
// 12. ADMIN (/api/v1/admin)
// -------------------------------------------------------------
app.get("/api/v1/admin/users", (_req: Request, res: Response) => {
  return successResponse(res, {
    items: users,
    page: 1,
    pageSize: 20,
    totalCount: users.length,
    totalPages: 1,
  });
});

app.get("/api/v1/admin/activity-logs", (_req: Request, res: Response) => {
  return successResponse(res, {
    items: activityLogs,
    page: 1,
    pageSize: 20,
    totalCount: activityLogs.length,
    totalPages: 1,
  });
});

// -------------------------------------------------------------
// 13. DASHBOARD (/api/v1/dashboard)
// -------------------------------------------------------------
app.get("/api/v1/dashboard/global", (_req: Request, res: Response) => {
  return successResponse(res, {
    totalProjects: projects.length,
    activeProjects: projects.filter((p) => p.status === "Active").length,
    totalKeywordsTracked: keywords.length,
    averageHealthScore: 83,
    criticalErrorsAcrossProjects: 3,
  });
});

app.get("/api/v1/projects/:id/dashboard", (req: Request, res: Response) => {
  return successResponse(res, {
    projectId: req.params.id,
    healthScore: 83,
    keywordsCount: keywords.length,
    averagePosition: 3.4,
    visibilityScore: 42.8,
  });
});

// -------------------------------------------------------------
// START SERVER
// -------------------------------------------------------------
if (process.env.NODE_ENV !== "test") {
  app.listen(PORT, () => {
    console.log(`[InternalSEOPlatform API] Node.js Express server listening on http://localhost:${PORT}`);
  });
}

export default app;
