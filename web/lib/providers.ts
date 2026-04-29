import { createAnthropic } from '@ai-sdk/anthropic'
import { createOpenAI } from '@ai-sdk/openai'
import { createGoogleGenerativeAI } from '@ai-sdk/google'
import type { Provider } from '@/types'

// Providers whose base URL points to an Anthropic-compatible endpoint
const ANTHROPIC_COMPAT_HOSTS = ['api.deepseek.com/anthropic']

export interface ModelOption {
  id: string
  label: string
  description: string
}

export const MODEL_OPTIONS: Record<Provider, ModelOption[]> = {
  anthropic: [
    { id: 'claude-opus-4-7', label: 'Claude Opus 4.7', description: '最强设计能力（推荐）' },
    { id: 'claude-sonnet-4-6', label: 'Claude Sonnet 4.6', description: '平衡速度与质量' },
    { id: 'claude-haiku-4-5', label: 'Claude Haiku 4.5', description: '快速原型' },
  ],
  openai: [
    { id: 'gpt-4o', label: 'GPT-4o', description: '强大通用模型' },
    { id: 'gpt-4o-mini', label: 'GPT-4o Mini', description: '轻量快速' },
  ],
  google: [
    { id: 'gemini-2.0-flash-exp', label: 'Gemini 2.0 Flash', description: '快速多模态' },
    { id: 'gemini-1.5-pro', label: 'Gemini 1.5 Pro', description: '长上下文' },
  ],
  // Custom OpenAI-compatible: model ID is entered freely by user
  custom: [
    { id: 'custom', label: '自定义模型', description: '在上方输入 Model ID' },
  ],
}

// Well-known OpenAI-compatible providers with preset base URLs
export const CUSTOM_PRESETS = [
  { label: 'DeepSeek', baseUrl: 'https://api.deepseek.com/anthropic', placeholder: 'deepseek-v4-flash' },
  { label: 'Qwen / 通义千问', baseUrl: 'https://dashscope.aliyuncs.com/compatible-mode/v1', placeholder: 'qwen-max' },
  { label: 'MiniMax', baseUrl: 'https://api.minimax.chat/v1', placeholder: 'abab6.5s-chat' },
  { label: 'Moonshot / Kimi', baseUrl: 'https://api.moonshot.cn/v1', placeholder: 'moonshot-v1-8k' },
  { label: '智谱 GLM', baseUrl: 'https://open.bigmodel.cn/api/paas/v4', placeholder: 'glm-4-flash' },
  { label: 'Groq', baseUrl: 'https://api.groq.com/openai/v1', placeholder: 'llama-3.3-70b-versatile' },
  { label: 'Together AI', baseUrl: 'https://api.together.xyz/v1', placeholder: 'meta-llama/Llama-3-70b-chat-hf' },
]

export function getAIModel(
  provider: Provider,
  apiKey: string,
  modelId: string,
  baseUrl?: string,
) {
  switch (provider) {
    case 'anthropic': {
      const client = createAnthropic({ apiKey })
      return client(modelId)
    }
    case 'openai': {
      const client = createOpenAI({ apiKey })
      return client.chat(modelId)
    }
    case 'google': {
      const client = createGoogleGenerativeAI({ apiKey })
      return client(modelId)
    }
    case 'custom': {
      if (!baseUrl) throw new Error('Custom provider requires a Base URL')
      // Use Anthropic SDK for Anthropic-compatible endpoints (e.g. DeepSeek /anthropic)
      if (ANTHROPIC_COMPAT_HOSTS.some(h => baseUrl.includes(h))) {
        const client = createAnthropic({ apiKey, baseURL: baseUrl })
        return client(modelId)
      }
      const client = createOpenAI({ apiKey, baseURL: baseUrl })
      return client.chat(modelId)
    }
    default:
      throw new Error(`Unknown provider: ${provider}`)
  }
}
