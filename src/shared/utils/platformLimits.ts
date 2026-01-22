/**
 * Character limits and validation rules for different social media platforms
 */

export const PLATFORM_LIMITS: Record<string, { maxChars: number; name: string }> = {
  x: { maxChars: 280, name: 'X (Twitter)' },
  facebook: { maxChars: 63206, name: 'Facebook' }, // Practically unlimited, but 63k is the technical limit
  linkedin: { maxChars: 3000, name: 'LinkedIn' },
  instagram: { maxChars: 2200, name: 'Instagram' },
  pinterest: { maxChars: 500, name: 'Pinterest' },
  tiktok: { maxChars: 2200, name: 'TikTok' },
  youtube: { maxChars: 5000, name: 'YouTube' },
  threads: { maxChars: 500, name: 'Threads' },
};

/**
 * Get character limit for a platform
 */
export const getCharacterLimit = (identifier: string): number => {
  return PLATFORM_LIMITS[identifier.toLowerCase()]?.maxChars || 2200; // Default to Instagram limit
};

/**
 * Get the most restrictive character limit from selected platforms
 */
export const getMostRestrictiveLimit = (identifiers: string[]): {
  limit: number;
  platform: string;
} => {
  if (identifiers.length === 0) {
    return { limit: 280, platform: 'X (Twitter)' }; // Default to Twitter as it's most restrictive
  }

  let minLimit = Infinity;
  let minPlatform = '';

  identifiers.forEach((id) => {
    const limit = getCharacterLimit(id);
    if (limit < minLimit) {
      minLimit = limit;
      minPlatform = PLATFORM_LIMITS[id.toLowerCase()]?.name || id;
    }
  });

  return { limit: minLimit, platform: minPlatform };
};

/**
 * Count characters in text (strips HTML tags)
 */
export const countCharacters = (htmlContent: string): number => {
  // Remove HTML tags
  const textContent = htmlContent.replace(/<[^>]*>/g, '');
  // Remove extra whitespace
  const cleanText = textContent.trim();
  return cleanText.length;
};

/**
 * Validate content against platform limits
 */
export const validateContentLength = (
  htmlContent: string,
  selectedIdentifiers: string[]
): {
  isValid: boolean;
  currentLength: number;
  limit: number;
  platform: string;
  remaining: number;
} => {
  const currentLength = countCharacters(htmlContent);
  const { limit, platform } = getMostRestrictiveLimit(selectedIdentifiers);
  const remaining = limit - currentLength;

  return {
    isValid: currentLength <= limit,
    currentLength,
    limit,
    platform,
    remaining,
  };
};
