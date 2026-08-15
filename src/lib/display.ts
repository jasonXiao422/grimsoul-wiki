import { RARITY_META, RARITY_ORDER, type Rarity } from './rarity';
import { BUILDINGS_BY_ID, getItemName, type CategorySlug } from './data';

export const FIELD_LABELS: Record<string, string> = {
  name: '名称',
  category: '类别',
  source: '来源',
  type: '类型',
  rarity: '稀有度',
  damage: '伤害',
  attackSpeed: '攻速',
  durability: '耐久',
  reqLevel: '需求等级',
  slot: '部位',
  armor: '护甲',
  set: '套装',
  tier: '等级',
  hp: '血量',
  locations: '出没地点',
  weakness: '弱点',
  behavior: '行为',
  effect: '效果',
  duration: '持续',
  usableIn: '可用地点',
  function: '功能',
  maxLevel: '最高等级',
  obtain: '获取方式',
  note: '备注',
  produces: '产出',
};

const TIER_LABELS: Record<string, string> = {
  普通: '普通',
  精英: '精英',
  BOSS: '首领',
};

const SET_LABELS: Record<string, string> = {
  'iron-set': '铁套装',
  'templar-set': '圣殿骑士套装',
};

export function normalizeTime(value: string): string {
  return value
    .replace(/^(\d+)s$/, '$1秒')
    .replace(/^(\d+)m$/, '$1分钟')
    .replace(/^(\d+)h$/, '$1小时');
}

export function formatValue(key: string, value: unknown): string {
  if (value === null || value === undefined || value === '') return '无';
  if (Array.isArray(value)) return value.map((item) => formatValue(key, item)).join('、');
  if (key === 'rarity' && typeof value === 'string') {
    return RARITY_META[value as Rarity]?.label ?? '未知';
  }
  if (key === 'tier' && typeof value === 'string') return TIER_LABELS[value] ?? value;
  if (key === 'set' && typeof value === 'string') return SET_LABELS[value] ?? '套装';
  if ((key === 'duration' || key === 'time') && typeof value === 'string') return normalizeTime(value);
  return String(value);
}

export function getSortValue(key: string, value: unknown): string | number {
  if (key === 'rarity' && typeof value === 'string') return RARITY_ORDER[value as Rarity] ?? 0;
  if (typeof value === 'number') return value;
  return formatValue(key, value);
}

export function getStationName(stationId: string): string {
  return BUILDINGS_BY_ID.get(stationId)?.name ?? '制作设施';
}

export function getDropItemName(type: string, id: string): string {
  const categoryByType: Record<string, CategorySlug> = {
    material: 'materials',
    weapon: 'weapons',
    armor: 'armors',
    scroll: 'scrolls',
  };
  const category = categoryByType[type];
  return category ? getItemName(category, id) : '未知条目';
}
