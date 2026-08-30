/**
 * 检查图标缺失。约定路径：public/images/<类别>/<id>.webp
 * 只警告不中断，方便先加数据后补图。
 */
import fs from 'node:fs';

const FILES = ['weapons', 'armor', 'armor-pieces', 'shields', 'backpacks', 'backpacks-full', 'enemies', 'enemies-full', 'buffs', 'debuffs', 'enemy-buffs', 'amulets', 'scrolls', 'runes', 'consumables', 'boxes', 'materials', 'cabinets', 'surface-chests-location', 'surface-chests', 'knight-orders'];
const missing = [];

for (const f of FILES) {
  const dataFile = ['backpacks-full', 'enemies-full', 'surface-chests-location', 'surface-chests'].includes(f)
    ? (f.startsWith('surface-chests') ? 'surface-chests' : f.replace('-full', ''))
    : f;
  const p = `src/data/${dataFile}.json`;
  if (!fs.existsSync(p)) continue;
  for (const item of JSON.parse(fs.readFileSync(p, 'utf8'))) {
    const iconCategory = ['backpacks-full', 'enemies-full', 'surface-chests-location', 'surface-chests'].includes(f)
      ? f
      : item.iconCat && item.iconId ? item.iconCat : f;
    const iconId = item.iconCat && item.iconId ? item.iconId : item.id;
    if (!fs.existsSync(`public/images/${iconCategory}/${iconId}.webp`))
      missing.push(`${iconCategory}/${iconId}.webp  (${item.name})`);
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
