import { type ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/**
 * Clean scraped description by removing source website references
 */
export function cleanDescription(description: string | undefined | null): string {
  if (!description) return '';

  let cleaned = description;

  // Common source site patterns to remove
  const patternsToRemove = [
    // MGeko patterns
    /You are reading chapters on www\.mgeko\.cc[^.]*\./gi,
    /You are reading chapters on mgeko\.cc[^.]*\./gi,
    /www\.mgeko\.cc[^.]*fastest updating comic site\./gi,
    /on www\.mgeko\.cc[^.]*\./gi,
    /mgeko\.cc/gi,

    // Generic manga site patterns
    /You are reading[^.]*on [a-zA-Z0-9.-]+\.(com|cc|net|org)[^.]*\./gi,
    /Read this [^.]*on [a-zA-Z0-9.-]+\.(com|cc|net|org)[^.]*\./gi,
    /Visit [a-zA-Z0-9.-]+\.(com|cc|net|org)[^.]*\./gi,
    /fastest updating comic site\./gi,
    /fastest updating manga site\./gi,

    // Common promotional phrases
    /is a Manga\/Manhwa\/Manhua in english language,?/gi,
    /english chapters have been translated and you can read them here\./gi,
    /in english language, [A-Za-z]+ series,/gi,

    // Asura/Flame/Reaper scans patterns
    /asurascans\.com/gi,
    /flamescans\.org/gi,
    /reaperscans\.com/gi,
    /manganato\.com/gi,
    /mangakakalot\.com/gi,
  ];

  // Apply all patterns
  for (const pattern of patternsToRemove) {
    cleaned = cleaned.replace(pattern, '');
  }

  // Clean up extra whitespace and punctuation
  cleaned = cleaned
    .replace(/\s{2,}/g, ' ') // Multiple spaces to single
    .replace(/\.,/g, ',') // Fix "., " to ", "
    .replace(/,\s*,/g, ',') // Fix double commas
    .replace(/\.\s*\./g, '.') // Fix double periods
    .replace(/^\s*[,.\s]+/g, '') // Remove leading punctuation
    .replace(/[,.\s]+\s*$/g, '.') // Clean trailing punctuation
    .trim();

  // Capitalize first letter if needed
  if (cleaned.length > 0 && cleaned[0] === cleaned[0].toLowerCase()) {
    cleaned = cleaned.charAt(0).toUpperCase() + cleaned.slice(1);
  }

  return cleaned;
}

/**
 * Format a date string to relative time (e.g., "2d ago", "3h ago")
 */
export function formatRelativeDate(dateString: string | null | undefined): string {
  if (!dateString) return 'Just now';
  
  try {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    
    if (diffMs < 0) return 'Just now'; // Future dates
    
    const diffMins = Math.floor(diffMs / (1000 * 60));
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
    const diffWeeks = Math.floor(diffDays / 7);
    const diffMonths = Math.floor(diffDays / 30);
    const diffYears = Math.floor(diffDays / 365);
    
    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays < 7) return `${diffDays}d ago`;
    if (diffWeeks < 4) return `${diffWeeks}w ago`;
    if (diffMonths < 12) return `${diffMonths}mo ago`;
    return `${diffYears}y ago`;
  } catch {
    return dateString; // Return original if parsing fails
  }
}
