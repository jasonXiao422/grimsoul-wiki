/**
 * 检查图标缺失。约定路径：public/images/<类别>/<id>.webp
 * 只警告不中断，方便先加数据后补图。
 */
import fs from 'node:fs';

const FILES = ['weapons', 'armor', 'armor-pieces', 'shields', 'backpacks', 'enemies', 'amulets', 'scrolls', 'materials', 'knight-orders'];
const missing = [];

for (const f of FILES) {
  const p = `src/data/${f}.json`;
  if (!fs.existsSync(p)) continue;
  for (const item of JSON.parse(fs.readFileSync(p, 'utf8'))) {
    if (!fs.existsSync(`public/images/${f}/${item.id}.webp`))
      missing.push(`${f}/${item.id}.webp  (${item.name})`);
    for (const pc of item.pieces ?? []) {
      if (!fs.existsSync(`public/images/armor-pieces/${pc.id}.webp`))
        missing.push(`armor-pieces/${pc.id}.webp  (${pc.name})`);
    }
  }
}

if (missing.length) {
  console.warn(`\n⚠ 缺少 ${missing.length} 个图标，页面会显示占位符。前 20 个：`);
  for (const m of missing.slice(0, 20)) console.warn('  · ' + m);
  if (missing.length > 20) console.warn(`  … 还有 ${missing.length - 20} 个`);
  console.warn('');
}
process.exit(0);
