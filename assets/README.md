# 设计素材资产库

存放设计过程中常用的参考素材和可复用资产，避免每次设计都临时生成或联网搜索。

## 目录结构

```
assets/
├── README.md         # 本文件
├── MANIFEST.md       # 资产索引（名称、类型、描述、路径）
├── images/           # 样例图片、占位图、背景图
├── icons/            # SVG 图标文件
├── posters/          # 海报参考、设计灵感截图
├── references/       # 参考网页截图、竞品截图
└── svgs/             # SVG 图形、插画、装饰元素
```

## 如何添加素材

1. 将文件放入对应子目录
2. 在 `MANIFEST.md` 中添加一行索引记录

也可以直接告诉 cloud-design skill：「把这张图保存到素材库」，skill 会自动完成归档和 MANIFEST 更新。

## 如何在设计中使用素材

设计过程中，直接说：

- 「使用 assets/images/hero-bg.jpg 作为首屏背景」
- 「帮我找一个适合用在导航栏的图标，看看 assets/icons/ 里有没有合适的」
- 「参考 assets/references/competitor-dashboard.png 的布局风格」

skill 会读取对应文件并在设计中直接引用。

## 素材格式建议

| 类型 | 推荐格式 | 说明 |
|------|---------|------|
| 图片 | JPG / PNG / WebP | JPG 用于照片，PNG 用于需要透明背景的图 |
| 图标 | SVG | 矢量格式，可随意缩放，可直接嵌入 HTML |
| 参考截图 | PNG | 高分辨率截图，方便分析细节 |
| SVG 图形 | SVG | 插画、装饰元素、图表底图 |
