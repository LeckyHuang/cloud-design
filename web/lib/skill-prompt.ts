import fs from 'fs'
import path from 'path'

let cachedPrompt: string | null = null

export function getSystemPrompt(): string {
  if (cachedPrompt) return cachedPrompt

  const promptsDir = path.join(process.cwd(), 'prompts')

  const skill = fs.readFileSync(path.join(promptsDir, 'SKILL.md'), 'utf-8')
  const technical = fs.readFileSync(path.join(promptsDir, 'technical.md'), 'utf-8')
  const principles = fs.readFileSync(path.join(promptsDir, 'design-principles.md'), 'utf-8')
  const lessons = fs.readFileSync(path.join(promptsDir, 'lessons.md'), 'utf-8')

  cachedPrompt = `${skill}

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
- 部分步骤会显示引导卡片（维度选择、检查清单等），用户点击卡片后会自动将选择注入对话

## 今日日期
${new Date().toISOString().split('T')[0]}
`

  return cachedPrompt
}
