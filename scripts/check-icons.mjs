/**
 * 检查每条数据是否都有对应图标。
 * 图标路径约定：public/images/<类别>/<id>.webp
 * 缺图只警告不中断，避免刚加数据还没配图就无法构建。
 * 想改成强制报错，把最后的 process.exit(0) 改成 exit(1)。
 */
import fs from 'node:fs';

const CATS = ['materials', 'weapons', 'armors', 'enemies', 'scrolls', 'buildings'];
const missing = [];

for (const cat of CATS) {
  const file = `src/data/${cat}.json`;
  if (!fs.existsSync(file)) continue;
  for (const item of JSON.parse(fs.readFileSync(file, 'utf8'))) {
    if (!fs.existsSync(`public/images/${cat}/${item.id}.webp`))
      missing.push(`${cat}/${item.id}.webp  (${item.name})`);
  }
}

if (missing.length) {
  console.warn(`\n⚠ 缺少 ${missing.length} 个图标：`);
  for (const m of missing) console.warn('  · ' + m);
  console.warn('');
}
process.exit(0);
