import cidData from './cid10.json';

export interface CID10 {
  code: string;
  description: string;
}

export const CID10_DATA: CID10[] = cidData as CID10[];

export function searchCID10(query: string): CID10[] {
  if (!query || query.length < 2) return [];

  const normalizedQuery = query.toLowerCase().trim();
  return CID10_DATA.filter(
    item =>
      item.code.toLowerCase().includes(normalizedQuery) ||
      item.description.toLowerCase().includes(normalizedQuery)
  );
}

export function getCID10Description(code: string): string | null {
  const normalizedCode = code.toUpperCase().trim();
  const item = CID10_DATA.find(item => item.code.toUpperCase() === normalizedCode);
  return item ? item.description : null;
}
