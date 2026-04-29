export type Provider = 'anthropic' | 'openai' | 'google' | 'custom'

export interface Message {
  id: string
  role: 'user' | 'assistant'
  content: string
  timestamp: number
  images?: string[]
  card?: CardData
}

export interface CardData {
  type: 'dimensions' | 'platform' | 'checklist' | 'v0-confirm'
  title?: string
  options?: string[]
  items?: string[]
  summary?: string
}

export interface Project {
  id: string
  sessionId: string
  name: string
  createdAt: number
  updatedAt: number
  expiresAt: number
  messages: Message[]
  vfs: Record<string, string>
  currentOutput?: string
}

export interface ChatRequest {
  sessionId: string
  projectId: string
  messages: { role: 'user' | 'assistant'; content: string }[]
  provider: Provider
  apiKey: string
  model: string
}

export interface VFS {
  files: Record<string, string>
}
