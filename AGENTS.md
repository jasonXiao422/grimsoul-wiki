# 项目说明（给 AI 编码助手看的）

《Grim Soul: Dark Fantasy Survival》玩家自制中文攻略站。
纯静态站点，Astro 5 + TypeScript，部署到 Cloudflare Pages。

## 铁律

1. **界面文案一律中文**，代码注释可中文，变量名/函数名用英文。
2. **id 一律小写英文 + 连字符**（`iron-sword`），因为 id 会变成图片文件名和 URL。
   绝不使用中文 id。
3. **五个数据类别共用同一套组件**，通过 `src/lib/categories.ts` 的配置对象驱动。
   禁止为每个类别复制粘贴一份页面代码。
4. 每次改动完成后必须能通过 `npm run build`。
5. 不引入 UI 框架（不用 Tailwind / Bootstrap / MUI），手写 CSS。

## 视觉规范

参考游戏官网 brickworksgames.com/grimsoul 的暗黑幻想风格。
所有颜色和字体在 `src/styles/global.css` 用 CSS 变量定义，其他地方只引用变量：

```css
--bg:        #131416;  /* 主背景，与官网一致 */
--bg-panel:  #1b1d21;  /* 卡片/面板 */
--border:    #2c2f35;
--text:      #d8d4cc;
--text-dim:  #8a8579;
--accent:    #c9a227;  /* 暗金，强调色 */
--accent-dim:#8a6f1a;
```

标题用衬线字体，正文用无衬线。中文字体栈需包含 `Noto Serif SC` / `Noto Sans SC` 的回退。

## 数据层

`src/data/` 下 6 个 JSON：
`materials` `weapons` `armors` `enemies` `scrolls` `buildings`

- 所有 schema 定义在 `src/lib/schema.ts`（zod），build 时校验
- 校验必须检查：字段缺失、id 重复、craft.cost 里引用了不存在的 material id
- 任一校验失败要让 build 退出码非 0

**材料引用规则**：weapons / armors / buildings 的 `craft.cost` 里只写 material 的 id，
渲染时从 `materials.json` 查表带出名称和图标。绝不在配方里硬编码材料名。

**稀有度**：只存英文 key，中文名和颜色映射在 `src/lib/rarity.ts`：
`common` 普通(灰) / `uncommon` 优秀(绿) / `rare` 稀有(蓝) / `epic` 史诗(紫) / `legendary` 传说(橙)

## 图片规则

- 路径按 `/images/<类别>/<id>.webp` **自动拼接**，JSON 里不写 icon 字段
- 缺图时显示占位符，不要报错崩页面
- `scripts/check-icons.mjs` 检查缺图，已挂在 `prebuild`

## 页面清单

| 路径 | 说明 |
|---|---|
| `/` | Hero + 六宫格入口（显示各类别条目数）+ 最近更新 |
| `/lore` | 背景故事，读取 `src/content/lore/*.md` |
| `/weapons` 等五个 | 列表页，复用 DataTable |
| `/weapons/[id]` 等 | 详情页，getStaticPaths 从 JSON 生成 |
| `/materials/[id]` | 材料页，反向列出"哪些配方用到它" |

## 组件清单

- `DataTable.astro` — 通用列表：表头排序、实时搜索、多条件筛选、手机横向滚动
- `DetailPanel.astro` — 详情：属性表 + 合成配方（材料图标可点击跳转）
- `ImageZoom.astro` — 点击全屏放大，ESC 关闭
- `SearchBox.astro` — 跨类别模糊搜索，纯客户端，build 时生成精简索引

## 页脚必须包含

> 本站为玩家自制非官方攻略站，与 Brickworks Games Ltd. 无隶属关系。
> 游戏素材版权归原作者所有。

## Git 约定

- 提交信息用中文，格式：`类型: 说明`，如 `数据: 新增 12 件传说武器`
- 类型可选：`数据` `功能` `样式` `修复` `文档`
- 不要提交 `node_modules/` `dist/` `.astro/`

## 中文站专项规则（重要）

本站面向中文玩家，界面上不允许出现英文条目名。

### 显示层

- 玩家可见的一切文字用中文：条目名、属性标签、稀有度、按钮、提示、404 页
- `id` 只用于图片文件名和 URL，**绝不直接渲染到页面上**
- 稀有度、部位、敌人等级等枚举值，一律经 `src/lib/` 下的映射表转成中文再显示

### 字体

`global.css` 里必须定义包含中文回退的字体栈，不能只写英文字体：

```css
--font-serif: 'Noto Serif SC', 'Source Han Serif SC', 'Songti SC', serif;
--font-sans:  'Noto Sans SC', 'PingFang SC', 'Microsoft YaHei', sans-serif;
```

字体通过 `@font-face` + `font-display: swap` 引入，并做 subset 处理，
避免加载整个中文字体包（完整包动辄 10MB+）。

### 排序

中文排序必须用 `localeCompare`，不能用默认的 Unicode 比较：

```js
list.sort((a, b) => a.name.localeCompare(b.name, 'zh-Hans-CN'));
```

### 搜索

`SearchBox` 需同时匹配三种输入：
1. 中文全称或部分（"铁剑" / "铁"）
2. 全拼（"tiejian"）
3. 首字母缩写（"tj"）

用 `pinyin-pro` 在 build 时预生成拼音索引，写进搜索索引 json，
不要在客户端实时转拼音。

### 数字与单位

- 属性数值右对齐，中文标签左对齐
- 时间统一写成 `30秒` / `5分钟`，不要 `30s` / `5m`
- 百分比写 `25%`，不要 `0.25`

### 排版细节

- 中英文混排时数字和中文之间不加空格（`伤害24` 不写成 `伤害 24`），
  但在表格中数字单独成列时不适用此规则
- `line-height` 中文正文用 1.75，比英文站更宽松
- 标题不要用 `letter-spacing` 的负值，中文字符会挤在一起
