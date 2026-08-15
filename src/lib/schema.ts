import { z } from 'zod';
import { RARITIES } from './rarity';

const id = z.string().regex(/^[a-z0-9-]+$/, 'id 只能是小写英文、数字和连字符');
const rarity = z.enum(RARITIES);

const costItem = z.object({
  material: id,
  qty: z.number().int().positive(),
});

const craft = z.object({
  station: id,
  time: z.string(),
  cost: z.array(costItem).min(1),
}).nullable();

export const materialSchema = z.object({
  id,
  name: z.string(),
  category: z.string(),
  source: z.string(),
  note: z.string().optional(),
});

export const weaponSchema = z.object({
  id,
  name: z.string(),
  type: z.string(),
  rarity,
  damage: z.number(),
  attackSpeed: z.number(),
  durability: z.number().int(),
  reqLevel: z.number().int(),
  craft,
  obtain: z.array(z.string()),
  note: z.string().optional(),
});

export const armorSchema = z.object({
  id,
  name: z.string(),
  slot: z.enum(['头部', '胸部', '腿部', '靴子', '盾牌']),
  rarity,
  armor: z.number(),
  durability: z.number().int(),
  reqLevel: z.number().int(),
  set: id.nullable(),
  craft,
  obtain: z.array(z.string()),
  note: z.string().optional(),
});

export const enemySchema = z.object({
  id,
  name: z.string(),
  tier: z.enum(['普通', '精英', 'BOSS']),
  hp: z.number().int(),
  damage: z.number(),
  locations: z.array(z.string()),
  weakness: z.string(),
  behavior: z.string(),
  drops: z.array(z.object({
    item: id,
    type: z.enum(['material', 'weapon', 'armor', 'scroll']),
    chance: z.string(),
  })),
  note: z.string().optional(),
});

export const scrollSchema = z.object({
  id,
  name: z.string(),
  effect: z.string(),
  duration: z.string(),
  usableIn: z.array(z.string()),
  craft,
  obtain: z.array(z.string()),
  note: z.string().optional(),
});

export const buildingSchema = z.object({
  id,
  name: z.string(),
  function: z.string(),
  levels: z.array(z.object({
    level: z.number().int().positive(),
    cost: z.array(costItem),
    unlock: z.string(),
  })).min(1),
  produces: z.array(id),
  note: z.string().optional(),
});

export const SCHEMAS = {
  materials: materialSchema,
  weapons: weaponSchema,
  armors: armorSchema,
  enemies: enemySchema,
  scrolls: scrollSchema,
  buildings: buildingSchema,
} as const;
