# 设计规范 · 古旧图鉴风格

本站所有样式改动都必须遵守本规范。新增组件前先对照本文件。

## 一、风格定位

关键词：古旧手稿、档案、图鉴、账簿。

- 克制：装饰只用细线与几何角标，不用插画式花纹
- 圆角：保留站内现有圆角，不改为直角
- 暗金：线条与强调色统一用暗金，不引入新颜色
- 衬线：标题与数字用衬线字体，正文保持无衬线以保证可读性

## 二、设计变量（写在 :root）

```css
/* 线条 */
--line: rgba(255, 255, 255, 0.07);                                      /* 默认边框 */
--line-strong: rgba(255, 255, 255, 0.12);                               /* 强调边框、分隔线 */
--line-gold: color-mix(in srgb, var(--accent-dim) 55%, transparent);     /* 卡片角标 */
--line-hover: color-mix(in srgb, var(--accent) 65%, transparent);       /* 悬停 */
--fill-input: color-mix(in srgb, var(--bg-panel) 85%, white 3%);         /* 输入框底色 */

/* 底色 */
--surface: color-mix(in srgb, var(--bg-panel) 88%, var(--accent-dim));  /* 卡片底，带极淡的金色倾向 */
--surface-active: color-mix(in srgb, var(--bg-panel) 80%, var(--accent-dim));

--tint-green: #16241f;      /* 仅用于背景渐变 */
--tint-mist: #34423c;       /* 背景底部雾带的灰绿色，只用于全站背景 */

/* 实体面板 */
--surface-top: #26272b;
--surface-bottom: #1d1e21;
--surface-edge: rgba(0, 0, 0, 0.85);
--surface-highlight: inset 0 1px 0 rgba(255, 255, 255, 0.06), inset 0 0 0 1px rgba(255, 255, 255, 0.025);
--surface-shadow: 0 10px 28px rgba(0, 0, 0, 0.45), 0 2px 6px rgba(0, 0, 0, 0.35);

/* 立体感 */
--card-fill: linear-gradient(180deg, color-mix(in srgb, var(--bg-panel) 92%, var(--accent-dim)) 0%, var(--bg-panel) 100%);
--card-highlight: inset 0 1px 0 color-mix(in srgb, var(--accent-dim) 25%, transparent);
--card-shadow: 0 1px 2px rgba(0, 0, 0, 0.45), 0 8px 24px rgba(0, 0, 0, 0.35);
--card-shadow-hover: 0 2px 4px rgba(0, 0, 0, 0.5), 0 14px 32px rgba(0, 0, 0, 0.45);
--icon-inset: inset 0 2px 6px rgba(0, 0, 0, 0.55), inset 0 -1px 0 color-mix(in srgb, var(--accent-dim) 20%, transparent);

/* 字体 */
--kicker-size: 0.72rem;
--kicker-spacing: 0.28em;
```

所有颜色都由现有变量调配，不写新的色值。唯一例外是背景用的 --tint-green、--tint-mist，以及本节规定的透明白和 color-mix 调配。

### 品阶颜色与排序

品阶统一按 `T` 后的数字升序；同一数字中，不带 `+` 的品阶排在带 `+` 的品阶之前。无法解析或为空的品阶排在最后。品阶颜色按相邻品阶的色彩递进规律维护，`+` 品阶使用同档位更明亮、更饱和的颜色；新增数字品阶时沿用这一规律补充颜色。

当前映射包含：`T1`、`T1+`、`T2`、`T2+`、`T3`、`T3+`、`T4`、`T4+`、`T5`、`T5+`、`T6`、`T6+`。其中 `T1+` 使用 `#848872`，取 `T1` 与 `T2` 现有配色之间的过渡色。

## 三、装饰元件

### 1. 角标

框体右下角一个 L 形细线，像书页角标。

- 位置：距右、下各 10px
- 尺寸：10px × 10px
- 线：右边与下边各 1px，颜色 var(--line-gold)
- 角标位于圆角内侧，不与边框圆弧重叠
- 悬停时随边框一起变为 var(--line-hover)
- 实现：::after 伪元素，pointer-events: none

