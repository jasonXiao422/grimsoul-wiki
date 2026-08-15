/**
 * 五个数据类别的统一配置。
 * 列表页 / 详情页 / 搜索索引全部由这个对象驱动，
 * 新增类别只需在这里加一项，不要复制页面代码。
 */
export interface ColumnDef {
  key: string;
  label: string;
  /** 是否可点击排序 */
  sortable?: boolean;
  /** 数值列右对齐 */
  numeric?: boolean;
}

export interface CategoryDef {
  slug: string;
  label: string;
  /** 首页六宫格用的一句话说明 */
  blurb: string;
  /** 列表页显示哪些列 */
  columns: ColumnDef[];
  /** 可筛选的字段 */
  filters: string[];
}

export const CATEGORIES: CategoryDef[] = [
  {
    slug: 'weapons',
    label: '武器',
    blurb: '各类近战与远程武器的伤害、耐久与合成配方',
    columns: [
      { key: 'name', label: '名称', sortable: true },
      { key: 'type', label: '类型', sortable: true },
      { key: 'rarity', label: '稀有度', sortable: true },
      { key: 'damage', label: '伤害', sortable: true, numeric: true },
      { key: 'attackSpeed', label: '攻速', sortable: true, numeric: true },
      { key: 'durability', label: '耐久', sortable: true, numeric: true },
      { key: 'reqLevel', label: '需求等级', sortable: true, numeric: true },
    ],
    filters: ['type', 'rarity'],
  },
  {
    slug: 'armors',
    label: '护甲',
    blurb: '护甲值、套装效果与部位搭配',
    columns: [
      { key: 'name', label: '名称', sortable: true },
      { key: 'slot', label: '部位', sortable: true },
      { key: 'rarity', label: '稀有度', sortable: true },
      { key: 'armor', label: '护甲', sortable: true, numeric: true },
      { key: 'durability', label: '耐久', sortable: true, numeric: true },
      { key: 'reqLevel', label: '需求等级', sortable: true, numeric: true },
    ],
    filters: ['slot', 'rarity', 'set'],
  },
  {
    slug: 'enemies',
    label: '敌人',
    blurb: '血量、掉落、弱点与应对打法',
    columns: [
      { key: 'name', label: '名称', sortable: true },
      { key: 'tier', label: '等级', sortable: true },
      { key: 'hp', label: '血量', sortable: true, numeric: true },
      { key: 'damage', label: '伤害', sortable: true, numeric: true },
      { key: 'locations', label: '出没地点' },
    ],
    filters: ['tier', 'locations'],
  },
  {
    slug: 'scrolls',
    label: '卷轴',
    blurb: '各类卷轴的效果、可用地点与获取方式',
    columns: [
      { key: 'name', label: '名称', sortable: true },
      { key: 'effect', label: '效果' },
      { key: 'duration', label: '持续' },
      { key: 'usableIn', label: '可用地点' },
    ],
    filters: ['usableIn'],
  },
  {
    slug: 'buildings',
    label: '建筑',
    blurb: '营地建筑的功能、升级材料与解锁条件',
    columns: [
      { key: 'name', label: '名称', sortable: true },
      { key: 'function', label: '功能' },
      { key: 'maxLevel', label: '最高等级', sortable: true, numeric: true },
    ],
    filters: [],
  },
];

export const CATEGORY_BY_SLUG = Object.fromEntries(
  CATEGORIES.map((c) => [c.slug, c])
);
