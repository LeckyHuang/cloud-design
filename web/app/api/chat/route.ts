import { streamText, tool, stepCountIs } from 'ai'
import { z } from 'zod'
import { getSystemPrompt } from '@/lib/skill-prompt'
import { getAIModel } from '@/lib/providers'
import { vfsGet, vfsSet, vfsEdit, vfsList } from '@/lib/vfs'
import type { Provider } from '@/types'

export const maxDuration = 300

export async function POST(req: Request) {
  const body = await req.json()
  const { messages, sessionId, projectId, provider, apiKey, model, baseUrl } = body as {
    messages: Array<{
      role: 'user' | 'assistant'
      content: string | Array<{ type: string; text?: string; image?: string }>
    }>
    sessionId: string
    projectId: string
    provider: Provider
    apiKey: string
    model: string
    baseUrl?: string
  }

  if (!apiKey?.trim()) {
    return new Response('API key required', { status: 400 })
  }
  if (!model?.trim()) {
    return new Response('Model required', { status: 400 })
  }

  const aiModel = getAIModel(provider, apiKey, model, baseUrl)
  const systemPrompt = getSystemPrompt()

  const result = streamText({
    model: aiModel,
    system: systemPrompt,
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    messages: messages as any,
    stopWhen: stepCountIs(20),
    tools: {
      read_file: tool({
        description: '读取虚拟文件系统中的文件内容',
        inputSchema: z.object({
          path: z.string().describe('文件路径，如 output.html'),
        }),
        execute: async (input) => {
          const content = await vfsGet(sessionId, projectId, input.path)
          if (content === null) return { success: false, error: `文件不存在: ${input.path}` }
          return { success: true, content }
        },
      }),

      write_file: tool({
        description: '向虚拟文件系统写入文件（完整覆盖）。写入 output.html 后预览面板自动刷新。',
        inputSchema: z.object({
          path: z.string().describe('文件路径，如 output.html'),
          content: z.string().describe('文件完整内容'),
        }),
        execute: async (input) => {
          await vfsSet(sessionId, projectId, input.path, input.content)
          return { success: true, path: input.path, size: input.content.length }
        },
      }),

      edit_file: tool({
        description: '精确字符串替换（外科手术式修改）',
        inputSchema: z.object({
          path: z.string().describe('文件路径'),
          old_string: z.string().describe('要替换的精确字符串'),
          new_string: z.string().describe('替换后的字符串'),
        }),
        execute: async (input) => {
          return await vfsEdit(sessionId, projectId, input.path, input.old_string, input.new_string)
        },
      }),

      list_files: tool({
        description: '列出虚拟文件系统中的所有文件',
        inputSchema: z.object({}),
        execute: async () => ({ files: await vfsList(sessionId, projectId) }),
      }),
    },
  })

  return result.toTextStreamResponse()
}
