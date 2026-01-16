import cidData from './cid10.json';

export interface CID10 {
  code: string;
  description: string;
}

export const CID10_DATA: CID10[] = cidData as CID10[];

// Pre-compute normalized data for faster search
// Optimization: Prepare lowercase strings once to avoid repetitive toLowerCase() during search.
// This adds a small one-time initialization cost but drastically improves search performance.
const SEARCH_INDEX = CID10_DATA.map(item => ({
  original: item,
  // We search in both code and description.
  // Storing them separately avoids partial matches across the boundary.
  codeLower: item.code.toLowerCase(),
  descLower: item.description.toLowerCase()
}));

// Optimization: Use a Map for O(1) lookup by code instead of O(n) Array.find()
const CODE_MAP = new Map<string, string>();
CID10_DATA.forEach(item => {
  // Store with uppercase keys to ensure case-insensitive lookup works reliably
  CODE_MAP.set(item.code.toUpperCase(), item.description);
});

export function searchCID10(query: string): CID10[] {
  if (!query || query.length < 2) return [];

  const normalizedQuery = query.toLowerCase().trim();
  const results: CID10[] = [];
  const limit = 50; // Optimization: Limit results to prevent UI lag and excessive rendering

  // Optimization: Use a manual loop to support early exit
  for (let i = 0; i < SEARCH_INDEX.length; i++) {
    const item = SEARCH_INDEX[i];
    if (item.codeLower.includes(normalizedQuery) || item.descLower.includes(normalizedQuery)) {
      results.push(item.original);
      if (results.length >= limit) break;
    }
  }

  return results;
}

export function getCID10Description(code: string): string | null {
  if (!code) return null;
  // Optimization: Direct Map lookup is O(1)
  return CODE_MAP.get(code.toUpperCase().trim()) || null;
}
