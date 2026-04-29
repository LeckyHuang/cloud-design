'use client'

import { useRef, useEffect, useState, useCallback } from 'react'
import MessageBubble from './MessageBubble'
import type { FileAttachment } from '@/lib/useStream'
import { extToLang } from '@/lib/useStream'

interface ChatMessage {
  id: string
  role: 'user' | 'assistant'
  content: string
  images?: string[]
  files?: FileAttachment[]
}

interface ChatPanelProps {
  messages: ChatMessage[]
  isGenerating: boolean
  input: string
  setInput: (v: string) => void
  onSend: (images: string[], files: FileAttachment[]) => void
  onStop?: () => void
  streamingContent?: string
}

const SUGGESTED_PROMPTS = [
  '帮我设计一个 Linear 风格的项目管理落地页',
  '做一个 macOS 风格的个人主页原型',
  '创建一个数据可视化看板（深色科技风）',
  '设计一个 SaaS 产品的定价页面',
]

// Text-based file extensions accepted for upload
const TEXT_ACCEPT = [
  '.html', '.htm', '.css', '.js', '.jsx', '.ts', '.tsx',
  '.json', '.md', '.markdown', '.txt', '.csv',
  '.xml', '.svg', '.yaml', '.yml', '.py', '.sh',
].join(',')

function fileIcon(name: string) {
  const ext = name.split('.').pop()?.toLowerCase() ?? ''
  if (['html', 'htm'].includes(ext)) return '🌐'
  if (['css'].includes(ext)) return '🎨'
  if (['js', 'jsx', 'ts', 'tsx'].includes(ext)) return '⚡'
  if (['json', 'yaml', 'yml'].includes(ext)) return '📋'
  if (['md', 'markdown', 'txt'].includes(ext)) return '📝'
  if (['svg'].includes(ext)) return '🖼'
  return '📄'
}

