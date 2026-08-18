#!/usr/bin/env python3
"""
把 data-source/ 下的 Excel 转成 src/data/ 下的 JSON。

以后拿到新版本数据时：
  1. 用新 Excel 覆盖 data-source/ 里的同名文件（或改下面的 FILES 常量）
  2. 运行  python3 scripts/import_excel.py
  3. 运行  npm run build  确认通过

脚本会在结尾打印一份报告，列出解析失败或数据可疑的条目。
"""
import json
import re
import sys
from datetime import datetime
from pathlib import Path

from openpyxl import load_workbook
from pypinyin import lazy_pinyin

ROOT = Path(__file__).resolve().parent.parent
SRC = ROOT / "data-source"
OUT = ROOT / "src" / "data"

FILES = {
    "weapons": ("武器数据.xlsx", "Sheet1"),
    "armor": ("护甲数据.xlsx", "护甲"),
    "shields": ("盾牌数据.xlsx", "护甲"),
    "backpacks": ("驮篮数据.xlsx", "Sheet1"),
    "enemies": ("敌人数据.xlsx", "敌人生命护甲和伤害"),
    "amulets": ("护符数据.xlsx", "Sheet1"),
}

warnings = []
used_ids = {}


# ---------------------------------------------------------------- 工具函数

def clean(v):
    """去掉首尾空白和全角空格；空值/占位符统一成 None。"""
    if v is None:
        return None
    if isinstance(v, datetime):
        return None  # Excel 把数值误存成日期，原值已丢失
    if isinstance(v, (int, float)):
        return v
    s = str(v).replace("\u3000", " ").strip()
    s = re.sub(r"\s+\n", "\n", s)
    if s in ("", "/", "-", "—"):
        return None
    return s


def text(v):
    c = clean(v)
    return None if c is None else str(c)


# 拼音相同但实为不同物品时，在此固定 id，避免顺序变化导致 id 漂移。
# 例：青铜锭 dìng 与 青铜钉 dīng 去声调后拼音一致。
ID_OVERRIDE = {
    "青铜锭": "qing-tong-ingot",
    "青铜钉": "qing-tong-nail",
}


def make_id(name, prefix=""):
    fixed = ID_OVERRIDE.get(re.sub(r"[（）()【】《》\s]+", "", name))
    if fixed:
        return f"{prefix}-{fixed}" if prefix else fixed

    """中文名 → 拼音 id。重名自动加数字后缀。"""
    base = "-".join(lazy_pinyin(re.sub(r"[（）()【】《》\s]+", "", name)))
    base = re.sub(r"[^a-z0-9]+", "-", base.lower()).strip("-")
    if not base:
        base = "item"
    if prefix:
        base = f"{prefix}-{base}"
    key = base
    n = used_ids.get(base, 0)
    if n:
        key = f"{base}-{n + 1}"
    used_ids[base] = n + 1
    return key


# 各表之间材料译名不一致时，统一到右侧的名称。
# 例如盾牌表写「绳索」、武器表写「绳子」，实为同一材料。
MATERIAL_ALIAS = {
    "绳索": "绳子",
    "金属线": "线",
    "附魔皮革": "魔法皮革",
    "真银": "纯银",
    "肖博尔之烬": "修博尔的灰烬",
    "肖博尔骨灰": "修博尔的灰烬",
    "古代板甲": "古老薄板",
    "铜碎片": "碎铜片",
}


def parse_cost(raw):
    """
    解析两种材料写法：
      武器： 原松木*1 绳子*1 亚麻纤维*1
      其他： 布料：7；亚麻纤维：13；绳索：2
    返回 [{"material": "布料", "qty": 7}, ...]
    """
    s = text(raw)
    if not s:
        return []
    s = s.replace("\n", " ").replace("：", ":").replace("；", ";")
    items = []

    if ":" in s:  # 冒号写法
        for part in re.split(r"[;,，]", s):
            part = part.strip()
            if not part:
                continue
            m = re.match(r"^(.+?)\s*:\s*([\d.]+)$", part)
            if m:
                items.append({"material": m.group(1).strip(), "qty": float(m.group(2))})
            else:
                warnings.append(f"材料段落无法解析: {part!r}")
    else:  # 星号写法
        for m in re.finditer(r"([^\s*]+)\s*\*\s*([\d.]+)", s):
            items.append({"material": m.group(1).strip(), "qty": float(m.group(2))})
        if not items:
            warnings.append(f"材料字符串无法解析: {s!r}")

    merged = {}
    for it in items:
        name = MATERIAL_ALIAS.get(it["material"], it["material"])
        qty = it["qty"]
        merged[name] = merged.get(name, 0) + qty
    return [{"material": k, "qty": int(v) if v == int(v) else v} for k, v in merged.items()]


