// In-Memory Seeded Database for Internal SEO Platform Node.js Backend

export interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  fullName: string;
  role: "SuperAdmin" | "SEOExecutive" | "Viewer";
  isActive: boolean;
  passwordHash: string; // Plaintext or hashed for demo comparison
  createdAt: string;
  updatedAt: string;
  assignedProjectIds: string[];
}

export interface Project {
  id: string;
  name: string;
  primaryDomain: string;
  protocol: string;
  industry?: string;
  countryCode: string;
  primaryLocation?: string;
  languageCode: string;
  timezone: string;
  defaultSearchEngine: string;
  defaultDevice: string;
  status: "Active" | "Paused" | "Archived" | number;
  createdAt: string;
  updatedAt: string;
  memberCount: number;
  userAccessLevel?: string;
}

export interface ProjectMember {
  id: string;
  projectId: string;
  userId: string;
  accessLevel: "Owner" | "Member" | "ReadOnly" | number;
  assignedAt: string;
}

export interface Keyword {
  id: string;
  projectId: string;
  keywordText: string;
  searchEngine: string;
  countryCode: string;
  device: string;
  targetUrl?: string;
  searchIntent?: string;
  monthlySearchVolume?: number;
  keywordDifficulty?: number;
  cpcUsd?: number;
  isActive: boolean;
  currentPosition?: number | null;
  previousPosition?: number | null;
  positionChange?: number | null;
  rankedUrl?: string | null;
  groupId?: string;
  groupName?: string;
  tags?: string[];
  createdAt: string;
  history?: Array<{ date: string; position: number | null }>;
}

export interface AuditIssue {
  id: string;
  projectId: string;
  ruleId: string;
  title: string;
  category: string;
  severity: "Error" | "Warning" | "Notice";
  url: string;
  description: string;
  recommendation: string;
  status: "Open" | "Resolved" | "Ignored";
  foundAt: string;
}

export interface Task {
  id: string;
  projectId: string;
  title: string;
  description?: string;
  priority: "High" | "Medium" | "Low";
  status: "Todo" | "InProgress" | "Review" | "Done";
  assignedToUserId?: string;
  assignedToName?: string;
  dueDate?: string;
  createdAt: string;
  comments: Array<{
    id: string;
    userId: string;
    userName: string;
    comment: string;
    createdAt: string;
  }>;
}

export interface Notification {
  id: number;
  userId: string;
  projectId?: string;
  title: string;
  message: string;
  type: "info" | "warning" | "success" | "error";
  isRead: boolean;
  createdAt: string;
}

export interface Competitor {
  id: string;
  projectId: string;
  domain: string;
  name: string;
  visibilityScore: number;
  avgPosition: number;
  netSentiment: number;
  commonKeywordsCount: number;
  createdAt: string;
}

export interface ActivityLog {
  id: string;
  userId: string;
  userName: string;
  action: string;
  entityType: string;
  entityId: string;
  details?: string;
  ipAddress: string;
  createdAt: string;
}

// -------------------------------------------------------------
// SEED DATA matching C# DbInitializer
// -------------------------------------------------------------

export const users: User[] = [
  {
    id: "11111111-1111-1111-1111-111111111111",
    email: "admin@internal-seo.local",
    firstName: "System",
    lastName: "Administrator",
    fullName: "System Administrator",
    role: "SuperAdmin",
    isActive: true,
    passwordHash: "AdminPassword123!",
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    assignedProjectIds: ["workco", "portal", "aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa", "bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb"],
  },
  {
    id: "22222222-2222-2222-2222-222222222222",
    email: "exec@internal-seo.local",
    firstName: "Sarah",
    lastName: "Executive",
    fullName: "Sarah Executive",
    role: "SEOExecutive",
    isActive: true,
    passwordHash: "ExecPassword123!",
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    assignedProjectIds: ["workco", "portal"],
  },
  {
    id: "33333333-3333-3333-3333-333333333333",
    email: "viewer@internal-seo.local",
    firstName: "Victor",
    lastName: "Viewer",
    fullName: "Victor Viewer",
    role: "Viewer",
    isActive: true,
    passwordHash: "ViewerPassword123!",
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    assignedProjectIds: ["workco"],
  },
];

