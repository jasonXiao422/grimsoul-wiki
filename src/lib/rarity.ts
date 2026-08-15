/** 稀有度：数据里只存英文 key，显示层统一在这里映射 */
export const RARITIES = ['common', 'uncommon', 'rare', 'epic', 'legendary'] as const;
export type Rarity = (typeof RARITIES)[number];

export const RARITY_META: Record<Rarity, { label: string; color: string }> = {
  common:    { label: '普通', color: '#8a8579' },
  uncommon:  { label: '优秀', color: '#5aa15a' },
  rare:      { label: '稀有', color: '#4a7fc1' },
  epic:      { label: '史诗', color: '#9a5fc4' },
  legendary: { label: '传说', color: '#c9a227' },
};

/** 排序用权重，列表页按稀有度排序时使用 */
export const RARITY_ORDER: Record<Rarity, number> =
  Object.fromEntries(RARITIES.map((r, i) => [r, i])) as Record<Rarity, number>;
