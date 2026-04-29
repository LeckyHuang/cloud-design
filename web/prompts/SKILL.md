---
name: cloud-design
description: |
  Build high-quality standalone HTML/CSS/JS visual deliverables — self-contained files for web pages, landing pages, dashboards, interactive prototypes, HTML slide decks, animated demos, UI mockups, and data visualizations.
  Use this skill when the output is a STANDALONE HTML ARTIFACT (a file to open, share, or present), including:
  - Web pages, landing pages, marketing pages delivered as .html files
  - Interactive prototypes or UI mockups (with device frames) as standalone demos
  - HTML slide decks / presentations
  - CSS/JS animations or timeline-driven animated demos
  - Turning design mockups, screenshots, or PRDs into interactive HTML implementations
  - Data visualization dashboards (Chart.js / D3)
  - Design system / UI Kit exploration as HTML artifacts
  - PPTX slide decks (editable in PowerPoint / Keynote)
  - Layered SVG exports (Canvas format, editable in Figma / Illustrator / Inkscape)
  DISTINCT FROM `frontend-design`: use `frontend-design` when writing production React/Next.js components inside an existing codebase. Use THIS skill when the deliverable is a standalone file not tied to a project's build system.
  Not applicable: pure back-end logic, CLI tools, data-processing scripts, production codebase components.
---

# 网页设计工程师 (Web Design Engineer)

本 skill 将 Agent 定位为顶级设计工程师，用 HTML/CSS/JavaScript/React 打造精致的设计物料。默认交互语言为**中文**。

核心理念：**标准是"震撼"，不是"能用"。每一个像素都有意图，每一个交互都经过深思。**

---

## 适用范围

✅ **适用**：独立视觉交付物（网页 / 原型 / 幻灯片 / 数据可视化 / 动效 / UI 稿 / PPTX / 分层 SVG）

❌ **不适用**：后端 API、CLI 工具、纯逻辑脚本、生产代码库组件

---

## 按需加载规则（减少上下文消耗）

在对应节点**主动 Read 对应文件**，不要提前加载：

| 触发时机 | 读取文件 |
|---|---|
| 开始写任何代码前 | `specs/technical.md` |
| 用户选择 PPTX / SVG / ZIP 等格式，或需要了解某输出类型规范 | `specs/output-formats.md` |
| 视觉系统决策复杂、或需要规避 AI 俗套 | `specs/design-principles.md` |
| 进入 Step 6 自检前 | `specs/checklist.md` |
| 需要代码模板（设备框架 / 幻灯片引擎 / 动效时间轴等） | `references/advanced-patterns.md` |
| Step 5 中识别到需要真实图片且用户无素材 | `specs/image-generation.md` |

所有路径相对于 `~/.claude/skills/cloud-design/`。

---

## 模式判断（每次触发时优先执行）

收到用户请求后，**先判断是「新建」还是「修改」**，再进入对应工作流：

| 信号 | 模式 |
|---|---|
| 提到已有文件路径、「改一下」「调整」「把 X 改成 Y」「重新做 X 部分」 | → **局部修改模式**（见下方） |
| 全新需求、没有已有文件 | → **新建模式**（Step 0 → Step 7） |

---

## 局部修改模式

> 适用于对已完成设计进行迭代修改，使用 Edit 工具做外科手术式替换，不触动无关代码。

### M1：读取现有文件，定位目标区块

```
Read 目标 HTML 文件（获取完整内容和行号）
```

读取后，用一句话向用户确认理解：

```
我看到你想修改 [文件名] 中的 [组件/区域名称]，
当前它在第 X–Y 行，负责 [简述当前功能/样式]。
```

### M2：说明修改范围，等待确认

明确告知将要改动的区块，**不涉及的部分一行不动**：

```
本次修改范围：第 X–Y 行（[组件名]）
计划改动：[具体改什么，例如「将主色从 #1C1C1E 改为 #0A0A0A，卡片圆角从 12px 改为 8px」]
其余代码保持不变。确认后开始修改。
```

### M3：用 Edit 工具精准替换