export const projects: Project[] = [
  {
    id: "workco",
    name: "workcomposer.com",
    primaryDomain: "https://www.workcomposer.com",
    protocol: "https://",
    industry: "Employee Monitoring & Productivity",
    countryCode: "US",
    primaryLocation: "New York, United States",
    languageCode: "en",
    timezone: "America/New_York",
    defaultSearchEngine: "google",
    defaultDevice: "desktop",
    status: "Active",
    createdAt: new Date(Date.now() - 60 * 86400000).toISOString(),
    updatedAt: new Date().toISOString(),
    memberCount: 3,
    userAccessLevel: "Owner",
  },
  {
    id: "socialflow",
    name: "socialflow.io",
    primaryDomain: "https://www.socialflow.io",
    protocol: "https://",
    industry: "Social Media Analytics",
    countryCode: "US",
    primaryLocation: "San Francisco, United States",
    languageCode: "en",
    timezone: "America/New_York",
    defaultSearchEngine: "google",
    defaultDevice: "desktop",
    status: "Active",
    createdAt: new Date(Date.now() - 45 * 86400000).toISOString(),
    updatedAt: new Date().toISOString(),
    memberCount: 2,
    userAccessLevel: "Owner",
  },
  {
    id: "seranking",
    name: "seranking.com",
    primaryDomain: "https://www.seranking.com",
    protocol: "https://",
    industry: "SEO Software & Analytics",
    countryCode: "US",
    primaryLocation: "London, United Kingdom",
    languageCode: "en",
    timezone: "America/New_York",
    defaultSearchEngine: "google",
    defaultDevice: "desktop",
    status: "Active",
    createdAt: new Date(Date.now() - 90 * 86400000).toISOString(),
    updatedAt: new Date().toISOString(),
    memberCount: 5,
    userAccessLevel: "Owner",
  },
  {
    id: "brighton",
    name: "brighton-seo.com",
    primaryDomain: "https://www.brighton-seo.com",
    protocol: "https://",
    industry: "Digital Marketing Conferences",
    countryCode: "GB",
    primaryLocation: "Brighton, United Kingdom",
    languageCode: "en",
    timezone: "Europe/London",
    defaultSearchEngine: "google",
    defaultDevice: "desktop",
    status: "Active",
    createdAt: new Date(Date.now() - 30 * 86400000).toISOString(),
    updatedAt: new Date().toISOString(),
    memberCount: 2,
    userAccessLevel: "Owner",
  },
];

