/**
 * 护符品质。数据里只存英文 key，中文名与配色在这里统一映射。
 * 颜色对应游戏内的边框与名称配色：普通白 / 稀有蓝 / 独特橙。
 */
export const QUALITIES = ['common', 'rare', 'unique'] as const;
export type Quality = (typeof QUALITIES)[number];

export const QUALITY_META: Record<Quality, {
  label: string;
  /** 名称文字色 */
  text: string;
  /** 图标外框色 */
  border: string;
  /** 图标外框的柔光 */
  glow: string;
}> = {
  common: {
    label: '普通',
    text: '#e8e5df',
    border: '#c8c4bc',
    glow: 'rgba(200,196,188,.25)',
  },
  rare: {
    label: '稀有',
    text: '#6ba6e8',
    border: '#4a86c8',
    glow: 'rgba(74,134,200,.35)',
  },
  unique: {
    label: '独特',
    text: '#e0912f',
    border: '#c8781a',
    glow: 'rgba(200,120,26,.35)',
  },
};

/** 列表排序用：普通 → 稀有 → 独特 */
export const QUALITY_ORDER: Record<Quality, number> =
  Object.fromEntries(QUALITIES.map((q, i) => [q, i])) as Record<Quality, number>;

/**
 * 元素类型配色。火红、冰蓝、衰败绿。
 * 数据里元素名可能写作「火焰/寒冷/衰败」，也可能是「火/冰」，都在这里归一。
 */
export const ELEMENT_META: Record<string, { label: string; color: string }> = {
  火焰: { label: '火焰', color: '#e05a3a' },
  火:   { label: '火焰', color: '#e05a3a' },
  寒冷: { label: '寒冷', color: '#4aa8e0' },
  冰:   { label: '寒冷', color: '#4aa8e0' },
  衰败: { label: '衰败', color: '#5aa84a' },
  毒:   { label: '毒',   color: '#7ab648' },
};

export function elementColor(type?: string | null): string {
  if (!type) return 'var(--text-dim)';
  return ELEMENT_META[type]?.color ?? 'var(--text)';
}
