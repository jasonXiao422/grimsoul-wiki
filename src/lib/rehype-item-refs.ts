import amulets from '../data/amulets.json';
import armor from '../data/armor.json';
import armorPieces from '../data/armor-pieces.json';
import backpacks from '../data/backpacks.json';
import consumables from '../data/consumables.json';
import enemies from '../data/enemies.json';
import runes from '../data/runes.json';
import scrolls from '../data/scrolls.json';
import shields from '../data/shields.json';
import sharpen from '../data/sharpen.json';
import weapons from '../data/weapons.json';
import { QUALITY_META, type Quality } from './quality';

const ITEM_CATEGORIES = new Set([
  'weapons',
  'armor',
  'armor-pieces',
  'shields',
  'backpacks',
  'amulets',
  'scrolls',
  'runes',
  'consumables',
  'materials',
  'enemies',
  'sharpen',
]);

const SHARPEN_ICON_IDS = new Map(
  sharpen.map((item) => [item.id, item.iconId ?? item.weaponId ?? item.id]),
);

const QUALITY_BY_CATEGORY = new Map<string, Map<string, string>>([
  ['weapons', new Map(weapons.map((item) => [item.id, item.quality]))],
  ['armor', new Map(armor.map((item) => [item.id, item.quality]))],
  ['shields', new Map(shields.map((item) => [item.id, item.quality]))],
  ['backpacks', new Map(backpacks.map((item) => [item.id, item.quality]))],
  ['amulets', new Map(amulets.map((item) => [item.id, item.quality]))],
  ['consumables', new Map(consumables.map((item) => [item.id, item.quality]))],
  ['enemies', new Map(enemies.map((item) => [item.id, item.quality]))],
  ['runes', new Map(runes.map((item) => [item.id, item.quality]))],
  ['scrolls', new Map(scrolls.map((item) => [item.id, item.quality]))],
  ['sharpen', new Map(sharpen.map((item) => [item.id, item.quality]))],
  ['armor-pieces', new Map([
    ...armorPieces.map((item) => [item.id, item.quality] as const),
    ...armor.flatMap((entry) => entry.pieces ?? []).map((item) => [item.id, item.quality] as const),
  ])],
]);

function getQuality(category: string, id: string) {
  const quality = QUALITY_BY_CATEGORY.get(category)?.get(id) as Quality | undefined;
  return quality ? QUALITY_META[quality] : undefined;
}

function isTipsSource(file: { history?: string[]; path?: string }) {
  const paths = [...(file.history ?? []), file.path ?? '']
    .map((path) => path.replaceAll('\\', '/'))
    .join('|');
  return paths.includes('/src/content/tips/');
}

function getItemRef(href: unknown) {
  if (typeof href !== 'string' || !href.startsWith('/')) return undefined;
  const match = href.match(/^\/([^/]+)\/([^/?#]+)$/);
  if (!match || !ITEM_CATEGORIES.has(match[1])) return undefined;

  const [, category, id] = match;
  const iconCategory = category === 'sharpen' ? 'weapons' : category;
  const iconId = category === 'sharpen' ? SHARPEN_ICON_IDS.get(id) ?? id : id;
  return {
    src: `/images/${iconCategory}/${iconId}.webp`,
    qualityMeta: getQuality(category, id),
  };
}

function transformTree(node: { children?: any[] }) {
  for (const child of node.children ?? []) {
    if (child.type === 'element' && child.tagName === 'a') {
      const itemRef = getItemRef(child.properties?.href);
      if (itemRef) {
        const existingClasses = child.properties?.className;
        const classes = Array.isArray(existingClasses)
          ? existingClasses
          : existingClasses
            ? [existingClasses]
            : [];
        child.properties = {
          ...child.properties,
          className: [...classes, 'item-ref'],
        };
        child.children = [
          {
            type: 'element',
            tagName: 'img',
            properties: {
              className: ['item-ref-icon', itemRef.qualityMeta && 'quality-icon'].filter(Boolean),
              src: itemRef.src,
              alt: '',
              onerror: 'this.hidden=true',
              ...(itemRef.qualityMeta
                ? {
                    style: `--quality-border:${itemRef.qualityMeta.border};--quality-glow:${itemRef.qualityMeta.glow}`,
                  }
                : {}),
            },
            children: [],
          },
          {
            type: 'element',
            tagName: 'span',
            properties: {},
            children: child.children ?? [],
          },
        ];
        continue;
      }
    }

    if (child.children) transformTree(child);
  }
}

export default function rehypeItemRefs() {
  return (tree: { children?: any[] }, file: { history?: string[]; path?: string }) => {
    if (isTipsSource(file)) transformTree(tree);
  };
}