export const keywords: Keyword[] = [
  {
    id: "kw-w01",
    projectId: "workco",
    keywordText: "workco digital design agency",
    searchEngine: "google",
    countryCode: "US",
    device: "desktop",
    targetUrl: "https://www.workco.com/",
    searchIntent: "Commercial",
    monthlySearchVolume: 8400,
    keywordDifficulty: 35.0,
    cpcUsd: 4.50,
    isActive: true,
    currentPosition: 1,
    previousPosition: 2,
    positionChange: 1,
    rankedUrl: "https://www.workco.com/",
    groupId: "grp-brand",
    groupName: "Brand",
    tags: ["brand", "core"],
    createdAt: new Date().toISOString(),
    history: [
      { date: "2026-09-24", position: 3 },
      { date: "2026-09-25", position: 2 },
      { date: "2026-09-26", position: 2 },
      { date: "2026-09-27", position: 2 },
      { date: "2026-09-28", position: 1 },
      { date: "2026-09-29", position: 1 },
      { date: "2026-09-30", position: 1 },
    ],
  },
  {
    id: "kw-w02",
    projectId: "workco",
    keywordText: "digital product design company",
    searchEngine: "google",
    countryCode: "US",
    device: "desktop",
    targetUrl: "https://www.workco.com/work",
    searchIntent: "Transactional",
    monthlySearchVolume: 6200,
    keywordDifficulty: 52.0,
    cpcUsd: 7.20,
    isActive: true,
    currentPosition: 2,
    previousPosition: 4,
    positionChange: 2,
    rankedUrl: "https://www.workco.com/work",
    groupId: "grp-features",
    groupName: "Core Services",
    tags: ["product", "agency"],
    createdAt: new Date().toISOString(),
    history: [
      { date: "2026-09-24", position: 5 },
      { date: "2026-09-25", position: 4 },
      { date: "2026-09-26", position: 4 },
      { date: "2026-09-27", position: 3 },
      { date: "2026-09-28", position: 3 },
      { date: "2026-09-29", position: 2 },
      { date: "2026-09-30", position: 2 },
    ],
  },
  {
    id: "kw-w03",
    projectId: "workco",
    keywordText: "enterprise ux strategy new york",
    searchEngine: "google",
    countryCode: "US",
    device: "desktop",
    targetUrl: "https://www.workco.com/services",
    searchIntent: "Informational",
    monthlySearchVolume: 3400,
    keywordDifficulty: 48.0,
    cpcUsd: 5.80,
    isActive: true,
    currentPosition: 4,
    previousPosition: 4,
    positionChange: 0,
    rankedUrl: "https://www.workco.com/services",
    groupId: "grp-features",
    groupName: "Core Services",
    tags: ["strategy"],
    createdAt: new Date().toISOString(),
    history: [
      { date: "2026-09-24", position: 6 },
      { date: "2026-09-25", position: 5 },
      { date: "2026-09-26", position: 5 },
      { date: "2026-09-27", position: 4 },
      { date: "2026-09-28", position: 4 },
      { date: "2026-09-29", position: 4 },
      { date: "2026-09-30", position: 4 },
    ],
  },
  {
    id: "kw-w04",
    projectId: "workco",
    keywordText: "custom design systems agency",
    searchEngine: "google",
    countryCode: "US",
    device: "desktop",
    targetUrl: "https://www.workco.com/clients",
    searchIntent: "Commercial",
    monthlySearchVolume: 2100,
    keywordDifficulty: 60.0,
    cpcUsd: 8.90,
    isActive: true,
    currentPosition: 8,
    previousPosition: 12,
    positionChange: 4,
    rankedUrl: "https://www.workco.com/clients",
    groupId: "grp-enterprise",
    groupName: "Enterprise",
    tags: ["design-systems"],
    createdAt: new Date().toISOString(),
    history: [
      { date: "2026-09-24", position: 14 },
      { date: "2026-09-25", position: 12 },
      { date: "2026-09-26", position: 11 },
      { date: "2026-09-27", position: 10 },
      { date: "2026-09-28", position: 9 },
      { date: "2026-09-29", position: 8 },
      { date: "2026-09-30", position: 8 },
    ],
  },
  {
    id: "kw-w05",
    projectId: "workco",
    keywordText: "mobile app engineering partner",
    searchEngine: "google",
    countryCode: "US",
    device: "mobile",
    targetUrl: "https://www.workco.com/capabilities",
    searchIntent: "Commercial",
    monthlySearchVolume: 1800,
    keywordDifficulty: 65.0,
    cpcUsd: 9.40,
    isActive: true,
    currentPosition: 18,
    previousPosition: 15,
    positionChange: -3,
    rankedUrl: "https://www.workco.com/capabilities",
    groupId: "grp-features",
    groupName: "Engineering",
    tags: ["mobile"],
    createdAt: new Date().toISOString(),
    history: [
      { date: "2026-09-24", position: 14 },
      { date: "2026-09-25", position: 15 },
      { date: "2026-09-26", position: 15 },
      { date: "2026-09-27", position: 16 },
      { date: "2026-09-28", position: 17 },
      { date: "2026-09-29", position: 17 },
      { date: "2026-09-30", position: 18 },
    ],
  },
  {
    id: "kw-w06",
    projectId: "workco",
    keywordText: "ecommerce digital transformation",
    searchEngine: "google",
    countryCode: "US",
    device: "desktop",
    targetUrl: "https://www.workco.com/work/ecommerce",
    searchIntent: "Informational",
    monthlySearchVolume: 4200,
    keywordDifficulty: 70.0,
    cpcUsd: 11.00,
    isActive: true,
    currentPosition: 45,
    previousPosition: 50,
    positionChange: 5,
    rankedUrl: "https://www.workco.com/work/ecommerce",
    groupId: "grp-enterprise",
    groupName: "Enterprise",
    tags: ["ecommerce"],
    createdAt: new Date().toISOString(),
    history: [
      { date: "2026-09-24", position: 55 },
      { date: "2026-09-25", position: 52 },
      { date: "2026-09-26", position: 50 },
      { date: "2026-09-27", position: 48 },
      { date: "2026-09-28", position: 48 },
      { date: "2026-09-29", position: 46 },
      { date: "2026-09-30", position: 45 },
    ],
  },
  {
    id: "kw-w07",
    projectId: "workco",
    keywordText: "workco reviews and ratings",
    searchEngine: "google",
    countryCode: "US",
    device: "desktop",
    targetUrl: "https://www.workco.com/about",
    searchIntent: "Navigational",
    monthlySearchVolume: 1200,
    keywordDifficulty: 22.0,
    cpcUsd: 1.80,
    isActive: true,
    currentPosition: 1,
    previousPosition: 1,
    positionChange: 0,
    rankedUrl: "https://www.workco.com/about",
    groupId: "grp-brand",
    groupName: "Brand",
    tags: ["brand"],
    createdAt: new Date().toISOString(),
    history: [
      { date: "2026-09-24", position: 1 },
      { date: "2026-09-25", position: 1 },
      { date: "2026-09-26", position: 1 },
      { date: "2026-09-27", position: 1 },
      { date: "2026-09-28", position: 1 },
      { date: "2026-09-29", position: 1 },
      { date: "2026-09-30", position: 1 },
    ],
  },
  {
    id: "kw-w08",
    projectId: "workco",
    keywordText: "global creative agency ranking",
    searchEngine: "google",
    countryCode: "US",
    device: "desktop",
    targetUrl: "https://www.workco.com/",
    searchIntent: "Informational",
    monthlySearchVolume: 2900,
    keywordDifficulty: 78.0,
    cpcUsd: 6.50,
    isActive: false,
    currentPosition: null,
    previousPosition: 110,
    positionChange: 0,
    rankedUrl: null,
    groupId: "grp-features",
    groupName: "Core Services",
    tags: ["unranked"],
    createdAt: new Date().toISOString(),
  },
  {
    id: "kw-001",
    projectId: "portal",
    keywordText: "portal login",
    searchEngine: "google",
    countryCode: "US",
    device: "desktop",
    targetUrl: "https://portal.company.com/login",
    searchIntent: "Navigational",
    monthlySearchVolume: 4800,
    keywordDifficulty: 18.5,
    cpcUsd: 1.25,
    isActive: true,
    currentPosition: 2,
    previousPosition: 3,
    positionChange: 1,
    rankedUrl: "https://portal.company.com/login",
    groupId: "grp-brand",
    groupName: "Brand",
    tags: ["brand", "p1-core"],
    createdAt: new Date().toISOString(),
    history: [
      { date: "2026-09-24", position: 4 },
      { date: "2026-09-25", position: 4 },
      { date: "2026-09-26", position: 3 },
      { date: "2026-09-27", position: 3 },
      { date: "2026-09-28", position: 3 },
      { date: "2026-09-29", position: 3 },
      { date: "2026-09-30", position: 2 },
    ],
  },
  {
    id: "kw-002",
    projectId: "aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa",
    keywordText: "internal portal software",
    searchEngine: "google",
    countryCode: "US",
    device: "desktop",
    targetUrl: "https://portal.company.com/features",
    searchIntent: "Commercial",
    monthlySearchVolume: 1900,
    keywordDifficulty: 42.0,
    cpcUsd: 4.80,
    isActive: true,
    currentPosition: 5,
    previousPosition: 5,
    positionChange: 0,
    rankedUrl: "https://portal.company.com/features",
    groupId: "grp-features",
    groupName: "Core Features",
    tags: ["product", "p1-core"],
    createdAt: new Date().toISOString(),
    history: [
      { date: "2026-09-24", position: 7 },
      { date: "2026-09-25", position: 6 },
      { date: "2026-09-26", position: 6 },
      { date: "2026-09-27", position: 5 },
      { date: "2026-09-28", position: 5 },
      { date: "2026-09-29", position: 5 },
      { date: "2026-09-30", position: 5 },
    ],
  },
  {
    id: "kw-003",
    projectId: "aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa",
    keywordText: "enterprise intranet security",
    searchEngine: "google",
    countryCode: "US",
    device: "desktop",
    targetUrl: "https://portal.company.com/security",
    searchIntent: "Informational",
    monthlySearchVolume: 850,
    keywordDifficulty: 56.5,
    cpcUsd: 6.10,
    isActive: true,
    currentPosition: 9,
    previousPosition: 8,
    positionChange: -1,
    rankedUrl: "https://portal.company.com/security",
    groupId: "grp-enterprise",
    groupName: "Enterprise",
    tags: ["p1-core"],
    createdAt: new Date().toISOString(),
    history: [
      { date: "2026-09-24", position: 8 },
      { date: "2026-09-25", position: 8 },
      { date: "2026-09-26", position: 8 },
      { date: "2026-09-27", position: 8 },
      { date: "2026-09-28", position: 8 },
      { date: "2026-09-29", position: 8 },
      { date: "2026-09-30", position: 9 },
    ],
  },
  {
    id: "kw-004",
    projectId: "aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa",
    keywordText: "company employee portal",
    searchEngine: "google",
    countryCode: "US",
    device: "mobile",
    targetUrl: "https://portal.company.com/",
    searchIntent: "Commercial",
    monthlySearchVolume: 3200,
    keywordDifficulty: 29.0,
    cpcUsd: 2.40,
    isActive: true,
    currentPosition: 24,
    previousPosition: 26,
    positionChange: 2,
    rankedUrl: "https://portal.company.com/",
    groupId: "grp-brand",
    groupName: "Brand",
    tags: ["brand"],
    createdAt: new Date().toISOString(),
    history: [
      { date: "2026-09-24", position: 28 },
      { date: "2026-09-25", position: 27 },
      { date: "2026-09-26", position: 27 },
      { date: "2026-09-27", position: 26 },
      { date: "2026-09-28", position: 26 },
      { date: "2026-09-29", position: 26 },
      { date: "2026-09-30", position: 24 },
    ],
  },
  {
    id: "kw-005",
    projectId: "aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa",
    keywordText: "cloud workspace portal",
    searchEngine: "google",
    countryCode: "US",
    device: "desktop",
    targetUrl: "https://portal.company.com/pricing",
    searchIntent: "Transactional",
    monthlySearchVolume: 1200,
    keywordDifficulty: 64.0,
    cpcUsd: 8.50,
    isActive: false,
    currentPosition: null,
    previousPosition: null,
    positionChange: null,
    rankedUrl: null,
    groupId: "grp-features",
    groupName: "Core Features",
    tags: ["product"],
    createdAt: new Date().toISOString(),
    history: [],
  },
];