def num(v):
    """浮点整数转 int，避免 JSON 里出现 5.0 这种。"""
    if isinstance(v, float) and v == int(v):
        return int(v)
    return v


def parse_damage(raw):
    """'19+5' → (19, 5)；'40真伤' → (40, None) 且标记真伤；纯数字 → (n, None)"""
    c = clean(raw)
    if c is None:
        return None, None, None
    if isinstance(c, (int, float)):
        return c, None, None
    s = str(c)
    note = None
    if "真伤" in s:
        note = "无视护甲（真实伤害）"
        s = s.replace("真伤", "").strip()
    m = re.match(r"^([\d.]+)\s*\+\s*([\d.]+)$", s)
    if m:
        return num(float(m.group(1))), num(float(m.group(2))), note
    m = re.match(r"^([\d.]+)$", s)
    if m:
        return num(float(m.group(1))), None, note
    return None, None, s  # 多段数值等复杂情况，原样保留


def parse_element(raw):
    """'11 冰伤' / '6火伤' / '13 衰败伤' → {'type': '冰', 'value': 11}"""
    s = text(raw)
    if not s:
        return None
    m = re.match(r"^([\d.]+)\s*(.*?)\s*(?:伤|霜|焰)?$", s.replace(" ", " "))
    if not m:
        return {"raw": s}
    val = float(m.group(1))
    kind = m.group(2).strip() or None
    if kind:
        kind = kind.rstrip("伤霜焰")
        kind = {"冰": "冰", "火": "火", "衰败": "衰败", "毒": "毒"}.get(kind, kind)
    return {"type": kind, "value": int(val) if val == int(val) else val}


def parse_durability(raw):
    """50 → {'value': 50}；'400秒' → {'value': 400, 'unit': '秒'}"""
    c = clean(raw)
    if c is None:
        return None
    if isinstance(c, (int, float)):
        return {"value": int(c) if c == int(c) else c, "unit": "点"}
    m = re.match(r"^([\d.]+)\s*(.*)$", str(c))
    if m:
        v = float(m.group(1))
        return {"value": int(v) if v == int(v) else v, "unit": m.group(2).strip() or "点"}
    return {"raw": str(c)}


def parse_formula(raw, label):
    """Excel 公式泄漏成字符串时，尝试算出数值。"""
    c = clean(raw)
    if isinstance(c, (int, float)):
        return c
    s = str(c) if c else ""
    if s.startswith("="):
        m = re.match(r"^=([\d+\-*/. ]+)$", s)
        if m:
            try:
                val = eval(m.group(1))  # 仅含数字和运算符
                warnings.append(f"{label} 的数值是 Excel 公式 {s}，已计算为 {val}，请核对")
                return val
            except Exception:
                pass
        warnings.append(f"{label} 的数值是 Excel 公式 {s}，无法自动计算，已留空")
        return None
    return None



# ---------------------------------------------------------------- 护甲减伤

ARMOR_K = 165  # 减伤 = 护甲 / (护甲 + K)


def undate(cell):
    """
    还原被 Excel 误存为日期的多段数值。

    起因：像「10, 30, 40」这种用逗号分隔的多段数值，Excel 会把它识别成日期，
    存为 1940-10-30，同时把单元格格式设为 m, d, yy。
    显示出来仍然是「10, 30, 40」，肉眼看不出问题，但读取时拿到的是 datetime。

    只要格式里同时含有 m、d、y，就能按 月, 日, 两位年 反推回原始文本。
    """
    if cell is None or not isinstance(cell.value, datetime):
        return None
    fmt = (cell.number_format or "").lower()
    if not ("m" in fmt and "d" in fmt and "y" in fmt):
        return None
    d = cell.value
    return f"{d.month}, {d.day}, {d.year % 100}"


