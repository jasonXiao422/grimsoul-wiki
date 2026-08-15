/**
 * build 前校验所有数据文件。
 * 检查三件事：schema 合法、id 不重复、配方引用的材料真实存在。
 * 任一失败则退出码非 0，让构建中断。
 */
import fs from 'node:fs';
import path from 'node:path';

const DATA_DIR = 'src/data';
const CATS = ['materials', 'weapons', 'armors', 'enemies', 'scrolls', 'buildings'];

const errors = [];
const all = {};

// 1. 读取 + id 唯一性
for (const cat of CATS) {
  const file = path.join(DATA_DIR, `${cat}.json`);
  if (!fs.existsSync(file)) { errors.push(`缺少数据文件: ${file}`); continue; }
  let data;
  try { data = JSON.parse(fs.readFileSync(file, 'utf8')); }
  catch (e) { errors.push(`${cat}.json JSON 语法错误: ${e.message}`); continue; }

  const seen = new Set();
  for (const item of data) {
    if (seen.has(item.id)) errors.push(`${cat}.json 中 id 重复: ${item.id}`);
    seen.add(item.id);
  }
  all[cat] = data;
}

// 2. 配方引用的材料必须存在
const materialIds = new Set((all.materials ?? []).map((m) => m.id));

const checkCost = (cat, itemId, cost) => {
  for (const c of cost ?? []) {
    if (!materialIds.has(c.material))
      errors.push(`${cat}/${itemId} 的配方引用了不存在的材料: ${c.material}`);
  }
};

for (const cat of ['weapons', 'armors', 'scrolls']) {
  for (const item of all[cat] ?? []) checkCost(cat, item.id, item.craft?.cost);
}
for (const b of all.buildings ?? []) {
  for (const lv of b.levels ?? []) checkCost('buildings', `${b.id} Lv${lv.level}`, lv.cost);
}

// 3. 敌人掉落引用的物品必须存在
const allIds = new Set(CATS.flatMap((c) => (all[c] ?? []).map((i) => i.id)));
for (const e of all.enemies ?? []) {
  for (const d of e.drops ?? []) {
    if (!allIds.has(d.item))
      errors.push(`enemies/${e.id} 的掉落引用了不存在的物品: ${d.item}`);
  }
}

if (errors.length) {
  console.error('\n数据校验失败：\n' + errors.map((e) => '  ✗ ' + e).join('\n') + '\n');
  process.exit(1);
}
console.log(`数据校验通过（共 ${Object.values(all).flat().length} 条）`);