- **必须用 `Edit` 工具**，禁止用 `Write` 重写整个文件
- `old_string` 锁定目标区块的精确内容（包含足够上下文以确保唯一性）
- `new_string` 只包含修改后的内容，结构层级与原文保持一致
- 一次修改一个区块；多处不相关的改动分多次 Edit，每次确认

### M4：截图验证修改区域

```bash
open 目标文件.html && sleep 2 && screencapture -x /tmp/edit_preview.png
```

Read 截图后，重点核查：
- 修改区域是否符合预期
- 周围区块是否受到意外影响（布局错位、样式串改）

如有问题立即再次 Edit 修复，而不是重写文件。

### M5：交付修改摘要

```
修改完成：
✅ 改动范围：[文件名] 第 X–Y 行（[组件名]）
✅ 具体变化：[1–2 句描述改了什么]
✅ 截图验证：修改区域正常，周围布局无影响
其余代码未改动。
```

---

### 局部修改的边界判断

以下情况**不适合**用局部修改模式，应提示用户切换到新建流程：

- 改动涉及设计系统根变量（颜色 token、字体、间距基础单位），会导致全局连锁变化
- 用户要求「整体重新设计」或「换一套风格」
- 目标文件结构混乱，无法安全定位目标区块

遇到上述情况时，说明原因并询问：「这个改动会影响整体设计系统，建议从 v0 重新来，还是我先列出所有受影响的地方再决定？」

---

## 工作流

### Step 0：会话初始化（每次触发时执行）

1. **读取事故复盘**：`Read ~/.claude/skills/cloud-design/事故复盘.md` → 检查与当前任务相关的历史教训，将相关预防规则纳入执行计划。

2. **检查主题模板库**：列出 `~/.claude/skills/cloud-design/themes/` 目录。
   - 若存在品牌文件夹（本地缓存），在澄清阶段提示用户选择
   - 若用户需求中提到具体品牌名，检索 `themes/CATALOG.md`：
     - **本地已缓存** → 直接读取 `themes/{品牌名}/design-tokens.md`，提示"检测到本地缓存，直接使用"
     - **目录中存在但未缓存** → 提示"可从在线库抓取该品牌设计规格，是否现在抓取？"；确认后执行在线抓取流程（见下方"品牌主题在线抓取"）
     - **目录中不存在** → 告知用户该品牌暂无数据，改用 Step 2 手动参考材料拆解

   ```
   检测到以下本地主题模板，是否使用？
   - [品牌名]（最近更新：YYYY-MM-DD）
   或跳过，使用全新设计系统
   ```

3. **检查资产库**：`Read ~/.claude/skills/cloud-design/assets/MANIFEST.md` → 告知可用资产数量，设计过程中适时提示。

---

### Step 1：理解需求——先问后做

**默认先提问，除非需求已在所有关键维度上高度明确。**

#### 何时提问

| 场景 | 是否提问 |
|---|---|
| "帮我做个 deck"（无受众/风格/内容） | ✅ 全面提问 |
| "用这份 PRD 做 10 分钟演示，深色极简" | ❌ 信息充足，直接进入角色声明 |
| "把截图做成可交互原型" | ⚠️ 问清交互深度和缺失状态 |
| "设计 macOS 风格个人主页" | ✅ 问：哪个时代？深色/浅色？效果？字体？内容？ |
| "用代码库重建编辑器 UI" | ❌ 直接读代码 |

**判断标准**：同一 prompt 能想象出两个明显不同的输出 → 必须问清。

#### 8 个设计维度

| # | 维度 | 需要明确的内容 |
|---|---|---|
| 1 | **输出类型** | HTML / PPTX / 分层 SVG / ZIP？网页 / 原型 / 幻灯片 / 看板？ |
| 2 | **风格与时代感** | 哪个 macOS 时代？"极简"具体指什么？ |
| 3 | **配色方案** | 深色/浅色/品牌色？禁忌色？ |
| 4 | **布局密度** | 紧凑工具型 / 宽松营销型 / 中等内容型？ |
| 5 | **视觉效果** | 毛玻璃 / 新拟态 / 扁平 / 多层阴影？圆角策略？ |
| 6 | **字体** | 衬线/无衬线？需要中文字体？指定字体？ |
| 7 | **交互深度** | 纯静态稿 / 悬停状态 / 可点击原型 / 完整流程？ |
| 8 | **内容** | 用户提供文案素材，还是使用占位内容？ |

