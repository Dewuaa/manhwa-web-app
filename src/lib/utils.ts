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