def dr_from_armor(armor):
    """
    由护甲值算减伤百分比，向上取整。
    减伤 = 护甲 / (护甲 + 165)

    支持三种输入：
      120                → 43
      "35, 50, 250"      → "18, 24, 61"     多段（普通/英雄/传奇）
      "不定; <400"        → "不定; <71"       带前缀的上限值
      None               → None
    """
    import math

    def one(v):
        v = float(v)
        return math.ceil(v / (v + ARMOR_K) * 100)

    if armor is None:
        return None
    if isinstance(armor, (int, float)):
        return one(armor)

    s = str(armor).strip()
    if not s:
        return None

    # 提取所有数字，保留原有的分隔与前缀结构
    import re
    nums = re.findall(r"\d+(?:\.\d+)?", s)
    if not nums:
        return s  # 纯文字说明，原样保留

    out = s
    for n in sorted(set(nums), key=len, reverse=True):
        out = out.replace(n, str(one(n)))
    return out


# ---------------------------------------------------------------- 各表解析

def rows_of(key):
    fn, sheet = FILES[key]
    wb = load_workbook(SRC / fn, read_only=True, data_only=False)
    return list(wb[sheet].iter_rows(values_only=True))


def cells_of(key):
    """返回单元格对象而非纯值，用于读取 number_format。"""
    fn, sheet = FILES[key]
    wb = load_workbook(SRC / fn, read_only=True, data_only=False)
    return list(wb[sheet].iter_rows())


def build_weapons():
    out = []
    for cells in cells_of("weapons")[2:]:
        row = [c.value for c in cells]
        name = text(row[0])
        if not name:
            continue
        # Excel 里手动 Alt+Enter 的换行会带进名称，统一压成空格
        name = re.sub(r"\s*\n\s*", "", name)
        base, skill, dmg_note = parse_damage(row[1])
        effect = text(row[7])
        blueprint = None
        if effect and "图纸" in effect:
            m = re.match(r"^(.+?)的?高级图纸$", effect.strip())
            if m:
                blueprint = m.group(1).strip()
                effect = None
        out.append({
            "id": make_id(name),
            "name": name,
            "quality": quality_from_fill(cells[0]),
            "damage": base,
            "skillBonus": skill,
            "damageNote": dmg_note,
            "element": parse_element(row[2]),
            "attackSpeed": clean(row[3]),
            "range": clean(row[4]),
            "durability": parse_durability(row[5]),
            "cost": parse_cost(row[6]),
            "effect": effect,
            "upgradeOf": blueprint,
        })
    # 把"XX的高级图纸"换成对应武器 id
    by_name = {w["name"]: w["id"] for w in out}
    for w in out:
        if w["upgradeOf"]:
            target = by_name.get(w["upgradeOf"])
            if target:
                w["upgradeOf"] = target
            else:
                warnings.append(f"武器 {w['name']} 的高级图纸来源 {w['upgradeOf']!r} 找不到对应武器")
                w["upgradeOf"] = None
    return out


def build_armor():
    """套装行后面紧跟 5 件部件，靠名字里的『套装（T…级）』识别。"""
    sets, standalone = [], []
    cur = None
    for cells in cells_of("armor")[1:]:
        row = [c.value for c in cells]
        name = text(row[1])
        if not name:
            continue
        is_set = "套装" in name and "级）" in name
        entry_armor = parse_formula(row[2], f"护甲 {name}") if not isinstance(clean(row[2]), (int, float)) else clean(row[2])
        quality = quality_from_fill(cells[1])
        common = {
            "name": re.sub(r"\s+", "", name),
            "quality": quality,
            "armor": entry_armor,
            "protection": parse_element(row[3]),
            "cost": parse_cost(row[5]),
            "effect": text(row[6]),
        }
        if is_set:
            m = re.match(r"^(.+?)套装（(T[\d+]+)级）$", common["name"])
            cur = {
                "id": make_id(common["name"]),
                "name": common["name"],
                "tier": m.group(2) if m else None,
                "quality": quality,
                "obtain": text(row[7]) if len(row) > 7 else None,
                "totalArmor": common["armor"],
                "protection": common["protection"],
                "durability": parse_durability(row[4]),
                "cost": common["cost"],
                "setEffect": common["effect"],
                "pieces": [],
            }
            sets.append(cur)
        elif cur is not None and len(cur["pieces"]) < 5:
            cur["pieces"].append({
                "id": make_id(common["name"]),
                "name": common["name"],
                "quality": quality,
                "armor": common["armor"],
                "protection": common["protection"],
                "cost": common["cost"],
                "effect": common["effect"],
            })
        else:
            cur = None
            standalone.append({
                "id": make_id(common["name"]),
                "name": common["name"],
                "tier": None,
                "quality": quality,
                "obtain": text(row[7]) if len(row) > 7 else None,
                "armor": common["armor"],
                "protection": common["protection"],
                "durability": parse_durability(row[4]),
                "cost": common["cost"],
                "effect": common["effect"],
            })
    for s in sets:
        if len(s["pieces"]) != 5:
            warnings.append(f"套装 {s['name']} 只解析到 {len(s['pieces'])} 件部件（预期 5 件）")
    return sets, standalone