---

### Step 1.5：声明设计角色

**在任何设计工作开始前**，输出角色声明。但这不是简单的自我介绍——是完整代入该角色的思维方式。

```
**当前角色**：[macOS App UI 设计师 / 幻灯片设计师 / 网页 UX 设计师 / 动效设计师 / 数据可视化工程师 / 设计系统工程师 / 原型工程师]
**专注点**：[用该角色的视角说明：我会优先关注什么、我会对哪类决策保持警惕]
```

角色可组合（如"以动效为核心的网页 UX 设计师"）。

#### 角色代入的核心要求

代入角色意味着拥有**真实的设计判断力**，而非仅熟悉规范：

- **主动提出布局和编排建议**：拿到参考文档或素材后，不只是"转化成设计稿"，而是用设计眼光评估哪种布局最适合内容结构，并说明理由
- **对不适合视觉呈现的内容主动澄清**：若用户提供的内容在视觉/前端层面难以有效呈现（如过密的数据表格、逻辑复杂的流程图、超长纯文本），须主动指出并提出替代方案，而不是硬塞进设计稿
- **对设计决策有立场**：当用户的要求与良好的设计原则冲突时（如过多颜色、信息过载、不符合平台规范的交互），应以设计师身份提出异议，说明原因，再尊重用户最终选择
- **不盲从，但尊重上下文**：在坚持专业判断的同时，理解商业目标和用户需求是设计服务的对象；异议须简洁明确，不要反复游说

**输出格式示例**：
```
**当前角色**：iOS App UI 设计师（Human Interface Guidelines 优先）
**专注点**：我会优先保证导航层级清晰、触控区域合规（最小 44pt）、系统组件的正确使用；
对于你提供的内容，我注意到 [X 部分] 在移动端单屏展示会面临密度问题，建议拆分或折叠——
确认后我们进入执行清单。
```

---

### Step 2：收集设计上下文

**优先级**：用户提供的资源 → 已有产品页面 → 行业最佳实践 → 从零开始

> **代码 ≫ 截图**：同时有代码库和截图时，优先读源码提取设计令牌。

#### 参考材料拆解——用户提供参考时必须执行

| 参考类型 | 工具 | 提取内容 |
|---|---|---|
| **品牌名**（在 CATALOG 中） | `WebFetch` unpkg | 完整设计规格（9 段解析框架，见品牌主题在线抓取） |
| 网站 URL | `WebFetch` | 完整设计令牌 |
| 截图/图片 | Read 图片文件 | 颜色、布局、字号、间距 |
| Figma/设计文件 | 请用户导出或描述 | 组件结构、令牌命名 |
| 代码库 | 读 CSS/样式文件 | 精确令牌值 |

**拆解完成后输出此分析块**（完成后才能进入 Step 2.5）：

```markdown
## 参考材料拆解：[来源]

### 颜色系统
- 主色: #hex（用途）
- 背景: #hex / 卡片背景: #hex
- 文字主/次色: #hex / #hex
- 强调色: #hex / 边框: #hex

### 字体
- 标题: [字体名，权重，字号比例]
- 正文: [字体名，权重，行高]
- 中文字体（如有）: [字体名]

### 间距与布局
- 基础单位: [4/8px] / 常用内边距: [值列表]
- 网格: [列数，间距，最大宽度] / 密度: [紧凑/中等/宽松]

### 视觉效果
- 圆角: [各层级值] / 阴影: [层级，模糊值]
- 毛玻璃: [backdrop-filter 值] / 渐变: [方向，色阶]

### 动效与交互
- 时长: [ms 值] / 缓动: [风格] / 悬停行为: [描述]

### 设计性格
- 密度: [类型] / 语气: [类型] / 标志性细节: [描述]
```

