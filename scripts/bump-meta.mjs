// Bump lastUpdated (luôn) và version (chỉ khi có code mới/thay đổi).
// Usage: node bump-meta.mjs "<iso timestamp>"
import { readFileSync, writeFileSync } from 'node:fs';

const newTimestamp = process.argv[2];
if (!newTimestamp) {
  console.error('Usage: node bump-meta.mjs "<iso timestamp>"');
  process.exit(1);
}

const FILE = 'codes.json';
const data = JSON.parse(readFileSync(FILE, 'utf8'));

const oldUpdated = data.lastUpdated;
const oldCount = data.codes.length;

data.lastUpdated = newTimestamp;
// version giữ nguyên — bump manual khi schema thay đổi

writeFileSync(FILE, JSON.stringify(data, null, 2) + '\n');

if (oldUpdated !== newTimestamp) {
  console.log(`Bumped lastUpdated: ${oldUpdated} → ${newTimestamp}`);
}
console.log(`Total codes: ${oldCount}`);
