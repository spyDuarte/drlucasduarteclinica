import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const CSV_FILE = process.argv[2];
const OUTPUT_FILE = path.resolve(__dirname, '../client/src/data/cid10.json');

if (!CSV_FILE) {
  console.error('Please provide the path to the CSV file.');
  console.error('Usage: node scripts/import_cids.mjs <path/to/cid10.csv>');
  console.error('Expected format: code,description (comma or semicolon separated)');
  process.exit(1);
}

try {
  const content = fs.readFileSync(CSV_FILE, 'utf-8');
  const lines = content.split(/\r?\n/);
  const json = [];

  let startIndex = 0;
  // Check if first line is likely a header
  if (lines[0] && (lines[0].toLowerCase().includes('code') || lines[0].toLowerCase().includes('codigo'))) {
    startIndex = 1;
  }

  for (let i = startIndex; i < lines.length; i++) {
    const line = lines[i].trim();
    if (!line) continue;

    let parts;
    // Detect separator based on line content. Prioritize semicolon if present as it's common in region.
    if (line.includes(';')) {
      parts = line.split(';');
    } else {
      parts = line.split(',');
    }

    if (parts.length >= 2) {
       let code = parts[0].trim();
       // Remove quotes if present
       code = code.replace(/^"|"$/g, '');

       // Rejoin rest as description in case it contained separator (only simple case)
       let description = parts.slice(1).join(line.includes(';') ? ';' : ',').trim();
       description = description.replace(/^"|"$/g, '');

       if (code && description) {
         json.push({ code, description });
       }
    }
  }

  fs.writeFileSync(OUTPUT_FILE, JSON.stringify(json, null, 2));
  console.log(`Successfully converted ${json.length} records to ${OUTPUT_FILE}`);
} catch (error) {
  console.error('Error processing file:', error.message);
  process.exit(1);
}