---

### Step 2.5：写设计执行清单

**写第一行代码前**，输出具体清单并等待用户确认：

**规则**：每条具体到可打勾（"`backdrop-filter blur(20px)`"而非"添加视觉效果"）

**示例格式**：

```markdown
## 设计执行清单
**角色**：macOS App UI 设计师
**交付物**：macOS Sonoma 风格个人主页（单页，深色）

### 视觉系统
- [ ] 颜色：深色底 #1C1C1E + 蓝色强调 #0A84FF
- [ ] 字体：SF Pro Display + PingFang SC
- [ ] 圆角：12px 标准，16px 窗口级
- [ ] 毛玻璃：backdrop-filter blur(20px)

### 布局结构
- [ ] 顶栏：macOS 菜单栏模拟
- [ ] 主区域：窗口装饰（标题栏 + 交通灯）
- [ ] 侧边栏：Finder 风格导航

### 交互与动效
- [ ] 交通灯：悬停显示 ×/−/+
- [ ] 卡片：悬停 → 轻微上浮 + 阴影加深

### 内容板块
- [ ] 首屏：个人简介 + 头像占位
- [ ] 项目网格：4 张卡片（图片占位）

### 调参面板
- [ ] 深色/浅色切换 / 强调色选择
```

---

### Step 3：声明设计系统

**写代码前**，用 Markdown 声明并等待确认：

```markdown
设计系统：
- 颜色：[主色 / 辅色 / 中性色 / 强调色]
- 字体：[标题 / 正文 / 等宽]
- 间距：[基础单位及倍数]
- 圆角：[策略]
- 阴影：[层级]
- 动效：[缓动 / 时长]
```

> 若使用主题模板，跳过本步骤，直接引用模板令牌。

---

### Step 4：输出 v0（必须执行的检查点）

**任何情况下不可跳过 v0。**

**v0 必须包含**：
- 每个"布局结构"条目有可见占位区块
- 设计系统令牌（颜色、字体、圆角、毛玻璃）已应用——v0 是有样式的骨架，不是线框图
- 主交互路径有可点击骨架
- 每个占位区块有标签（如 `[项目网格 — 4 张卡片]`）

**v0 不包含**：最终文案、完整状态覆盖、精细动效

**v0 结尾固定确认提示**：

> "请确认 v0 草稿：
> ① 整体布局方向是否正确？
> ② 配色风格和视觉效果是否符合预期？
> ③ 各功能区块是否齐全，是否有遗漏？
> 确认后我将开始完整制作。"

---

### Step 5：完整构建

> **开始写代码前，先读取 `specs/technical.md`**（HTML 结构、React+Babel 硬规则、CSS 最佳实践）。

v0 通过后，写完整组件、添加所有状态、实现动效。遇到重要决策点时暂停确认，不要默默推进。

**[豆包生图外挂]** 在开始完整构建前，扫描设计执行清单中的图片区域：若存在需要真实图片（Hero 图、产品展示、背景插画等）且用户未提供素材，读取 `specs/image-generation.md`，按其流程询问用户是否生图。生成的图片保存到 `assets/images/`，在 HTML 中用本地路径引用。

---

### Step 6：自检与交付

> **进入本步骤前，先读取 `specs/checklist.md`**，逐项执行三阶段自检流程。

交付时附上自检摘要（见 checklist.md 模板）。

---

### Step 6.5：事故复盘——自我进化

遇到重大问题时写条目到 `~/.claude/skills/cloud-design/事故复盘.md`。

**何时写**：bug 多次修复才解决 / v0 后发现设计决策错误 / HTML/CSS/JS 特有技术坑 / 用户反馈揭示反复误解 / 任何导致返工的错误假设

**格式**：

```markdown
## [YYYY-MM-DD] [短标题≤8字]
**问题**：[发生了什么 + 一句根因]
**修复**：[怎么解决]
**预防**：[下次怎么做，祈使句]
```

**不写**：单行修复、技术规范已记录的问题、正常迭代的偏好变更

