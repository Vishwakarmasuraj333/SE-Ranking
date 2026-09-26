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
