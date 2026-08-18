# 项目说明（给 AI 编码助手看的）

《Grim Soul: Dark Fantasy Survival》玩家自制中文攻略站。
纯静态站点，Astro 5 + TypeScript，部署到 Cloudflare Pages。

> **改动之前请通读本文**。这份文档记录了大量踩过的坑，
> 凭直觉重写代码很可能推翻已有的修复。

## 铁律

1. **界面文案一律中文**，代码注释可中文，变量名/函数名用英文。
2. **id 一律小写英文 + 连字符**（`iron-sword`），因为 id 会变成图片文件名和 URL。
   绝不使用中文 id。
3. **所有数据类别共用同一套组件**，通过 `src/lib/categories.ts` 的配置对象驱动。
   禁止为每个类别复制粘贴一份页面代码。
4. **列表页不放长文本**。效果、套装效果、敌人介绍这类描述只在详情页出现。
   这条被回退过多次，改动列表配置时务必复查。
5. 每次改动完成后必须能通过 `npm run build`。
6. 不引入 UI 框架（不用 Tailwind / Bootstrap / MUI），手写 CSS。

## 视觉规范

参考游戏官网 brickworksgames.com/grimsoul 的暗黑幻想风格。
**站点是纯暗色，没有浅色模式**，不要写 `prefers-color-scheme` 分支。

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

标题用衬线字体，正文用无衬线。目前使用系统字体回退，
`public/fonts/` 下没有自定义字体文件，**不要引用不存在的 woff2**。

## 数据层

`src/data/` 下的 JSON **全部由脚本从 Excel 生成，绝不手工编辑**。
手改会在下次 `npm run import` 时被覆盖。

| 文件 | 内容 |
|---|---|
| `weapons.json` | 武器 |
| `armor.json` | 护甲套装，每套内嵌 5 件 `pieces` |
| `armor-pieces.json` | 不属于套装的散件 |
| `shields.json` | 盾牌 |
| `backpacks.json` | 驮篮 |
| `amulets.json` | 护符 |
| `enemies.json` | 敌人，`group` 字段是地点大类 |
| `materials.json` | **从所有配方自动反推**，不来自任何 Excel |
| `knight-orders.json` | 骑士团，**唯一手工维护的 JSON** |

**条目数量不要写死在任何地方**，一律从 JSON 实际长度读取。
页面上出现过「124 件武器」而实际有 137 件的问题。

数据源在 `data-source/`，文件名固定不带版本号：

```
武器数据.xlsx  护甲数据.xlsx  盾牌数据.xlsx
驮篮数据.xlsx  敌人数据.xlsx  护符数据.xlsx
```

转换脚本是 `scripts/import_excel.py`，**单一入口，不要拆分成多个脚本**。

## 品质与品阶是两回事

这两个字段经常被搞混，务必分清：

| 字段 | 含义 | 取值 | 配色文件 |
|---|---|---|---|
| `quality` | 物品品质 | `common` / `rare` / `unique` / `legendary` | `src/lib/quality.ts` |
| `tier` | 护甲套装品阶 | `T1` / `T2` / `T2+` … `T6+` | `src/lib/tiers.ts` |

**`quality` 用于**：武器、护甲、盾牌、驮篮、护符、敌人
**`tier` 只用于**：护甲套装

`quality` 的值**不写在 Excel 单元格里，而是由名称单元格的填充底色决定**，
映射表在 `import_excel.py` 的 `QUALITY_BY_FILL`：

| 底色 | 品质 |
|---|---|
| 无填充 | 普通 |
| 蓝 | 稀有 |
| 黄橙 | 独特 |
| 紫（或灰） | 传说 |

同一档位登记了多个相近色值，因为不同表用了不同色板。
遇到未登记的颜色会打印警告并按普通处理，**不要静默吞掉**。

渲染规则：名称文字色取 `QUALITY_META[q].text`，
图标外框 2px 描边取 `border`，外加柔光 `box-shadow` 取 `glow`。
**页面上不显示「普通/稀有/独特/传说」文字，颜色本身即信息**，
只有筛选器里出现中文标签。

## import_excel.py 里已有的机制

**改动这个脚本前先读懂这些，它们都是为解决真实问题而加的。**

| 机制 | 解决什么 |
|---|---|
| `undate(cell)` | Excel 把「10, 30, 40」这类多段数值识别成日期存起来。显示正常但读出来是 datetime。按单元格的 `number_format`（含 m/d/y）反推回原文本 |
| `ID_OVERRIDE` | 拼音相同但物品不同，如青铜锭与青铜钉都是 `qing-tong-ding`。固定 id 避免行序变化导致 id 漂移 |
| `MATERIAL_ALIAS` | 跨表材料译名不一致（绳索/绳子、金属线/线、铜碎片/碎铜片）。统一归并，否则材料表会分裂成两条 |
| `QUALITY_BY_FILL` | 从单元格底色读品质，登记了两套色板 |
| `parse_protection()` | 驮篮与护符的元素防护写法是「防御寒冷15」，与武器的「11 冰」不同 |
| `dr_from_armor()` | 敌人减伤 = 护甲 /（护甲 + 165），向上取整。支持多段值与带前缀的字符串 |
| `link_material_entities()` | 材料名与某个真实条目同名时（如皮驮篮既是驮篮也是升级材料），记录跳转目标写入 `entity` 字段 |
| `cells_of()` | 需要读填充色或数字格式时用它，普通取值用 `rows_of()` |
| `merged_ranges_of()` | 出现地点列的跨行合并单元格装的是分组共用的场地机制说明，不是地点。读出来写进 `groupNote`，该组各行的 `locations` 回退成分组名。`cells_of()` 用的 `read_only` 模式下 worksheet 没有 `merged_cells`，所以这里单独再开一次工作簿 |
| 名称换行清理 | Excel 里 Alt+Enter 的手动换行会进名称，统一压掉 |

