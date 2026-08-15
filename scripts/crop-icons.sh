#!/bin/bash
# 从游戏背包截图批量裁切物品图标
# 用法: ./scripts/crop-icons.sh 背包截图.png 输出目录
#
# 下面的坐标需要你自己量一次：用任意看图软件打开截图，
# 量出第一个格子左上角坐标和格子边长，改掉 X0 Y0 SIZE。
# 需要先安装 imagemagick:  sudo apt install imagemagick

set -e
SRC="${1:?请提供截图文件}"
OUT="${2:-./cropped}"

X0=48      # 第一个格子左上角 X
Y0=820     # 第一个格子左上角 Y
SIZE=132   # 格子边长（含间距）
PAD=6      # 向内收缩，避开格子边框
COLS=5
ROWS=6

mkdir -p "$OUT"
n=0
for ((r=0; r<ROWS; r++)); do
  for ((c=0; c<COLS; c++)); do
    x=$((X0 + c*SIZE + PAD))
    y=$((Y0 + r*SIZE + PAD))
    s=$((SIZE - PAD*2))
    convert "$SRC" -crop ${s}x${s}+${x}+${y} +repage \
      -resize 128x128 -quality 85 \
      "$OUT/$(printf 'icon_%02d' $n).webp"
    n=$((n+1))
  done
done
echo "已裁切 $n 个图标到 $OUT/"
echo "接下来手动重命名成对应的 id，例如 iron-sword.webp"
