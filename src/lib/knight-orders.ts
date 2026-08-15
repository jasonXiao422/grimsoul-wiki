export const ORDER_ERA_SEQUENCE = ['kaila', 'church', 'crown', 'late'] as const;

export const ORDER_STATUS_LABELS = {
  loyal: '仍效忠',
  fallen: '遭背叛而覆灭',
  turned: '倒向异神',
  outside: '立场特殊',
} as const;

export type OrderEra = (typeof ORDER_ERA_SEQUENCE)[number];
export type OrderStatus = keyof typeof ORDER_STATUS_LABELS;

export function getOrderStatusLabel(status: string) {
  return ORDER_STATUS_LABELS[status as OrderStatus] ?? status;
}

export function getOrderEraRank(era: string) {
  const rank = ORDER_ERA_SEQUENCE.indexOf(era as OrderEra);
  return rank === -1 ? ORDER_ERA_SEQUENCE.length : rank;
}
