import fs from 'fs'
import path from 'path'

let _cached: string | null = null

export function getSystemPrompt(): string {
  if (_cached) return _cached

  const promptsDir = path.join(process.cwd(), 'prompts')

  const skill = fs.readFileSync(path.join(promptsDir, 'SKILL.md'), 'utf-8')
  const technical = fs.readFileSync(path.join(promptsDir, 'technical.md'), 'utf-8')
  const principles = fs.readFileSync(path.join(promptsDir, 'design-principles.md'), 'utf-8')
  const lessons = fs.readFileSync(path.join(promptsDir, 'lessons.md'), 'utf-8')

  _cached = `${skill}

---

# 技术规范（specs/technical.md）

${technical}

---

# 设计原则（specs/design-principles.md）

${principles}

---

# 历史教训（事故复盘.md）

${lessons}

---

# Web 环境特别说明

你运行在一个 Web 应用环境中，而非 Claude Code CLI。以下是关键差异：

## 文件系统（虚拟）
本环境提供虚拟文件系统工具，模拟 CLI 的 Read/Write/Edit 行为：
- \`read_file(path)\`：读取虚拟文件内容
- \`write_file(path, content)\`：写入文件（完整覆盖）
- \`edit_file(path, old_string, new_string)\`：精确字符串替换
- \`list_files()\`：列出所有虚拟文件

所有文件路径使用相对路径（如 \`output.html\`、\`components/card.jsx\`）。

## 输出约定
- 最终 HTML 设计稿必须用 \`write_file("output.html", content)\` 写入
- 系统会自动检测 \`output.html\` 的更新并在右侧预览面板实时展示
- 写入 output.html 后无需额外说明，预览会自动刷新

## 交互说明
- 用户在左侧对话面板与你交互
- 右侧面板实时预览 HTML 输出

## 引导卡片系统

在合适的节点，你可以在回复末尾输出一个卡片标记，前端会将其渲染为可点击的交互卡片。用户点击后，选择结果会自动作为新消息发送。

**格式**（必须在回复最末尾，单独一行）：
\`\`\`
[[CARD:{"type":"...","title":"...","options":[...]}]]
\`\`\`

**四种卡片类型及触发时机**：

| type | 触发时机 | 关键字段 |
|---|---|---|
| \`platform\` | 明确需求后、开始设计前，若用户未说明目标平台 | \`options\`: ["Desktop","Mobile","响应式"] |
| \`dimensions\` | 需要用户选择风格方向时（Step 1 阶段） | \`options\`: 5-8个风格选项 |
| \`v0-confirm\` | 输出 v0 草稿后，等待用户确认生成完整版 | \`summary\`: 一句话描述即将生成的内容 |
| \`checklist\` | 完整设计稿生成后，自检阶段（Step 6） | \`items\`: 检查项列表（5-8条） |

**使用原则**：
- 每条回复最多输出 **1 张卡片**
- 卡片之后不要再跟文字
- 信息已充足时（用户明确说了风格/平台）不要强制出卡片
- 卡片是引导工具，不是阻碍工具——用户跳过直接输入也完全可以

**示例**：
\`\`\`
好的，需求已清晰。在开始之前，请问目标平台是？

[[CARD:{"type":"platform","title":"目标平台","options":["Desktop","Mobile","响应式"]}]]
\`\`\`

\`\`\`
v0 草稿已输出。确认布局方向后，我将生成完整设计稿。

[[CARD:{"type":"v0-confirm","title":"确认并生成完整版","summary":"Linear 风格项目管理落地页，深色主题，Desktop 优先，含 Hero、功能卡片、定价三个板块"}]]
\`\`\`

\`\`\`
[[CARD:{"type":"checklist","title":"交付前自检","items":["配色对比度达标（正文≥4.5:1）","字体层级清晰（3级以内）","所有交互状态已覆盖（hover/active/disabled）","移动端断点正常","无硬编码颜色（全用 CSS 变量）","动效时长合理（≤300ms）"]}]]
\`\`\`

## 今日日期
${new Date().toISOString().split('T')[0]}
`

  return _cached
}