export default function ChatPanel({
  messages,
  isGenerating,
  input,
  setInput,
  onSend,
  onStop,
  streamingContent,
}: ChatPanelProps) {
  const bottomRef = useRef<HTMLDivElement>(null)
  const textareaRef = useRef<HTMLTextAreaElement>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [pendingImages, setPendingImages] = useState<string[]>([])
  const [pendingFiles, setPendingFiles] = useState<FileAttachment[]>([])

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages, streamingContent])

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      if (!isGenerating && (input.trim() || pendingImages.length > 0 || pendingFiles.length > 0)) {
        handleSend()
      }
    }
  }

  const autoResize = () => {
    const el = textareaRef.current
    if (!el) return
    el.style.height = 'auto'
    el.style.height = Math.min(el.scrollHeight, 200) + 'px'
  }

  const addImages = useCallback((files: File[]) => {
    files.filter(f => f.type.startsWith('image/')).forEach(file => {
      const reader = new FileReader()
      reader.onload = e => {
        const dataUrl = e.target?.result as string
        if (dataUrl) setPendingImages(prev => [...prev, dataUrl])
      }
      reader.readAsDataURL(file)
    })
  }, [])

  const addTextFiles = useCallback((files: File[]) => {
    files.forEach(file => {
      const reader = new FileReader()
      reader.onload = e => {
        const content = e.target?.result as string
        if (content !== undefined) {
          setPendingFiles(prev => [
            ...prev,
            { name: file.name, content, lang: extToLang(file.name) },
          ])
        }
      }
      reader.readAsText(file)
    })
  }, [])

  const handlePaste = useCallback((e: React.ClipboardEvent<HTMLTextAreaElement>) => {
    const items = e.clipboardData?.items
    if (!items) return
    const imageFiles: File[] = []
    for (const item of items) {
      if (item.type.startsWith('image/')) {
        const file = item.getAsFile()
        if (file) imageFiles.push(file)
      }
    }
    if (imageFiles.length > 0) {
      e.preventDefault()
      addImages(imageFiles)
    }
  }, [addImages])

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files) return
    const all = Array.from(e.target.files)
    addImages(all.filter(f => f.type.startsWith('image/')))
    addTextFiles(all.filter(f => !f.type.startsWith('image/')))
    e.target.value = ''
  }

  const removeImage = (idx: number) => setPendingImages(prev => prev.filter((_, i) => i !== idx))
  const removeFile = (idx: number) => setPendingFiles(prev => prev.filter((_, i) => i !== idx))

  const handleSend = () => {
    if (isGenerating) return
    onSend(pendingImages, pendingFiles)
    setPendingImages([])
    setPendingFiles([])
  }

  const canSend = !isGenerating && (
    input.trim().length > 0 || pendingImages.length > 0 || pendingFiles.length > 0
  )
  const isEmpty = messages.length === 0 && !isGenerating
  const hasPending = pendingImages.length > 0 || pendingFiles.length > 0

  return (
    <div style={{
      width: '400px',
      flexShrink: 0,
      background: 'var(--panel-left)',
      borderRight: '1px solid var(--border)',
      display: 'flex',
      flexDirection: 'column',
      overflow: 'hidden',
    }}>
      {/* Panel label */}
      <div style={{
        padding: '10px 16px',
        borderBottom: '1px solid var(--border)',
        fontSize: '11px',
        fontWeight: 600,
        color: 'var(--text-3)',
        letterSpacing: '0.5px',
        flexShrink: 0,
      }}>
        CONVERSATION
      </div>

      {/* Messages */}
      <div style={{ flex: 1, overflow: 'auto', paddingTop: '16px' }}>
        {isEmpty && (
          <div style={{
            padding: '20px 16px',
            display: 'flex', flexDirection: 'column', gap: '16px',
          }}>
            <div style={{ textAlign: 'center', marginBottom: '8px' }}>
              <div style={{
                width: '48px', height: '48px',
                background: 'var(--accent-grad)',
                borderRadius: '14px',
                margin: '0 auto 12px',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
              }}>
                <svg width="22" height="22" viewBox="0 0 22 22" fill="none">
                  <path d="M3 11h16M11 3l8 8-8 8" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </div>
              <div style={{ fontWeight: 700, fontSize: '16px', marginBottom: '6px' }}>
                Cloud Design
              </div>
              <div style={{ fontSize: '13px', color: 'var(--text-2)', lineHeight: '1.6' }}>
                告诉我你想要的设计，<br/>AI 设计工程师来实现
              </div>
            </div>

            <div style={{ fontSize: '11px', color: 'var(--text-3)', fontWeight: 600, letterSpacing: '0.5px' }}>
              快速开始
            </div>
            {SUGGESTED_PROMPTS.map((prompt, i) => (
              <button
                key={i}
                onClick={() => { setInput(prompt); textareaRef.current?.focus() }}
                style={{
                  padding: '10px 12px',
                  background: 'var(--surface)',
                  border: '1px solid var(--border)',
                  borderRadius: '10px',
                  color: 'var(--text-2)',
                  cursor: 'pointer',
                  textAlign: 'left',
                  fontSize: '13px',
                  fontFamily: 'var(--font-ui)',
                  lineHeight: '1.5',
                  transition: 'all 0.15s',
                }}
                onMouseEnter={e => {
                  (e.currentTarget as HTMLButtonElement).style.background = 'var(--surface-hi)'
                  ;(e.currentTarget as HTMLButtonElement).style.borderColor = 'var(--border-hi)'
                  ;(e.currentTarget as HTMLButtonElement).style.color = 'var(--text)'
                }}
                onMouseLeave={e => {
                  (e.currentTarget as HTMLButtonElement).style.background = 'var(--surface)'
                  ;(e.currentTarget as HTMLButtonElement).style.borderColor = 'var(--border)'
                  ;(e.currentTarget as HTMLButtonElement).style.color = 'var(--text-2)'
                }}
              >
                {prompt}
              </button>
            ))}
          </div>
        )}

        {messages.map((msg, i) => (
          <MessageBubble
            key={msg.id}
            role={msg.role}
            content={msg.content}
            images={msg.images}
            files={msg.files}
            isStreaming={i === messages.length - 1 && msg.role === 'assistant' && isGenerating && !streamingContent}
          />
        ))}

        {isGenerating && streamingContent !== undefined && (
          <MessageBubble
            role="assistant"
            content={streamingContent}
            isStreaming={true}
          />
        )}

        <div ref={bottomRef} />
      </div>

      {/* Input area */}
      <div style={{
        padding: '12px',
        borderTop: '1px solid var(--border)',
        flexShrink: 0,
      }}>
        <div style={{
          background: 'var(--surface)',
          border: '1px solid var(--border)',
          borderRadius: '12px',
          overflow: 'hidden',
          transition: 'border-color 0.15s',
        }}>
          {/* Pending attachments preview */}
          {hasPending && (
            <div style={{
              display: 'flex',
              flexWrap: 'wrap',
              gap: '6px',
              padding: '8px 10px 0',
            }}>
              {/* Image thumbnails */}
              {pendingImages.map((src, idx) => (
                <div key={`img-${idx}`} style={{ position: 'relative', flexShrink: 0 }}>
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={src}
                    alt=""
                    style={{
                      width: '52px', height: '52px',
                      objectFit: 'cover',
                      borderRadius: '6px',
                      border: '1px solid var(--border)',
                      display: 'block',
                    }}
                  />
                  <button onClick={() => removeImage(idx)} style={removeStyle}>
                    <CloseIcon />
                  </button>
                </div>
              ))}

              {/* File chips */}
              {pendingFiles.map((f, idx) => (
                <div key={`file-${idx}`} style={{
                  display: 'flex', alignItems: 'center', gap: '5px',
                  padding: '4px 8px',
                  background: 'var(--surface-hi)',
                  border: '1px solid var(--border)',
                  borderRadius: '6px',
                  fontSize: '12px',
                  color: 'var(--text-2)',
                  maxWidth: '160px',
                  position: 'relative',
                }}>
                  <span style={{ flexShrink: 0 }}>{fileIcon(f.name)}</span>
                  <span style={{
                    overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
                  }}>{f.name}</span>
                  <button onClick={() => removeFile(idx)} style={removeStyle}>
                    <CloseIcon />
                  </button>
                </div>
              ))}
            </div>
          )}

          <textarea
            ref={textareaRef}
            value={input}
            onChange={e => { setInput(e.target.value); autoResize() }}
            onKeyDown={handleKeyDown}
            onPaste={handlePaste}
            placeholder="描述你想要的设计，或上传文件作为参考…"
            rows={1}
            disabled={isGenerating}
            style={{
              width: '100%',
              padding: '10px 12px 4px',
              background: 'transparent',
              border: 'none',
              color: 'var(--text)',
              fontSize: '14px',
              fontFamily: 'var(--font-ui)',
              resize: 'none',
              outline: 'none',
              lineHeight: '1.5',
              minHeight: '40px',
            }}
          />
          <div style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            padding: '4px 8px 8px',
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              {/* Upload button */}
              <button
                onClick={() => fileInputRef.current?.click()}
                disabled={isGenerating}
                title="上传文件（图片 / HTML / CSS / JS / JSON / MD 等）"
                style={{
                  height: '26px',
                  padding: '0 8px',
                  background: 'var(--surface-hi)',
                  border: '1px solid var(--border)',
                  borderRadius: '6px',
                  cursor: isGenerating ? 'not-allowed' : 'pointer',
                  display: 'flex', alignItems: 'center', gap: '5px',
                  color: 'var(--text-2)',
                  fontSize: '12px',
                  fontFamily: 'var(--font-ui)',
                  transition: 'all 0.15s',
                  flexShrink: 0,
                  opacity: isGenerating ? 0.5 : 1,
                }}
                onMouseEnter={e => {
                  if (!isGenerating) {
                    (e.currentTarget as HTMLButtonElement).style.borderColor = 'var(--border-hi)'
                    ;(e.currentTarget as HTMLButtonElement).style.color = 'var(--text)'
                  }
                }}
                onMouseLeave={e => {
                  (e.currentTarget as HTMLButtonElement).style.borderColor = 'var(--border)'
                  ;(e.currentTarget as HTMLButtonElement).style.color = 'var(--text-2)'
                }}
              >
                📎 上传文件
              </button>
              <span style={{ fontSize: '11px', color: 'var(--text-3)' }}>
                {isGenerating ? '生成中…' : 'Enter 发送 · ⌘V 贴图'}
              </span>
            </div>
            {isGenerating ? (
              <button
                onClick={onStop}
                style={{
                  width: '32px', height: '32px',
                  background: 'var(--surface-hi)',
                  border: '1px solid var(--border-hi)',
                  borderRadius: '8px',
                  cursor: 'pointer',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  transition: 'all 0.15s',
                }}
                title="停止生成"
              >
                <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
                  <rect x="2" y="2" width="8" height="8" rx="1.5" fill="var(--text-2)"/>
                </svg>
              </button>
            ) : (
              <button
                onClick={handleSend}
                disabled={!canSend}
                style={{
                  width: '32px', height: '32px',
                  background: canSend ? 'var(--accent-grad)' : 'var(--surface-hi)',
                  border: 'none',
                  borderRadius: '8px',
                  cursor: canSend ? 'pointer' : 'not-allowed',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  transition: 'all 0.15s',
                }}
              >
                <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                  <path d="M7 1v12M1 7l6-6 6 6" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </button>
            )}
          </div>
        </div>

        {/* Hidden file input — accepts both images and text files */}
        <input
          ref={fileInputRef}
          type="file"
          accept={`image/*,${TEXT_ACCEPT}`}
          multiple
          onChange={handleFileChange}
          style={{ display: 'none' }}
        />
      </div>
    </div>
  )
}

const removeStyle: React.CSSProperties = {
  position: 'absolute',
  top: '-5px',
  right: '-5px',
  width: '16px',
  height: '16px',
  borderRadius: '50%',
  background: 'var(--text-2)',
  border: 'none',
  cursor: 'pointer',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  padding: 0,
}

function CloseIcon() {
  return (
    <svg width="8" height="8" viewBox="0 0 8 8" fill="none">
      <path d="M1 1l6 6M7 1L1 7" stroke="white" strokeWidth="1.5" strokeLinecap="round"/>
    </svg>
  )
}
