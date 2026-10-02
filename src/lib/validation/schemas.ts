import { z } from 'zod';
import { normalizeCountryCode } from '@/lib/countryUtils';

export function normalizeDomain(input: string): string {
  let cleaned = input.trim().toLowerCase();
  cleaned = cleaned.replace(/^https?:\/\//, '');
  cleaned = cleaned.replace(/^www\./, '');
  cleaned = cleaned.replace(/\/.*$/, '');
  return cleaned;
}

export function normalizeUrl(input: string): string {
  let cleaned = input.trim();
  if (!/^https?:\/\//i.test(cleaned)) {
    cleaned = 'https://' + cleaned;
  }
  return cleaned;
}

export const LoginSchema = z.object({
  email: z.string().email('Please enter a valid email address.').toLowerCase().trim(),
  password: z.string().min(1, 'Password is required.'),
});

export const SignupSchema = z.object({
  firstName: z.string().optional(),
  lastName: z.string().optional(),
  email: z.string().email('Please enter a valid email address.').toLowerCase().trim(),
  password: z.string().min(8, 'Password must be at least 8 characters long.'),
});

export const ProjectSchema = z.object({
  name: z.string().min(1, 'Project name is required').max(100),
  websiteUrl: z.string().optional().nullable(),
  domain: z
    .string()
    .min(1, 'Domain is required')
    .transform(normalizeDomain),
  brandName: z.string().optional().nullable(),
  country: z.string().default('India'),
  countryCode: z.string().default('in').transform((val) => normalizeCountryCode(val)?.toLowerCase() || 'in'),
  languageCode: z.string().default('en'),
  searchEngine: z.string().default('google'),
  device: z.enum(['desktop', 'mobile']).default('desktop'),
  weeklyReport: z.boolean().default(false),
  websiteAudit: z.boolean().default(true),
  backlinkReport: z.boolean().default(false),
  color: z.string().optional().nullable(),
});

export type ProjectInput = z.infer<typeof ProjectSchema>;

export const ProjectWizardSchema = z.object({
  general: z.object({
    websiteUrl: z.string().min(1, 'Website URL is required'),
    projectName: z.string().min(1, 'Project name is required'),
    groupId: z.string().optional().nullable(),
    projectColor: z.string().optional().nullable(),
    weeklyReport: z.boolean().default(false),
    websiteAudit: z.boolean().default(true),
    backlinkReport: z.boolean().default(false),
  }),
  searchEngines: z.array(
    z.object({
      engine: z.string().default('google'),
      countryCode: z.string().default('in'),
      country: z.string().default('India'),
      languageCode: z.string().default('en'),
      language: z.string().default('English'),
      device: z.enum(['desktop', 'mobile']).default('desktop'),
      location: z.string().optional().nullable(),
    })
  ).default([]),
  keywords: z.array(
    z.object({
      keyword: z.string().min(1),
      group: z.string().default('General'),
      tags: z.array(z.string()).default([]),
    })
  ).default([]),
  prompts: z.array(
    z.object({
      prompt: z.string().min(1),
      engine: z.string().default('ai-overview'),
      topic: z.string().default('Brand Research'),
    })
  ).default([]),
  competitors: z.array(
    z.object({
      domain: z.string().min(1).transform(normalizeDomain),
      name: z.string().optional(),
    })
  ).default([]),
  analytics: z.object({
    connectGa4: z.boolean().default(false),
    connectGsc: z.boolean().default(false),
    connectGbp: z.boolean().default(false),
  }).default({
    connectGa4: false,
    connectGsc: false,
    connectGbp: false,
  }),
});

export const KeywordAddSchema = z.object({
  keywords: z.union([z.string(), z.array(z.string())]),
  group: z.string().optional().default('General'),
  searchEngine: z.string().optional().default('google'),
  countryCode: z.string().optional().default('in'),
  device: z.enum(['desktop', 'mobile']).optional().default('desktop'),
  tags: z.array(z.string()).optional().default([]),
});

export const CompetitorAddSchema = z.object({
  name: z.string().min(1, 'Competitor name is required'),
  domain: z.string().min(1, 'Domain is required').transform(normalizeDomain),
  notes: z.string().optional().nullable(),
});

export const LocationCreateSchema = z.object({
  name: z.string().min(1, 'Business / location name is required'),
  countryCode: z.string().default('US').transform((val) => normalizeCountryCode(val) || 'US'),
  region: z.string().optional().nullable(),
  city: z.string().min(1, 'City is required'),
  postalCode: z.string().optional().nullable(),
  address: z.string().min(1, 'Address is required'),
  phone: z.string().optional().nullable(),
  category: z.string().optional().nullable(),
  latitude: z.number().optional().nullable(),
  longitude: z.number().optional().nullable(),
  language: z.string().default('en'),
  timezone: z.string().default('UTC'),
});

export const GbpPostCreateSchema = z.object({
  locationId: z.string().optional().nullable(),
  title: z.string().optional().nullable(),
  text: z.string().min(1, 'Post content is required'),
  type: z.enum(['Offer', 'Event', 'Update']).default('Update'),
  status: z.enum(['Draft', 'Scheduled', 'Published']).default('Published'),
  ctaText: z.string().optional().nullable(),
  ctaUrl: z.string().url('Invalid URL format').optional().nullable(),
  couponCode: z.string().optional().nullable(),
  startDate: z.string().optional().nullable(),
  endDate: z.string().optional().nullable(),
});

export const TaskCreateSchema = z.object({
  title: z.string().min(1, 'Task title is required'),
  description: z.string().optional().nullable(),
  priority: z.enum(['High', 'Medium', 'Low']).default('Medium'),
  status: z.enum(['Todo', 'InProgress', 'Review', 'Done']).default('Todo'),
  dueDate: z.string().optional().nullable(),
  assignedToName: z.string().optional().nullable(),
});

export const AnalyzeRequestSchema = z.object({
  domain: z
    .string()
    .min(1, 'Enter a valid website domain or URL.')
    .transform(normalizeDomain),
  scope: z.enum(['*.domain.com/*', 'domain.com/*', 'Exact URL']).default('*.domain.com/*'),
  country: z.string().min(1, 'Target location is required'),
  countryCode: z.string().min(1, 'Target location code is required'),
  brandName: z.string().optional().nullable(),
  searchType: z.enum(['ai-search', 'google-search']).default('ai-search'),
  projectId: z.string().optional().nullable(),
});

export const CompetitorSchema = z.object({
  domain: z.string().min(1, 'Domain is required').transform(normalizeDomain),
  name: z.string().optional().default(''),
  brandName: z.string().optional().nullable(),
  analysisId: z.string().optional().nullable(),
  notes: z.string().optional().nullable(),
});
export type AnalyzeRequestInput = z.infer<typeof AnalyzeRequestSchema>;
export type CompetitorInput = z.infer<typeof CompetitorSchema>;