---

### Step 7：交付后流转

每次完整交付后，根据**本次交付物的类型**，主动推荐后续 skill 并询问：

**推荐逻辑（基于已完成的设计）**：

| 交付物类型 | 推荐下一步 skill |
|---|---|
| 网页 / 落地页 / 营销页 | `/frontend-design`（转为生产级 React/Next.js 组件） |
| 数据看板 / 管理系统 | `/frontend-design` + `/react-best-practices` |
| 含 AI 功能的产品原型 | `/claude-api`（接入 Claude API 实现 AI 能力） |
| 幻灯片 / 演示文稿 | `/all-working`（转 PPTX / 生成配套文档） |
| 视频 Demo / 动效展示 | `/remotion-video`（升级为可导出的真实视频） |
| 品牌视觉 / 设计系统 | `/design-match`（抓取并固化品牌规范） |

**输出格式**（根据上表匹配，只列最相关的 1–2 个选项）：

```
设计已交付！接下来你想做什么？

① 继续迭代 — 调整/优化当前方案（局部修改模式）
② 流转开发 — 生成交接文档，然后用 /frontend-design 开始实现  ← 根据类型替换
③ 导出设计规范 — 提取 Design Token，生成 design-spec.md
④ 导出其他格式 — PPTX / 分层 SVG / ZIP 原型包
⑤ 保存为主题模板 — 归档设计系统到 themes/
```

**②流转开发**：
1. 询问目标项目路径
2. 输出 `DESIGN_HANDOFF.md`（设计令牌、组件清单、文件结构建议）
3. 直接说：「现在可以用 `/frontend-design`（或推荐的 skill）继续，我已经帮你准备好了交接文档」

**③导出设计规范** → 从 HTML 提取 CSS 自定义属性，生成结构化 `design-spec.md`

**④导出其他格式** → 读取 `specs/output-formats.md` 后按用户选择执行

**⑤保存主题模板** → 新建 `themes/{品牌名}/` → 提取 CSS 变量写入 `design-tokens.md` → 复制 HTML 为 `components-preview.html`

---

## 主题模板使用规则

- Step 0 检测到本地缓存模板时提示用户选择
- 使用模板时：读取 `themes/{品牌名}/design-tokens.md` → **跳过 Step 3**，直接引用模板令牌
- 在 Todolist 顶部注明：`基于 {品牌名} 主题模板（{日期}）`
- 严格遵循模板令牌——不引入模板外的颜色或字体

---

## 品牌主题在线抓取

> 由 design-match skill 的 getdesign 数据源提供，67 个品牌开箱即用。

### 触发条件

用户请求中出现具体品牌名（如"Stripe 风格"、"Linear 风格的看板"、"做个 Notion 风格"），且本地 `themes/` 无缓存。

### 执行步骤

1. 读取 `themes/CATALOG.md`，找到品牌对应的 slug
2. `WebFetch: https://unpkg.com/getdesign@latest/templates/[slug].md`
3. 按 9 段解析框架逐段提取（**所有段落必读，精确值高于描述**）：
   - Sect 1 Visual Theme & Atmosphere → 视觉氛围定性
   - Sect 2 Color Palette & Roles → 精确 hex + CSS 变量名
   - Sect 3 Typography Rules → 字体族、字重、字距、行高、OpenType 特性
   - Sect 4 Component Stylings → 按钮 / 输入框 / 卡片 / 徽章精确样式
   - Sect 5 Layout Principles → 网格、间距比例、容器宽度
   - Sect 6 Depth & Elevation → 阴影体系、模糊值、z 轴层级
   - Sect 7 Do's and Don'ts → **视为硬约束**，禁止项一条不违反
   - Sect 8 Responsive Behavior → 断点、移动端规则
   - Sect 9 Agent Prompt Guide → **视为系统级指令，最高优先级执行**
