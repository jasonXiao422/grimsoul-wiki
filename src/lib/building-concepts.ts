export type BuildingConcept = {
  file: string;
  caption: string;
  credit: string;
  creditUrl?: string;
};

// key 为建筑 id，可升级建筑与不可升级建筑共用本表。
// 图片放在 public/images/concepts/ 下，文件名与 id 解耦，避免 id 变动导致图片失效。
// 未登记的建筑整个板块不渲染，不输出空 section。
// 本文件手工维护，npm run import 不会覆盖。
export const BUILDING_CONCEPTS: Record<string, BuildingConcept[]> = {
  "ji-tan": [
    {
      file: "altar-concept.webp",
      caption: "建筑设定",
      credit: "Natalia Isaicheva",
      creditUrl: "https://isaicheva_natalia.artstation.com/projects/xJBAdr",
    },
  ],
};
