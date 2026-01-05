import medicamentosCsv from './Medicamentos.csv?raw';

export interface Medicamento {
  nome: string;
  principioAtivo: string;
  classeTerapeutica: string;
  categoriaRegulatoria: string;
}

let MEDICAMENTOS_DATA: Medicamento[] = [];

function parseCSV(csvText: string): Medicamento[] {
  const lines = csvText.split('\n');
  const result: Medicamento[] = [];

  // Skip header (line 0)
  for (let i = 1; i < lines.length; i++) {
    const line = lines[i].trim();
    if (!line) continue;

    const values: string[] = [];
    let current = '';
    let inQuotes = false;

    for (let j = 0; j < line.length; j++) {
      const char = line[j];
      if (char === '"') {
        inQuotes = !inQuotes;
      } else if (char === ',' && !inQuotes) {
        values.push(current.trim().replace(/^"|"$/g, ''));
        current = '';
      } else {
        current += char;
      }
    }
    values.push(current.trim().replace(/^"|"$/g, ''));

    // CSV columns: ,NOME_PRODUTO,PRINCIPIO_ATIVO,CLASSE_TERAPEUTICA,CATEGORIA_REGULATORIA
    // So values[0] is index, values[1] is NOME_PRODUTO, etc.
    if (values.length >= 5) {
      result.push({
        nome: values[1],
        principioAtivo: values[2],
        classeTerapeutica: values[3],
        categoriaRegulatoria: values[4]
      });
    }
  }
  return result;
}

// Initialize data
try {
  MEDICAMENTOS_DATA = parseCSV(medicamentosCsv);
} catch (error) {
  console.error("Erro ao carregar medicamentos:", error);
}

export function searchMedicamentos(query: string): Medicamento[] {
  if (!query || query.length < 2) return [];

  const normalizedQuery = query.toLowerCase().trim();
  const LIMIT = 50;

  return MEDICAMENTOS_DATA.filter(item =>
    item.nome.toLowerCase().includes(normalizedQuery) ||
    item.principioAtivo.toLowerCase().includes(normalizedQuery)
  ).slice(0, LIMIT);
}
