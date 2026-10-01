export const LOADING_LINES = [
  '卢比尼亚档案管理员正在为您查找资料……',
  '红天使档案员正在翻查卷宗……',
  '史官塔德乌什正在誊抄笔记……',
  '正在穿过卢比尼亚的迷雾……',
  '正在向修博尔询问答案……',
] as const;

export const randomLoadingLine = () => LOADING_LINES[Math.floor(Math.random() * LOADING_LINES.length)];
