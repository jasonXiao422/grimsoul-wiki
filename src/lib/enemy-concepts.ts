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
  "bei-zhou-qi-shi": [
    { file: "damned-knight-concept.webp", caption: "角色设定", credit: "Pavel Goloviy", creditUrl: "https://korontari.artstation.com/projects/9xJXR" },
  ],
  "bei-zhou-sheng-dian-qi-shi": [
    { file: "damned-templar-concept.webp", caption: "角色设定", credit: "Pavel Goloviy", creditUrl: "https://korontari.artstation.com/projects/9xJXR" },
  ],
  "ai-sen-bo-ge-ling-zhu-pu-tong-ying-xiong": [
    { file: "eisenberg-model-1.webp", caption: "模型布线", credit: "Eugene Nepomnyaschiy", creditUrl: "https://www.artstation.com/artwork/YKl9bX" },
    { file: "eisenberg-model-2.webp", caption: "角色模型", credit: "Eugene Nepomnyaschiy", creditUrl: "https://www.artstation.com/artwork/YKl9bX" },
    { file: "eisenberg-concept.webp", caption: "角色设定与草图", credit: "Natalia Isaicheva", creditUrl: "https://www.artstation.com/artwork/xzPwG1" },
    { file: "eisenberg-scene.webp", caption: "场景设定", credit: "Natalia Isaicheva", creditUrl: "https://www.artstation.com/artwork/xzPwG1" },
  ],
  "bu-wen-ding-de-gu-kui-lei": [
    { file: "unstable-skeleton-concept.webp", caption: "形态设定与模型", credit: "BrickWorks Games", creditUrl: "https://www.facebook.com/photo.php?fbid=1502169901927595&set=pb.100064037977309.-2207520000&type=3" },
  ],
  "xiu-bo-er-chu-peng-de-kuang-gong": [
    { file: "miner-concept.webp", caption: "角色设定与感染过程", credit: "BrickWorks Games", creditUrl: "https://www.facebook.com/photo.php?fbid=1471942634950322&set=pb.100064037977309.-2207520000&type=3" },
  ],
};

export function getEnemyConcepts(id: string): EnemyConcept[] {
  return ENEMY_CONCEPTS[id] ?? [];
}
