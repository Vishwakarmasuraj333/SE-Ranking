export type SearchType = 'ai-search' | 'google-search';

export type ScopeType = '*.domain.com/*' | 'domain.com/*' | 'Exact URL';

export type AiEngineId = 'ai-overview' | 'ai-mode' | 'chatgpt' | 'gemini' | 'perplexity';

export interface AiEngineConfig {
  id: AiEngineId;
  name: string;
  badge?: string;
  color: string;
  iconType: 'ai-overview' | 'ai-mode' | 'chatgpt' | 'gemini' | 'perplexity';
}

export interface CountryOption {
  code: string;
  name: string;
  flag: string;
  region: 'Worldwide' | 'North America' | 'South America' | 'Europe' | 'Asia' | 'Africa';
}

export interface ProjectData {
  id: string;
  name: string;
  domain: string;
  brandName?: string | null;
  country: string;
  countryCode: string;
  isArchived: boolean;
  createdAt: string;
  updatedAt: string;
  analysesCount?: number;
}

export interface EngineMetric {
  id: string;
  engineId: AiEngineId;
  name: string;
  mentions: number;
  linkPresence: number;
  presence: number;
  status: string;
}

export interface PromptItem {
  id: string;
  prompt: string;
  topic: string;
  engine: AiEngineId;
  mention: boolean;
  link: boolean;
  ads: boolean;
  competitors: string[];
  fullAnswer?: string;
  answerDate?: string;
  visibility: 'Visible' | 'Not Visible' | 'Partial';
}

export interface CitationItem {
  id: string;
  domain: string;
  url: string;
  citationShare: number | null;
  visibility: number | null;
  topics: string;
  domainTrust: number | null;
  pageTrust: number | null;
  organicTraffic: number | null;
}

export interface CompetitorItem {
  id: string;
  domain: string;
  brandName?: string;
  aiPresence: number | null;
  domainPresence: number | null;
  brandPresence: number | null;
  avgPosition: number | null;
  shareOfVoice: number | null;
}

export interface TopicItem {
  id: string;
  topic: string;
  presence: number;
  competitorPresence: number;
  overlap: 'Shared' | 'Unique' | 'Missing';
  promptsCount: number;
}

export interface AnalysisOverview {
  id: string;
  projectId?: string;
  domain: string;
  scope: ScopeType;
  brandName?: string;
  country: string;
  countryCode: string;
  searchType: SearchType;
  aiPresence: number | null;
  brandPresence: number | null;
  domainPresence: number | null;
  avgPosition: number | null;
  traffic: number | null;
  mentions: number | null;
  links: number | null;
  citationShare: number | null;
  referringDomains?: number | null;
  organicKeywords?: number | null;
  organicTraffic?: number | null;
  status: 'completed' | 'processing' | 'failed';
  createdAt: string;
  engines: EngineMetric[];
  prompts: PromptItem[];
  citations: CitationItem[];
  competitors: CompetitorItem[];
  topics?: TopicItem[];
}

export interface ApiUsageStats {
  requests: number;
  creditsUsed: number;
  lastRequest: string | null;
  currentMonth: string;
  status: 'active' | 'exhausted' | 'unconfigured';
}

export interface ApiResponse<T> {
  success: boolean;
  statusCode: number;
  timestamp: string;
  data: T;
  error?: string;
}

export interface PaginatedList<T> {
  items: T[];
  pageNumber: number;
  page?: number;
  pageSize: number;
  totalCount: number;
  totalPages: number;
  hasPreviousPage: boolean;
  hasNextPage: boolean;
}

export interface ProjectDto {
  id: string;
  name: string;
  primaryDomain: string;
  status: string;
  createdAt: string;
  role: string;
}

export interface ProjectDetailDto extends ProjectDto {
  domain?: string;
  brandName?: string | null;
  country?: string;
  countryCode?: string;
  isArchived?: boolean;
  updatedAt?: string;
  analysesCount?: number;
  keywordsCount?: number;
  competitorsCount?: number;
  userAccessLevel?: string;
  protocol?: string;
}

export interface ActivityLogDto {
  id: number;
  actorId?: string | null;
  actorEmail?: string | null;
  actorRole?: string | null;
  actionType: string;
  entityType: string;
  entityId: string;
  projectId?: string | null;
  projectName?: string | null;
  payloadJson?: string | null;
  ipAddress?: string | null;
  createdAt: string;
}

export interface CreateAdminUserRequest {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  role: 'SuperAdmin' | 'SEOExecutive' | 'Viewer' | string;
  phoneNumber?: string;
}

export interface ProjectMembershipDto {
  projectId: string;
  projectName: string;
  primaryDomain: string;
  accessLevel: number;
}

export interface AdminUserDetailDto {
  id: string;
  email: string;
  fullName: string;
  firstName?: string;
  lastName?: string;
  role: string;
  status?: string;
  phoneNumber?: string;
  createdAt?: string;
  projectMemberships: ProjectMembershipDto[];
}

export interface AdminUserDto {
  id: string;
  email: string;
  fullName: string;
  firstName?: string;
  lastName?: string;
  role: string;
  isActive: boolean;
  projectCount: number;
  createdAt: string;
}

export interface CrawlRunDto {
  id: string;
  projectId?: string;
  status: 'Completed' | 'Failed' | 'Cancelled' | 'Crawling' | 'Queued' | 'Evaluating' | string;
  triggerSource?: string;
  startedAt?: string;
  completedAt?: string;
  startedAtUtc?: string;
  completedAtUtc?: string;
  createdAt?: string;
  urlsDiscovered: number;
  urlsCrawled: number;
  healthScore?: number | null;
  errorsCount?: number;
  warningsCount?: number;
  noticesCount?: number;
}

export interface AuditIssueDto {
  id: string;
  ruleCode?: string;
  ruleTitle: string;
  ruleCategory?: string;
  category?: string;
  severity: 'Error' | 'Warning' | 'Notice' | string;
  affectedUrl: string;
  affectedCount?: number;
  description?: string;
  recommendation?: string;
  createdAt?: string;
}

export interface AuditIssueEvidence {
  id?: string;
  evidenceType?: string;
  evidencePayload?: string;
  url?: string;
  codeSnippet?: string;
  detectedAt?: string;
  createdAt?: string;
}

export interface AuditIssueDetailDto extends AuditIssueDto {
  description: string;
  recommendation: string;
  firstSeenAt?: string;
  lastSeenAt?: string;
  evidence?: AuditIssueEvidence[];
}

export interface AuditOverviewDto {
  id?: string;
  projectId?: string;
  healthScore?: number | null;
  urlsCrawled: number;
  errorsCount: number;
  warningsCount: number;
  noticesCount: number;
  passedChecks?: number;
  topIssues?: AuditIssueDto[];
  crawledAt?: string;
  lastCrawlRun?: CrawlRunDto | null;
  recentRuns?: CrawlRunDto[];
}

export interface CrawlPageDto {
  id: string;
  url: string;
  title?: string | null;
  httpStatusCode: number;
  crawlDepth: number;
  inlinksCount: number;
  loadTimeMs?: number | null;
  isIndexable: boolean;
  indexabilityStatus?: string | null;
}

export interface UpdateCrawlSettingsRequest {
  crawlMaxPages?: number;
  crawlMaxDepth?: number;
  crawlConcurrency?: number;
  crawlRateLimitMs?: number;
  crawlRespectRobotsTxt?: boolean;
  crawlUserAgent?: string;
  maxUrls?: number;
  crawlSubdomains?: boolean;
  respectRobotsTxt?: boolean;
  userAgent?: string;
}

