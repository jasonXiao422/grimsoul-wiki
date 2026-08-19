/**
 * 数据类别的统一配置。
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
  render?: 'element' | 'durability' | 'cost' | 'tier' | 'list' | 'quality';
  /** 排序时改用另一个字段。显示的值是混合写法、无法直接比较时用，
   *  例如食物的「持续治愈」显示「瞬间120，240」，排序用 healingSort 的 360 */
  sortKey?: string;
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
  /** 默认排序方向，缺省为 asc */
  defaultSortDir?: 'asc' | 'desc';
}

export const CATEGORIES: CategoryDef[] = [
  {
    slug: 'weapons',
    label: '武器',
    blurb: '伤害、攻速与合成配方',
    file: 'weapons',
    columns: [
      { key: 'name', label: '名称', sortable: true, render: 'quality' },
      { key: 'damage', label: '物理伤害', sortable: true, numeric: true },
      { key: 'skillBonus', label: '满级技能', sortable: true, numeric: true },
      { key: 'element', label: '元素伤害', render: 'element' },
      { key: 'attackSpeed', label: '攻速', sortable: true, numeric: true },
      { key: 'range', label: '攻距', sortable: true, numeric: true },
      { key: 'durability', label: '耐久', sortable: true, numeric: true, render: 'durability' },
    ],
    filters: ['element.type', 'quality'],
    defaultSort: 'damage',
  },
  {
    slug: 'armor',
    label: '护甲',
    blurb: '护甲值、套装效果与部件',
    file: 'armor',
    columns: [
      { key: 'name', label: '名称', sortable: true, render: 'quality' },
      { key: 'tier', label: '品阶', sortable: true, render: 'tier' },
      { key: 'totalArmor', label: '总护甲', sortable: true, numeric: true },
      { key: 'protection', label: '元素防护', render: 'element' },
      { key: 'durability', label: '耐久', sortable: true, numeric: true, render: 'durability' },
      { key: 'obtain', label: '获取途径', sortable: true },
    ],
    filters: ['tier', 'quality', 'obtain'],
    defaultSort: 'tier',
  },
  {
    slug: 'shields',
    label: '盾牌',
    blurb: '防御值、格挡效果与获取',
    file: 'shields',
    columns: [
      { key: 'name', label: '名称', sortable: true, render: 'quality' },
      { key: 'armor', label: '防御值', sortable: true, numeric: true },
      { key: 'durability', label: '耐久', sortable: true, numeric: true, render: 'durability' },
      { key: 'obtain', label: '获取途径', sortable: true },
    ],
    filters: ['quality', 'obtain'],
    defaultSort: 'armor',
  },
  {
    slug: 'backpacks',
    label: '驮篮',
    blurb: '储存栏位与元素防护',
    file: 'backpacks',
    columns: [
      { key: 'name', label: '名称', sortable: true, render: 'quality' },
      { key: 'slots', label: '储存栏', sortable: true, numeric: true },
      { key: 'protection', label: '元素防护', render: 'element' },
      { key: 'obtain', label: '获取途径', sortable: true },
    ],
    filters: ['slots', 'quality', 'obtain'],
    defaultSort: 'slots',
  },
  {
    slug: 'amulets',
    label: '护符',
    blurb: '品质、耐久与元素防护',
    file: 'amulets',
    columns: [
      { key: 'name', label: '名称', sortable: true, render: 'quality' },
      { key: 'durability', label: '耐久', sortable: true, numeric: true, render: 'durability' },
      { key: 'protection', label: '元素防护', render: 'element' },
    ],
    filters: ['quality'],
    defaultSort: 'quality',
  },
  {
    slug: 'scrolls',
    label: '卷轴',
    blurb: '效果、持续时间与品质',
    file: 'scrolls',
    columns: [
      { key: 'name', label: '名称', sortable: true, render: 'quality' },
      { key: 'effect', label: '特殊效果' },
    ],
    filters: ['quality'],
    defaultSort: 'quality',
  },
  {
    slug: 'runes',
    label: '符文',
    blurb: '放置类道具的效果与品质',
    file: 'runes',
    columns: [
      { key: 'name', label: '名称', sortable: true, render: 'quality' },
      { key: 'effect', label: '特殊效果' },
    ],
    filters: ['quality'],
    defaultSort: 'quality',
  },
  {
    slug: 'consumables',
    label: '食物&药剂',
    blurb: '治愈量、饱食度与制作地点',
    file: 'consumables',
    columns: [
      { key: 'name', label: '名称', sortable: true, render: 'quality' },
      { key: 'healing', label: '持续治愈', sortable: true, numeric: true, sortKey: 'healingSort' },
      { key: 'satiety', label: '饱食度', sortable: true, numeric: true },
      { key: 'thirst', label: '口渴值', sortable: true, numeric: true },
      { key: 'craftedAt', label: '制作地点', sortable: true },
    ],
    filters: ['quality', 'craftedAt'],
    defaultSort: 'healing',
    defaultSortDir: 'desc',
  },
  {
    slug: 'enemies',
    label: '敌人',
    blurb: '生命、减伤与出没地点',
    file: 'enemies',
    columns: [
      { key: 'name', label: '名称', sortable: true, render: 'quality' },
      { key: 'hp', label: '生命', sortable: true, numeric: true },
      { key: 'damageReduction', label: '减伤%', sortable: true, numeric: true },
      { key: 'physicalDamage', label: '物理伤害', sortable: true, numeric: true },
      { key: 'elementDamage', label: '元素伤害', render: 'element' },
    ],
    filters: ['group', 'quality'],
    groupBy: 'group',
  },
  {
    slug: 'materials',
    label: '材料',
    blurb: '反查哪些配方用到它',
    file: 'materials',
    columns: [
      { key: 'name', label: '名称', sortable: true },
      { key: 'usedIn', label: '配方数', sortable: true, numeric: true },
    ],
    filters: [],
    defaultSort: 'usedIn',
  },
];

export const CATEGORY_BY_SLUG = Object.fromEntries(
  CATEGORIES.map((c) => [c.slug, c])
);

export const ARMOR_PIECES_TABLE: CategoryDef = {
  slug: 'armor-pieces',
  label: '散件',
  blurb: '不属于套装的单件护甲',
  file: 'armor-pieces',
  columns: [
    { key: 'name', label: '名称', sortable: true, render: 'quality' },
    { key: 'armor', label: '护甲', sortable: true, numeric: true },
    { key: 'durability', label: '耐久', sortable: true, numeric: true, render: 'durability' },
    { key: 'obtain', label: '获取方式', sortable: true },
  ],
  filters: ['quality'],
  defaultSort: 'armor',
};

/** 护甲散件单独存在 armor-pieces.json，不作为独立板块，只在搜索和材料反查里出现。 */
export const EXTRA_FILES = ['armor-pieces'] as const;
