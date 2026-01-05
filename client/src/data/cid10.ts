import cidData from './tabela_cid.json';

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
