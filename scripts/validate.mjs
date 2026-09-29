// Validate codes.json dựa trên schema.json.
// Dùng ajv (cài bởi workflow) — không cần bundle, chỉ CLI.
import { readFileSync } from 'node:fs';
import Ajv from 'ajv';
import addFormats from 'ajv-formats';

const schema = JSON.parse(readFileSync('schema.json', 'utf8'));
const data = JSON.parse(readFileSync('codes.json', 'utf8'));

const ajv = new Ajv({ allErrors: true, strict: false });
addFormats(ajv);

const validate = ajv.compile(schema);
const ok = validate(data);

if (!ok) {
  console.error('codes.json KHÔNG hợp lệ:');
  for (const err of validate.errors || []) {
    console.error('  -', err.instancePath || '(root)', err.message);
  }
  process.exit(1);
}

console.log(`codes.json OK — ${data.codes.length} code(s).`);