export const auditIssues: AuditIssue[] = [
  {
    id: "issue-001",
    projectId: "aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa",
    ruleId: "RULE-HTTP-404",
    title: "Page Returns HTTP 404 (Not Found)",
    category: "Indexability",
    severity: "Error",
    url: "https://portal.company.com/old-dashboard-archive",
    description: "The server returned a 404 client error indicating the resource could not be found.",
    recommendation: "Fix broken internal links or implement a 301 redirect to a relevant live URL.",
    status: "Open",
    foundAt: new Date().toISOString(),
  },
  {
    id: "issue-002",
    projectId: "aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa",
    ruleId: "RULE-TITLE-MISSING",
    title: "Missing <title> Tag",
    category: "Content",
    severity: "Error",
    url: "https://portal.company.com/api-docs/internal-proxy",
    description: "The HTML document is missing a <title> element or the tag is completely empty.",
    recommendation: "Add a unique, descriptive <title> tag between 30 and 60 characters.",
    status: "Open",
    foundAt: new Date().toISOString(),
  },
  {
    id: "issue-003",
    projectId: "aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa",
    ruleId: "RULE-META-DESC-MISSING",
    title: "Missing Meta Description",
    category: "Content",
    severity: "Warning",
    url: "https://portal.company.com/features/team-management",
    description: "The page does not have a <meta name=\"description\"> tag.",
    recommendation: "Add a compelling meta description between 120 and 160 characters summarizing the page.",
    status: "Open",
    foundAt: new Date().toISOString(),
  },
];