def build_shields():
    """
    盾牌表列序：
      0 名称 / 1 耐久 / 2 防御值 / 3 制作 / 4 效果 / 5 获取途径
    """
    out = []
    for row in rows_of("shields")[1:]:
        name = text(row[0])
        if not name:
            continue
        out.append({
            "id": make_id(name),
            "name": re.sub(r"\s+", "", name),
            "armor": clean(row[2]),
            "durability": parse_durability(row[1]),
            "cost": parse_cost(row[3]),
            "effect": text(row[4]),
            "obtain": text(row[5]),
        })
    return out


def parse_protection(raw):
    """
    驮篮的元素防护写法：「防御寒冷15」「防御火焰40」「防御衰败40」
    → {"type": "寒冷", "value": 15}
    """
    t = text(raw)
    if not t:
        return None
    m = re.match(r"^防御(.+?)\s*([\d.]+)$", t)
    if m:
        v = float(m.group(2))
        return {"type": m.group(1).strip(), "value": int(v) if v == int(v) else v}
    return parse_element(raw)


def build_backpacks():
    """
    驮篮表列序：
      0 名称 / 1 储存栏 / 2 元素伤害保护 / 3 制作配方 / 4 效果 / 5 获取途径
    """
    out = []
    for row in rows_of("backpacks")[1:]:
        name = text(row[0])
        if not name:
            continue
        out.append({
            "id": make_id(name),
            "name": re.sub(r"\s+", "", name),
            "slots": clean(row[1]),
            "protection": parse_protection(row[2]),
            "cost": parse_cost(row[3]),
            "effect": text(row[4]),
            "obtain": text(row[5]),
        })
    return out


QUALITY_KEY = {"普通": "common", "稀有": "rare", "独特": "unique", "传说": "legendary"}

# 武器与护甲表用单元格底色标记品质。
# 同一档位可能存在几个相近色值（手填时选了不同色板），一并归入同一档。
QUALITY_BY_FILL = {
    None:       "common",     # 无填充
    "00000000": "common",
    "FFFFFFFF": "common",
    "FF4A86E8": "rare",       # 蓝
    "FF4285F4": "rare",       # 蓝（另一种色板）
    "FFFBBC04": "unique",     # 黄橙
    "FFF1C232": "unique",
    "FF351C75": "legendary",  # 紫
    "FF674EA7": "legendary",
}


def quality_from_fill(cell):
    """读取单元格填充色，映射为品质 key。未登记的颜色回退为普通并告警。"""
    try:
        fg = cell.fill.fgColor
        rgb = fg.rgb if fg and fg.type == "rgb" else None
    except Exception:
        rgb = None
    if rgb not in QUALITY_BY_FILL:
        warnings.append(f"未登记的品质底色 {rgb}（{cell.value}），已按普通处理")
        return "common"
    return QUALITY_BY_FILL[rgb]


def build_amulets():
    """
    护符表列序：
      0 名称 / 1 品质 / 2 耐久 / 3 元素伤害保护 / 4 制作配方 / 5 效果
    品质存英文 key，中文名与配色在 src/lib/quality.ts 里映射。
    """
    out = []
    for row in rows_of("amulets")[1:]:
        name = text(row[0])
        if not name:
            continue
        q = text(row[1])
        out.append({
            "id": make_id(name),
            "name": re.sub(r"\s+", "", name),
            "quality": QUALITY_KEY.get(q, "common"),
            "durability": parse_durability(row[2]),
            "protection": parse_protection(row[3]),
            "cost": parse_cost(row[4]),
            "effect": text(row[5]),
        })
    return out


