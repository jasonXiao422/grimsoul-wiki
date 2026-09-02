#!/usr/bin/env node
/**
 * 重新生成 tools/*.html 里硬编码的条目清单与类别数组。
 *
 * 数据一变（新增条目、新增类别）就要跑一次，否则图标工具里看不到新条目的槽位：
 *
 *   node scripts/gen-icon-list.mjs          # 写回 tools/*.html
 *   node scripts/gen-icon-list.mjs --check  # 只打印统计，不写文件
 *
 * 脚本只改写两处：
 *   const DATA = [...];
 *   const CATS = [...];
 * 其余内容一字不动。
 */
import { readFileSync, writeFileSync, existsSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');
const DATA_DIR = join(ROOT, 'src', 'data');
const TOOLS = ['icon-namer.html', 'icon-studio.html'];

/** 品质 key → 中文名。与 src/lib/quality.ts 保持一致。 */
const QUALITY_NAME = {
  common: '普通',
  rare: '稀有',
  unique: '独特',
  legendary: '传说',
};

/**
 * 清单来源。顺序即工具里的显示顺序，应与 src/lib/categories.ts 一致。
 *
 * parent 是工具里显示在条目名下方的副标题，用来区分同名物品：
 * 大多数类别用品质，骑士团用时代，材料没有。
 *
 * 新增类别时在这里加一行。
 */
const SOURCES = [
  { file: 'weapons', cat: 'weapons', label: '武器', parent: quality },
  // 护甲套装后面紧跟它自己的 5 件部件
  { file: 'armor', cat: 'armor', label: '护甲套装', parent: quality, expand: expandArmorSet },
  { file: 'armor-pieces', cat: 'armor-pieces', label: '护甲部件', parent: quality },
  { file: 'shields', cat: 'shields', label: '盾牌', parent: quality },
  { file: 'backpacks', cat: 'backpacks', label: '驮篮', parent: quality },
  // 驮篮有两套图：列表用方形图标 backpacks/，详情用大图 backpacks-full/
  { file: 'backpacks', cat: 'backpacks-full', label: '驮篮大图', parent: quality },
  { file: 'amulets', cat: 'amulets', label: '护符', parent: quality },
  { file: 'scrolls', cat: 'scrolls', label: '卷轴', parent: quality },
  { file: 'runes', cat: 'runes', label: '符文', parent: quality },
  { file: 'consumables', cat: 'consumables', label: '食物药剂', parent: quality },
  { file: 'boxes', cat: 'boxes', label: '武器盒子', parent: quality },
  { file: 'enemies', cat: 'enemies', label: '敌人', parent: quality },
  // 敌人有两套图：列表用方形头像 enemies/，详情用游戏截图 enemies-full/
  { file: 'enemies', cat: 'enemies-full', label: '敌人截图', parent: quality },
  { file: 'buffs', cat: 'buffs', label: '玩家增益', parent: () => undefined },
  { file: 'debuffs', cat: 'debuffs', label: '玩家减益', parent: () => undefined },
  { file: 'enemy-buffs', cat: 'enemy-buffs', label: '敌方强化', parent: () => undefined },
  { file: 'materials', cat: 'materials', label: '材料', parent: () => undefined },
  { file: 'cabinets', cat: 'cabinets', label: '柜子', parent: quality },
  { file: 'surface-chests', cat: 'surface-chests-location', label: '地表箱子地点', parent: () => undefined },
  { file: 'surface-chests', cat: 'surface-chests', label: '地表箱子', parent: () => undefined },
  { file: 'fixed-buildings', cat: 'fixed-buildings', label: '不可升级建筑', parent: quality },
  { file: 'skills', cat: 'skills', label: '技能', parent: () => undefined },
  { file: 'knight-orders', cat: 'knight-orders', label: '骑士团', parent: era },
];

const SKILL_CATEGORY_IDS = {
  主动技能: 'skill-cat-zhu-dong',
  伤害: 'skill-cat-shang-hai',
  治疗: 'skill-cat-zhi-liao',
  闪避: 'skill-cat-shan-bi',
  资源: 'skill-cat-zi-yuan',
  角色: 'skill-cat-jue-se',
  特殊: 'skill-cat-te-shu',
};

function quality(item, source) {
  const q = item.quality;
  if (q === undefined || q === null) {
    fail(`${source.file}.json 里「${item.name}」没有 quality 字段`);
  }
  const name = QUALITY_NAME[q];
  if (!name) fail(`${source.file}.json 里「${item.name}」的 quality 值「${q}」不认识`);
  return name;
}

/** 骑士团的时代，字段名是 eraLabel。 */
function era(item, source) {
  if (item.eraLabel) return item.eraLabel;
  fail(`${source.file}.json 里「${item.name}」缺少 eraLabel 字段`);
}

/** 套装展开成「套装 + 它的部件」。 */
function expandArmorSet(set, source) {
  const parent = quality(set, source);
  const rows = [{ cat: 'armor', catLabel: '护甲套装', id: set.id, name: set.name, parent }];
  for (const piece of set.pieces ?? []) {
    rows.push({ cat: 'armor-pieces', catLabel: '护甲部件', id: piece.id, name: piece.name, parent });
  }
  return rows;
}

function fail(message) {
  console.error(`\n[生成失败] ${message}`);
  console.error('请检查 JSON 结构是否变了，或修改本脚本顶部的 SOURCES 配置。\n');
  process.exit(1);
}

function load(name) {
  const path = join(DATA_DIR, `${name}.json`);
  if (!existsSync(path)) fail(`找不到 ${path}`);
  return JSON.parse(readFileSync(path, 'utf8'));
}

function build() {
  const rows = [];
  for (const source of SOURCES) {
    const items = load(source.file);
    for (const item of items) {
      if (!item.id || !item.name) fail(`${source.file}.json 有条目缺少 id 或 name`);
      if (source.expand) {
        rows.push(...source.expand(item, source));
        continue;
      }
      const parent = source.parent(item, source);
      const row = { cat: source.cat, catLabel: source.label, id: item.id, name: item.name };
      if (parent !== undefined) row.parent = parent;
      rows.push(row);
    }
  }

  const skills = load('skills');
  for (const [name, id] of Object.entries(SKILL_CATEGORY_IDS)) {
    if (skills.some((item) => item.category === name)) {
      rows.push({ cat: 'skill-categories', catLabel: '技能类别', id, name });
    }
  }

  const seen = new Set();
  for (const row of rows) {
    const key = `${row.cat}/${row.id}`;
    if (seen.has(key)) fail(`重复条目 ${key}（${row.name}）`);
    seen.add(key);
  }
  return rows;
}

function report(rows) {
  const counts = new Map();
  for (const row of rows) counts.set(row.catLabel, (counts.get(row.catLabel) ?? 0) + 1);
  console.log(`图标清单条目总数：${rows.length}`);
  for (const [label, n] of counts) console.log(`  ${label} ${n}`);
}

const rows = build();
report(rows);

if (process.argv.includes('--check')) {
  console.log('\n--check 模式，未写入文件。');
  process.exit(0);
}

const dataPayload = JSON.stringify(rows);
// CATS 用于工具里识别 public/images 下的子目录，顺序与 SOURCES 一致
const catsPayload = JSON.stringify([...new Set(rows.map((r) => r.cat))]).replace(/"/g, "'");

let written = 0;

for (const tool of TOOLS) {
  const path = join(ROOT, 'tools', tool);
  if (!existsSync(path)) {
    console.log(`跳过 ${tool}（文件不存在）`);
    continue;
  }

  let html = readFileSync(path, 'utf8');

  const dataPattern = /const DATA = (\[[\s\S]*?\]);/;
  if (!dataPattern.test(html)) fail(`${tool} 里找不到 const DATA = [...];`);
  html = html.replace(dataPattern, () => `const DATA = ${dataPayload};`);

  // CATS 不是每个工具都有，有就更新，没有就跳过
  const catsPattern = /const CATS = \[[\s\S]*?\];/;
  if (catsPattern.test(html)) {
    html = html.replace(catsPattern, () => `const CATS = ${catsPayload};`);
  }

  writeFileSync(path, html, 'utf8');
  console.log(`已更新 tools/${tool}`);
  written += 1;
}

if (!written) fail('一个工具文件都没更新');
