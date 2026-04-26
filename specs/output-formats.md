# 输出格式与类型规范

> 确定输出格式或进入特定类型构建时读取本文件。

---

## PPTX 输出

**适用**：需要在 PowerPoint / Keynote / Google Slides 中编辑的演示文稿。

**流程**：
1. 先完成 HTML 版设计（视觉参考 + v0 确认）
2. 设计通过后，生成 python-pptx 脚本重建布局
3. CLI 执行，产出 `.pptx`
4. 若未安装：`pip install python-pptx`

**技术要点**：
- 画布：`prs.slide_width = Inches(13.33); prs.slide_height = Inches(7.5)`（16:9）
- 颜色从 HTML CSS 变量映射到 `RGBColor`
- 文字 `add_textbox`，形状 `add_shape`，图片 `add_picture`
- 背景：`slide.background.fill.solid()`
- 层次：背景层 → 内容层 → 文字层

```python
from pptx import Presentation
from pptx.util import Inches, Pt
from pptx.dml.color import RGBColor

prs = Presentation()
prs.slide_width = Inches(13.33)
prs.slide_height = Inches(7.5)
# 按设计重建每张幻灯片
prs.save('output.pptx')
```

---

## 分层 SVG 导出（Canvas 格式）

**适用**：可在 Figma / Illustrator / Inkscape 中按图层编辑的矢量文件。

**图层结构**：

```svg
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1440 900">
  <g id="layer-background"><rect width="1440" height="900" fill="#1C1C1E"/></g>
  <g id="layer-navigation"><!-- 导航栏 --></g>
  <g id="layer-hero"><!-- 首屏 --></g>
  <g id="layer-cards">
    <g id="card-1"><!-- 卡片1 --></g>
    <g id="card-2"><!-- 卡片2 --></g>
  </g>
</svg>
```

**元素映射**：文字 → `<text>`，矩形 → `<rect rx="...">`，图片 → `<image>`，自定义形状 → `<path>`

**局限（告知用户）**：
- `backdrop-filter` 用 `<feGaussianBlur>` filter 模拟，效果有差异
- CSS 动效不保留（SVG 为静态）
- 渐变用 `<linearGradient>` / `<radialGradient>` 定义

---

## ZIP 原型包

将 HTML + 本地资产整理到目录，内联或保留 CDN 引用，`index.html` 为入口：

```bash
zip -r "{项目名}-prototype-v{版本}.zip" 目录名/
```

---

## 可交互原型

- 无标题屏/封面——直接展示产品
- 使用设备框架（iPhone / Android / 浏览器窗口）增强真实感
- 实现主要交互路径
- 至少 3 个变体（Tweaks 面板切换）
- 完整状态覆盖：默认 / 悬停 / 激活 / 聚焦 / 禁用 / 加载中 / 空状态 / 错误

---

## HTML 幻灯片 / 演示文稿

- 固定画布 1920×1080，JS `transform: scale()` 自适应视口
- 居中，带留黑边；上/下一页按钮在缩放容器**外部**
- 键盘导航：← → 切换，Space 下一页
- `localStorage` 记住当前位置
- **编号从 1 开始**：`01 标题`、`02 议程`（"第 5 张"对应 `05`，不用 0 索引）
- 每张设置 `data-screen-label` 属性
- 视觉主导，文字辅助；1–2 种背景色

---

## 数据可视化看板

- Chart.js（简单）或 D3.js（复杂）—— CDN 引入
- `ResizeObserver` 响应式容器
- 深色/浅色模式切换
- 聚焦数据墨水比：去掉多余网格线、3D 效果、装饰阴影
- 颜色编码传递语义（涨跌/分类/时间），不作装饰

---

## 动效 / 视频 Demo

复杂度阶梯（从轻到重）：

1. **CSS transitions/animations** — 覆盖 80% 微交互
2. **React state + setTimeout/rAF** — 简单逐帧/事件动效
3. **自定义 `useTime` + `Easing` + `interpolate`**（见 references）— 时间轴驱动
4. **Popmotion** — 以上三层真的不够时才用

> 避免 Framer Motion / GSAP / Lottie——除非用户明确要求

要求：
- 播放/暂停按钮 + 进度条滑块
- 项目内统一缓动函数库
- 不加标题屏，直接进入内容

---

## 调参面板 Tweaks

- 右下角浮动面板，标题固定为 **"Tweaks"**
- 关闭时**完全隐藏**（演示时看起来是最终稿）
- 多变体用 Tweaks 切换，不创建多个文件
- 默认添加 1–2 个有创意的选项

---

## 变体探索哲学

目的是**穷举可能性供用户组合**，不是给唯一最优解。

至少探索 4 个维度：
1. **布局**：分栏 / 卡片网格 / 列表 / 时间线
2. **视觉**：配色、字体、纹理、分层
3. **交互**：动效、反馈、导航模式
4. **创意**：打破惯例的隐喻、新颖 UX

策略：头几个变体保守安全，然后逐渐拓展边界。

---

## 静态对比 vs. 完整流程

- 纯视觉对比（颜色/字体/卡片样式）→ 设计画板并排展示
- 交互流程/多选项 → 完整可点击原型 + Tweaks 暴露选项
