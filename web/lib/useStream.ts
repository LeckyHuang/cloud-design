'use client'

import { useState, useRef, useCallback } from 'react'

export interface FileAttachment {
  name: string
  content: string
  lang: string
}

export interface ChatMessage {
  id: string
  role: 'user' | 'assistant'
  content: string
  images?: string[]
  files?: FileAttachment[]
}

interface StreamOptions {
  sessionId: () => string
  projectId: () => string
  provider: () => string
  apiKey: () => string
  model: () => string
  baseUrl: () => string | undefined
  onDone?: () => void
}

function uid() {
  return Math.random().toString(36).slice(2, 10)
}

function extToLang(filename: string): string {
  const ext = filename.split('.').pop()?.toLowerCase() ?? ''
  const map: Record<string, string> = {
    html: 'html', htm: 'html',
    css: 'css',
    js: 'javascript', jsx: 'javascript',
    ts: 'typescript', tsx: 'typescript',
    json: 'json',
    md: 'markdown', markdown: 'markdown',
    yaml: 'yaml', yml: 'yaml',
    xml: 'xml', svg: 'xml',
    py: 'python',
    sh: 'bash', bash: 'bash',
    txt: '', csv: '',
  }
  return map[ext] ?? ''
}

type MultimodalPart =
  | { type: 'text'; text: string }
  | { type: 'image'; image: string }

type ApiMessage =
  | { role: 'user' | 'assistant'; content: string }
  | { role: 'user'; content: MultimodalPart[] }

export function useStream(opts: StreamOptions) {
  const [messages, setMessages] = useState<ChatMessage[]>([])
  const [streamingText, setStreamingText] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const abortRef = useRef<AbortController | null>(null)
  const messagesRef = useRef<ChatMessage[]>([])

  const sendMessage = useCallback(async (
    userText: string,
    images: string[] = [],
    files: FileAttachment[] = [],
  ) => {
    if (!userText.trim() && images.length === 0 && files.length === 0) return
    if (isLoading) return

    const userMsg: ChatMessage = {
      id: uid(),
      role: 'user',
      content: userText,
      ...(images.length > 0 ? { images } : {}),
      ...(files.length > 0 ? { files } : {}),
    }
    const history = messagesRef.current

    messagesRef.current = [...history, userMsg]
    setMessages(messagesRef.current)
    setStreamingText('')
    setIsLoading(true)

    const controller = new AbortController()
    abortRef.current = controller

    // Keep last 20 turns to stay within context limits
    const recentMessages = messagesRef.current.slice(-20)
    const MAX_FILE_CHARS = 80_000 // ~20K tokens per file, hard cap
    const apiMessages: ApiMessage[] = recentMessages.map(m => {
      // Build the full text content: user text + injected file contents
      let textContent = m.content
      if (m.files && m.files.length > 0) {
        const fileParts = m.files.map(f => {
          const body = f.content.length > MAX_FILE_CHARS
            ? f.content.slice(0, MAX_FILE_CHARS) + `\n\n…[文件过大，已截断，原始大小 ${(f.content.length / 1024).toFixed(0)} KB]`
            : f.content
          return `\n\n---\n📄 **${f.name}**\n\`\`\`${f.lang}\n${body}\n\`\`\``
        })
        textContent = (m.content ? m.content + '\n' : '') + fileParts.join('')
      }

      if (m.images && m.images.length > 0) {
        const parts: MultimodalPart[] = [
          ...m.images.map(img => ({ type: 'image' as const, image: img })),
          { type: 'text' as const, text: textContent },
        ]
        return { role: 'user' as const, content: parts }
      }
      return { role: m.role, content: textContent }
    })

    const body = {
      messages: apiMessages,
      sessionId: opts.sessionId(),
      projectId: opts.projectId(),
      provider: opts.provider(),
      apiKey: opts.apiKey(),
      model: opts.model(),
      baseUrl: opts.baseUrl(),
    }

    try {
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
        signal: controller.signal,
      })

      if (!res.ok) {
        const errText = await res.text()
        const errMsg: ChatMessage = { id: uid(), role: 'assistant', content: `❌ 错误：${errText || res.statusText}` }
        messagesRef.current = [...messagesRef.current, errMsg]
        setMessages(messagesRef.current)
        setIsLoading(false)
        return
      }

      const reader = res.body!.getReader()
      const decoder = new TextDecoder()
      let accumulated = ''
      let rafId: number | null = null

      const flushToState = () => {
        setStreamingText(accumulated)
        rafId = null
      }

      while (true) {
        const { done, value } = await reader.read()
        if (done) break
        const chunk = decoder.decode(value, { stream: true })
        accumulated += chunk
        if (!rafId) rafId = requestAnimationFrame(flushToState)
      }

      if (rafId) { cancelAnimationFrame(rafId); rafId = null }
      setStreamingText(accumulated)

      const assistantMsg: ChatMessage = { id: uid(), role: 'assistant', content: accumulated }
      messagesRef.current = [...messagesRef.current, assistantMsg]
      setMessages(messagesRef.current)
      setStreamingText('')
      opts.onDone?.()
    } catch (err: unknown) {
      if (err instanceof Error && err.name !== 'AbortError') {
        const errMsg: ChatMessage = {
          id: uid(), role: 'assistant',
          content: `❌ 请求失败：${err.message}`,
        }
        messagesRef.current = [...messagesRef.current, errMsg]
        setMessages(messagesRef.current)
      }
    } finally {
      setIsLoading(false)
      setStreamingText('')
    }
  }, [isLoading, opts])

  const stop = useCallback(() => {
    abortRef.current?.abort()
  }, [])

  return { messages, streamingText, isLoading, sendMessage, stop }
}

export { extToLang }
