import { CATEGORIES, CATEGORY_BY_SLUG } from './categories';
import { getSortValue } from './display';
import materials from '../data/materials.json';
import weapons from '../data/weapons.json';
import armor from '../data/armor.json';
import shields from '../data/shields.json';
import backpacks from '../data/backpacks.json';
import enemies from '../data/enemies.json';
import amulets from '../data/amulets.json';
import scrolls from '../data/scrolls.json';
import knightOrders from '../data/knight-orders.json';
import armorPieces from '../data/armor-pieces.json';

export const ALL_CATEGORIES = CATEGORIES;

export const DATA_BY_CATEGORY = {
  weapons,
  armor,
  shields,
  backpacks,
  enemies,
  amulets,
  scrolls,
  materials,
  orders: knightOrders,
} as const;

export const EXTRA_DATA = {
  'armor-pieces': armorPieces,
} as const;

export type CategorySlug = keyof typeof DATA_BY_CATEGORY;
export type DataItem = (typeof DATA_BY_CATEGORY)[CategorySlug][number];
export type CostItem = { material: string; qty: number };
export type MaterialEntity = { cat: string; id: string };

export const MATERIALS_BY_ID = new Map(materials.map((item) => [item.id, item]));

const ENTITY_PATH_BY_CAT: Record<string, string> = {
  weapons: 'weapons',
  armor: 'armor',
  'armor-pieces': 'armor',
  shields: 'shields',
  backpacks: 'backpacks',
  amulets: 'amulets',
};

const ENTITY_LABEL_BY_CAT: Record<string, string> = {
  weapons: '武器',
  armor: '护甲',
  'armor-pieces': '护甲散件',
  shields: '盾牌',
  backpacks: '驮篮',
  amulets: '护符',
};

export function getEntityHref(entity: MaterialEntity | undefined): string | undefined {
  if (!entity?.cat || !entity.id) return undefined;
  const path = ENTITY_PATH_BY_CAT[entity.cat];
  if (!path) return undefined;
  return entity.cat === 'armor-pieces' ? `/${path}#${entity.id}` : `/${path}/${entity.id}`;
}

export function getEntityCategoryLabel(entity: MaterialEntity | undefined): string {
  return entity ? ENTITY_LABEL_BY_CAT[entity.cat] ?? entity.cat : '条目';
}

export function getMaterialHref(material: { id: string; entity?: MaterialEntity }): string {
  return getEntityHref(material.entity) ?? `/materials/${material.id}`;
}

export function getCategoryCount(slug: CategorySlug): number {
  // 护甲统计 armor.json 里的套装数，不包含套装内嵌部件。
  // 骑士团统计 knight-orders.json 里的骑士团条目数。
  return DATA_BY_CATEGORY[slug].length;
}

export function getCategoryCountLabel(slug: CategorySlug): string {
  return `${getCategoryCount(slug)} 条`;
}

export function getCategoryBlurb(slug: CategorySlug): string {
  const category = CATEGORY_BY_SLUG[slug];
  return typeof category?.blurb === 'string' ? category.blurb : '';
}

const CATEGORY_LABELS: Record<string, string> = Object.fromEntries(
  CATEGORIES.map((category) => [category.slug, category.label])
);

const GROUP_ORDER = [
  '家里',
  '1-5级图',
  '被弃地下城',
  '酷吏地下城',
  '空降事件',
  '节日活动',
  '衰败摇篮',
  '元素副本',
  '大车炮台',
];

function compareSortValues(a: string | number, b: string | number) {
  if (typeof a === 'number' && typeof b === 'number') return a - b;
  return String(a).localeCompare(String(b), 'zh-Hans-CN');
}

export function getByPath(item: Record<string, unknown>, path: string): unknown {
  return path.split('.').reduce<unknown>((value, key) => {
    if (value && typeof value === 'object') return (value as Record<string, unknown>)[key];
    return undefined;
  }, item);
}

