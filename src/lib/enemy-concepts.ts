export type EnemyConcept = {
  file: string;
  caption: string;
  credit: string;
  creditUrl?: string;
};

export const ENEMY_CONCEPTS: Record<string, EnemyConcept[]> = {
  "ji-mu-ai-sha": [
    { file: "elsa-concept-1.webp", caption: "角色设定集", credit: "Kefir Games 官方设定" },
    { file: "elsa-concept-2.webp", caption: "早期建模视图", credit: "Kefir Games 官方设定" },
  ],
  "luo-ge-wo-er-de-ying-zi": [
    { file: "rogvold-model.webp", caption: "角色模型", credit: "Kefir Games 官方设定" },
    { file: "rogvold-concept-1.webp", caption: "幽魂形态与场景设定", credit: "Kefir Games 官方设定" },
    { file: "rogvold-concept-2.webp", caption: "角色设定与面具方案", credit: "Kefir Games 官方设定" },
  ],
  "tan-cai-jiu-huo-shang": [
    { file: "merchant-model-1.webp", caption: "角色模型", credit: "Eugene Nepomnyaschiy", creditUrl: "https://www.artstation.com/bagstor" },
    { file: "merchant-model-2.webp", caption: "模型布线", credit: "Eugene Nepomnyaschiy", creditUrl: "https://www.artstation.com/bagstor" },
    { file: "merchant-concept-1.webp", caption: "角色设定与草图", credit: "Natalia Isaicheva", creditUrl: "https://www.artstation.com/isaicheva_natalia" },
    { file: "merchant-concept-2.webp", caption: "面部方案与背包设计", credit: "Natalia Isaicheva", creditUrl: "https://www.artstation.com/isaicheva_natalia" },
  ],
};

export function getEnemyConcepts(id: string): EnemyConcept[] {
  return ENEMY_CONCEPTS[id] ?? [];
}