export const tasks: Task[] = [
  {
    id: "task-001",
    projectId: "aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa",
    title: "Fix 404 Redirect on Old Dashboard URL",
    description: "Resolve broken internal link pointing to /old-dashboard-archive by adding a 301 redirect.",
    priority: "High",
    status: "InProgress",
    assignedToUserId: "22222222-2222-2222-2222-222222222222",
    assignedToName: "Sarah Executive",
    dueDate: new Date(Date.now() + 7 * 86400000).toISOString(),
    createdAt: new Date().toISOString(),
    comments: [
      {
        id: "comm-001",
        userId: "11111111-1111-1111-1111-111111111111",
        userName: "System Administrator",
        comment: "Configured redirect rule in Nginx configuration, testing in staging.",
        createdAt: new Date().toISOString(),
      },
    ],
  },
  {
    id: "task-002",
    projectId: "aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa",
    title: "Add Meta Descriptions to Core Feature Pages",
    description: "Write SEO meta descriptions for 12 features pages with character limits under 155 chars.",
    priority: "Medium",
    status: "Todo",
    assignedToUserId: "22222222-2222-2222-2222-222222222222",
    assignedToName: "Sarah Executive",
    dueDate: new Date(Date.now() + 14 * 86400000).toISOString(),
    createdAt: new Date().toISOString(),
    comments: [],
  },
];

