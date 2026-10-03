/** 护甲套装的品阶。数据里存 "T1" / "T3+" 这种字符串。 */
export type Tier = string;

/** 按品阶给颜色，从灰到金，用于列表页的品阶徽章。 */
export const TIER_COLOR: Record<string, string> = {
  T1: '#8a8579',
  'T1+': '#848872',
  T2: '#7d8a6a',
  'T2+': '#6f9159',
  T3: '#5a8fa8',
  'T3+': '#4a7fc1',
  T4: '#7a6fbd',
  'T4+': '#9a5fc4',
  T5: '#b5763a',
  'T5+': '#c98a27',
  T6: '#c9a227',
  'T6+': '#e0c04a',
};

export function tierRank(tier?: string | null): number {
  if (!tier) return Number.POSITIVE_INFINITY;
  const match = /^T(\d+)(\+)?$/.exec(tier.trim());
  if (!match) return Number.POSITIVE_INFINITY;
  return Number(match[1]) * 2 + (match[2] ? 1 : 0);
}
