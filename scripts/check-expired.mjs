// Kiểm tra code trong codes.json đã quá hạn chưa.
// Nếu có → in warning (không fail, để tác giả tự quyết định move sang expired.json).
import { readFileSync } from 'node:fs';

const data = JSON.parse(readFileSync('codes.json', 'utf8'));
const now = Date.now();

let expiredCount = 0;
for (const c of data.codes || []) {
  if (c.validUntil) {
    const t = Date.parse(c.validUntil);
    if (Number.isFinite(t) && t < now) {
      expiredCount += 1;
      console.warn(`  ! expired: ${c.id} (${c.code}) — validUntil ${c.validUntil}`);
    }
  }
}

if (expiredCount > 0) {
  console.warn(`\n${expiredCount} code đã hết hạn — nên chuyển sang expired.json.`);
} else {
  console.log('Không có code hết hạn nào trong codes.json.');
}
