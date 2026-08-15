/**
 * build 前校验数据文件。
 * 检查：文件存在、id 全局唯一、配方引用的材料真实存在。
 * 任一失败则退出码非 0，中断构建。
 */
import fs from 'node:fs';
import path from 'node:path';

const DIR = 'src/data';
const FILES = ['weapons', 'armor', 'armor-pieces', 'shields', 'backpacks', 'enemies', 'materials'];

const errors = [];
const all = {};

for (const f of FILES) {
  const p = path.join(DIR, `${f}.json`);
  if (!fs.existsSync(p)) { errors.push(`缺少数据文件: ${p}`); continue; }
  try { all[f] = JSON.parse(fs.readFileSync(p, 'utf8')); }
  catch (e) { errors.push(`${f}.json 语法错误: ${e.message}`); }
}

// id 全局唯一（含套装部件）
const seen = new Map();
const claim = (id, where) => {
  if (!id) { errors.push(`${where} 缺少 id`); return; }
  if (seen.has(id)) errors.push(`id 重复: ${id}（${seen.get(id)} 与 ${where}）`);
  else seen.set(id, where);
};
for (const f of FILES) {
  for (const item of all[f] ?? []) {
    claim(item.id, f);
    for (const p of item.pieces ?? []) claim(p.id, `${f}/${item.id} 的部件`);
  }
}

// 配方引用的材料必须存在
const matIds = new Set((all.materials ?? []).map((m) => m.id));
const checkCost = (cost, where) => {
  for (const c of cost ?? []) {
    if (!matIds.has(c.material)) errors.push(`${where} 引用了不存在的材料: ${c.material}`);
  }
};
for (const f of FILES) {
  for (const item of all[f] ?? []) {
    checkCost(item.cost, `${f}/${item.id}`);
    for (const p of item.pieces ?? []) checkCost(p.cost, `${f}/${item.id}/${p.id}`);
  }
}

// 武器的高级图纸必须指向真实武器
const weaponIds = new Set((all.weapons ?? []).map((w) => w.id));
for (const w of all.weapons ?? []) {
  if (w.upgradeOf && !weaponIds.has(w.upgradeOf))
    errors.push(`weapons/${w.id} 的高级图纸来源不存在: ${w.upgradeOf}`);
}

if (errors.length) {
  console.error('\n数据校验失败：\n' + errors.map((e) => '  ✗ ' + e).join('\n') + '\n');
  process.exit(1);
}

const total = FILES.reduce((n, f) => n + (all[f]?.length ?? 0), 0);
const pieces = (all.armor ?? []).reduce((n, s) => n + (s.pieces?.length ?? 0), 0);
console.log(`数据校验通过（${total} 条主记录 + ${pieces} 件套装部件）`);