def build_enemies():
    """表头行（第二列是『生命』）同时充当地点分组标题。"""
    out, group = [], None
    for cells in cells_of("enemies")[1:]:
        row = [c.value for c in cells]
        first = text(row[0])
        if not first:
            continue
        if text(row[1]) == "生命":
            group = first
            continue
        hp = clean(row[1])
        armor = undate(cells[2]) or clean(row[2])
        phys = undate(cells[4]) or clean(row[4])
        dr_src = text(row[3])
        recovered = bool(undate(cells[2]) or undate(cells[4]))
        if recovered:
            warnings.append(f"敌人 {first}：护甲/物理伤害在 Excel 中被存为日期，已按单元格显示格式还原")
        out.append({
            "id": make_id(first),
            "name": first,
            "group": group,
            "hp": hp,
            "armor": armor,
            "damageReduction": dr_from_armor(armor),
            "damageReductionSource": dr_src,
            "restoredFromDate": True if recovered else None,
            "physicalDamage": phys,
            "elementDamage": text(row[5]),
            "note": text(row[6]),
            "locations": [p.strip() for p in re.split(r"[;；\n]", text(row[7]) or "") if p.strip()],
            "dataIncomplete": True if (armor is None and phys is None) else None,
        })
    return out


def link_material_entities(materials, catalog):
    """
    有些「材料」本身就是站内的条目，例如皮驮篮既是驮篮也是升级材料。
    给这类材料标记它对应的板块与 id，页面上可以直接跳转过去。
    """
    for m in materials:
        hit = catalog.get(m["name"])
        if hit:
            m["entity"] = {"cat": hit[0], "id": hit[1]}


def build_materials(*datasets):
    """从所有配方里反推材料总表。"""
    counts = {}
    for data in datasets:
        for item in data:
            for c in item.get("cost", []) or []:
                counts[c["material"]] = counts.get(c["material"], 0) + 1
            for p in item.get("pieces", []) or []:
                for c in p.get("cost", []) or []:
                    counts[c["material"]] = counts.get(c["material"], 0) + 1
    return [
        {"id": make_id(name, "mat"), "name": name, "usedIn": n}
        for name, n in sorted(counts.items(), key=lambda kv: -kv[1])
    ]


def link_materials(materials, *datasets):
    """把配方里的材料中文名替换成 material id。"""
    by_name = {m["name"]: m["id"] for m in materials}
    def fix(cost):
        for c in cost or []:
            c["material"] = by_name.get(c["material"], c["material"])
    for data in datasets:
        for item in data:
            fix(item.get("cost"))
            for p in item.get("pieces", []) or []:
                fix(p.get("cost"))


def write(name, data):
    path = OUT / f"{name}.json"
    path.write_text(json.dumps(data, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")
    print(f"  {path.relative_to(ROOT)}  —  {len(data)} 条")


def main():
    OUT.mkdir(parents=True, exist_ok=True)
    print("正在转换…\n")

    weapons = build_weapons()
    armor_sets, armor_pieces = build_armor()
    shields = build_shields()
    backpacks = build_backpacks()
    enemies = build_enemies()
    amulets = build_amulets()

    materials = build_materials(weapons, armor_sets, armor_pieces, shields, backpacks, amulets)

    # 材料名若与某个真实条目同名，记录跳转目标
    catalog = {}
    for cat, data in [("weapons", weapons), ("armor", armor_sets),
                      ("armor-pieces", armor_pieces), ("shields", shields),
                      ("backpacks", backpacks)]:
        for it in data:
            catalog.setdefault(it["name"], (cat, it["id"]))
            for pc in it.get("pieces", []) or []:
                catalog.setdefault(pc["name"], ("armor-pieces", pc["id"]))
    link_material_entities(materials, catalog)

    link_materials(materials, weapons, armor_sets, armor_pieces, shields, backpacks, amulets)

    write("weapons", weapons)
    write("armor", armor_sets)
    write("armor-pieces", armor_pieces)
    write("shields", shields)
    write("backpacks", backpacks)
    write("enemies", enemies)
    write("amulets", amulets)
    write("materials", materials)

    total_pieces = sum(len(s["pieces"]) for s in armor_sets)
    print(f"\n护甲套装 {len(armor_sets)} 套，含部件 {total_pieces} 件；散件 {len(armor_pieces)} 件")

    if warnings:
        print(f"\n⚠ {len(warnings)} 条需要留意：\n")
        for w in warnings:
            print("  ·", w)
    else:
        print("\n无警告。")


if __name__ == "__main__":
    main()
