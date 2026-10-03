/**
 * Live Ranking Provider Factory & Manager
 * Selects configured provider via RANKING_PROVIDER env variable ('serpapi' | 'dataforseo')
 */

import { RankingProvider, EngineCapability } from './types';
import { SerpApiProvider } from './serpapi';
import { DataForSeoProvider } from './dataforseo';

let cachedProvider: RankingProvider | null = null;

export function getRankingProvider(): RankingProvider {
  if (cachedProvider) {
    return cachedProvider;
  }

  const configuredProvider = (process.env.RANKING_PROVIDER || 'serpapi').toLowerCase().trim();

  switch (configuredProvider) {
    case 'dataforseo':
      cachedProvider = new DataForSeoProvider();
      break;
    case 'serpapi':
    default:
      cachedProvider = new SerpApiProvider();
      break;
  }

  return cachedProvider;
}

/**
 * Resets cached provider (useful for testing or dynamic credential updates)
 */
export function resetRankingProvider(): void {
  cachedProvider = null;
}

/**
 * Retrieves aggregate engine capabilities across the active provider.
 */
export function getActiveEngineCapabilities(): EngineCapability[] {
  const provider = getRankingProvider();
  return provider.getEngineCapabilities();
}