export const notifications: Notification[] = [
  {
    id: 1,
    userId: "11111111-1111-1111-1111-111111111111",
    projectId: "aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa",
    title: "Keyword Jump to Top 3",
    message: "'portal login' climbed to #2 on Google US Desktop (+1 rank change).",
    type: "success",
    isRead: false,
    createdAt: new Date().toISOString(),
  },
  {
    id: 2,
    userId: "11111111-1111-1111-1111-111111111111",
    projectId: "aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa",
    title: "Scheduled Crawl Completed",
    message: "Technical audit crawl processed 128 pages with 3 errors and 121 warnings detected.",
    type: "info",
    isRead: false,
    createdAt: new Date(Date.now() - 3600000).toISOString(),
  },
];

export const competitors: Competitor[] = [
  {
    id: "comp-001",
    projectId: "aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa",
    domain: "brighton-seo.com",
    name: "Brighton SEO",
    visibilityScore: 99,
    avgPosition: 2.61,
    netSentiment: 78,
    commonKeywordsCount: 142,
    createdAt: new Date().toISOString(),
  },
  {
    id: "comp-002",
    projectId: "aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa",
    domain: "smx-interactive.org",
    name: "SMX Search",
    visibilityScore: 83,
    avgPosition: 2.75,
    netSentiment: 44,
    commonKeywordsCount: 98,
    createdAt: new Date().toISOString(),
  },
  {
    id: "comp-003",
    projectId: "aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa",
    domain: "pubcon-digital.com",
    name: "Pubcon",
    visibilityScore: 80,
    avgPosition: 5.11,
    netSentiment: 40,
    commonKeywordsCount: 84,
    createdAt: new Date().toISOString(),
  },
];

export const activityLogs: ActivityLog[] = [
  {
    id: "log-001",
    userId: "11111111-1111-1111-1111-111111111111",
    userName: "System Administrator",
    action: "System Startup & Initialization",
    entityType: "System",
    entityId: "SYSTEM",
    details: "Node.js Express API service started on Port 5000",
    ipAddress: "127.0.0.1",
    createdAt: new Date().toISOString(),
  },
];
