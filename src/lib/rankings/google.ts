/**
 * Google Engine Specific SERP Parser & Utilities
 */

export function normalizeDomain(raw: string): string {
  if (!raw) return '';
  return raw
    .trim()
    .toLowerCase()
    .replace(/^https?:\/\//i, '')
    .replace(/^www\./i, '')
    .split('/')[0]
    .split('?')[0]
    .split(':')[0];
}

export function urlMatchesTarget(url: string, targetDomain: string): boolean {
  if (!url || !targetDomain) return false;
  const cleanTarget = normalizeDomain(targetDomain);
  const cleanUrl = normalizeDomain(url);
  return cleanUrl === cleanTarget || cleanUrl.endsWith(`.${cleanTarget}`);
}

export function extractGoogleSerpFeatures(serpData: Record<string, unknown>): string[] {
  const features: string[] = [];
  if (!serpData) return features;

  if (serpData.answer_box || serpData.featured_snippet) {
    features.push('Featured Snippet');
  }
  if (Array.isArray(serpData.related_questions) && serpData.related_questions.length > 0) {
    features.push('People Also Ask');
  }
  if (serpData.knowledge_graph) {
    features.push('Knowledge Graph');
  }
  if (serpData.local_map || serpData.local_results) {
    features.push('Local Pack');
  }
  if (Array.isArray(serpData.top_stories) && serpData.top_stories.length > 0) {
    features.push('Top Stories');
  }
  if (serpData.inline_videos || (Array.isArray(serpData.video_results) && serpData.video_results.length > 0)) {
    features.push('Video');
  }
  if (serpData.inline_images || serpData.image_results) {
    features.push('Images');
  }
  if (serpData.ai_overview || serpData.generative_ai) {
    features.push('AI Overview');
  }
  if (Array.isArray(serpData.shopping_results) && serpData.shopping_results.length > 0) {
    features.push('Shopping');
  }
  if (
    serpData.sitelinks ||
    (Array.isArray(serpData.organic_results) &&
      serpData.organic_results.some((r: Record<string, unknown>) => Boolean(r.sitelinks)))
  ) {
    features.push('SiteLinks');
  }

  return Array.from(new Set(features));
}
