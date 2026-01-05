import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import XLSX from 'xlsx';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const INPUT_FILE = process.argv[2];
const OUTPUT_FILE = path.resolve(__dirname, '../client/src/data/tabela_cid.json');

if (!INPUT_FILE) {
  console.error('Please provide the path to the input file (CSV or XLSX).');
  console.error('Usage: node scripts/import_cids.mjs <path/to/file>');
  process.exit(1);
}

const ext = path.extname(INPUT_FILE).toLowerCase();
const json = [];

try {
  if (ext === '.xlsx' || ext === '.xls') {
    console.log(`Reading Excel file: ${INPUT_FILE}`);
    const workbook = XLSX.readFile(INPUT_FILE);
    const sheetName = workbook.SheetNames[0];
    const sheet = workbook.Sheets[sheetName];

    // Convert to JSON
    const rawData = XLSX.utils.sheet_to_json(sheet);

    if (rawData.length === 0) {
        console.warn('Warning: Sheet appears to be empty.');
    }

    // Normalize keys
    for (const row of rawData) {
      // Find key for code
      const keys = Object.keys(row);
      const codeKey = keys.find(k => /code|código|codigo|cid/i.test(k));
      // Find key for description
      const descKey = keys.find(k => /desc|nome|description/i.test(k));

      if (codeKey && descKey) {
        const code = String(row[codeKey]).trim();
        const description = String(row[descKey]).trim();
        if (code && description) {
           json.push({ code, description });
        }
      } else if (keys.length >= 2) {
          // Fallback: take first and second column if headers not matched
          const code = String(row[keys[0]]).trim();
          const description = String(row[keys[1]]).trim();
           if (code && description) {
             json.push({ code, description });
           }
      }
    }

  } else {
    // CSV logic
    console.log(`Reading CSV file: ${INPUT_FILE}`);
    const content = fs.readFileSync(INPUT_FILE, 'utf-8');
    const lines = content.split(/\r?\n/);

    let startIndex = 0;
    // Check if first line is likely a header
    if (lines[0] && (lines[0].toLowerCase().includes('code') || lines[0].toLowerCase().includes('codigo'))) {
      startIndex = 1;
    }

    for (let i = startIndex; i < lines.length; i++) {
        const line = lines[i].trim();
        if (!line) continue;

        let parts;
        // Detect separator
        if (line.includes(';')) {
          parts = line.split(';');
        } else {
          parts = line.split(',');
        }

        if (parts.length >= 2) {
           let code = parts[0].trim().replace(/^"|"$/g, '');
           let description = parts.slice(1).join(line.includes(';') ? ';' : ',').trim().replace(/^"|"$/g, '');

           if (code && description) {
             json.push({ code, description });
           }
        }
    }
  }

  if (json.length > 0) {
      fs.writeFileSync(OUTPUT_FILE, JSON.stringify(json, null, 2));
      console.log(`Successfully converted ${json.length} records to ${OUTPUT_FILE}`);
  } else {
      console.warn('No valid records found to import.');
  }

} catch (error) {
    console.error('Error processing file:', error.message);
    process.exit(1);
}
