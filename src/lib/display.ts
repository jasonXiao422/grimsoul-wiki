import { tierRank } from './tiers';
import { ELEMENT_ALIASES, ELEMENT_META, normalizeElementName, QUALITY_META, QUALITY_ORDER } from './quality';

export const FIELD_LABELS: Record<string, string> = {
  name: '名称',
  group: '地点大类',
  damage: '物理伤害',
  skillBonus: '满级技能',
  damageNote: '伤害备注',
  element: '固定元素伤害',
  attackSpeed: '攻速',
  range: '攻距',
  durability: '耐久',
  cost: '合成配方',
  effect: '特殊效果',
  upgradeOf: '高级图纸来源',
  tier: '品阶',
  obtain: '获取途径',
  quality: '品质',
  totalArmor: '总护甲',
  armor: '护甲',
  protection: '元素防护',
  setEffect: '套装效果',
  slots: '槽位',
  hp: '生命',
  damageReduction: '减伤',
  physicalDamage: '物理伤害',
  elementDamage: '元素伤害',
  note: '敌人介绍',
  locations: '出没地点',
  usedIn: '配方数',
  healing: '持续治愈',
  satiety: '饱食度',
  thirst: '口渴值',
  craftedAt: '制作地点',
};

export const ELEMENT_COLORS: Record<string, string> = {
  ...Object.fromEntries(
    [...Object.keys(ELEMENT_META), ...Object.keys(ELEMENT_ALIASES)].map((name) => [
      name,
      ELEMENT_META[normalizeElementName(name) ?? '']?.color ?? 'var(--text)',
    ]),
  ),
  暗: '#9a7bd1',
  神圣: '#d8c46a',
};

export function normalizeTime(value: string): string {
  return value
    .replace(/^(\d+)s$/, '$1秒')
    .replace(/^(\d+)m$/, '$1分钟')
    .replace(/^(\d+)h$/, '$1小时');
}

function formatElement(value: Record<string, unknown>): string {
  const type = typeof value.type === 'string' ? value.type : '';
  const amount = value.value ?? value.amount;
  if (!type && (amount === null || amount === undefined || amount === '')) return '无';
  const label = type ? ELEMENT_META[normalizeElementName(type) ?? '']?.label ?? normalizeElementName(type) ?? type : '';
  if (amount === null || amount === undefined || amount === '') return label || '无';
  return label ? `${label} ${amount}` : String(amount);
}

export function formatValue(key: string, value: unknown): string {
  if (key === 'obtain' && (value === null || value === undefined || value === '' || value === 'N/A')) return '无需图纸制作';
  if (value === null || value === undefined || value === '') return '无';
  if (Array.isArray(value)) return value.map((item) => formatValue(key, item)).join('、');

  if (key.endsWith('.type') && typeof value === 'string') return normalizeElementName(value) ?? value;

  if (key === 'quality' && typeof value === 'string') {
    return QUALITY_META[value as keyof typeof QUALITY_META]?.label ?? value;
  }

  if (typeof value === 'object') {
    const objectValue = value as Record<string, unknown>;
    if ('type' in objectValue || 'value' in objectValue && key !== 'durability') return formatElement(objectValue);
    if (key === 'durability' && 'value' in objectValue) {
      return `${objectValue.value ?? ''}${objectValue.unit ?? ''}`;
    }
    return Object.values(objectValue).map(String).join(' ');
  }

  if ((key === 'duration' || key === 'time') && typeof value === 'string') return normalizeTime(value);
  if (key === 'damageReduction' && typeof value === 'string') return value.replace(/%/g, '');
  return String(value);
}

export function getSortValue(key: string, value: unknown): string | number {
  if (key === 'tier' && typeof value === 'string') return tierRank(value);
  if (key === 'quality' && typeof value === 'string') {
    return QUALITY_ORDER[value as keyof typeof QUALITY_ORDER] ?? Number.POSITIVE_INFINITY;
  }
  if (typeof value === 'number') return value;
  if (value === null || value === undefined || value === '') return Number.NEGATIVE_INFINITY;
  if (typeof value === 'object' && !Array.isArray(value)) {
    const objectValue = value as Record<string, unknown>;
    if (typeof objectValue.value === 'number') return objectValue.value;
  }
  return formatValue(key, value);
}

export function formatMaybeIncomplete(value: unknown, dataIncomplete?: boolean): string {
  if ((value === null || value === undefined || value === '') && dataIncomplete) return '数据待补充';
  return formatValue('', value);
}
