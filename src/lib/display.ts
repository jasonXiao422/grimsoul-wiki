import { tierRank } from './tiers';

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
  totalArmor: '总护甲',
  armor: '护甲',
  protection: '元素防护',
  setEffect: '套装效果',
  block: '格挡效果',
  blockCost: '格挡消耗',
  blockDurability: '格挡耐久',
  slots: '槽位',
  hp: '生命',
  damageReduction: '减伤',
  physicalDamage: '物理伤害',
  elementDamage: '元素伤害',
  note: '备注',
  locations: '出没地点',
  usedIn: '配方数',
};

export const ELEMENT_COLORS: Record<string, string> = {
  冰: '#86c5ff',
  火: '#d9773f',
  衰败: '#5a9e4a',
  毒: '#83ad55',
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
  if (amount === null || amount === undefined || amount === '') return type || '无';
  return type ? `${type} ${amount}` : String(amount);
}

export function formatValue(key: string, value: unknown): string {
  if (key === 'obtain' && (value === null || value === undefined || value === '')) return '—';
  if (value === null || value === undefined || value === '') return '无';
  if (Array.isArray(value)) return value.map((item) => formatValue(key, item)).join('、');

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