export function getListItems(slug: CategorySlug): DataItem[] {
  const category = CATEGORY_BY_SLUG[slug];
  const items = [...DATA_BY_CATEGORY[slug]] as DataItem[];
  const sortKey = category?.defaultSort ?? 'name';

  return items.sort((a, b) => {
    if (category?.groupBy) {
      const aGroup = String(getByPath(a as Record<string, unknown>, category.groupBy) ?? '');
      const bGroup = String(getByPath(b as Record<string, unknown>, category.groupBy) ?? '');
      const aRank = GROUP_ORDER.indexOf(aGroup);
      const bRank = GROUP_ORDER.indexOf(bGroup);
      const groupResult = (aRank === -1 ? GROUP_ORDER.length : aRank) - (bRank === -1 ? GROUP_ORDER.length : bRank)
        || aGroup.localeCompare(bGroup, 'zh-Hans-CN');
      if (groupResult) return groupResult;
    }

    const result = compareSortValues(
      getSortValue(sortKey, getByPath(a as Record<string, unknown>, sortKey)),
      getSortValue(sortKey, getByPath(b as Record<string, unknown>, sortKey))
    );
    return result || a.name.localeCompare(b.name, 'zh-Hans-CN');
  });
}

export function getCategoryBySlug(slug: string) {
  return CATEGORIES.find((category) => category.slug === slug);
}

export function getItemName(category: CategorySlug, id: string): string {
  const found = (DATA_BY_CATEGORY[category] as readonly DataItem[]).find((item) => item.id === id);
  return found?.name ?? '未知条目';
}

export function getAnyItemName(id: string): string {
  for (const slug of Object.keys(DATA_BY_CATEGORY) as CategorySlug[]) {
    const found = (DATA_BY_CATEGORY[slug] as readonly DataItem[]).find((item) => item.id === id);
    if (found) return found.name;
  }

  const piece = armorPieces.find((item) => item.id === id);
  return piece?.name ?? '未知条目';
}

export function getItemHref(category: CategorySlug, id: string): string {
  return `/${category}/${id}`;
}

function pushCostUsages(
  usages: Array<{
    category: string;
    categoryLabel: string;
    name: string;
    href: string;
    qty: number;
    source: string;
  }>,
  cost: CostItem[] | undefined,
  materialId: string,
  meta: { category: string; name: string; href: string; source: string }
) {
  for (const item of cost ?? []) {
    if (item.material !== materialId) continue;
    usages.push({
      category: meta.category,
      categoryLabel: CATEGORY_LABELS[meta.category] ?? meta.category,
      name: meta.name,
      href: meta.href,
      qty: item.qty,
      source: meta.source,
    });
  }
}

export function getRecipeUsages(materialId: string) {
  const usages: Array<{
    category: string;
    categoryLabel: string;
    name: string;
    href: string;
    qty: number;
    source: string;
  }> = [];

  for (const slug of ['weapons', 'armor', 'shields', 'backpacks', 'amulets'] as const) {
    for (const item of DATA_BY_CATEGORY[slug] as readonly any[]) {
      pushCostUsages(usages, item.cost, materialId, {
        category: slug,
        name: item.name,
        href: getItemHref(slug, item.id),
        source: '合成配方',
      });

      for (const piece of item.pieces ?? []) {
        pushCostUsages(usages, piece.cost, materialId, {
          category: slug,
          name: `${item.name}：${piece.name}`,
          href: `${getItemHref(slug, item.id)}#${piece.id}`,
          source: '套装部件',
        });
      }
    }
  }

  for (const item of armorPieces) {
    pushCostUsages(usages, item.cost, materialId, {
      category: 'armor',
      name: item.name,
      href: '/armor',
      source: '护甲散件',
    });
  }

  return usages.sort((a, b) => a.name.localeCompare(b.name, 'zh-Hans-CN'));
}
