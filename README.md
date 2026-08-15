# 灰蚀之地 · Grim Soul 中文攻略站

玩家自制的《Grim Soul: Dark Fantasy Survival》中文攻略站。
纯静态站点，Astro + TypeScript，部署在 Cloudflare Pages。

## 本地开发

```bash
npm install
npm run dev      # http://localhost:4321
npm run build    # 构建前会自动校验数据和检查缺图
```

## 日常维护：加一条数据

以新增一件武器为例，只需两步：

1. 在 `src/data/weapons.json` 里加一个对象（id 用小写英文连字符）
2. 把图标存成 `public/images/weapons/<同样的id>.webp`

然后提交：

```bash
git add .
git commit -m "数据: 新增 圣殿骑士剑"
git push
```

推送后 Cloudflare Pages 会自动构建部署，大约一分钟后网站更新。

## 图标处理

游戏内背包截图可以批量裁切：

```bash
./scripts/crop-icons.sh 背包截图.png ./cropped
```

坐标参数需要按你的截图分辨率调整，脚本里有说明。
裁完手动重命名成对应 id，移到 `public/images/<类别>/`。

## 数据规范

见 `AGENTS.md`。核心两条：

- **id 一律小写英文**，因为它同时是图片文件名和 URL
- **配方里只写材料 id**，不写材料名，渲染时从 `materials.json` 查表

`npm run build` 会自动检查 id 重复、配方引用了不存在的材料等问题。

## 声明

本站为玩家自制非官方攻略站，与 Brickworks Games Ltd. 无隶属关系。
游戏素材版权归原作者所有。
