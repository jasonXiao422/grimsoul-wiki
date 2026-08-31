export const SKILL_CATEGORY_IDS = {
  主动技能: 'skill-cat-zhu-dong',
  伤害: 'skill-cat-shang-hai',
  治疗: 'skill-cat-zhi-liao',
  闪避: 'skill-cat-shan-bi',
  资源: 'skill-cat-zi-yuan',
  角色: 'skill-cat-jue-se',
  特殊: 'skill-cat-te-shu',
} as const;

export type SkillCategory = keyof typeof SKILL_CATEGORY_IDS;

export function getSkillCategoryId(category: string): string {
  return SKILL_CATEGORY_IDS[category as SkillCategory] ?? category;
}
