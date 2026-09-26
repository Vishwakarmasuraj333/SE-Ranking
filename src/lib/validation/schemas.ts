import { z } from 'zod';

export function normalizeDomain(input: string): string {
  let cleaned = input.trim().toLowerCase();
  cleaned = cleaned.replace(/^https?:\/\//, '');
  cleaned = cleaned.replace(/^www\./, '');
  cleaned = cleaned.replace(/\/.*$/, '');
  return cleaned;
}

export const AnalyzeRequestSchema = z.object({
  domain: z
    .string()
    .min(1, 'Enter a valid website domain or URL.')
    .refine((val) => {
      const cleaned = normalizeDomain(val);
      const domainRegex = /^[a-zA-Z0-9][a-zA-Z0-9-]{0,61}[a-zA-Z0-9](?:\.[a-zA-Z]{2,})+$/;
      return domainRegex.test(cleaned) || /^[a-zA-Z0-9-]+\.[a-zA-Z]{2,}$/.test(cleaned);
    }, 'Enter a valid website domain or URL.'),
  scope: z.enum(['*.domain.com/*', 'domain.com/*', 'Exact URL']).default('*.domain.com/*'),
  country: z.string().min(1, 'Target location is required'),
  countryCode: z.string().min(1, 'Target location code is required'),
  brandName: z.string().optional().nullable(),
  searchType: z.enum(['ai-search', 'google-search']).default('ai-search'),
  projectId: z.string().optional().nullable(),
});

export type AnalyzeRequestInput = z.infer<typeof AnalyzeRequestSchema>;

export const ProjectSchema = z.object({
  name: z.string().min(1, 'Project name is required').max(100),
  domain: z
    .string()
    .min(1, 'Domain is required')
    .transform(normalizeDomain),
  brandName: z.string().optional().nullable(),
  country: z.string().default('India'),
  countryCode: z.string().default('in'),
});

export type ProjectInput = z.infer<typeof ProjectSchema>;

export const CompetitorSchema = z.object({
  domain: z
    .string()
    .min(1, 'Competitor domain is required')
    .transform(normalizeDomain),
  brandName: z.string().optional().nullable(),
  analysisId: z.string().min(1, 'Analysis ID is required'),
});

export type CompetitorInput = z.infer<typeof CompetitorSchema>;