### 2. 分隔线

章节之间的分隔：一条细线，正中一个菱形。

- 线：1px，var(--line)
- 菱形：6px 见方，旋转 45 度，1px 边框 var(--line-strong)，底色与页面背景相同
- 上下间距 40px

### 3. 引导小字（kicker）

放在大标题上方的英文或中文小字，例如 CHOOSE YOUR PATH、THE ARMOURY。

- 字号 var(--kicker-size)，字距 var(--kicker-spacing)，大写
- 颜色 var(--accent-dim)
- 与下方标题间距 8px

### 4. 图标框

线稿图标外套一个方框。

- 方框沿用现有圆角，1px var(--line)，内边距 10px
- 图标颜色 var(--accent-dim)，悬停 var(--accent)

### 5. 水印序号

卡片内的大号序号，如 01、02。

- 衬线字体，字号约 3.5rem，颜色 var(--line)
- 绝对定位在右下角，位于角标内侧，不遮挡内容
- 仅用于有顺序意义的卡片（首页分类、世界观篇目）

## 四、组件规则

| 组件 | 规则 |
|---|---|
| 卡片 | 保留现有圆角；1px var(--line) 中性淡色边框；底 var(--surface)；角标使用 var(--line-gold)；悬停边框 var(--line-hover) |
| 面板（详情页内容区） | 保留现有圆角；1px var(--line) 中性淡色边框；不带角标 |
| 按钮 | 保留现有圆角；1px var(--line-strong)；透明底；悬停边框 var(--line-hover)、文字 var(--accent) |
| 输入框、搜索框 | 保留现有圆角；1px transparent；底 var(--fill-input)；聚焦时边框 var(--line-hover)，不用发光阴影 |
| 标签 | 保留现有圆角；1px var(--line)；字号略小 |
| 表格 | 外框 1px var(--line)；表头底部 1px var(--line-strong)；行间 1px var(--line) |
| 导航当前项 | 底 var(--surface-active)；左侧 2px var(--accent) 竖条 |
| 桌面导航按键与背景音乐按钮 | 采用同一套立体按键样式；默认状态凸起，当前项或开启状态按下并发光；悬停不变金色；仅桌面导航使用，990px 及以下汉堡菜单保持原样 |
| 面包屑 | 分隔符用 / ，颜色 var(--line-strong) |
| 分页 | 保留现有圆角；当前页边框 var(--accent-dim)、底 var(--surface-active) |
| 数字统计 | 衬线字体，tabular-nums |

### 列表名称悬停变暗金

- 表格列表的名称链接使用 `.item-link`，链接只包住图标与名称文字，宽度按内容计算，不占满整格。
- 桌面鼠标悬停或键盘 `:focus-visible` 时，名称文字使用 `var(--accent)`；颜色变化使用 `0.12s ease` 过渡。
- 品质色通过更高优先级覆盖，图标品质边框与光晕保持不变。
- 整卡链接保持整卡可点击，但只将卡片内部名称文字变为 `var(--accent)`。

金色只用于强调与交互，包括悬停、选中、当前项、主要按钮、提示框、引用块、状态标签与关键数字；普通边框与分隔线一律使用中性淡色。

## 五、页面背景

主色调为深灰与暗金，墨绿只作为背景中的一抹渐变，不用于文字、边框和组件。

- 底色保持深灰 var(--bg)
- 背景随页面滚动，由三层径向渐变与 var(--bg) 底色组成
- 墨绿通过变量 --tint-green 引入，灰绿色雾带通过 --tint-mist 引入，只允许在背景渐变中使用
- 不使用颗粒纹理、固定背景层或背景图片

## 六、立体感

入口卡片、资料卡片与面板统一使用实体材质，像嵌在书页上的金属铭牌。

