/**
 * Migration Service
 * Handles migration of user data from Mgeko to Comix.to provider
 * 
 * When a saved bookmark/history item fails to load (old Mgeko ID),
 * this service searches Comix.to by title and auto-updates the ID if found.
 */

import { manhwaAPI } from './api';

const MIGRATION_CACHE_KEY = 'manhwa_migration_cache';
const MIGRATION_FAILED_KEY = 'manhwa_migration_failed';

interface MigrationCache {
  [oldId: string]: {
    newId: string;
    title: string;
    migratedAt: number;
  };
}

interface MigrationFailed {
  [oldId: string]: {
    title: string;
    failedAt: number;
    attempts: number;
  };
}

/**
 * Get cached migration mappings
 */
export function getMigrationCache(): MigrationCache {
  if (typeof window === 'undefined') return {};
  try {
    const data = localStorage.getItem(MIGRATION_CACHE_KEY);
    return data ? JSON.parse(data) : {};
  } catch {
    return {};
  }
}

/**
 * Get failed migration attempts (to avoid repeated API calls)
 */
export function getFailedMigrations(): MigrationFailed {
  if (typeof window === 'undefined') return {};
  try {
    const data = localStorage.getItem(MIGRATION_FAILED_KEY);
    return data ? JSON.parse(data) : {};
  } catch {
    return {};
  }
}

/**
 * Save a successful migration mapping
 */
export function saveMigration(oldId: string, newId: string, title: string): void {
  const cache = getMigrationCache();
  cache[oldId] = {
    newId,
    title,
    migratedAt: Date.now(),
  };
  localStorage.setItem(MIGRATION_CACHE_KEY, JSON.stringify(cache));
  
  // Remove from failed list if it was there
  const failed = getFailedMigrations();
  if (failed[oldId]) {
    delete failed[oldId];
    localStorage.setItem(MIGRATION_FAILED_KEY, JSON.stringify(failed));
  }
}

/**
 * Mark a migration as failed
 */
export function markMigrationFailed(oldId: string, title: string): void {
  const failed = getFailedMigrations();
  const existing = failed[oldId];
  
  failed[oldId] = {
    title,
    failedAt: Date.now(),
    attempts: (existing?.attempts || 0) + 1,
  };
  localStorage.setItem(MIGRATION_FAILED_KEY, JSON.stringify(failed));
}

/**
 * Check if we have a cached migration for this ID
 */
export function getCachedMigration(oldId: string): string | null {
  const cache = getMigrationCache();
  return cache[oldId]?.newId || null;
}

/**
 * Check if we should skip migration attempts for this ID
 * (failed too many times or too recently)
 */
export function shouldSkipMigration(oldId: string): boolean {
  const failed = getFailedMigrations();
  const entry = failed[oldId];
  
  if (!entry) return false;
  
  // Skip if failed more than 3 times
  if (entry.attempts >= 3) return true;
  
  // Skip if failed in the last hour
  const oneHour = 60 * 60 * 1000;
  if (Date.now() - entry.failedAt < oneHour) return true;
  
  return false;
}

/**
 * Calculate string similarity (simple Levenshtein-based)
 */
function calculateSimilarity(str1: string, str2: string): number {
  const s1 = str1.toLowerCase().trim();
  const s2 = str2.toLowerCase().trim();
  
  if (s1 === s2) return 1;
  
  // Check if one contains the other
  if (s1.includes(s2) || s2.includes(s1)) {
    return 0.9;
  }
  
  // Simple word-based matching
  const words1 = s1.split(/\s+/);
  const words2 = s2.split(/\s+/);
  
  const matchingWords = words1.filter(w => words2.includes(w));
  const totalWords = Math.max(words1.length, words2.length);
  
  return matchingWords.length / totalWords;
}

/**
 * Try to migrate an old ID to a new Comix.to ID by searching by title
 * Returns the new ID if found, null if not found
 */
export async function tryMigrateByTitle(
  oldId: string,
  title: string
): Promise<string | null> {
  // Check cache first
  const cached = getCachedMigration(oldId);
  if (cached) {
    console.log(`[Migration] Using cached migration for "${title}": ${oldId} -> ${cached}`);
    return cached;
  }
  
  // Check if we should skip
  if (shouldSkipMigration(oldId)) {
    console.log(`[Migration] Skipping migration for "${title}" (too many failures)`);
    return null;
  }
  
  try {
    console.log(`[Migration] Searching Comix.to for: "${title}"`);
    
    // Search for the title on Comix.to
    const results = await manhwaAPI.search(title, 1);
    
    if (!results || !results.results || results.results.length === 0) {
      console.log(`[Migration] No results found for "${title}"`);
      markMigrationFailed(oldId, title);
      return null;
    }
    
    // Find the best match
    let bestMatch = null;
    let bestScore = 0;
    
    for (const result of results.results.slice(0, 5)) {
      const score = calculateSimilarity(title, result.title);
      
      if (score > bestScore) {
        bestScore = score;
        bestMatch = result;
      }
    }
    
    // Only accept high-confidence matches (>70% similar)
    if (bestMatch && bestScore >= 0.7) {
      console.log(`[Migration] Found match for "${title}": ${bestMatch.id} (score: ${bestScore.toFixed(2)})`);
      saveMigration(oldId, bestMatch.id, title);
      return bestMatch.id;
    } else {
      console.log(`[Migration] No confident match found for "${title}" (best score: ${bestScore.toFixed(2)})`);
      markMigrationFailed(oldId, title);
      return null;
    }
    
  } catch (error) {
    console.error(`[Migration] Error searching for "${title}":`, error);
    markMigrationFailed(oldId, title);
    return null;
  }
}

/**
 * Clear all migration data (for debugging/testing)
 */
export function clearMigrationData(): void {
  localStorage.removeItem(MIGRATION_CACHE_KEY);
  localStorage.removeItem(MIGRATION_FAILED_KEY);
}