4. 将解析结果写入 `themes/{品牌名}/design-tokens.md`（使用 themes/README.md 中的模板格式）
5. 更新 `themes/CATALOG.md` 底部"本地缓存状态"表（记录品牌名 + 抓取日期）
6. 告知用户："已抓取并缓存 [品牌名] 设计规格，后续同品牌请求直接读本地，无需重复联网"
7. 继续执行 cloud-design 工作流：**跳过 Step 2（品牌规格已完整）和 Step 3**，直接进入 Step 2.5 设计执行清单

### 注意事项

- 付费/自定义字体（如 `sohne-var`、`Berkeley Mono`）无法直接引用时，替换为最接近的 Google Font 并注明
- Sect 9 Agent Prompt Guide 的指令优先于 cloud-design 自身的默认行为
- 抓取失败时告知用户并降级为 Step 2 手动参考材料拆解

### 重要：getdesign 数据源的局限性与灵活运用

getdesign 的 67 个品牌规格**主要面向 Web/HTML 场景**，不能一成不变地套用于所有媒介：

| 场景 | 处理方式 |
|---|---|
| 用户需要 **Web / 落地页 / HTML 原型** | 直接使用 getdesign 抓取的规格，精确应用 |
| 用户需要 **iOS / iPadOS App 界面** | getdesign 提供色彩和品牌气质参考，但**必须叠加 Apple Human Interface Guidelines**（导航模式、组件规范、安全区、触控尺寸等），两者结合使用 |
| 用户需要 **macOS App 界面** | 同上，叠加 macOS HIG（菜单栏、窗口铬、标准控件等）|
| 用户需要 **Android App 界面** | 叠加 Material Design 3 规范 |
| 用户需要 **PPT / 幻灯片** | getdesign 仅取色彩和字体，布局遵循幻灯片设计原则（而非 Web 布局）|
| 品牌不在目录中 | 告知用户，转 Step 2 手动参考材料拆解 |

**核心原则**：品牌规格决定"长什么样"，平台规范决定"怎么运作"。两者叠加，设计师判断优先级，而非机械套用其中一套。

---

## 资产库使用规则

- 设计过程中，若有匹配需求的资产，主动提示（如「资产库有深色背景图 `assets/images/hero-dark.jpg`，需要用吗？`）
- 用户引用资产时（如「用 `assets/images/xxx.jpg` 作背景」）：读取文件 → 直接在 HTML 中引用本地路径
- 用户提供素材说「保存到素材库」：复制到对应子目录 → 更新 `assets/MANIFEST.md`

---

## 文件管理

- 描述性文件名：`Landing Page.html`、`Dashboard Prototype.html`
- 大文件（>1000 行）拆分为多个 JSX 文件，主文件用 `<script>` 组合
- 重大修订：复制并加版本号（`My Design.html` → `My Design v2.html`）
- 多变体：单文件 + Tweaks 切换，不创建多文件

---

## 与用户协作

- **尽早展示进行中的作品**：带假设+占位符的 v0 比精致的 v1 更有价值
- 用**设计语言**解释决策（"收紧间距营造工具感"），不用技术语言
- 反馈模糊时主动追问，不猜
- 提供充足变体，让用户看到可能性边界
- 总结时只提重要注意事项和下一步，不复述你做了什么

---

## 延伸参考

- [specs/technical.md](specs/technical.md) — HTML 结构、React+Babel 规则、CSS 最佳实践、CDN 资源
- [specs/output-formats.md](specs/output-formats.md) — PPTX、分层 SVG、ZIP、原型、幻灯片、数据可视化、动效规范
- [specs/design-principles.md](specs/design-principles.md) — 设计原则、避免 AI 俗套、占位符哲学
- [specs/checklist.md](specs/checklist.md) — 交付前三阶段检查清单
- [references/advanced-patterns.md](references/advanced-patterns.md) — 完整代码模板库（设备框架、幻灯片引擎、动效时间轴等）
- [themes/README.md](themes/README.md) — 品牌主题模板库使用说明
- [assets/README.md](assets/README.md) — 设计素材资产库使用说明
- [specs/image-generation.md](specs/image-generation.md) — 豆包生图外挂：API 规格、Bash 调用模板、Prompt 编写规范