- 填充：自上而下的轻微渐变，上方略亮、下方略暗
- 高光：顶部 1px 内阴影，极淡的暗金
- 投影：两层柔和投影，一层贴近、一层扩散，只用透明黑
- 悬停：上移 2px，投影加深，边框变亮
- 图标框：内凹效果，内阴影使图标像嵌在框里
- 面板填充使用 `linear-gradient(to bottom, var(--surface-top), var(--surface-bottom))`
- 面板边框使用 1px `var(--surface-edge)`，高光与投影使用 `var(--surface-highlight)`、`var(--surface-shadow)`
- 浮层、表格内部行与吸顶表头保持各自的毛玻璃或行背景规则

## 七、毛玻璃

原则：毛玻璃只用于浮在内容之上的层，背后有内容透出才有效果；平铺的卡片、面板、正文区域不使用。

适用位置：导航下拉菜单、手机汉堡菜单、搜索结果下拉、表格吸顶表头、回到顶部按钮、图片放大弹窗的背景遮罩、提示浮层。

不适用：页头保持不透明，避免正文文字从下方透出影响阅读；首页大图保持原样，不加任何框体。

```css
--glass-bg: color-mix(in srgb, var(--bg-panel) 70%, transparent);
--glass-bg-strong: color-mix(in srgb, var(--bg-panel) 85%, transparent);
--glass-border: rgba(255, 255, 255, 0.08);
--glass-highlight: inset 0 1px 0 rgba(255, 255, 255, 0.06);
--glass-blur: blur(16px) saturate(140%);
--glass-shadow: 0 12px 32px rgba(0, 0, 0, 0.35);
```

规则：背景使用 `var(--glass-bg)`，`backdrop-filter` 与 `-webkit-backdrop-filter` 使用 `var(--glass-blur)`；边框为 1px `var(--glass-border)`，顶部高光使用 `var(--glass-highlight)`；浮起的层加 `var(--glass-shadow)`，页头与吸顶表头不加投影；文字较多的浮层使用 `var(--glass-bg-strong)`；使用 `@supports not (backdrop-filter: blur(1px))` 回退为实色 `var(--bg-panel)`；639px 以下模糊降为 `blur(10px)`；同一屏不叠加两层以上毛玻璃。

### 透明毛玻璃

透明毛玻璃用于悬停浮窗等轻量浮层，强调保留背景透出，同时保持文字与标签清晰。

```css
--clear-glass-bg: rgba(16, 18, 20, 0.28);
--clear-glass-blur: blur(16px) saturate(160%);
--clear-glass-border: rgba(255, 255, 255, 0.14);
--clear-glass-highlight: inset 0 1px 0 rgba(255, 255, 255, 0.10);
--clear-glass-shadow: 0 8px 24px rgba(0, 0, 0, 0.35);
- 详情页内指向其他物品的链接同样适用名称悬停变暗金规则；只覆盖名称文字，不改变可点击区域与布局。
--clear-glass-tag-bg: rgba(255, 255, 255, 0.07);
--clear-glass-tag-border: rgba(255, 255, 255, 0.12);
```

- 详情页内指向其他物品的链接同样适用名称悬停变暗金规则；只覆盖名称文字，不改变可点击区域与布局。

透明毛玻璃只作用于轻量浮层，不改变导航下拉菜单和全站其他标签的材质。

## 八、动效

- 只做颜色、透明度、投影与 2px 以内的位移过渡，时长 0.2s
- 不做缩放、弹跳等动效
- 遵守 prefers-reduced-motion

## 九、禁止事项

- 不用发光效果；投影只用于第六、七节规定的组件
- 不引入新颜色值
- 不使用大面积纹理图片
- 装饰元件不得遮挡或干扰正文内容

## 十、响应式

- 页头、导航与首页布局必须流式自适应，禁止使用固定像素宽度撑开页面。
- 禁止使用 `100vw` 作为宽度、外边距或内边距的计算依据；全宽区块放在正文容器之外实现。
- 全宽区块应通过布局容器与 `width: 100%` 实现，避免 Windows 滚动条宽度参与布局。
- 任何新增元素都必须在 390px、1000px、1920px 三种宽度下确认不会撑出横向滚动。
