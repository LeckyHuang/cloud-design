# cloud-design

> **Claude Code Skill** · 顶级网页设计工程师  
> 标准是"震撼"，不是"能用"。每一个像素都有意图，每一个交互都经过深思。

---

## 这是什么

`cloud-design` 是一个 [Claude Code](https://claude.ai/code) Skill，将 AI Agent 定位为顶级设计工程师，专门生产**独立的视觉交付物**——只需一句话，即可获得高质量的 HTML/CSS/JS 设计作品。

### 能做什么

| 交付物类型 | 示例 |
|---|---|
| 网页 / 落地页 / 营销页 | 产品介绍页、个人主页、活动页 |
| 交互原型 / UI Mockup | 带设备框架的可点击原型 |
| 数据看板 | Chart.js / D3 数据可视化 |
| HTML 幻灯片 | 演示文稿、Pitch Deck |
| 动效 Demo | CSS/JS 时间轴动画 |
| PPTX 幻灯片 | 可在 PowerPoint / Keynote 编辑的真实幻灯片 |
| 分层 SVG | 可在 Figma / Illustrator / Inkscape 编辑的矢量图 |

### 不做什么

- 后端 API、数据库、服务端逻辑
- CLI 工具、纯脚本
- 生产代码库中的 React/Next.js 组件（那是 `frontend-design` skill 的职责）

---

## 目录结构

```
cloud-design/
├── SKILL.md                  # Skill 主定义文件（Claude Code 读取入口）
├── specs/
│   ├── technical.md          # HTML/CSS/JS 技术规范与 CDN 资源
│   ├── design-principles.md  # 设计原则、避免 AI 俗套、占位符哲学
│   ├── output-formats.md     # PPTX / SVG / ZIP / 幻灯片等格式规范
│   └── checklist.md          # 交付前三阶段自检清单
├── references/
│   └── advanced-patterns.md  # 代码模板库（设备框架、幻灯片引擎、动效时间轴）
├── themes/
│   └── README.md             # 品牌主题模板库使用说明
├── assets/
│   ├── MANIFEST.md           # 资产索引
│   └── README.md             # 资产库使用说明
└── 事故复盘.md                # 历史踩坑记录，每次任务开始前自动读取
```

---

## 安装方法

### 前提条件

- 已安装 [Claude Code CLI](https://docs.anthropic.com/zh-CN/docs/claude-code)
- 已登录 Anthropic 账号（`claude login`）

### 方法一：克隆到 Skills 目录（推荐）

```bash
# 1. 进入 Claude Code Skills 目录
cd ~/.claude/skills/

# 2. 克隆本仓库
git clone https://github.com/LeckyHuang/cloud-design.git

# 3. 完成，无需额外配置
```

### 方法二：手动复制

```bash
# 将本仓库所有文件复制到 ~/.claude/skills/cloud-design/
```

### 验证安装

在 Claude Code 中输入 `/cloud-design`，如果 Agent 开始询问设计需求，说明安装成功。

---

## 使用方法

在 Claude Code 会话中，输入：

```
/cloud-design
```

然后用中文描述你的需求，例如：

```
帮我做一个 macOS 风格的个人主页，深色，极简，要有项目展示区和联系方式
```

```
做一个 SaaS 产品落地页，科技感，主色蓝色，面向企业客户
```

```
把这份数据做成可交互的看板，要有折线图和饼图
```

### 工作流程

Skill 遵循**渐进式工作流**，确保每步对齐再推进：

```
Step 0  初始化（读取事故复盘、检查主题库和资产库）
Step 1  理解需求（先提问，信息充分后才开始）
Step 1.5 声明设计角色
Step 2  收集设计上下文（参考材料拆解）
Step 2.5 写设计执行清单，等待确认
Step 3  声明设计系统（颜色 / 字体 / 间距 / 圆角 / 动效）
Step 4  输出 v0 草稿（有样式的骨架，等待确认）
Step 5  完整构建
Step 6  三阶段自检 + 交付
Step 7  推荐后续 Skill（流转开发 / 导出格式 / 保存主题）
```

### 局部修改模式

对已有设计文件迭代时，触发**局部修改模式**：

```
把 Landing Page.html 里的主色从蓝色改成紫色
调整一下 Dashboard.html 的卡片圆角，改成 8px
```

Skill 会用 `Edit` 工具做外科手术式修改，不触动无关代码。

---

## 核心功能亮点

### 事故复盘系统

每次任务开始前自动读取 `事故复盘.md`，将历史踩坑（如 `calc()` 空格缺失、SVG 留白、绝对定位陷阱）转化为预防规则，避免重蹈覆辙。发现新问题时自动写入，持续积累。

### 品牌主题库（67 个品牌，由 design-match 提供数据源）

内置 67 个顶级品牌的设计规格在线目录（Apple、Stripe、Linear、Notion、Claude、Vercel、Figma……），由 [getdesign](https://github.com/your-org/getdesign) 数据源驱动。

**三级查找逻辑**：
1. **本地缓存优先** — 抓取过的品牌直接读 `themes/{品牌名}/design-tokens.md`，无需联网
2. **在线抓取** — 说一句"Stripe 风格"，自动 fetch 完整设计规格（颜色 / 字体 / 间距 / 阴影 / 组件规则 / Agent 指令），解析后缓存到本地
3. **手动创建** — 不在目录中的品牌，按模板手动填写

品牌规格采用 **9 段解析框架**（视觉氛围 → 颜色 → 字体 → 组件 → 布局 → 层深 → 规则 → 响应式 → Agent 指令），其中 Do's & Don'ts 和 Agent 指令作为硬约束执行。使用品牌主题时自动跳过设计系统声明步骤，直接进入执行清单。

### 资产库

将图片、图标、SVG 等素材保存到 `assets/`，并在 `MANIFEST.md` 中索引。设计过程中 Skill 会主动提示可用资产，免去重复上传。

### 按需加载规范文件

`specs/` 下的四个文件只在需要时读取，减少无效上下文消耗，保持响应速度。

---

## 版本计划

### v1.0（当前）

- 完整的渐进式 8 步工作流
- 局部修改模式（外科手术式 Edit）
- 多格式输出：HTML / PPTX / 分层 SVG / ZIP
- 事故复盘自进化系统
- 品牌主题模板库
- 设计资产库
- Step 7 交付后流转推荐

### v1.1（已完成）

- **67 品牌在线设计库**：与 design-match skill 的 getdesign 数据源打通，说一句"Stripe 风格"即可自动抓取完整设计规格（Apple / Linear / Stripe / Notion / Claude / Vercel / Figma 等），按需抓取 + 本地缓存
- **9 段解析框架**：对品牌规格进行系统化拆解，Do's & Don'ts 和 Agent 指令作为硬约束执行
- **三级查找逻辑**：本地缓存 → 在线抓取 → 手动创建，首次抓取后自动缓存

### v1.2（计划中）

- **多页面原型支持**：多个 HTML 文件 + 导航逻辑的 ZIP 原型包
- **设计 Token 导出**：自动从交付物提取 CSS 变量，生成 `design-spec.md`
- **与 `frontend-design` 深度对接**：生成标准交接文档，一键流转到生产开发

### v2.0（展望）

- **实时协作模式**：多轮对话中保持设计系统上下文，跨会话延续迭代
- **AI 视觉评审**：截图后自动对照设计清单进行像素级评审
- **版本管理**：内置设计版本树，支持对比和回滚

---

## 与其他 Skill 的关系

```
cloud-design  →  frontend-design    独立 HTML 原型 → 生产 React/Next.js 组件
cloud-design  →  claude-api         原型 → 接入 Claude AI 能力
cloud-design  →  remotion-video     动效 Demo → 可导出真实视频
cloud-design  →  all-working        幻灯片 → 转 PPTX / 配套文档
cloud-design  →  design-match       品牌视觉 → 抓取并固化品牌规范
```

---

## License

MIT

---

*由 Claude Code + cloud-design skill 自我生成维护*