**材料引用规则**：所有 `cost` 数组里只存 material 的 id，
渲染时从 `materials.json` 查表带出中文名和图标。绝不硬编码材料名。

## 特殊字段的渲染方式

由 `categories.ts` 里每列的 `render` 决定：

| render | 数据形态 | 渲染为 |
|---|---|---|
| `quality` | 名称列，读同行的 `quality` | 带品质色与外框的名称 |
| `element` | `{type: "冰", value: 11}` | 「冰 11」并按元素配色 |
| `durability` | `{value: 400, unit: "秒"}` | 「400秒」 |
| `cost` | 材料 id 数组 | 材料图标 + 数量，可点击跳转 |
| `tier` | `"T4+"` | 品阶徽章，颜色查 `tiers.ts` |
| `list` | 字符串数组 | 若干标签 |

元素配色统一走 `quality.ts` 导出的 `elementColor()`：
火焰红、寒冷蓝、衰败绿。函数内部已做名称归一，
「火焰」「火」都能识别。

## 页面清单

| 路径 | 说明 |
|---|---|
| `/` | Hero 幻灯片 + 资料入口宫格 + 贡献者 + 联系方式 |
| `/lore` | 背景故事目录，10 篇 |
| `/lore/[slug]` | 单篇背景故事，带 TOC |
| `/orders` `/orders/[id]` | 骑士团，14 支，按时代分四组 |
| `/guides/[slug]` | 机制攻略（马匹机制、护甲与减伤），含交互计算器 |
| 各板块 `/[category]` `/[category]/[id]` | 列表页与详情页 |

顶部导航一级项：武器、护甲、盾牌、驮篮、护符、敌人、其他。
「其他」是下拉，含材料、马匹机制、护甲与减伤。
下拉必须支持点击展开，**不要用纯 CSS hover，手机触屏点不开**。

敌人列表按 `group` 字段分组展示，但搜索要能跨组。
现有分组包括：家里、1-5级图、被弃地下城、酷吏地下城、空降事件/剧情/固定地点副本、
节日活动、衰败摇篮、元素副本、大车炮台、银矿、铜矿、古墓。

## 图片规则

- 路径按 `/images/<文件名>/<id>.webp` **自动拼接**，JSON 里不写 icon 字段
- 套装部件的图标在 `public/images/armor-pieces/`
- 缺图时显示占位符，不要报错崩页面
- `scripts/check-icons.mjs` 检查缺图，挂在 `prebuild`，只警告不中断

## 移动端

已知这几处踩过坑，改动时留意：

- **表格不要撑破视口**。横向滚动必须限制在表格容器内，
  容器用 `overflow-x: auto`，页面本身不能左右拖动
- **表头吸顶已放弃**。移动端与桌面端都不做 sticky，
  多次尝试与横向滚动冲突，不值得继续投入
- **面包屑不要把中间层折叠成不可点的省略号**，
  用户必须能一键返回所属列表页
- **列表页从详情页返回时恢复滚动位置**，用 sessionStorage，
  且不能出现先闪顶部再跳回的抖动
- 卡片用 flex 纵向布局，**标题固定顶部，高度差异吸收在底部**，
  否则同行卡片的标题不对齐

## tools/ 目录

`icon-studio.html` 与 `icon-namer.html` 是浏览器端图标处理工具，
`bg-packer.html` 是首页背景图压缩工具。

**这些不属于站点构建的一部分**。不要修改，不要移进 `public/`，
不要在 astro.config 里引用。

工具内硬编码了全部条目清单，**数据增减后需要重新生成**，
由 `scripts/update-tools.py` 负责更新；它已挂在 `npm run import` 上，
数据导入时会自动更新，不需要单独执行。

## 页脚必须包含

> 本站为玩家自制非官方攻略站，与 Brickworks Games Ltd. 无隶属关系。
> 游戏素材版权归原作者所有。

贡献者分「网站贡献」与「数据贡献」两组，数据写成分组数组便于增减。

## Git 约定

- 提交信息用中文，格式：`类型: 说明`，如 `数据: 新增 12 件传说武器`
- 类型可选：`数据` `功能` `样式` `修复` `文档` `图标` `工具`
- 不要提交 `node_modules/` `dist/` `.astro/`，Excel 临时锁文件 `~$*` 也已忽略

## 日常维护流程

改数据不需要动代码：

```bash
npm run import      # Excel → JSON
npm run build       # 验证，会打印缺图与数据警告
git add . && git commit -m "数据: xxx" && git push
```

push 后 Cloudflare 自动构建部署，1～3 分钟生效。
