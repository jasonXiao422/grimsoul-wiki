/**
 * 六个数据类别的统一配置。
 * 列表页、详情页、搜索索引全部由这个对象驱动。
 * 新增类别只需在这里加一项，不要复制页面代码。
 */
export interface ColumnDef {
  key: string;
  label: string;
  sortable?: boolean;
  /** 数值列右对齐 */
  numeric?: boolean;
  /** 特殊渲染方式，组件里按这个分支处理 */
  render?: 'element' | 'durability' | 'cost' | 'tier' | 'list';
}

export interface CategoryDef {
  slug: string;
  label: string;
  blurb: string;
  /** 对应 src/data/<file>.json */
  file: string;
  columns: ColumnDef[];
  filters: string[];
  /** 按这个字段分组展示；null 表示平铺 */
  groupBy?: string | null;
  /** 列表默认排序字段 */
  defaultSort?: string;
}

export const CATEGORIES: CategoryDef[] = [
  {
    slug: 'weapons',
    label: '武器',
    blurb: '124 件武器的伤害、攻速、攻距与合成配方',
    file: 'weapons',
    columns: [
      { key: 'name', label: '名称', sortable: true },
      { key: 'damage', label: '物理伤害', sortable: true, numeric: true },
      { key: 'skillBonus', label: '满级技能', sortable: true, numeric: true },
      { key: 'element', label: '固定元素伤害', render: 'element' },
      { key: 'attackSpeed', label: '攻速', sortable: true, numeric: true },
      { key: 'range', label: '攻距', sortable: true, numeric: true },
      { key: 'durability', label: '耐久', sortable: true, numeric: true, render: 'durability' },
    ],
    filters: [],
    defaultSort: 'damage',
  },
  {
    slug: 'armor',
    label: '护甲',
    blurb: '33 套套装的护甲值、套装效果与部件构成',
    file: 'armor',
    columns: [
      { key: 'name', label: '套装', sortable: true },
      { key: 'tier', label: '品阶', sortable: true, render: 'tier' },
      { key: 'totalArmor', label: '总护甲', sortable: true, numeric: true },
      { key: 'durability', label: '耐久', sortable: true, numeric: true, render: 'durability' },
    ],
    filters: ['tier'],
    defaultSort: 'tier',
  },
  {
    slug: 'shields',
    label: '盾牌',
    blurb: '14 面盾牌的格挡机制与护甲值',
    file: 'shields',
    columns: [
      { key: 'name', label: '名称', sortable: true },
      { key: 'armor', label: '护甲值', sortable: true, numeric: true },
      { key: 'block', label: '格挡效果' },
      { key: 'durability', label: '耐久', sortable: true, numeric: true, render: 'durability' },
      { key: 'effect', label: '特殊效果' },
    ],
    filters: [],
    defaultSort: 'armor',
  },
  {
    slug: 'backpacks',
    label: '驮篮',
    blurb: '29 个驮篮的槽位、元素防护与特殊效果',
    file: 'backpacks',
    columns: [
      { key: 'name', label: '名称', sortable: true },
      { key: 'slots', label: '槽位', sortable: true, numeric: true },
      { key: 'protection', label: '元素防护', render: 'element' },
      { key: 'effect', label: '特殊效果' },
    ],
    filters: ['slots'],
    defaultSort: 'slots',
  },
  {
    slug: 'enemies',
    label: '敌人',
    blurb: '124 只敌人的生命、护甲、伤害与出没地点',
    file: 'enemies',
    columns: [
      { key: 'name', label: '名称', sortable: true },
      { key: 'hp', label: '生命', sortable: true, numeric: true },
      { key: 'armor', label: '护甲', sortable: true, numeric: true },
      { key: 'damageReduction', label: '减伤%', sortable: true, numeric: true },
      { key: 'physicalDamage', label: '物理伤害', sortable: true, numeric: true },
      { key: 'elementDamage', label: '元素伤害' },
      { key: 'locations', label: '出没地点', render: 'list' },
    ],
    filters: ['group'],
    groupBy: 'group',
  },
  {
    slug: 'materials',
    label: '材料',
    blurb: '49 种材料，可反查哪些配方用到它',
    file: 'materials',
    columns: [
      { key: 'name', label: '名称', sortable: true },
      { key: 'usedIn', label: '配方数', sortable: true, numeric: true },
    ],
    filters: [],
    defaultSort: 'usedIn',
  },
  {
    slug: 'orders',
    label: '骑士团',
    blurb: '14 支帝国骑士团的时代、领主、职责与最终命运',
    file: 'knight-orders',
    columns: [
      { key: 'name', label: '名称', sortable: true },
      { key: 'ordinal', label: '序号', sortable: true },
      { key: 'eraLabel', label: '时代' },
      { key: 'status', label: '状态', sortable: true },
      { key: 'leader', label: '领主' },
      { key: 'summary', label: '概述' },
    ],
    filters: ['era', 'status'],
    groupBy: 'era',
    defaultSort: 'ordinal',
  },
];

export const CATEGORY_BY_SLUG = Object.fromEntries(
  CATEGORIES.map((c) => [c.slug, c])
);

/** 护甲散件单独存在 armor-pieces.json，不作为独立板块，只在搜索和材料反查里出现。 */
export const EXTRA_FILES = ['armor-pieces'] as const;
