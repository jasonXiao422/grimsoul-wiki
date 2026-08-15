import { CATEGORIES } from './categories';
import materials from '../data/materials.json';
import weapons from '../data/weapons.json';
import armors from '../data/armors.json';
import enemies from '../data/enemies.json';
import scrolls from '../data/scrolls.json';
import buildings from '../data/buildings.json';

export const MATERIAL_CATEGORY = {
  slug: 'materials',
  label: '材料',
  blurb: '基础资源、加工材料与稀有材料的来源',
  columns: [
    { key: 'name', label: '名称', sortable: true },
    { key: 'category', label: '类别', sortable: true },
    { key: 'source', label: '来源' },
  ],
  filters: ['category'],
};

export const ALL_CATEGORIES = [MATERIAL_CATEGORY, ...CATEGORIES];

export const DATA_BY_CATEGORY = {
  materials,
  weapons,
  armors,
  enemies,
  scrolls,
  buildings,
} as const;

export type CategorySlug = keyof typeof DATA_BY_CATEGORY;
export type DataItem = (typeof DATA_BY_CATEGORY)[CategorySlug][number] & { maxLevel?: number };

export const MATERIALS_BY_ID = new Map(materials.map((item) => [item.id, item]));
export const BUILDINGS_BY_ID = new Map(buildings.map((item) => [item.id, item]));

export function getListItems(slug: CategorySlug): DataItem[] {
  if (slug === 'buildings') {
    return buildings.map((item) => ({
      ...item,
      maxLevel: item.levels.length,
    }));
  }
  return [...DATA_BY_CATEGORY[slug]] as DataItem[];
}

export function getCategoryBySlug(slug: string) {
  return ALL_CATEGORIES.find((category) => category.slug === slug);
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
  return '未知条目';
}

export function getItemHref(category: CategorySlug, id: string): string {
  return `/${category}/${id}`;
}

export function getRecipeUsages(materialId: string) {
  const usages: Array<{
    category: CategorySlug;
    categoryLabel: string;
    name: string;
    href: string;
    qty: number;
    source: string;
  }> = [];

  const craftCategories: CategorySlug[] = ['weapons', 'armors', 'scrolls'];
  for (const slug of craftCategories) {
    const category = getCategoryBySlug(slug);
    for (const item of DATA_BY_CATEGORY[slug] as readonly any[]) {
      for (const cost of item.craft?.cost ?? []) {
        if (cost.material === materialId) {
          usages.push({
            category: slug,
            categoryLabel: category?.label ?? '条目',
            name: item.name,
            href: getItemHref(slug, item.id),
            qty: cost.qty,
            source: '合成配方',
          });
        }
      }
    }
  }

  for (const item of buildings) {
    for (const level of item.levels) {
      for (const cost of level.cost) {
        if (cost.material === materialId) {
          usages.push({
            category: 'buildings',
            categoryLabel: '建筑',
            name: item.name,
            href: getItemHref('buildings', item.id),
            qty: cost.qty,
            source: `${level.level}级升级`,
          });
        }
      }
    }
  }

  return usages.sort((a, b) => a.name.localeCompare(b.name, 'zh-Hans-CN'));
}
