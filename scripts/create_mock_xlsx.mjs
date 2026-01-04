import XLSX from 'xlsx';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const OUTPUT_FILE = path.resolve(__dirname, '../DATA/CID-10.xlsx');

const data = [
  { "Código": "A00", "Descrição": "Cólera" },
  { "Código": "A01", "Descrição": "Febre tifóide e paratifóide" },
  { "Código": "A90", "Descrição": "Dengue [dengue clássico]" },
  { "Código": "B50", "Descrição": "Malária por Plasmodium falciparum" },
  { "Código": "B54", "Descrição": "Malária não especificada" },
  { "Código": "J11", "Descrição": "Influenza devida a vírus não identificado" },
  { "Código": "J18.9", "Descrição": "Pneumonia não especificada" },
  { "Código": "J45", "Descrição": "Asma" },
  { "Código": "K29.7", "Descrição": "Gastrite não especificada" },
  { "Código": "M54.5", "Descrição": "Dor lombar baixa" },
  { "Código": "R51", "Descrição": "Cefaléia" },
  { "Código": "S82", "Descrição": "Fratura da perna, incluindo tornozelo" },
  { "Código": "Z00.0", "Descrição": "Exame geral e investigação de pessoas sem queixas ou diagnóstico relatado" },
  { "Código": "I10", "Descrição": "Hipertensão essencial (primária)" },
  { "Código": "E11", "Descrição": "Diabetes mellitus não-insulino-dependente" },
  { "Código": "F32", "Descrição": "Episódios depressivos" },
  { "Código": "F41", "Descrição": "Outros transtornos ansiosos" }
];

const ws = XLSX.utils.json_to_sheet(data);
const wb = XLSX.utils.book_new();
XLSX.utils.book_append_sheet(wb, ws, "CID-10");

XLSX.writeFile(wb, OUTPUT_FILE);
console.log(`Created mock XLSX at ${OUTPUT_FILE}`);
