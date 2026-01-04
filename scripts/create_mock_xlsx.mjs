import XLSX from 'xlsx';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const OUTPUT_FILE = path.resolve(__dirname, '../DATA/CID-10.xlsx');

const data = [
  // Doenças Infecciosas
  { "Código": "A00", "Descrição": "Cólera" },
  { "Código": "A01", "Descrição": "Febre tifóide e paratifóide" },
  { "Código": "A03", "Descrição": "Shiguelose" },
  { "Código": "A04", "Descrição": "Outras infecções intestinais bacterianas" },
  { "Código": "A09", "Descrição": "Diarréia e gastroenterite de origem infecciosa presumível" },
  { "Código": "A90", "Descrição": "Dengue [dengue clássico]" },
  { "Código": "B50", "Descrição": "Malária por Plasmodium falciparum" },
  { "Código": "B54", "Descrição": "Malária não especificada" },
  { "Código": "B34.2", "Descrição": "Infecção por coronavírus de localização não especificada" },

  // Doenças Respiratórias
  { "Código": "J00", "Descrição": "Nasofaringite aguda [resfriado comum]" },
  { "Código": "J01", "Descrição": "Sinusite aguda" },
  { "Código": "J02", "Descrição": "Faringite aguda" },
  { "Código": "J03", "Descrição": "Amigdalite aguda" },
  { "Código": "J06", "Descrição": "Infecções agudas das vias aéreas superiores" },
  { "Código": "J10", "Descrição": "Influenza devida a vírus da influenza identificado" },
  { "Código": "J11", "Descrição": "Influenza devida a vírus não identificado" },
  { "Código": "J12", "Descrição": "Pneumonia viral" },
  { "Código": "J18", "Descrição": "Pneumonia por microorganismo não especificado" },
  { "Código": "J18.9", "Descrição": "Pneumonia não especificada" },
  { "Código": "J20", "Descrição": "Bronquite aguda" },
  { "Código": "J44", "Descrição": "Outras doenças pulmonares obstrutivas crônicas" },
  { "Código": "J45", "Descrição": "Asma" },

  // Doenças Cardiovasculares
  { "Código": "I10", "Descrição": "Hipertensão essencial (primária)" },
  { "Código": "I20", "Descrição": "Angina pectoris" },
  { "Código": "I21", "Descrição": "Infarto agudo do miocárdio" },
  { "Código": "I50", "Descrição": "Insuficiência cardíaca" },

  // Doenças Endócrinas
  { "Código": "E10", "Descrição": "Diabetes mellitus insulino-dependente" },
  { "Código": "E11", "Descrição": "Diabetes mellitus não-insulino-dependente" },
  { "Código": "E66", "Descrição": "Obesidade" },

  // Transtornos Mentais
  { "Código": "F32", "Descrição": "Episódios depressivos" },
  { "Código": "F41", "Descrição": "Outros transtornos ansiosos" },

  // Sistema Musculoesquelético
  { "Código": "M54", "Descrição": "Dorsalgia" },
  { "Código": "M54.5", "Descrição": "Dor lombar baixa" },

  // Sintomas e Sinais
  { "Código": "R50", "Descrição": "Febre de outra origem e de origem desconhecida" },
  { "Código": "R51", "Descrição": "Cefaléia" },
  { "Código": "R52", "Descrição": "Dor não classificada em outra parte" },

  // Lesões
  { "Código": "S82", "Descrição": "Fratura da perna, incluindo tornozelo" },

  // Contatos com Serviços de Saúde
  { "Código": "Z00.0", "Descrição": "Exame geral e investigação de pessoas sem queixas ou diagnóstico relatado" },
  { "Código": "Z76", "Descrição": "Pessoas em contato com serviços de saúde em outras circunstâncias" }
];

const ws = XLSX.utils.json_to_sheet(data);
const wb = XLSX.utils.book_new();
XLSX.utils.book_append_sheet(wb, ws, "CID-10");

XLSX.writeFile(wb, OUTPUT_FILE);
console.log(`Created mock XLSX at ${OUTPUT_FILE} with ${data.length} records.`);
