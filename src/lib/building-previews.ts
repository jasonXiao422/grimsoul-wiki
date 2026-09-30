export type BuildingPreview = {
  src: string;
  alt: string;
  caption: string;
};

export const BUILDING_PREVIEWS: Record<string, BuildingPreview[]> = {
  "ji-jian-jia-ren": [
    {
      src: "/images/pages/ji-jian-jia-ren-preview.webp",
      alt: "击剑假人摆放在地面上，头部装有各种头饰与面具。",
      caption: "击剑假人装上头部后的效果",
    },
  ],
};

export function getBuildingPreviews(id: string): BuildingPreview[] {
  return BUILDING_PREVIEWS[id] ?? [];
}
