#!/usr/bin/env node
/**
 * Build codes.json from Delta_Force_Garena_Danh_sach_gop.txt
 * - Dedupe by `code`
 * - Assign addedAt timestamps (descending by file order so newest in file appears first)
 * - Use generic GitHub repo as source for all
 */
import { readFileSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';

const ROOT = process.argv[2] || 'C:/Users/Admin/Downloads';
const TXT = join(ROOT, 'Delta_Force_Garena_Danh_sach_gop.txt');
const OUT = join(ROOT, 'df-codes-data', 'codes.json');

const REPO_URL = 'https://github.com/kenthudoan/df-codes-data';
const SOURCE_URL = REPO_URL;
const BATCH_START = new Date('2026-09-29T17:52:00Z');
const STEP_MIN = 1;

const raw = readFileSync(TXT, 'utf8');
const lines = raw.split(/\r?\n/);

const seen = new Set();
const codes = [];

lines.forEach((line, idx) => {
  const code = line.trim();
  if (!code) return;
  if (seen.has(code)) {
    console.warn(`[dup] line ${idx + 1}: ${code}`);
    return;
  }
  seen.add(code);

  const addedAt = new Date(BATCH_START.getTime() + idx * STEP_MIN * 60 * 1000).toISOString();

  codes.push({
    id: `bulk-${String(idx + 1).padStart(4, '0')}`,
    code,
    title: `Code ${code.slice(0, 16)}${code.length > 16 ? '…' : ''}`,
    description: 'Mã từ danh sách cộng đồng sưu tầm',
    source: SOURCE_URL,
    tags: ['community'],
    validFrom: '2026-09-29T00:00:00Z',
    validUntil: '2099-12-31T23:59:59Z',
    addedAt
  });
});

codes.reverse();

const out = {
  version: 1,
  lastUpdated: new Date().toISOString(),
  source: {
    name: 'Auto Redeem Code Delta Force — Community Feed',
    minVotes: 3,
    schemaUrl: 'https://raw.githubusercontent.com/kenthudoan/df-codes-data/main/schema.json'
  },
  codes
};

writeFileSync(OUT, JSON.stringify(out, null, 2) + '\n', 'utf8');
console.log(`Wrote ${codes.length} codes to ${OUT}`);
