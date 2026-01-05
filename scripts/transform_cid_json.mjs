#!/usr/bin/env node
/**
 * Script para transformar o arquivo tabela_cid.json (formato pandas/Excel)
 * para o formato CID-10 esperado pelo sistema.
 *
 * Entrada: client/src/data/tabela_cid.json
 *   Formato: { "Código": { "0": "A00.0", ... }, "Descrição": { "0": "...", ... } }
 *
 * Saída: client/src/data/cid10.json
 *   Formato: [{ "code": "A00.0", "description": "..." }, ...]
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const INPUT_FILE = path.resolve(__dirname, '../client/src/data/tabela_cid.json');
const OUTPUT_FILE = path.resolve(__dirname, '../client/src/data/cid10.json');

console.log('Transformando tabela CID para formato CID-10...\n');
console.log(`Entrada: ${INPUT_FILE}`);
console.log(`Saída: ${OUTPUT_FILE}\n`);

try {
  // Ler o arquivo de entrada
  const rawData = fs.readFileSync(INPUT_FILE, 'utf-8');
  const data = JSON.parse(rawData);

  // Verificar estrutura esperada
  const keys = Object.keys(data);
  console.log(`Colunas encontradas: ${keys.join(', ')}`);

  // Encontrar as chaves para código e descrição
  const codeKey = keys.find(k => /código|codigo|code|cid/i.test(k));
  const descKey = keys.find(k => /descrição|descricao|desc|nome|description/i.test(k));

  if (!codeKey || !descKey) {
    console.error('Erro: Não foi possível identificar as colunas de código e descrição.');
    console.error(`Colunas disponíveis: ${keys.join(', ')}`);
    process.exit(1);
  }

  console.log(`Coluna de código: "${codeKey}"`);
  console.log(`Coluna de descrição: "${descKey}"\n`);

  const codes = data[codeKey];
  const descriptions = data[descKey];

  // Obter os índices (podem ser strings como "0", "1", etc.)
  const indices = Object.keys(codes);
  console.log(`Total de registros encontrados: ${indices.length}`);

  // Transformar para o formato de array
  const result = [];
  let skipped = 0;

  for (const idx of indices) {
    const code = String(codes[idx]).trim();
    const description = String(descriptions[idx]).trim();

    // Validar que ambos os campos existem
    if (code && description && code !== 'undefined' && description !== 'undefined') {
      result.push({ code, description });
    } else {
      skipped++;
    }
  }

  // Ordenar por código
  result.sort((a, b) => a.code.localeCompare(b.code));

  // Salvar o arquivo de saída
  fs.writeFileSync(OUTPUT_FILE, JSON.stringify(result, null, 2), 'utf-8');

  console.log(`\nTransformação concluída com sucesso!`);
  console.log(`Registros convertidos: ${result.length}`);
  if (skipped > 0) {
    console.log(`Registros ignorados (inválidos): ${skipped}`);
  }
  console.log(`\nArquivo salvo em: ${OUTPUT_FILE}`);

  // Mostrar exemplos
  console.log('\nPrimeiros 5 registros:');
  result.slice(0, 5).forEach(item => {
    console.log(`  ${item.code}: ${item.description}`);
  });

} catch (error) {
  console.error('Erro ao processar arquivo:', error.message);
  process.exit(1);
}
