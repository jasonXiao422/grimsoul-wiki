/**
 * 敌人角色原画映射表
 *
 * 手工维护，不由 import_excel.py 生成，npm run import 不会覆盖本文件。
 * key 为敌人 id（与 public/images/enemies/ 下的图标文件名一致）。
 * 只有在此登记的敌人才会在详情页显示「角色原画」板块，未登记的敌人不渲染该板块。
 *
 * 图片放在 public/images/concepts/ 下，文件名自由命名，
 * 故意不与敌人 id 绑定，避免 id 变动导致图片失效。
 */

export type EnemyConcept = {
  /** public/images/concepts/ 下的文件名，含扩展名 */
  file: string;
  /** 图片说明，显示在图下方 */
  caption: string;
  /** 来源署名 */
  credit: string;
};

export const ENEMY_CONCEPTS: Record<string, EnemyConcept[]> = {
  "ji-mu-ai-sha": [
    {
      file: "elsa-concept-1.webp",
      caption: "角色设定集",
      credit: "Kefir Games 官方设定",
    },
    {
      file: "elsa-concept-2.webp",
      caption: "早期建模视图",
      credit: "Kefir Games 官方设定",
    },
  ],
};

export function getEnemyConcepts(id: string): EnemyConcept[] {
  return ENEMY_CONCEPTS[id] ?? [];
}
